const { FormatPurityList, HPLGenChannel, HPLGenUsers, HPLSelectChannel, HPLSelectUser, HPLSelectDate, HaikuSelection, GetSimilarName, ObtainDBHolidays, NameFromUserID, HPLGenD8 } = require("./database.js");
const { getD1, FindDate, CheckHoliday, FindNextHoliday, GetDate, dateDiffInDays, MakeImage, funnyDOWText } = require("./helperFunc.js");
var babadata = require('./babotdata.json'); //baba configuration file
var data = require(babadata.datalocation + 'data.json'); //extra data
const Discord = require('discord.js'); //discord module for interation with discord api
const fs = require('fs');
const images = require('images');
const Jimp = require('jimp');
const https = require('https');

const dbenable = !process.argv.includes("-db")

const options = { year: 'numeric', month: 'long', day: 'numeric' }; // for date parsing to string

function babaFriday()
{
    var templocal = babadata.datalocation + "FrogHolidays/"; //creates the output frog image
    var newAttch = new Discord.MessageAttachment().setFile(templocal + "/Friday.jpg"); //makes a new discord attachment
    return { content: "FRIDAY!", files: [newAttch] };
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
    else if (num < 20)
        return { content: "BABA IS HAPPY!" };
    else if (num < 60)
        return { content: "BABA IS THANKS!" };
    else if (num == 69)
        return { content: "Nice!" };
}

function babaPizza()
{
    return { content: "Baba Pizza Ordering Service™ coming soon!" };
}

function babaProgress()
{    
    var date2 = new Date();
    var date1 = new Date(date2.getFullYear() + "-01-01");

    var Difference_In_Time = date2.getTime() - date1.getTime();
    
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

    var leap = date2.getFullYear() % 100 === 0 ? date2.getFullYear() % 400 === 0 : date2.getFullYear() % 4 === 0;

    var endoyear = 365 + leap;

    var percent = +((Difference_In_Days / endoyear) * 100).toFixed(2);

    var pb = "";

    var vdiff = 0;
    var valcount = 0;

    for (var i = 1; i <= 19; i++)
    {
        valcount = endoyear * (i / 20);
        v1plus = endoyear * ((i+1) / 20);

        var vdiff = (v1plus - valcount) / 3;

        if (Difference_In_Days < valcount)
            pb += (valcount - (2 * vdiff) > Difference_In_Days) ? "░" : ((valcount - vdiff > Difference_In_Days) ? "▒" : "▓");
        else
            pb += "█";
    }

    vdiff = (1/20 * endoyear) / 3;
    valcount = endoyear * (19 / 20);

    if (Difference_In_Days > endoyear - (1/12)) pb += "█";
    else pb += (valcount + vdiff > Difference_In_Days) ? "░" : ((valcount + (2 * vdiff) > Difference_In_Days) ? "▒" : "▓");

    return { content: pb + " " + percent + "%" };
}

function babaHelp()
{
    var helptext = "```Commands:"

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
    
    var newAttch = new Discord.MessageAttachment().setFile(babadata.datalocation + "Flags/" + "Night_Shift_" + sood + ".png"); //makes a new discord attachment
    return {content: flagtext, files: [newAttch] };
    
}

function babaYugo()
{
    var yugotext = "Here Yugo!";
    var num = Math.floor(Math.random() * 11); //pick a random one
    var yugo = babadata.datalocation + "Yugo/" + num.toString() + ".jpg";
    return { content: yugotext, files: [yugo] };
}

function babaRepost()
{
    var num = Math.floor(Math.random() * 5); //pick a random one
    var yugo = babadata.datalocation + "Repost/" + num.toString() + ".png";
    return { files: [yugo] };
}


