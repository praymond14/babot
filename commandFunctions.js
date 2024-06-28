const { FormatPurityList, HPLGenChannel, HPLGenUsers, HPLSelectChannel, HPLSelectUser, HPLSelectDate, HaikuSelection, ObtainDBHolidays, NameFromUserID, HPLGenD8 } = require("./databaseandvoice.js");
const { getD1, FindDate, GetDate, dateDiffInDays, uExist, getTimeFromString } = require("./HelperFunctions/basicHelpers.js");
const { CheckHoliday, FindNextHoliday, MakeImage, EmbedHaikuGen, loadHurricaneHelpers, checkHurricaneStuff, monthFromInt, reverseDelay } = require("./HelperFunctions/commandHelpers.js");
const { normalizeMSG } = require("./HelperFunctions/dbHelpers.js");
const { funnyDOWText } = require("./HelperFunctions/slashFridayHelpers.js");

var babadata = require('./babotdata.json'); //baba configuration file
var data = require(babadata.datalocation + 'data.json'); //extra data
const Discord = require('discord.js'); //discord module for interation with discord api
const fs = require('fs');
const Jimp = require('jimp');
const https = require('https');

const options = { year: 'numeric', month: 'long', day: 'numeric' }; // for date parsing to string

async function babaFriday(isFake = false)
{
    alttext = isFake ? "YOU THINK IT IS FRIDAY??" : "Baba Friday Image, As it is ALWAYS Friday!"
    var templocal = babadata.datalocation + "FrogHolidays/"; //creates the output frog image

    var newFile = null;
    if (!isFake && global.BirthdayToday != null)
    {
        var font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
        var image = await Jimp.read(templocal + "Friday.jpg");

        var names = global.BirthdayToday;
        var name = names.join(" and ");
        name = name + " Edition!";

        var nameWidth = Jimp.measureText(font, name);
        var nameHeight = Jimp.measureTextHeight(font, name, 500);

        var nameX = 500 - nameWidth / 2;
        var nameY = 235 - nameHeight / 2;

        image.print(font, nameX, nameY, name);

        alttext = "Baba Friday Image, As it is ALWAYS Friday!\nCelebrating: " + names.join(" and ") + " Edition!";

        newFile = new Discord.AttachmentBuilder(await image.getBufferAsync(Jimp.MIME_JPEG), { name: 'Friday.jpg', description : alttext });
    }
    else
    {
        newFile = new Discord.AttachmentBuilder(templocal + "Friday.jpg", { name: 'Friday.jpg', description : alttext });
    }

    return { content: "FRIDAY!", files: [newFile] };
}

function babaRNG(min, max, spoiler)
{
    var num = Math.floor(Math.random() * (max - min + 1)) + min;
    return { content: "Your Random Number is: " + (spoiler ? "||" : "")  + num + (spoiler ? "||" : "") };
}

function babaPlease()
{
    var num = Math.floor(Math.random() * 100); //pick a random one
    if (num < 2)
        return { content: "AAAAAAAAAAA" }
    else if (num < 15)
        return { content: "BABA IS HAPPY!" };
    else if (num < 45)
        return { content: "BABA IS THANKS!" };
    else if (num < 68)
        return { content: "BABA IS PLEASED!" };
    else if (num == 69)
        return { content: "Nice!" };
}

function babaPizza()
{
    return { content: "Baba Pizza Ordering Service™ coming soon!" };
}

function babaProgress(n = 20)
{    
    var n1less = n - 1;

    var date2 = new Date();
    var date1 = new Date(date2.getFullYear(), 0, 1);

    var Difference_In_Time = date2.getTime() - date1.getTime();
    
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

    var leap = date2.getFullYear() % 100 === 0 ? date2.getFullYear() % 400 === 0 : date2.getFullYear() % 4 === 0;

    var endoyear = 365 + leap;

    var percent = +((Difference_In_Days / endoyear) * 100).toFixed(2);

    var pb = "";

    var vdiff = 0;
    var valcount = 0;

    for (var i = 1; i <= n1less; i++)
    {
        valcount = endoyear * (i / n);
        v1plus = endoyear * ((i+1) / n);

        var vdiff = (v1plus - valcount) / 3;

        if (Difference_In_Days < valcount)
            pb += (valcount - (2 * vdiff) > Difference_In_Days) ? "░" : ((valcount - vdiff > Difference_In_Days) ? "▒" : "▓");
        else
            pb += "█";
    }

    vdiff = (1/n * endoyear) / 3;
    valcount = endoyear * (n1less / n);

    if (Difference_In_Days > endoyear - (1/12)) pb += "█";
    else pb += (valcount + vdiff > Difference_In_Days) ? "░" : ((valcount + (2 * vdiff) > Difference_In_Days) ? "▒" : "▓");

    return { content: pb + " " + percent + "%" };
}

