var babadata = require('../../babotdata.json'); //baba configuration file

var fs = require('fs');

const Discord = require('discord.js'); //discord module for interation with discord api
const { ComponentType } = require('discord.js');
const { ModalBuilder, ActionRowBuilder, TextInputBuilder } = require('discord.js');

const { getD1 } = require("../../Tools/overrides");
const { antiDelay } = require("./basicHelpers");
const { DeleteReminderInDB, EditReminderInDB, AddReminderToDB, LoadReminderCache } = require("../Database/databaseVoiceController");

var to = {};
var toList = [];

global.ReminderMessageExists = {};

function getReminderJSON()
{
    
    if (!fs.existsSync(babadata.datalocation + "reminders.json"))
        fs.writeFileSync(babadata.datalocation + "reminders.json", JSON.stringify([]));

    var data = fs.readFileSync(babadata.datalocation + "reminders.json");
    return JSON.parse(data);
}

function viewReminders(userID)
{
    var reminderList = getReminderJSON();
    var userReminders = [];
    for (var i = 0; i < reminderList.length; i++)
    {
        if (reminderList[i].UserID == userID)
            userReminders.push(reminderList[i]);
    }

    return userReminders;
}

function RefreshReminders(dontRun = false)
{
    var reminderList = getReminderJSON();
    for (var i = 0; i < reminderList.length; i++)
    {
        var remmy = reminderList[i];

        if (remmy.State == "Added" || remmy.State == "Edited" || remmy.State == "Pending")
        {
            if (to[remmy.ID] != null)
            {
                clearTimeout(to[remmy.ID]);
                delete to[remmy.ID];
            }

            var stateChangedHere = false;
            var beforeState = remmy.State;
            
            var dateOfRem = new Date(remmy.Date);
            // if date is before midnight, we will set state to Running, else we will set it to Pending
            var nextMidnight = getD1();
            nextMidnight.setHours(23);
            nextMidnight.setMinutes(59);
            nextMidnight.setSeconds(59);

            if (dateOfRem < nextMidnight)
                remmy.State = "Running";
            else
                remmy.State = "Pending";

            stateChangedHere = beforeState != remmy.State;

            if (stateChangedHere)
            {
                reminderList[i] = remmy;
                fs.writeFileSync(babadata.datalocation + "reminders.json", JSON.stringify(reminderList));
            }
        }

        if (remmy.State == "Running" && !dontRun)
        {
            var timeToRun = new Date(remmy.Date) - Date.now();
            if (timeToRun <= 0)
            {
                reminderCompleted(remmy);
                remmy.State = "Deleted";
                remmy.UpdateDB = "Delete";

                reminderList[i] = remmy;
                fs.writeFileSync(babadata.datalocation + "reminders.json", JSON.stringify(reminderList));
            }
            else
            {
                console.log("Reminder " + remmy.ID + " will run in " + timeToRun + "ms");
                var timeout = setTimeout(function()
                {
                    reminderCompleted(remmy);
                    remmy.State = "Deleted";
                    remmy.UpdateDB = "Delete";

                    fs.writeFileSync(babadata.datalocation + "reminders.json", JSON.stringify(reminderList));

                    RefreshReminders();
                }, timeToRun);

                to[remmy.ID] = timeout;
                toList.push(timeout);

                remmy.State = "RunningNow";

                reminderList[i] = remmy;
                fs.writeFileSync(babadata.datalocation + "reminders.json", JSON.stringify(reminderList));
            }
        }
    }

    for (var i = 0; i < reminderList.length; i++)
    {
        if (reminderList[i].UpdateDB)
        {
            if (reminderList[i].UpdateDB == "Delete")
                DeleteReminderInDB(reminderList[i]);
            else if (reminderList[i].UpdateDB == "Edit")
                EditReminderInDB(reminderList[i]);
            else if (reminderList[i].UpdateDB == "Add")
                AddReminderToDB(reminderList[i]);
            
            if (reminderList[i].UpdateDB != "Delete")
            {
                reminderList[i].UpdateDB = false;
                fs.writeFileSync(babadata.datalocation + "reminders.json", JSON.stringify(reminderList));
            }
            else
            {
                // remove the reminder from the timeout list if it exists
                if (to[reminderList[i].ID] != null)
                {
                    clearTimeout(to[reminderList[i].ID]);
                    delete to[reminderList[i].ID];
                }

                reminderList.splice(i, 1);
                fs.writeFileSync(babadata.datalocation + "reminders.json", JSON.stringify(reminderList));
                i--;
            }
        }
    }
}

