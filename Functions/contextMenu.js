var babadata = require('../babotdata.json'); //baba configuration file

const Discord = require('discord.js');
const { ModalBuilder, ActionRowBuilder, TextInputBuilder } = require('discord.js');

const { movetoChannel } = require('./HelperFunctions/adminHelpers.js');
const { babaHaikuEmbed, babaHaikuLinks } = require('./commandFunctions.js');
const { handleButtonsEmbed, getTimeFromString, FindDate } = require('./HelperFunctions/basicHelpers.js');
const { getReminder, editReminder, removeReminder, handleButtonsEmbedReminders, getUserReminder, getUserReminderAndIDFromID, getUserIDFromID } = require('./HelperFunctions/remindersByBaba.js');
const { sqlEscapeStringThingforAdamBecauseHeWillDoanSQLInjectionOtherwise } = require('./HelperFunctions/dbHelpers.js');

global.ReminderList = {};

async function contextInfo(interaction, bot)
{
    var commandName = interaction.commandName;

    if (commandName === "Delete")
    {
		await interaction.deferReply({ ephemeral: true });
        var fnd = false;
        var msgID = interaction.targetId;

        var chanMap = interaction.guild.channels.fetch().then(channels => {
            channels.each(chan => { //iterate through all the channels
                if (!fnd && chan.type == 0) //make sure the channel is a text channel
                {
                    chan.threads.fetch().then(thread => 
                        thread.threads.each(thr =>
                        {
                            thr.messages.fetch(msgID).then(message => 
                            {
                                fnd = true;
                                movetoChannel(message, thr, babadata.logchan);
                                interaction.editReply({ content: "Message Moved", ephemeral: true });
                            }).catch(function (err) {});
                        })
                    ).catch(function (err) {});

                    chan.messages.fetch(msgID).then(message => 
                    {
                        fnd = true;
                        movetoChannel(message, chan, babadata.logchan);
                        interaction.editReply({ content: "Message Moved", ephemeral: true });
                    }).catch(function (err) {}); //try to get the message, if it exists call setVote, otherwise catch the error
                }
            });
        });
        await interaction.editReply({ content: "Searching for Message", ephemeral: true });
    }
    else if (commandName === "Move To")
    {
        var fnd = false;
        var msgID = interaction.targetId;
        var channelId = interaction.channelId;

        const modal = new ModalBuilder()
            .setCustomId('movetoModal')
            .setTitle('Move Message');

        const messageIDShow = new TextInputBuilder()
			.setCustomId('msgID')
			.setLabel("The ID of the Message to Move - Autofilled")
			.setStyle(1)
            .setRequired(true)
            .setPlaceholder(msgID)
            .setValue(msgID);
        
        const channelIDInput = new TextInputBuilder()
            .setCustomId('chanIDInput')
            .setLabel("The ID of the Channel to Move to")
            .setStyle(1)
            .setRequired(true)
            .setPlaceholder("Channel ID");

		// An action row only holds one text input,
		// so you need one action row per text input.
		const firstActionRow = new ActionRowBuilder().addComponents(messageIDShow);
		const thtrdActionRow = new ActionRowBuilder().addComponents(channelIDInput);
		// Add inputs to the modal
		modal.addComponents(firstActionRow, thtrdActionRow);

        interaction.showModal(modal);
    }
}