function babaHelp()
{
    var helptext = "BABA IS HELP"
    helptext += "\n```Commands:"

    helptext += "\nAll commands can be run as slash commands!";

    helptext += "\n" + "- !baba password - Gets the server password for games!"
    helptext += "\n" + "- !baba [night shift | vibe time] flag - Gets the current vibe time flag for the day!"
    helptext += "\n" + "- !baba make yugo - Baba will give you a yugo!"

    helptext += "\n" + "- !baba haiku - Pulls a random haiku from the haiku database of the server!"
    helptext += "\n" + "- !baba haiku by [person] - Gets a random haiku make by the specified person!"
    helptext += "\n" + "- !baba haiku purity list [channels] - Gets a list of all people or channels haiku purity's!"
    helptext += "\n" + "- !baba my haiku purity - Gets the haiku purity of the sender!"
    helptext += "\n" + "- !baba haiku purity [channel/person/date] - Gets the haiku purity of the the specified value!"

    helptext += "\n" + "- !baba wednesday {holiday} - Displays a frog with how many wednesdays until the specified holiday!"
    helptext += "\n" + "- !baba days until {holiday} - Displays how many days until specified holiday!"
    helptext += "\n" + "- !baba when is {holiday} - Displays the exact date of the specified holiday!"
    helptext += "\n" + "- !baba day of week {holiday} - Displays what day of week the specified holiday is!";
    
    helptext += "\n" + "- !baba friday - Displays the friday image!";
    helptext += "\n" + "- !baba order pizza - Baba will order you a pizza (coming soon)!";
    helptext += "\n" + "- !baba please - >:(";
    helptext += "```"

    return { content: helptext };
}

function babaVibeFlag()
{
    var d1 = getD1();
    var flagtext = "BABA IS AT VIBE TIME";; //V I B E  T I M E
    let d1_useage = new Date(d1.getFullYear(), d1.getMonth(), 1); //today that has been wednesday shifted
    d1_useage.setDate(d1.getDate() - d1.getDay()); //modify today for wed

    d1_useage.setDate(d1_useage.getDate() + (d1_useage.getMonth() % 7)); //modify today for wed

    var seed = (d1_useage.getDate() % 9) + (d1_useage.getMonth() % 5); //seeds are cool

    var locals = [ //another thing hank doesnt like, but it is needed
        [0,1,2,3,4,5,6],
        [6,5,4,3,2,1,0], 
        [1,3,5,0,2,4,6],
        [0,2,4,6,5,3,1],
        [0,4,5,1,2,6,2],
        [5,6,1,4,3,2,0],
        [4,0,6,2,1,5,3]
    ]

    var sood = locals[seed % 7][(d1.getDay() + d1_useage.getDate()) % 7]; // "the mommy number and daddy numbers get drunk and invite cousins" - Caden 2021
    
    // var newAttch = new Discord.MessageAttachment().setFile(); //makes a new discord attachment
    var newFile = new Discord.AttachmentBuilder(babadata.datalocation + "Flags/" + "Night_Shift_" + sood + ".png", 
        { name: 'NightShift.png', description : "This one is indexed as " + sood + "!" });

    return {content: flagtext, files: [newFile] };
    
}

function babaYugo()
{
    var yugotext = "Here Yugo!";
    var num = Math.floor(Math.random() * 11); //pick a random one
    var yugo = new Discord.AttachmentBuilder(babadata.datalocation + "Yugo/" + num.toString() + ".jpg", 
        { name: 'Yugo.jpg', description : "This is yugo number " + num + "!\nHere Yugo, Get IT, GET IT! HHUEHUEHEUHEHEUEUEHUEHUEHUE!" });

    return { content: yugotext, files: [yugo] };
}