function reminderCompleted(reminderItem)
{
    var objectiveSender = {
        content: reminderItem.EnableAtPerson ? "<@" + reminderItem.UserID + "> `Baba Reminds You:`\n" + reminderItem.Message : reminderItem.Message,
    };

    var AdditionalMessagesToSend = [];

    if (reminderItem.Files != null && reminderItem.Files.length > 0)
    {
        objectiveSender.files = [];
        var maxFilesPerMessage = 5;
        var currentFiles = 0;
        var currentFileList = objectiveSender.files;
        for (var i = 0; i < reminderItem.Files.length; i++)
        {
            var extensi = reminderItem.Files[i].split('.').pop();
            var discordFile = new Discord.AttachmentBuilder(babadata.temp + reminderItem.Files[i], { name: 'File' + i + '.' + extensi, description: "Baba Makes Messages" });

            if (currentFiles < maxFilesPerMessage)
            {
                currentFileList.push(discordFile);
                currentFiles++;
            }
            else
            {
                var newFileObject = {};
                var newFileList = [];
                newFileObject.files = newFileList;
                newFileList.push(discordFile);
                AdditionalMessagesToSend.push(newFileObject);
                currentFiles = 1;
                currentFileList = newFileList;
            }
        }
    }

    var guildID = babadata.testing === undefined ? "454457880825823252" : "522136584649310208";
    global.Bot.guilds.fetch(guildID).then(guild => {
        var channelID = reminderItem.ThreadParentID == null ? reminderItem.ChannelID : reminderItem.ThreadParentID;
        guild.channels.fetch(channelID).then(async channel =>
        {
            if (reminderItem.ThreadParentID != null)
            {
                channel.threads.fetch(reminderItem.ChannelID).then(async thread =>
                {
                    console.log("Sending message to thread");
                    var msg = await thread.send(objectiveSender);
                    if (AdditionalMessagesToSend.length > 0)
                    {
                        for (var i = 0; i < AdditionalMessagesToSend.length; i++)
                            var msg = await msg.reply(AdditionalMessagesToSend[i]);
                    }

                    // delete all the files that were saved to the local file system
                    for (var i = 0; i < reminderItem.Files.length; i++)
                        fs.unlinkSync(babadata.temp + reminderItem.Files[i]);
                }).catch((error) =>
                {
                    console.error(error);
                });
            }
            else
            {
                console.log("Sending message to channel");
                var msg = await channel.send(objectiveSender);
                if (AdditionalMessagesToSend.length > 0)
                {
                    for (var i = 0; i < AdditionalMessagesToSend.length; i++)
                        var msg = await msg.reply(AdditionalMessagesToSend[i]);
                }

                // delete all the files that were saved to the local file system
                for (var i = 0; i < reminderItem.Files.length; i++)
                    fs.unlinkSync(babadata.temp + reminderItem.Files[i]);
            }
        }).catch((error) =>
        {
            console.error(error);
        });
    }).catch((error) => 
    {
        console.error(error);
    });
}

function getAttachments(message, IDID)
{
	var files = message.attachments;

    // save each of the attachments to the local file system as a temporary file (ex: file1_IDIDIDID.[ext], file2_IDIDIDID.[ext], etc.)
    var fileNames = [];
    var counter = 0;

    // loop through the Collection of attachments and save each one to the local file system
    files.forEach(function(attachment)
    {
        var fileName = attachment.name;
        var fileExtension = fileName.split('.').pop();
        var newFileName = "file" + counter + "_" + IDID + "." + fileExtension;
        fetch(attachment.url).then(res => res.arrayBuffer()).then(data =>
        {
            const nodeBuffer = Buffer.from(data);
            fs.writeFileSync(babadata.temp + newFileName, nodeBuffer);
        });
        counter++;
        fileNames.push(newFileName);
    });

    return fileNames;
}