async function modalInfo(interaction, bot)
{
    var cid = interaction.customId;
    if (cid === "movetoModal")
    {
        await interaction.deferReply({ ephemeral: true });
        var msgID = interaction.fields.getTextInputValue("msgID");
        var chansend = interaction.fields.getTextInputValue("chanIDInput");

        var fnd = false;

        var chanMap = interaction.guild.channels.fetch().then(channels => {
            channels.each(chan => { //iterate through all the channels
                if (!fnd && chan.type == 0) //make sure the channel is a text channel
                {
                    chan.threads.fetch().then(thread => 
                        thread.threads.each(thr =>
                        {
                            thr.messages.fetch(msgID).then(message => 
                            {
                                fnd = true;
                                movetoChannel(message, thr, chansend)
                                interaction.editReply({ content: "Message Moved", ephemeral: true });
                            }).catch(function (err) {});
                        })
                    ).catch(function (err) {});

                    chan.messages.fetch(msgID).then(message => 
                    {
                        fnd = true;
                        movetoChannel(message, chan, chansend)
                        interaction.editReply({ content: "Message Moved", ephemeral: true });
                    }).catch(function (err) {}); //try to get the message, if it exists call setVote, otherwise catch the error
                }
            });
        });
        await interaction.editReply({ content: "Searching for Message", ephemeral: true });
    }
    else if (cid.startsWith("haiku-"))
    {
        await interaction.deferReply();
        var id = cid.split("-")[2];

        var globalData = global.interactions[id];

        var globalPeople = globalData["personList"];
        var globalChans = globalData["channelList"];

        var globalPurityMode = globalData["puritymode"];

        var purity = globalData["purity"];
        var list = globalPurityMode;

        var all = globalData["all"];

        var sdate = interaction.fields.getTextInputValue("startDateInput");
        var edate = interaction.fields.getTextInputValue("endDateInput");
        var keyword = interaction.fields.getTextInputValue("keywordInput");
        var person = interaction.fields.getTextInputValue("personInput");

        global.interactions[id]["sdate"] = sdate;
        global.interactions[id]["edate"] = edate;
        global.interactions[id]["keyword"] = keyword;
        global.interactions[id]["person"] = person;

        person = person + "---" + (globalPeople != null ? globalPeople.join(",") : "");
        chans = (globalChans != null ? globalChans.join(",") : "");

        if (person != null)
            person = sqlEscapeStringThingforAdamBecauseHeWillDoanSQLInjectionOtherwise(person);
        
        if (keyword != null)
            keyword = sqlEscapeStringThingforAdamBecauseHeWillDoanSQLInjectionOtherwise(keyword);

        if (chans == "") chans = null;
        if (person == "") person = null;
        if (person == "---") person = null;
        if (keyword == "") keyword = null;
        if (sdate == "") sdate = null;
        if (edate == "") edate = null;

        var buy = 4;
        var msgstr = [sdate, edate, chans, person, keyword, (all ? "all" : (purity ? "purity" : null)), (purity ? list : null)];

        var message = await interaction.fetchReply();
        var info = {"ipp": 5, "page": 0}


        var cont = babaHaikuEmbed(purity, buy, msgstr, info);
        var deadData = purity || cont[0].components == null ?  null : babaHaikuLinks(cont);

        interaction.editReply(cont[info.page]);
        if (cont[info.page].components != null && cont.length > 1)
        {
            handleButtonsEmbed(interaction.channel, message, interaction.user.id, cont, deadData);
        }
    }
    else if (cid.startsWith("editReminder-"))
    {
        var remID = cid.split("-")[1];
        var page = cid.split("-")[2];
        var userID = cid.split("-")[3];
        var reminder = getReminder(remID);

        var authorID = interaction.user.id;

        if (reminder == null)
            await interaction.reply({content: "Reminder not found, it may have been deleted/completed already", ephemeral: true});
        else
        {
            var message = interaction.fields.getTextInputValue("messageInput");
            var date = interaction.fields.getTextInputValue("dateInput");
            var time = interaction.fields.getTextInputValue("timeInput");
    
            var theTime = getTimeFromString(time);
            var theDate = FindDate(date);

            var extral = "";

            if (message == null || message == "")
            {
                message = reminder.Message;
                extral += ": Invalid Message, keeping original message";
            }

            if (theDate == null || theTime == null)
                extral += ": Invalid Date/Time, keeping original date time";
            else
            {
                theDate = new Date(theDate.year, theDate.month - 1, theDate.day);
                theDate = new Date(theDate.getFullYear(), theDate.getMonth(), theDate.getDate(), theTime.getHours(), theTime.getMinutes(), theTime.getSeconds());
            }
            
            editReminder(remID, message, theDate);
    
            await interaction.reply({content: "Reminder Edited" + extral, ephemeral: true});
        }

        var massamage = global.ReminderList[remID];
        if (massamage != null)
        {
            var reminderListGroup = getUserReminderAndIDFromID(remID);
            var reminderList = reminderListGroup[0];
            authorID = reminderListGroup[1];
            var massamage2 = await massamage.reply(reminderList);
            massamage.delete();
            global.ReminderMessageExists[massamage.id] = false;

            var finalComps = reminderList.finalComponents;
            if (finalComps != null)
                delete reminderList.finalComponents;
            
            if (reminderList.components != null && reminderList.components[0].components.length > 2)
            {
                handleButtonsEmbedReminders(massamage.channel, massamage2, authorID, finalComps);
            }
            delete global.ReminderList[remID];
        }
    }
    else if (cid.startsWith("deleteReminder-"))
    {
        var remID = cid.split("-")[1];
        var page = cid.split("-")[2];
        var userID = cid.split("-")[3];
        var reminder = getReminder(remID);

        var authorID = interaction.user.id;

        if (reminder == null)
            await interaction.reply({content: "Reminder not found, it may have been deleted/completed already", ephemeral: true});
        else
        {
            authorID = getUserIDFromID(remID);
            removeReminder(remID);
    
            await interaction.reply({content: "Reminder Deleted", ephemeral: true});
        }


        var massamage = global.ReminderList[remID];
        if (massamage != null)
        {
            var reminderList = getUserReminder(authorID, 0);

            var finalComps = reminderList.finalComponents;
            if (finalComps != null)
                delete reminderList.finalComponents;
            
            var massamage2 = await massamage.reply(reminderList);
            massamage.delete();
            global.ReminderMessageExists[massamage.id] = false;
            
            if (reminderList.components != null && reminderList.components[0].components.length > 2)
            {
                handleButtonsEmbedReminders(massamage.channel, massamage2, authorID, finalComps);
            }
            delete global.ReminderList[remID];
        }
    }
}