function babaRepost()
{
    var num = Math.floor(Math.random() * 5); //pick a random one
    var reppy = new Discord.AttachmentBuilder(babadata.datalocation + "Repost/" + num.toString() + ".png", 
        { name: 'Repost.png', description : "This is repost number " + num + "!\nWhen will jeremy finish his report detector?"});
    return { files: [reppy] };
}


function babaHaikuEmbed(purity, list, chans, mye, buy, msgContent, pagestuff, callback)
{
    if (buy != 4)
        msgContent = normalizeMSG(msgContent);
    else
    {
        for (var i = 0; i < msgContent.length; i++)
        {
            if (typeof(msgContent[i]) == "string")
                msgContent[i] = normalizeMSG(msgContent[i]);
        }
    }
    if (!(global.dbAccess[1] && global.dbAccess[0])) return callback([{content: "Database is not enabled so no haikus for you!"}]);

    if (purity)
    {
        var hpl = {"retstring": ["No Haiku Purity Found!"], "total": 1};
        var bonust = ""
        var bonupr = ""
        var haifou = false;

        bonust = " List for ";
        bonust += (msgContent[6] == "chans" ? "Channels" : (msgContent[6] == "dates" ? "Dates" : "Users"));
        HaikuSelection(function(result)
        {
            if (result == null) 
            {
                haifou = true;
                return callback([{content: "DB Probably not enabled! or no haikus found to make the purity!"}]);
            }

            hpl = FormatPurityList(result, (msgContent[6] == "chans" ? true : (msgContent[6] == "dates" ? 2 : false)), pagestuff);

            if (hpl.retstring.length != 0)
            {
                haifou = true;
                return callback(EmbedPurityGen(hpl, bonust, bonupr, pagestuff, msgContent));
            }
            else hpl = {"retstring": ["No Haiku Purity Found based on Selections"], "total": 1};
        }, buy, msgContent);

        setTimeout(function()
	    { 
            if (!haifou)
                return callback(EmbedPurityGen(hpl, bonust, bonupr, pagestuff));
        }, 1000);
    }
    else
    { 
        HaikuSelection(function(haiku, simnames)
        {
            console.log(haiku);
            if (haiku == null) return callback([{content: "No Haiku Found, or the DB is Disabled!"}]);

            return callback(EmbedHaikuGen(haiku, simnames));
        }, buy, msgContent);
    }
}