function addReminder(DiscordMessage, UID, ChannelSendTo, MessageToSend, DelayinMS, IncludeAtUser)
{
    var IDIDIDID = Date.now();
    var Files = null;
    if (DiscordMessage != null && DelayinMS >= 0)
    {
        Files = getAttachments(DiscordMessage, IDIDIDID);
    }

	if (DelayinMS < 0)
		antiDelay(DiscordMessage);
	else
	{
        var dateOfReminder = new Date(Date.now() + DelayinMS);
        var reminderObject = {
            "Source": DiscordMessage == null ? "Reminder" : "DM Message",
            "Message": MessageToSend,
            "Files": Files,
            "Date": dateOfReminder,
            "ChannelID": ChannelSendTo.id,
            "UserID": UID,
            "ThreadParentID": ChannelSendTo.type == 11 ? ChannelSendTo.parentId : null,
            "EnableAtPerson": IncludeAtUser,
            "State": "Added",
            "ID": IDIDIDID,
            "UpdateDB": "Add"
        }

        var reminders = getReminderJSON();
        reminders.push(reminderObject);
        fs.writeFileSync(babadata.datalocation + "reminders.json", JSON.stringify(reminders));

        RefreshReminders();
	}
}

function removeReminder(reminderID)
{
    var reminderList = getReminderJSON();
    for (var i = 0; i < reminderList.length; i++)
    {
        if (reminderList[i].ID == reminderID)
        {
            reminderList[i].State = "Deleted";
            reminderList[i].UpdateDB = "Delete";
            break;
        }
    }

    fs.writeFileSync(babadata.datalocation + "reminders.json", JSON.stringify(reminderList));

    RefreshReminders();
}

function getReminder(reminderID)
{
    var reminderList = getReminderJSON();
    for (var i = 0; i < reminderList.length; i++)
    {
        if (reminderList[i].ID == reminderID)
            return reminderList[i];
    }

    return null;
}

function editReminder(reminderID, newMessage, newDate)
{
    var reminderList = getReminderJSON();
    for (var i = 0; i < reminderList.length; i++)
    {
        if (reminderList[i].ID == reminderID)
        {
            reminderList[i].Message = newMessage;
            reminderList[i].Date = newDate;
            reminderList[i].State = "Edited";
            reminderList[i].UpdateDB = "Edit";
            break;
        }
    }

    fs.writeFileSync(babadata.datalocation + "reminders.json", JSON.stringify(reminderList));

    RefreshReminders();
}

function DailyReminderCall()
{
    RefreshReminders(true);
}

function StartTheReminders()
{    
    const CachceAsync = async function() 
    {
        // Reminder Values - reminders.json - `Select * from reminders`
        const ReminderResult = await LoadReminderCache();
        console.log("Reminder Cache: " + ReminderResult, false, true);
    }

    var PromisedStartReminders = new Promise((resolve, reject) =>
    {
        CachceAsync().then(() => 
        {
            RefreshReminders();
            console.log("Reminders Loaded and Started");
            resolve("SuccCess");
        }).catch((err) => 
        {
            RefreshReminders();
            console.log("Reminders Started");
            reject("AllCache");
        });
    });

    return PromisedStartReminders;
}


/////// Embed Stuff ///////

function checkUntilGood(reminderList, index)
{
    if (index < 0)
        return 0;
    if (index >= reminderList.length)
        return reminderList.length - 1;
    return index;
}

function getUserReminderbyID(reminderID, userID)
{
    var reminderList = viewReminders(userID);
    for (var i = 0; i < reminderList.length; i++)
    {
        if (reminderList[i].ID == reminderID)
            return getUserReminder(userID, i);
    }

    return null;
}