async function buttonInfo(interaction, bot)
{
    var purity = false;
    var buy = 0;
    var msgstr = "";

	var msg = interaction.message;
    var cid = interaction.customId;

    if (interaction.message.interaction != null && interaction.message.interaction.user.id != interaction.user.id)
    {
        await interaction.reply({content: "You cannot use this button", ephemeral: true});
        return;
    }

    if (cid.startsWith("editrem-"))
    {
        var remID = cid.split("-")[1];
        var page = cid.split("-")[2];
        var userID = cid.split("-")[3];

        if (interaction.user.id != userID)
        {
            await interaction.reply({content: "You cannot use this button", ephemeral: true});
            return;
        }

        var reminder = getReminder(remID);

        if (reminder == null)
        {
            await interaction.reply({content: "Reminder not found, may have been deleted/completed", ephemeral: true});
            return;
        }

        var mode = reminder.Source == "Reminder" ? "Reminder" : "DM Message";

        var theDate = new Date(reminder.Date);

        var timeString = theDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric' });
        var dateString = theDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        const modal = new ModalBuilder()
            .setCustomId('editReminder-' + remID + "-" + page + "-" + userID)
            .setTitle('Edit ' + mode);

        const messageInput = new TextInputBuilder()
            .setCustomId('messageInput')
            .setLabel("The Message to Edit")
            .setStyle(1)
            .setRequired(false)
            .setPlaceholder("Message")
            .setValue(reminder.Message == null ? "BLANK BROKE ME ADAM PLEASE" : reminder.Message);

        const dateInput = new TextInputBuilder()
            .setCustomId('dateInput')
            .setLabel("The Date to Edit")
            .setStyle(1)
            .setRequired(false)
            .setPlaceholder("Date")
            .setValue(dateString);

        const timeInput = new TextInputBuilder()
            .setCustomId('timeInput')
            .setLabel("The Time to Edit")
            .setStyle(1)
            .setRequired(false)
            .setPlaceholder("Time")
            .setValue(timeString);

        const firstActionRow = new ActionRowBuilder().addComponents(messageInput);
        const secondActionRow = new ActionRowBuilder().addComponents(dateInput);
        const thirdActionRow = new ActionRowBuilder().addComponents(timeInput);
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

        global.ReminderList[remID] = interaction.message;
        interaction.showModal(modal);
    }
    else if (cid.startsWith("dismissrem-"))
    {
        var remID = cid.split("-")[1];
        var page = cid.split("-")[2];
        var userID = cid.split("-")[3];

        if (interaction.user.id != userID)
        {
            await interaction.reply({content: "You cannot use this button", ephemeral: true});
            return;
        }

        interaction.reply({content: "Reminder Dismissed", ephemeral: true});
        // delete the message associated with the button
        global.ReminderMessageExists[interaction.message.id] = false;
        interaction.message.delete().catch(function (err) {}); //try to get the message, if it exists delete it
    }
    else if (cid.startsWith("deleterem-"))
    {
        var remID = cid.split("-")[1];
        var page = cid.split("-")[2];
        var userID = cid.split("-")[3];

        if (interaction.user.id != userID)
        {
            await interaction.reply({content: "You cannot use this button", ephemeral: true});
            return;
        }

        const modal = new ModalBuilder()
            .setCustomId('deleteReminder-' + remID + "-" + page + "-" + userID)
            .setTitle('Are you sure? Delete Reminder?');

        const confirmInput = new TextInputBuilder()
            .setCustomId('confirmInput')
            .setLabel("Discord need something in popup to work")
            .setStyle(1)
            .setPlaceholder("Close the popup if you no want delete reminder")
            .setRequired(false);

        const firstActionRow = new ActionRowBuilder().addComponents(confirmInput);
        modal.addComponents(firstActionRow);

        global.ReminderList[remID] = interaction.message;
        interaction.showModal(modal);
    }
    else if (cid === "cursed")
    {
        await interaction.deferReply();
        buy = 6;

        var message = await interaction.fetchReply();
        var info = {"ipp": 5, "page": 0}

        var cont = babaHaikuEmbed(purity, buy, msgstr, info);

        for (var i = 0; i < cont.length; i++)
            cont[i].components = null;

        interaction.editReply(cont[info.page]);
    }
    else if (cid === "purity" || cid === "haiku" || cid === "haiku_list")
    {
        await interaction.deferReply({ ephemeral: true });

        var message = await interaction.fetchReply();
        global.interactions[message.id] = {"puritymode" : null, "personList" : null, "channelList" : null};

        global.interactions[message.id]["purity"] = cid === "purity";
        global.interactions[message.id]["all"] = cid === "haiku_list";
        
        var contenenent = {content: "Select Purity Score Information"};
        if (cid === "haiku_list") contenenent.content = "Select Multi-Haiku Information";
        if (cid === "haiku") contenenent.content = "Select Single Haiku Information";

        var row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.StringSelectMenuBuilder()
                    .setCustomId('puritymode')
                    .setPlaceholder('Pick which Purity Scores to Show')
                    .addOptions([
                        {
                            label: 'Channels',
                            description: 'Show Purity Score for Channels',
                            value: 'chans',
                        },
                        {
                            label: 'Users',
                            description: 'Show Purity Score for Users',
                            value: 'users',
                        },
                        {
                            label: 'Dates',
                            description: 'Show Purity Score for Dates',
                            value: 'dates',
                        },
                    ]),
            );

        var r2 = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.UserSelectMenuBuilder()
                    .setCustomId('personList')
                    .setPlaceholder('Pick a Person to Search for')
                    .setMinValues(0)
                    .setMaxValues(25)
            );

        var r3 = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ChannelSelectMenuBuilder()
                    .setCustomId('channelList')
                    .setPlaceholder('Pick a Channel to Search for')
                    .setMinValues(0)
                    .setMaxValues(25)
            );

        var r4 = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId('generateHaikuList')
                    .setLabel(cid === "purity" ? 'Generate Purity Score List' : (cid === "haiku" ? 'Open Haiku Search Form' : 'Open Multi-Haiku Search Form'))
                    .setStyle(1),
            );

        if (cid === "purity")
            contenenent.components = [row, r2, r3, r4];
        else
            contenenent.components = [r2, r3, r4];
        
        interaction.editReply(contenenent);
    }
    else if (cid === "generateHaikuList")
    {
        var msg = interaction.message;
        if (global.interactions[msg.id] === undefined) global.interactions[msg.id] = {"puritymode" : null, "personList" : null, "channelList" : null, "purity" : false, "all" : false};
        
        var pMode = global.interactions[msg.id]["puritymode"];

        if (pMode === null && global.interactions[msg.id]["purity"] === true)
        {
            await interaction.reply({content: "Please Select a Purity Mode", ephemeral: true});
            return;
        }
        else
        {
            if (pMode === "chans")
                pMode = "Channels";
            else if (pMode === "users")
                pMode = "Users";
            else if (pMode === "dates")
                pMode = "Dates";
            
            const modal = new ModalBuilder()
                .setCustomId('haiku-' + (global.interactions[msg.id]["purity"] ? "Purity" : (global.interactions[msg.id]["all"] ? "All" : "Haiku")) + '-' + msg.id)
                .setTitle(global.interactions[msg.id]["purity"] ? 'Purity Score List for ' + pMode : (global.interactions[msg.id]["all"] ? 'Get All Haikus' : 'Get a Random Haiku'))

            const keywordInput = new TextInputBuilder()
                .setCustomId('keywordInput')
                .setLabel("The Keyword to Search for")
                .setStyle(1)
                .setRequired(false)
                .setPlaceholder("Keyword")
                .setValue(global.interactions[msg.id]["keyword"] != null ? global.interactions[msg.id]["keyword"] : "");

            const startDateInput = new TextInputBuilder()
                .setCustomId('startDateInput')
                .setLabel("The Start Date to Search for")
                .setStyle(1)
                .setRequired(false)
                .setPlaceholder("Start Date")
                .setValue(global.interactions[msg.id]["sdate"] != null ? global.interactions[msg.id]["sdate"] : "");
            
            const endDateInput = new TextInputBuilder()
                .setCustomId('endDateInput')
                .setLabel("The End Date to Search for")
                .setStyle(1)
                .setRequired(false)
                .setPlaceholder("End Date")
                .setValue(global.interactions[msg.id]["edate"] != null ? global.interactions[msg.id]["edate"] : "");
            
            const personInput = new TextInputBuilder()
                .setCustomId('personInput')
                .setLabel("The Person to Search for")
                .setStyle(1)
                .setRequired(false)
                .setPlaceholder("Person")
                .setValue(global.interactions[msg.id]["person"] != null ? global.interactions[msg.id]["person"] : "");

            const firstActionRow = new ActionRowBuilder().addComponents(keywordInput);
            const secondActionRow = new ActionRowBuilder().addComponents(startDateInput);
            const thirdActionRow = new ActionRowBuilder().addComponents(endDateInput);
            const fourthActionRow = new ActionRowBuilder().addComponents(personInput);
            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);

            interaction.showModal(modal);
        }
    }
}