function babaHaikuEmbed(purity, list, chans, mye, buy, msgContent, pagestuff, callback)
{
    if (!dbenable) return callback([{content: "Database is not enabled so no haikus for you!"}]);

    if (purity)
    {
        var hpl = {"retstring": ["No Haiku Purity Found!"], "total": 1};
        var bonust = ""
        var bonupr = ""
        var haifou = false;
        if (list)
        {
            if (chans == 1)
            {
                bonust = " List for Channels"
                HPLGenChannel(function(result)
                {
                    hpl = FormatPurityList(result, true, pagestuff);
                    haifou = true;
                    return callback(EmbedPurityGen(hpl, bonust, bonupr, pagestuff));
                });
            }
            else if (chans == 2)
            {
                bonust = " List for Dates"
                HPLGenD8(function(result)
                {
                    hpl = FormatPurityList(result, 2, pagestuff);
                    haifou = true;
                    return callback(EmbedPurityGen(hpl, bonust, bonupr, pagestuff));
                });
            }
            else
            {
                bonust = " List"
                HPLGenUsers(function(result)
                {
                    hpl = FormatPurityList(result, false, pagestuff);
                    haifou = true;
                    return callback(EmbedPurityGen(hpl, bonust, bonupr, pagestuff));
                });
            }
        }
        else
        {
            if (mye > 0)
            {
                bonupr = "Your ";
                var ids = mye;

                HPLSelectUser(function(result)
                {
                    hpl = FormatPurityList(result, false, pagestuff);

                    if (hpl.retstring.length != 0)
                    {
                        haifou = true;
                        return callback(EmbedPurityGen(hpl, bonust, bonupr, pagestuff));
                    }
                    else hpl = {"retstring": ["No Haiku Purity Found for You :("], "total": 1};
                }, ids);
            }
            else
            {
                var d1 = null;
                var IsDate = FindDate(msgContent);
                if (IsDate != null)
                {
                    d1 = new Date(IsDate.year, IsDate.month - 1, IsDate.day);
                    var mpre = d1.getMonth() + 1 < 10 ? 0 : "";
                    var dpre = d1.getUTCDate() < 10 ? 0 : "";
                    HPLSelectDate(function(result)
                    {
                        hpl = FormatPurityList(result, 2, pagestuff);
                        if (hpl.retstring.length != 0)
                        {
                            haifou = true;
                            return callback(EmbedPurityGen(hpl, bonust, bonupr, pagestuff));
                        }
                        else hpl = {"retstring": ["No Haiku Purity Found!"], "total": 1};
                    }, `${d1.getFullYear()}-${mpre}${d1.getMonth() + 1}-${dpre}${d1.getUTCDate()}`);
                }

                HPLSelectChannel(function(result)
                {
                    hpl = FormatPurityList(result, true, pagestuff);
                    if (hpl.retstring.length != 0)
                    {
                        haifou = true;
                        return callback(EmbedPurityGen(hpl, bonust, bonupr, pagestuff));
                    }
                    else hpl = {"retstring": ["No Haiku Purity Found!"], "total": 1};
                }, msgContent);

                HPLSelectUser(function(result)
                {
                    hpl = FormatPurityList(result, false, pagestuff);

                    if (hpl.retstring.length != 0)
                    {
                        haifou = true;
                        return callback(EmbedPurityGen(hpl, bonust, bonupr, pagestuff));
                    }
                    else hpl = {"retstring": ["No Haiku Purity Found!"], "total": 1};
                }, msgContent);

            }
        }

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
            var obj = {content: "BABA MAKE HAIKU"};
            if (haiku == null) 
            {
                var bad = new Discord.MessageEmbed() // embed for the haiku
                .setColor("#" + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F"))
                .setDescription("No Haikus Found!")
                .setFooter("Haikus by Baba", "https://media.discordapp.net/attachments/574840583563116566/949515044746559568/JSO3bX0V.png");
                obj.embeds = [bad];
                return callback([obj]);
            }

            var showchan = Math.random();
            var showname = Math.random();
            var showdate = Math.random();

            //get signiture and things
            var outname = showname < .025 ? "Anonymous" : (showname < .325 ? haiku.PersonName : (showname < .5 ? haiku.DiscordName : GetSimilarName(simnames))); // .85 > random discord name
            var channame = showchan < .35 ? haiku.ChannelName : "";
            var datetime = showdate < .5 ? new Date(haiku.Date) : "";

            var signature = "";
            
            if (channame == "" && datetime == "") signature = outname; // randomness is great, dont judge
            else 
            {
                signature = outname;

                if (channame != "") signature += " in " + channame;
                if (datetime != "") signature += " on " + datetime.toLocaleDateString('en-US', options);
            }

            exampleEmbed = new Discord.MessageEmbed() // embed for the haiku
            .setColor("#" + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F"))
            .setDescription(haiku.HaikuFormatted)
            .setFooter("- " + (!haiku.Accidental ? "Purposful Haiku by " : "") + signature, "https://media.discordapp.net/attachments/574840583563116566/949515044746559568/JSO3bX0V.png");
            
            obj.embeds = [exampleEmbed];
            return callback([obj]);
        }, buy, msgContent);
    }
}