function getUserReminderAndIDFromID(id)
{
    var reminderList = getReminderJSON();

    for (var i = 0; i < reminderList.length; i++)
    {
        if (reminderList[i].ID == id)
            return [getUserReminderbyID(reminderList[i].ID , reminderList[i].UserID), reminderList[i].UserID];
    }

    return null;
}

function getUserIDFromID(id)
{
    var reminderList = getReminderJSON();

    for (var i = 0; i < reminderList.length; i++)
    {
        if (reminderList[i].ID == id)
            return reminderList[i].UserID;
    }

    return null;
}

function getUserReminder(userID, i)
{
    var reminderList = viewReminders(userID);

    var pagetotal = reminderList.length;
    
    var obj = {
        content: "Your Reminders",
        embeds: []
    };

    var finalComponents = [];

    var reminder = reminderList[i];

    if (reminder == null)
    {
        obj.content = "No Reminders Found";
        return obj;
    }

    var editButton = new Discord.ButtonBuilder().setCustomId("editrem-" + reminder.ID + "-" + i).setLabel("Edit").setStyle(2);
    var deleteButton = new Discord.ButtonBuilder().setCustomId("deleterem-" + reminder.ID + "-" + i).setLabel("Delete").setStyle(4);
    
    var footer = "Baba Works in Reminders and in Mysterious Ways";
    if (pagetotal > 1) 
    {
        footer += " - Page " + (1 + i) + " of " + pagetotal;
        var row = new Discord.ActionRowBuilder();
        
        var pButton = new Discord.ButtonBuilder().setCustomId("page"+(i - 1)).setLabel("Previous").setStyle(1);
        var jumpButton = new Discord.ButtonBuilder().setCustomId("jumpToReminder").setLabel("Jump to ...").setStyle(3);
        var nButton = new Discord.ButtonBuilder().setCustomId("page"+(1 + i)).setLabel("Next").setStyle(1);
        if (i == 0)
        {
            pButton.setDisabled(true);
        }
        if (i == pagetotal - 1)
        {
            nButton.setDisabled(true);
        }

        row.addComponents(pButton, jumpButton, nButton, editButton, deleteButton);
        obj.components = [row];

        var row = new Discord.ActionRowBuilder();
        row.addComponents(editButton, deleteButton);
        finalComponents = [row];
    }
    else
    {
        var row = new Discord.ActionRowBuilder();
        row.addComponents(editButton, deleteButton);
        obj.components = [row];
    }

    var desco = "**Message:** \n" + reminder.Message + "\n\n";
    var dateString = "<t:" + Math.floor(new Date(reminder.Date).getTime() / 1000) + ":F> which is <t:" + Math.floor(new Date(reminder.Date).getTime() / 1000) + ":R>";
    desco += "**Date:** " + dateString + "\n";
    desco += "**Channel:** <#" + reminder.ChannelID + ">\n";

    var footobj = {
        text : footer,
        iconURL : "https://media.discordapp.net/attachments/574840583563116566/949515044746559568/JSO3bX0V.png"
    };

    var colorString = getReminderColor(new Date(parseInt(reminder.ID)), new Date(reminder.Date), getD1());

    var exampleEmbed = new Discord.EmbedBuilder() // embed for the haiku
    .setColor(colorString)
    .setTitle(reminder.Source + " Information")
    .setDescription(desco)
    .setFooter(footobj);

    obj.embeds = [exampleEmbed];
    obj.finalComponents = finalComponents;

    return obj;
}

function getReminderColor(started, end, now) 
{
    const startTime = started.getTime();
    const endTime = end.getTime();
    const nowTime = now.getTime();
    const midTime = startTime + (endTime - startTime) / 2;
  
    if (nowTime <= midTime) 
    {
        // Phase 1: Green (0,255,0) → Yellow (255,255,0)
        const progress = (nowTime - startTime) / (midTime - startTime);
        const g = Math.round(255 * progress);
        const r = 255;
        const b = 0;
        return rgbToHex(r, g, b);
    } 
    else 
    {
        // Phase 2: Yellow (255,255,0) → Red (255,0,0)
        const progress = (nowTime - midTime) / (endTime - midTime);
        const g = 255;
        const r = Math.round(255 * (1 - progress));
        const b = 0;
        return rgbToHex(r, g, b);
    }
}
  