function EmbedPurityGen(hpl, bonust, bonupr, pagestuff, msgContent)
{
    var objs = [];
    var pagetotal = Math.ceil(hpl.total / pagestuff.ipp);
    for (var e = 0; e < pagetotal; e++)
    {
        var obj = {content: "BABA MAKE HAIKU"};
        if (msgContent != undefined)
        {
            var sd = msgContent[0];
            var startDate = null;
            var ed = msgContent[1];
            var endDate = null;
            var chan = msgContent[2];
            var pson = msgContent[3];
            var kword = msgContent[4];

            var cont = "BABA MAKE HAIKU\n";
            cont += "```\n";

            if (pson != null)
            {
                var ppl2s = pson.split("---");
                cont += "Users: \n";
                if (ppl2s[1] != "")
                {
                    var ids = ppl2s[1].split(",");
                    
                    cont += "\t-> " + ids.map(id => global.userCache[id]).join(", ") + "\n";
                }
                if (ppl2s[0] != "")
                {
                    cont += "\t-> " + ppl2s[0] + "\n";
                }
            }

            if (chan != null)
            {
                var chans = chan.split(",");
                cont += "Channels: \n";
                cont += "\t-> " + chans.map(id => global.channelCache[id]).join(", ") + "\n";
            }

            if (kword != null)
                cont += "Containing: " + kword.split(" ").join(", ") + "\n";

            if (sd != null || ed != null)
            {
                if (sd != null)
                    startDate = FindDate(sd);
                if (ed != null)
                    endDate = FindDate(ed);

                if (startDate == null && endDate != null) startDate = endDate;

                if (startDate != null)
                {
                    var d1 = new Date(startDate.year, startDate.month - 1, startDate.day);
                    if (endDate != null)
                    {
                        var d2 = new Date(endDate.year, endDate.month - 1, endDate.day);
                        if (endDate < startDate)
                        {
                            var temp = startDate;
                            startDate = endDate;
                            endDate = temp;
                        }
                        
                        cont += "From: " + d1.toLocaleDateString('en-US', options) + "\n";
                        cont += "To: " + d2.toLocaleDateString('en-US', options) + "\n";
                    }
                    else
                    {
                        cont += "Occuring On: " + d1.toLocaleDateString('en-US', options) + "\n";
                    }
                }
                else if (sd != null)
                {
                    startDate = FindDate(sd, true);
                    if (startDate != null)
                    {
                        var year = startDate.year;
                        var month = startDate.month;
                        var day = startDate.day;
                        
                        month = (month == 0) ? month = "ANY Month" : monthFromInt(month)
                        day = (day == 0) ? day = "ANY Day" : day;
                        year = (year == 0) ? year = "ANY Year" : year;
                        
                        cont += "Occuring On Any Instance of: " + `${month} ${day}, ${year}` + "\n";
                    }
                }
            } 

            //remove last newline
            cont = cont.substring(0, cont.length - 1);
            cont += "```\n";

            if (msgContent[0] == null && msgContent[1] == null && msgContent[2] == null && msgContent[3] == null && msgContent[4] == null)
                cont = "BABA MAKE HAIKU";

            obj = {content: cont};
        }

        var footer = "Haikus by Baba!";
        if (pagetotal > 1) 
        {
            footer += " - Page " + (1 + e) + " of " + pagetotal;
            var row = new Discord.ActionRowBuilder();
            
            var pButton = new Discord.ButtonBuilder().setCustomId("page"+(e - 1)).setLabel("Previous").setStyle(1);
            var nButton = new Discord.ButtonBuilder().setCustomId("page"+(1 + e)).setLabel("Next").setStyle(1);
            if (e == 0)
            {
                pButton.setDisabled(true);
            }
            if (e == pagetotal - 1)
            {
                nButton.setDisabled(true);
            }
    
            row.addComponents(pButton, nButton);
            obj.components = [row];
        }
    
        var footobj = {
            text : footer,
            iconURL : "https://media.discordapp.net/attachments/574840583563116566/949515044746559568/JSO3bX0V.png"
        };

        var exampleEmbed = new Discord.EmbedBuilder() // embed for the haiku
        .setColor("#" + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F"))
        .setTitle(bonupr + "Haiku Purity" + bonust)
        .setDescription(hpl.retstring[e])
        .setFooter(footobj);
        obj.embeds = [exampleEmbed];
        objs.push(obj);
    }
    
    return objs;
}


function babaDayNextWed(since = 1)
{
    var seven  = 7 * since;
    let d1 = getD1(); //get today
    var dow_d1 = (d1.getDay() + 4) % 7;//get day of week (making wed = 0)

    var dtnw = ""
    var ct = Math.abs(seven - dow_d1);
    if (ct > 7) ct -= 7;
    
    if (ct == 1)
        dtnw = "\nIt is only " + ct + " day " + (since == 1 ? "until" : "since") + " the " + (since == 1 ? "next" : "last") + " Wednesday!"
    else
        dtnw = "\nIt is only " + ct + " days " + (since == 1 ? "until" : "since") + " the " + (since == 1 ? "next" : "last") + " Wednesday!"
        
    return { content: dtnw };
}

function babaJeremy()
{
    var adjective = data.adjectives[Math.floor(Math.random() * data.adjectives.length)];
    var animal = data.animals[Math.floor(Math.random() * data.animals.length)].replaceAll(' ', '');

    return { content: "```" + adjective + animal + "```" };
}

async function babaWednesday(msgContent, author, callback)
{
    msgContent = normalizeMSG(msgContent);
    var outs = [];
    //let rawdata = fs.readFileSync(babadata.datalocation + "FrogHolidays/" + 'frogholidays.json'); //load file each time of calling wednesday
    //let holidays = JSON.parse(rawdata);

    if (!(global.dbAccess[1] && global.dbAccess[0])) return callback([{content: await funnyDOWText(3, author.id) }]);

    ObtainDBHolidays(async function(holidays)
    {
        let d1 = getD1(); //get today
        var yr = d1.getFullYear();
        var dow_d1 = (d1.getDay() + 4) % 7;//get day of week (making wed = 0)
        let d1_useage = new Date(d1.getFullYear(), d1.getMonth(), 1); //today that has been wednesday shifted
        d1_useage.setDate(d1.getDate() - dow_d1); //modify today for wednesdays
    
        var IsHoliday = CheckHoliday(msgContent, holidays); //get the holidays that are reqested
        var IsDate = FindDate(msgContent);

        if (IsDate != null)
            IsHoliday.push(IsDate);
    
        if (msgContent.includes('next event'))
        {
            var hols = FindNextHoliday(d1, yr, CheckHoliday("ALL", holidays));
            for ( var i = 0; i < hols.length; i++) //loop through the holidays that are requested
            {
                IsHoliday.push(hols[i]);
            }
        }
        
        if (msgContent.includes('next birthday'))
        {
            var hols = FindNextHoliday(d1, yr, CheckHoliday("BIRTHDAY", holidays));
            for ( var i = 0; i < hols.length; i++) //loop through the holidays that are requested
            {
                IsHoliday.push(hols[i]);
            }
        }
    
        if(IsHoliday.length > 0) //reply with password file string if baba password
        {
            var templocationslist = [];
    
            for ( var i = 0; i < IsHoliday.length; i++) //loop through the holidays that are requested
            {
                var holidayinfo = IsHoliday[i];
                if (holidayinfo.name != "date" && holidayinfo.year)
                    yr = holidayinfo.year;
    
                console.log("holidayinfo: " + holidayinfo.name);
                let d2 = GetDate(d1, yr, holidayinfo);

                if (isNaN(d2))
                {
                    var fronge = new Discord.AttachmentBuilder(babadata.datalocation + "FrogHolidays/error.png", 
                        { name: 'ErrorFrog.png', description : "Brug, run commands better bud hee!"});

                    outs.push({ content: "The date does not exist so BABA will give you ERROR frog!", files: [fronge] });
                    continue;
                }
    
                var additionaltext = "";
                var showwed = false;
    
                if (msgContent.includes('wednesday'))
                    showwed = true;
    
                if (msgContent.includes('when is')) //outputs the next occurance of the event
                {
                    var bonustext = holidayinfo.year != undefined ? " " + holidayinfo.year : "";
                    
                    var whenistext = "";
                    if (IsDate != null)
                        whenistext += "\n" + holidayinfo.safename;
                    else
                    {
                        if (holidayinfo.year != undefined)
                            // whenistext += "\n" + holidayinfo.safename + bonustext + " is on " + d2.toLocaleDateString('en-US', options);
                            whenistext += "\n" + holidayinfo.safename + bonustext + " is on <t:" + d2.getTime() / 1000 + ":D>";
                        else
                        {
                            //whenistext += "\nThe next occurance of " + holidayinfo.safename + " is on " + d2.toLocaleDateString('en-US', options);
                            whenistext += "\nThe next occurance of " + holidayinfo.safename + " is on <t:" + d2.getTime() / 1000 + ":D>";
                            
                        }
                    }
                    
                    additionaltext += whenistext + "\n";
                }
                
                if (msgContent.includes('day of week')) //custom days until text output - for joseph
                {
                    var bonustext = holidayinfo.year != undefined ? " " + holidayinfo.year : "";
                    var dowtext = holidayinfo.safename + bonustext + " is on " + d2.toLocaleDateString('en-US', {weekday: 'long'}); //future text
                    
                    additionaltext += dowtext + "\n";
                }
    
                if (msgContent.includes('days until')) //custom days until text output - for joseph
                {
                    var int = dateDiffInDays(d1, d2); //convert to days difference
                    var bonustext = holidayinfo.year != undefined ? " " + holidayinfo.year : "";
    
                    var dutext = "";
                    if (int != 0)
                    {
                        // if (int == 1)
                        //     dutext = int + " Day until " + holidayinfo.safename; //future text
                        // else
                        //     dutext = int + " Days until " + holidayinfo.safename + bonustext; //future text
                        
                        dutext = holidayinfo.safename + bonustext + " is <t:" + d2.getTime() / 1000 + ":R>" + (int > 31 ? " which is in " + int + " day" + (int == 1 ? "" : "s") : "");

                        additionaltext += dutext + "\n";
                    }
                    else
                        showwed = true;
                }

                if (msgContent.includes('days since')) //custom days until text output - for joseph
                {
                    var int = dateDiffInDays(d1, d2); //convert to days difference
                    var bonustext = holidayinfo.year != undefined ? " " + holidayinfo.year : "";
                    
                    int = 3;
                    var dutext = "";
                    if (int != 0)
                    {
                        if (int == 1)
                            dutext = int + " Day until " + holidayinfo.safename; //future text
                        else
                            dutext = int + " Days until " + holidayinfo.safename + bonustext; //future text
                        
                        dutext = "Since for Events Coming Soon";
                        additionaltext += dutext + "\n";
                    }
                    else
                        showwed = true;
                }
                
                if (additionaltext !== "")
                {
                    outs.push({ content: additionaltext });
    
                    if (!showwed)
                        continue;
                }
    
                var dow_d2 = (d2.getDay() + 4) % 7;//get day of week (making wed = 0)
                let d2_useage = new Date(d2.getFullYear(), d2.getMonth(), 1); //holiday that has been wednesday shifted
                d2_useage.setDate(d2.getDate() - dow_d2);// modify holiday for wednesdays
    
                let weeks = Math.abs((d1_useage.getTime() - d2_useage.getTime()) / 3600000 / 24 / 7); // how many weeks
                
                if (weeks < .3) //for when it is the week before and set to .142
                    weeks = 0;

                weeks = Math.round(weeks);
    
                var wednesdayoverlay = "Wednesday_Plural.png"; //gets the wednesday portion
                if (weeks == 1)
                    wednesdayoverlay = "Wednesday_Single.png"; //one week means single info
    
                var templocal = babadata.datalocation + "FrogHolidays/"; //creates the output frog image
    
                var outputname = "outputfrog_" + i + ".png"; //default output name
                if (d1.getTime() - d2.getTime() == 0)
                {
                    outputname =  holidayinfo.name + ".png"; //if today is the event, show something cool

                    var custom = false;
                    if (holidayinfo.name == "date")
                    {
                        custom = true;
                    }
                    else
                    {
                        try
                        {
                            fs.accessSync(templocal + outputname, fs.constants.R_OK | fs.constants.W_OK);
                        } 
                        catch (err)
                        {
                            custom = true;
                            outputname = "date.png";
                        }
                    }
    
                    if (custom)
                    {
                        // images(templocal + outputname).save(templocal + "outputfrog_0.png");
    
                        Jimp.read(templocal + outputname)
                            .then(function (image) {
                                loadedImage = image;
                                return Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
                            })
                            .then(function (font) {
                                loadedImage.print(font, 190, 20, holidayinfo.safename)
                                        .write(templocal + "outputfrog_0.png");
                            })
                            .catch(function (err) {
                                console.error(err);
                            });
                        outputname = "outputfrog_0.png";
                    }
                }
                else
                {
                    weeks = Math.floor(weeks);
                    if (weeks > 999999) weeks = 1000000;
                    var base = holidayinfo.name + "_base.png";
    
                    try 
                    {
                        await MakeImage(templocal, base, wednesdayoverlay, weeks, outputname, holidayinfo, false);
                    }
                    catch(err) // probably not nessisary
                    {
                        await MakeImage(templocal, "date_base.png", wednesdayoverlay, weeks, outputname, holidayinfo, true);
                    }
                    
                }
                
                var tempFilePath = templocal + outputname; // temp file location
                templocationslist.push(tempFilePath);
            }
    
            for (var j = 0; j < templocationslist.length; j++)
            {
                var newAttch = new Discord.AttachmentBuilder(templocationslist[j], 
                    { name: IsHoliday[j].name + '.png', description : "It is " + IsHoliday[j].name + ", my dudes"}); //makes a new discord attachment
                try
                {
                    fs.accessSync(templocationslist[j], fs.constants.R_OK | fs.constants.W_OK);
                } 
                catch (err)
                {
                    var newAttch = new Discord.AttachmentBuilder(templocal + "error.png", 
                        { name: 'error.png', description : "It is error time, my dudes! Brug why you erroring baba?"}); //makes a new discord attachment (default fail image)
                }
                
                var op = { content: "It is Wednesday, My BABAs", files: [newAttch] }
                outs.push(op);
            }
        }
        else
        {
		    var tod = new Date();
            if (tod.getDay() == 3)
                outs.push({ content: "It is Wednesday, My Dudes" });
            else
            {
                if (msgContent.replace("wednesday", "").replace("when is", "").replace("day of week", "").replace("days until", "").trim() == "next")
                    outs.push({ content: "The definition of insanity is doing the same thing over and over expecting a different result" });
                else
                    outs.push({ content: await funnyDOWText(3, author.id) });
            }
        }

        if (outs.length == 0)
            outs.push({ content: "Baba Broke Getting that Event!" });
        
        return callback(outs);
    });

    
    //if (msgContent.includes('super cursed'))
    //{
    //	setTimeout(function()
    //	{ 
    //		let help = "abcdefghijklm.nopqrstuvwxyz:1234567890/".split('');
    //		let li = "";

    //		for (var i = 0; i < holidays.help.outp.length; i++)
    //		{
    //			var t = help.indexOf(holidays.help.outp[i]);
    //			t = ((t - holidays.help.count) + help.length) % help.length;
    //			var s = help[t];
    //			li += s;
    //		}
    //		message.channel.send(li);
    //	}, 100);
    //}
}

function babaWhomst(user, callback)
{
    if (!(global.dbAccess[1] && global.dbAccess[0])) return callback({content: "Whomst mayhaps are they, BABA not know as BABA Databasen't" });

    NameFromUserID(
        function(result)
        {
            // do formatting on result
            if (result.length == 0)
            {
                console.log(`Whomst lookup for id ${user.id} (${user.username}) returned no results`)
                callback(`User ${user.username} not found!`);
            }
            else
            {
                callback(`User ${user.username} is ${result[0].PersonName}`);
            }            
        },
        user);
}

async function babaHurricane(hurricanename, callback)
{
    var tempFilePath = babadata.temp + "hurricane.png";
    const file = fs.createWriteStream(tempFilePath);
    var url = "https://www.nhc.noaa.gov/xgtwo/two_atl_7d0.png";

    var binus = "";
    var thisYear = new Date().getFullYear();

    console.log("Hurricane lookup for " + hurricanename);

    // check the hurricane.json for exisiting name or subname classification:
        // if name, use the the link saved  -DONE
        // else if name starts with existing letter, provide the link to corresponding letter  -DONE
        // else look up on the site starting with the number indexed letter
            // if letter is not a-z skip
            // if letter pulls a blank folder, skip (as may be something far down alphabet)
            // XX if letter (to number) pulls a folder with files (check for xml file)
                // if xml file exists, get name and check if in db and matches
                    // if not in db, add to db with name of hurricane and link to image
                    // check if name matches now or subname, or subletter
                        // if so, we got em boys, use image in db
                    // if name doesnt match, check next index and repeat starting at XX
                // if xml file does not exist, stop searching as empty folder means end of line

    // {"name": "bikus", "letter": "B", "url": "bikus.png"}
    if (hurricanename != "" && hurricanename != null)
    {
        var hurricaneJson = await loadHurricaneHelpers();
        url = null;
        var hFull = "";

        for (const [hName, hObject] of Object.entries(hurricaneJson)) 
        {
            if (hName.toLowerCase() == hurricanename.toLowerCase() || hObject.letter == hurricanename.toUpperCase().charAt(0) || hName.toLowerCase().includes(hurricanename.toLowerCase()))
            {
                url = hObject.url;
                hFull = hName;
                break;
            }
        }

        if (url == null)
        {
            // if letter is not a-z skip
            if (hurricanename.toUpperCase().charCodeAt(0) < 65 || hurricanename.toUpperCase().charCodeAt(0) > 90)
            {
                callback({ content: "Give a Valid Hurricane Name (A-Z supported only right now)" });
                return;
            }

            for (var i = 0; i < 6; i++)
            {
                var good = await checkHurricaneStuff(hurricanename, i == 0, i)
                if (good)
                    break;
            }


            hurricaneJson = await loadHurricaneHelpers();
            for (const [hName, hObject] of Object.entries(hurricaneJson)) 
            {
                if (hName.toLowerCase() == hurricanename.toLowerCase() || hObject.letter == hurricanename.toUpperCase().charAt(0) || hName.toLowerCase().includes(hurricanename.toLowerCase()))
                {
                    url = hObject.url;
                    hFull = hName;
                    break;
                }
            }
        }

        if (url == null)
        {
            callback({ content: "Hurricane Doesn't seem to exist!" });
            return;
        }

        binus = " for " + hFull;
    }
    
    console.log(url);

    const request = https.get(url, function(response) {
       response.pipe(file);
    
       // after download completed close filestream
        file.on("finish", () => {
            file.close();
            console.log("Download Completed");

            var vv = hFull === undefined ? "Hurricanes" : hFull;
           
            var newAttch = new Discord.AttachmentBuilder(tempFilePath, 
                { name: vv + '.png', description : "Hurricane Info for " + vv}); //makes a new discord attachment

           callback({ content: "Baba Hurricane Info" + binus, files: [newAttch] });
        });
    });
}

function babaCat(callback)
{
    var tempFilePath = babadata.temp + "hurricane.png";
    const file = fs.createWriteStream(tempFilePath);
    var url = "https://thiscatdoesnotexist.com/";

    console.log(url);

    const request = https.get(url, function(response) {
       response.pipe(file);
    
       // after download completed close filestream
       file.on("finish", () => {
           file.close();
           console.log("Download Completed");

           callback({ content: "Baba Cat", files: [tempFilePath] });
       });
    });
}

function babaWeather(mode, city, callback)
{
    //TODO: add check if site down
    var tempFilePath = babadata.temp + "weather.png";
    const file = fs.createWriteStream(tempFilePath);
    var cityUnderscore = city.replace(" ", "%20");
    var url = "https://wttr.in/" + cityUnderscore + ".png?u";

    if (mode == "four")
        url = "https://wttr.in/" + cityUnderscore + ".png?u";
    else if (mode == "deets")
        url = "https://v2.wttr.in/" + cityUnderscore + ".png?u";

    console.log(url);

    const request = https.get(url, function(response) {
       response.pipe(file);
    
       // after download completed close filestream
       file.on("finish", () => {
           file.close();
           console.log("Download Completed");

           var newAttch = new Discord.AttachmentBuilder(tempFilePath, 
               { name: city + '.png', description : "Weather info for " + city}); //makes a new discord attachment

           callback({ content: "Baba Weather", files: [newAttch] });
        }).on('error', () => {
            callback({ content: "Baba Weather Error" });
        });
    });
}

async function babaRemind(message, time, date, interaction)
{
    var theTime = getTimeFromString(time);
    var theDate = null;
    if (date != null)
    {
        theDate = FindDate(date);
        theDate = new Date(theDate.year, theDate.month - 1, theDate.day);
    }

    // add the offset of midnight to theTime onto theDate if theDate is not null
    // else add the offset of now to theTime onto now

    var now = new Date();
    // convert now to correct timezone
	now = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));

    var timeuntilTheTimeFromNow = theTime.getTime() - now.getTime();
    var timeuntilthetimefromMidnight = theTime.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    if (timeuntilTheTimeFromNow < 0) timeuntilTheTimeFromNow = 0;
    if (timeuntilthetimefromMidnight < 0) timeuntilthetimefromMidnight = 0;

    if (theDate == null)
    {
        theDate = theTime;
    }
    else theDate.setTime(theDate.getTime() + timeuntilthetimefromMidnight);

    var newTimeFromNow = theDate.getTime() - now.getTime();

    var fullmsg = "<@" + interaction.user.id + "> Baba Reminds You: \n" + message;

    // obtain channel
    var channel = await interaction.guild.channels.fetch(interaction.channelId);

    reverseDelay(null, channel, fullmsg, newTimeFromNow);

    return theDate;
}

module.exports = {
    babaFriday, 
    babaHelp, 
    babaPlease, 
    babaPizza, 
    babaVibeFlag, 
    babaYugo, 
    babaHaikuEmbed, 
    babaWednesday, 
    babaDayNextWed,
    babaRepost,
    babaProgress,
    babaJeremy,
    babaRNG,
    babaWhomst,
    babaHurricane,
    babaCat,
    babaWeather,
    babaRemind
};