function EmbedPurityGen(hpl, bonust, bonupr, pagestuff)
{
    var objs = [];
    var pagetotal = Math.ceil(hpl.total / pagestuff.ipp);
    for (var e = 0; e < pagetotal; e++)
    {
        var obj = {content: "BABA MAKE HAIKU"};

        var footer = "Haikus by Baba!";
        if (pagetotal > 1) 
        {
            footer += " - Page " + (1 + e) + " of " + pagetotal;
            var row = new Discord.MessageActionRow();
            
            var pButton = new Discord.MessageButton().setCustomId("page"+(e - 1)).setLabel("Previous").setStyle("PRIMARY");
            var nButton = new Discord.MessageButton().setCustomId("page"+(1 + e)).setLabel("Next").setStyle("PRIMARY");
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
    
        var exampleEmbed = new Discord.MessageEmbed() // embed for the haiku
        .setColor("#" + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F"))
        .setTitle(bonupr + "Haiku Purity" + bonust)
        .setDescription(hpl.retstring[e])
        .setFooter(footer, "https://media.discordapp.net/attachments/574840583563116566/949515044746559568/JSO3bX0V.png");
        obj.embeds = [exampleEmbed];
        objs.push(obj);
    }
    
    return objs;
}


function babaDayNextWed()
{
    let d1 = getD1(); //get today
    var dow_d1 = (d1.getDay() + 4) % 7;//get day of week (making wed = 0)

    var dtnw = ""
    var ct = 7 - dow_d1;
    if (ct == 1)
        dtnw = "\nIt is only " + ct + " day until the next Wednesday!"
    else
        dtnw = "\nIt is only " + ct + " days until the next Wednesday!"
        
    return { content: dtnw };
}

function babaJeremy()
{
    var adjective = data.adjectives[Math.floor(Math.random() * data.adjectives.length)];
    var animal = data.animals[Math.floor(Math.random() * data.animals.length)].replaceAll(' ', '');

    return { content: "```" + adjective + animal + "```" };
}

function babaWednesday(msgContent, author, callback)
{
    var outs = [];
    //let rawdata = fs.readFileSync(babadata.datalocation + "FrogHolidays/" + 'frogholidays.json'); //load file each time of calling wednesday
    //let holidays = JSON.parse(rawdata);

    if (!dbenable) return callback([{content: funnyDOWText(3, author.id) }]);

    ObtainDBHolidays(function(holidays)
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
    
                let d2 = GetDate(d1, yr, holidayinfo);

                if (isNaN(d2))
                {
                    var atch = new Discord.MessageAttachment().setFile(babadata.datalocation + "FrogHolidays/error.png");
                    outs.push({ content: "The date does not exist so BABA will give you ERROR frog!", files: [atch] });
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
                        whenistext += "\n" + holidayinfo.safename + bonustext + " is on " + d2.toLocaleDateString('en-US', options);
                        else
                        {
                            whenistext += "\nThe next occurance of " + holidayinfo.safename + " is on " + d2.toLocaleDateString('en-US', options);
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
                        if (int == 1)
                            dutext = int + " Day until " + holidayinfo.safename; //future text
                        else
                            dutext = int + " Days until " + holidayinfo.safename + bonustext; //future text
                        
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
                        images(templocal + outputname).save(templocal + "outputfrog_0.png");
    
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
                        MakeImage(templocal, base, wednesdayoverlay, weeks, outputname, holidayinfo, false);
                    }
                    catch(err)
                    {
                        MakeImage(templocal, "date_base.png", wednesdayoverlay, weeks, outputname, holidayinfo, true);
                    }
                    
                }
                
                var tempFilePath = templocal + outputname; // temp file location
                templocationslist.push(tempFilePath);
            }
    
            for (var j = 0; j < templocationslist.length; j++)
            {
                var newAttch = new Discord.MessageAttachment().setFile(templocationslist[j]); //makes a new discord attachment
                try
                {
                    fs.accessSync(templocationslist[j], fs.constants.R_OK | fs.constants.W_OK);
                } 
                catch (err)
                {
                    newAttch = new Discord.MessageAttachment().setFile(templocal + "error.png"); //makes a new discord attachment (default fail image)
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
                    outs.push({ content: funnyDOWText(3, author.id) });
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
    if (!dbenable) return callback({content: "Whomst mayhaps are they, BABA not know as BABA Databasen't" });

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

function babaHurricane(hurricanename, callback)
{
    var tempFilePath = babadata.temp + "hurricane.png";
    const file = fs.createWriteStream(tempFilePath);
    var url = "https://www.nhc.noaa.gov/xgtwo/two_atl_5d0.png";

    console.log("Hurricane lookup for " + hurricanename);
    if (hurricanename != "" && hurricanename != null)
    {
        var hurricanenameNum = hurricanename.toUpperCase().charCodeAt(0)
        if (hurricanenameNum >= 65 && hurricanenameNum <= 90)
        {
            hurricanenameNum = hurricanenameNum - 64;
            if (hurricanenameNum < 10) hurricanenameNum = "0" + hurricanenameNum;
            url = "https://www.nhc.noaa.gov/storm_graphics/AT" + hurricanenameNum + "/refresh/AL" + hurricanenameNum + "2022_5day_cone_no_line_and_wind+png/"
        }
    }
    
    console.log(url);

    const request = https.get(url, function(response) {
       response.pipe(file);
    
       // after download completed close filestream
       file.on("finish", () => {
           file.close();
           console.log("Download Completed");

           callback({ content: "Baba Hurricane Info", files: [tempFilePath] });
       });
    });
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
    babaHurricane
};