function rgbToHex(r, g, b) 
{
    return `#${[r, g, b]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()}`;
}


function handleButtonsEmbedReminders(channel, message, userid, finalComps)
{
    global.paged[message.id] = 0;
    global.ReminderMessageExists[message.id] = true;
    console.log("Handling buttons embed reminders");
    const filter = i => (i.customId.includes("page")) 
                        && i.message.id === message.id && i.user.id === userid;

    
    const collector = channel.createMessageComponentCollector({ filter, time: 30000 });
    collector.on('collect', async i => {
        if (i.customId.includes("page")) 
        {
            //i.deferUpdate();
            var page = parseInt(i.customId.replace("page", ""));
            
            global.paged[message.id] = page;

            var newd = getUserReminder(userid, page);

            if (newd.content != "No Reminders Found")
            {
                delete newd.finalComponents;
                i.update(newd);
            }

            collector.resetTimer();

            //await i.update({ content: 'A button was clicked!', components: [] });
        }
    });

	buttonsAwaitMessageComponentReminder(message, userid, collector);
 
    collector.on('end', collected => {
        try 
        {
            if (global.ReminderMessageExists[message.id])
                message.edit({components: finalComps});
        }
        catch (error) 
        {
            console.error(error, false);
        }
    });
}

function buttonsAwaitMessageComponentReminder(message, userid, collector)
{
    const collectorFilter = i => {
        return i.user.id === userid && i.message.id === message.id && i.customId.includes("jumpToReminder");
    };

    message.awaitMessageComponent({ filter: collectorFilter, componentType: ComponentType.Button, time: 100000 })
    .then(async initialInteraction => 
        {
            // open a modal with a text input for the user to enter the haiku number
            const modal = new ModalBuilder()
                .setCustomId('jumpToNumberRemind')
                .setTitle('Jump to Custom Reminder Page');

            const input = new TextInputBuilder()
                .setCustomId('remNum')
                .setLabel("The page of the reminder to jump too")
                .setStyle(1)
                .setRequired(true)
                .setPlaceholder("Reminder Number");

            const firstActionRow = new ActionRowBuilder().addComponents(input);
            modal.addComponents(firstActionRow);

            initialInteraction.showModal(modal);

            await initialInteraction.awaitModalSubmit({
                filter: (i) =>
                      i.customId === "jumpToNumberRemind" &&
                      i.user.id === userid,
                time: 60000,
            }).then(async (modalInteraction) => {
                modalInteraction.deferUpdate();
                var chansend = modalInteraction.fields.getTextInputValue('remNum');
                var num = parseInt(chansend);
                if (num != null && num > 0)
                {
                    global.paged[message.id] = num - 1;
                    // update the message to show the haiku at the given number
                    
                    var newd = getUserReminder(userid, global.paged[message.id]);

                    if (newd.content != "No Reminders Found")
                    {
                        delete newd.finalComponents;
                        message.edit(newd);
                    }

                    collector.resetTimer();
                    buttonsAwaitMessageComponentReminder(message, userid, collector);
                }
            });
        }
    )
    .catch(err => console.error(err, true));
}

var cleanupFn = function cleanup() 
{
	console.log("Ending Reminder Messages");
	if (toList != null)
        toList.forEach(clearTimeout);

    to = {};
    toList = [];
}

global.CommandHelperCleanup = cleanupFn;

process.on('SIGINT', cleanupFn);
process.on('SIGTERM', cleanupFn);

module.exports = 
{ 
    reverseDelay: addReminder,
    DailyReminderCall,
    StartTheReminders,
    viewReminders,
    getUserReminder,
    getUserReminderAndIDFromID,
    getUserIDFromID,
    handleButtonsEmbedReminders,
    getReminder,
    removeReminder,
    editReminder
};