async function stringSelectInfo(interaction, bot)
{
    var cid = interaction.customId;

    if (cid === "puritymode")
    {
        if (global.interactions[interaction.message.id] === undefined) global.interactions[interaction.message.id] = {"puritymode" : null, "personList" : null, "channelList" : null, "purity" : true, "all" : false};
        
        global.interactions[interaction.message.id]["purity"] = true;
        global.interactions[interaction.message.id]["puritymode"] = interaction.values[0];
        
        await interaction.reply({content: "puritymode", ephemeral: true});
        await interaction.deleteReply();
    }
}

async function userSelectInfo(interaction, bot)
{
    var cid = interaction.customId;

    if (cid === "personList")
    {
        if (global.interactions[interaction.message.id] === undefined) global.interactions[interaction.message.id] = {"puritymode" : null, "personList" : null, "channelList" : null, "purity" : false, "all" : false};
        
        global.interactions[interaction.message.id]["personList"] = interaction.values;
        await interaction.reply({content: "personList", ephemeral: true});
        await interaction.deleteReply();
    }
}

async function channelSelectInfo(interaction, bot)
{
    var cid = interaction.customId;

    if (cid === "channelList")
    {
        if (global.interactions[interaction.message.id] === undefined) global.interactions[interaction.message.id] = {"puritymode" : null, "personList" : null, "channelList" : null, "purity" : false, "all" : false};

        global.interactions[interaction.message.id]["channelList"] = interaction.values;
        await interaction.reply({content: "channelList", ephemeral: true});
        await interaction.deleteReply();
    }
}

module.exports = {
	contextInfo,
    modalInfo,
    buttonInfo,
    stringSelectInfo,
    userSelectInfo,
    channelSelectInfo
}