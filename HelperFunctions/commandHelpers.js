var babadata = require('../babotdata.json'); //baba configuration file
// var request = require('node-fetch');
const Discord = require('discord.js'); //discord module for interation with discord api
const fs = require('fs');
const Jimp = require('jimp');
const fetch = require('node-fetch');

const options = { year: 'numeric', month: 'long', day: 'numeric' }; // for date parsing to string
const { dateDiffInDays, antiDelay, GetDate, GetSimilarName, uExist } = require('./basicHelpers.js');
const { getHurricaneInfo, saveUpdatedHurrInfo } = require('../databaseVoiceController.js');

var to = [];

function getErrorFlag()
{
	return babadata.datalocation + "Flags/" + "error.png";
}

async function MakeImage(templocal, base, wednesdayoverlay, weeks, outputname, holidayinfo, textoverlay) //Image Creation is now function
{
	var plu = false;
	if (weeks > 999999)
	{
		plu = true;
		weeks = 999999;
	}

	var bonus = 0;
	var yeartop = holidayinfo.year && holidayinfo.name != "date" ? true : false;

	if (weeks > 100) //set bonus val and reset weeks to between 1 - 100
	{
		bonus = Math.floor(weeks / 100);
		weeks = weeks % 100;
	}

	Jimp.read(templocal + base).catch((err) => {base = "date_base.png";});
	
	var baseImg = await Jimp.read(templocal + base).catch((err) => {base = "date_base.png"; textoverlay = true;});

	if (base == "date_base.png") baseImg = await Jimp.read(templocal + base);

	var mydudes = await Jimp.read(templocal + "mydudes.png");
	var wednesday = await Jimp.read(templocal + wednesdayoverlay);
	baseImg.composite(mydudes, 0, 0);

	if (!(bonus > 0 && weeks == 0)) //if weeks is 0 and bonus is real - no printing zero
	{
		var week = await Jimp.read(templocal + weeks + ".png");
		baseImg.composite(week, 0, 0);
	}

	baseImg.composite(wednesday, 0, 0);

	var res = await BonusGenerator(bonus, baseImg, templocal, weeks, 1, 1, plu);
	baseImg = res[0];
	var textlocal = res[1];

	if (holidayinfo.name == "date" || textoverlay || yeartop)
	{
		var font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

		baseImg.print(font, 
						yeartop ? 10 : (textoverlay ? 50 : 90),
						textlocal + (yeartop ? 35 : 0),
						yeartop ? holidayinfo.year : holidayinfo.safename,
						textoverlay ? 367 : 467);
	}

	baseImg.write(templocal + outputname);
}

function GetWhite(weekct) //For frogs more than 100 weeks; "Retarded Lookup Table" - Hank 2021
{
	var wites = [
		["1", 0,1,2,4,5,6,9,10], 
		["2", 3,8],
		["3", 7,11,12,14,15,16,18,19],
		["4", 13,17,20],
		["5", 21,22,23,24,25,26,28,29,31,32,33,34,35,37,38,39],
		["6", 27],
		["7", 30,40,50,60,70,80,90],
		["8", 36,41,42,43,44,45,46,47,48,49,
				 51,52,53,54,55,56,57,58,59,
				 61,62,63,64,65,66,67,68,69,
				 71,72,73,74,75,76,77,78,79,
				 81,82,83,84,85,86,87,88,89,
				 91,92,93,94,95,96,97,98,99],
		["9", 100,200,300,400,500,600,700,800,900]
	]; // for more than 100 week

	for ( var i = 0; i < wites.length; i++) 
	{
		var retme = wites[i][0]; //white value
		for ( var j = 0; j < wites[i].length; j++) 
		{
			if (wites[i][j] == weekct) //check for the day in list
				return retme;
		}
	}

	return "8";
}

async function BonusGenerator(bonus, im, templocal, weeks, ct, ln, moere) //for more than 100 weeks
{
	var mult = (40 * ln); //for text output
	var textlocal = 93 + mult - 38; //numbwr

	var kip = false; // for skiping the image being printed

	if (bonus > 0) //creates images for more than 100 weeks
	{
		var bonusbonus = 0; //new bonus value

		var invisbonus = false; //for 1000 line only
		var max = ct == 3 ? 100 : 10; //check if over 1K

		if (bonus >= max) //new values coming soon
		{
			bonusbonus = Math.floor(bonus / max); //calc bonus for next set
			bonus = bonus % max; //current bonus is less than max now
			if (bonus == 0 && ct != 2) //for skiping
			{
				kip = true;
			}
		}

		if (ct == 2 && bonus == 0) //make sure 1000 is printed
		{
			invisbonus = true;
			bonus = 1;
		}

		if (!kip) //not skipped
		{
			textlocal += 38; //move down text
			var ni = new Jimp(427, 512 + mult, "#FFFFFF"); //new imgre
		
			var h = Math.pow(10, (ct + 1) % 4) * bonus; // value of the image
			
			if (h > 1000)
				h = 1000;

			var whitenm = "White" + GetWhite(Math.pow(100, (ct - 1) % 4) * weeks) + ".png"; //white overaly because otherwise there will be 1000 image
			var whiteImg = await Jimp.read(templocal + whitenm);
			var Twight = await Jimp.read(templocal + "TopWhite.png");
			
			if (h == 900 && moere) h = h + "+";

			if (ct != 3 && weeks != 0) //only block white on values where last line wasnt 1000
				im.composite(whiteImg, 0, 0);

			var him = await Jimp.read(templocal + h + ".png");

			ni.composite(him, 0, 0) //draw image
				.composite(im, 0, (ln == 0 ? 0 : 40)) // redraw img
				.composite(him, 0, 0); //make new image with hundred mult and old image

			// ni.draw(images(templocal + h + ".png"), 0, 0) //make new image with hundred mult and old image
			// 	.draw(im, 0, (ln == 0 ? 0 : 40)) // redraw img
			// 	.draw(images(templocal + h + ".png"), 0, 0);//make new image with hundred mult and old image
			
			if (ln != 0)
				ni.composite(Twight, 0, 0); //get rid of black spots
		
			im = ni;
		}

		if (invisbonus) //reset bonus so no ecxtra 1 is printed
			bonus = 0;

		if (ct == 2) //push value through on 1000's
		{
			bonusbonus = (bonusbonus * 10) + bonus;
		}

		var res = await BonusGenerator(bonusbonus, im, templocal, (kip ? weeks : bonus), (ct == 3 ? ct + 2 : ct + 1), ln + (kip ? 0 : 1), moere); //do it again
		
		im = res[0];
		textlocal = res[1];

		return [im, textlocal]; //return textlocal for text spot and image
	}
	else return [im, textlocal]; //return textlocal for text spot and image
}

function FindNextHoliday(d1, yr, simpleholidays)
{
	let diff = 100000;
	var retme = [];
	for (var i = 0; i < simpleholidays.length; i++)
	{
		let d2 = GetDate(d1, yr, simpleholidays[i]);
		let dbigdiff = dateDiffInDays(d1, d2);

		if (dbigdiff < diff)
		{
			retme = [];
			retme.push(simpleholidays[i]);
			diff = dbigdiff;
		}
		else if (dbigdiff === diff)
		{
			retme.push(simpleholidays[i]);
		}
	}
	return retme;
}

function reverseDelay(message, hiddenChan, mess, delay)
{
	if (delay < 0)
		antiDelay(message);
	else
	{
		var newto = setTimeout(function()
		{
			hiddenChan.sendTyping();
			hiddenChan.send(mess);
			to.splice(to.indexOf(newto), 1);
		}, delay);

		to.push(newto);
	}
}

function SingleHaiku(haiku, simnames, page, pagetotal)
{
	var obj = {content: "BABA MAKE HAIKU"};
    var showchan = Math.random();
    var showname = Math.random();
    var showdate = Math.random();

    //get signiture and things
	var outname = "";
	var channame = "";
	var datetime = "";

	if (simnames == null)
	{
    	outname = haiku.DiscordName;
		channame = haiku.ChannelName;
		datetime = new Date(haiku.Date);
	}
    else
	{
		outname = showname < .025 ? "Anonymous" : (showname < .325 ? haiku.PersonName : (showname < .5 ? haiku.DiscordName : GetSimilarName(simnames))); // .85 > random discord name
		channame = showchan < .35 ? haiku.ChannelName : "";
		datetime = showdate < .5 ? new Date(haiku.Date) : "";
	}

    var signature = "";

    if (channame == "" && datetime == "") signature = outname; // randomness is great, dont judge
    else 
    {
        signature = outname;

        if (channame != "") signature += " in " + channame;
        if (datetime != "") signature += " on " + datetime.toLocaleDateString('en-US', options);
    }

	//footer from discordjs

	var footobj = {
		text : "- " + (!haiku.Accidental ? "Purposful Haiku by " : "") + signature + (page != null ? " - Page " + (1 + page) + " of " + pagetotal : ""),
		iconURL : "https://media.discordapp.net/attachments/574840583563116566/949515044746559568/JSO3bX0V.png"
	};

    exampleEmbed = new Discord.EmbedBuilder() // embed for the haiku
    .setColor("#" + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F"))
    .setDescription(haiku.HaikuFormatted)
    .setFooter(footobj);

    obj.embeds = [exampleEmbed];
	return obj;
}

function EmbedHaikuGen(haiku, simnames)
{
    var objs = [];
    if (haiku == null) 
    {
        var footobj = {
            text : "Haikus by Baba",
            iconURL : "https://media.discordapp.net/attachments/574840583563116566/949515044746559568/JSO3bX0V.png"
        };

		var obj = {content: "BABA MAKE HAIKU"};
        var bad = new Discord.EmbedBuilder() // embed for the haiku
        .setColor("#" + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F"))
        .setDescription("No Haikus Found!")
        .setFooter(footobj);
        obj.embeds = [bad];
        return [obj];
    }

	var objs = [];
	for (var e = 0; e < haiku.length; e++)
	{
		var ovb = null;
		var row = new Discord.ActionRowBuilder();

		var URLButton = new Discord.ButtonBuilder().setURL(haiku[e].URL == null ? "https://discord.com/channels/454457880825823252/979881683790733333/1183900512828006492" : haiku[e].URL).setLabel("View Source").setStyle(5);

		if (haiku.length > 1)
		{
			ovb = SingleHaiku(haiku[e], simnames, e, haiku.length);
			var pButton = new Discord.ButtonBuilder().setCustomId("page"+(e - 1)).setLabel("Previous").setStyle(1);
			var nButton = new Discord.ButtonBuilder().setCustomId("page"+(1 + e)).setLabel("Next").setStyle(1);
			
			if (e == 0)
			{
				pButton.setDisabled(true);
			}
			if (e == haiku.length - 1)
			{
				nButton.setDisabled(true);
			}

			var jumpButton = new Discord.ButtonBuilder().setCustomId("jumpToHaiku").setLabel("Jump to ...").setStyle(3);
	
			row.addComponents(pButton, jumpButton, nButton);
		}
		else
		{
			ovb = SingleHaiku(haiku[e], simnames);
		}

		row.addComponents(URLButton);
		
		ovb.components = [row];
		objs.push(ovb);
	}
	
	return objs;
}

function CheckHoliday(msg, holdaylist) //checks if any of the holiday list is said in the message
{
	var retme = [];
	var ct = 0;
	for ( var x in holdaylist) 
	{
		var hol = holdaylist[x];

		if (hol.mode == -2) //skip help info
			continue;

		for ( var i = 0; i < hol.name.length; i++) 
		{
			if ((msg == "BIRTHDAY" && hol.safename == "Birthday") || msg == "ALL" || msg.toLowerCase().includes(hol.name[i].replace("[NY]", new Date().getFullYear() + 1))) //checks if the holiday name is in the message
			{
				var item = {};
				item.name = x; //picture lookup value
				item.mode = hol.mode; //date calc value
				item.safename = hol.safename; //display value
				item.ignoredays = hol.ignoredays; //for days with custom images

				var outps = msg.toLowerCase().split(" ");

				var year = 0;
				for ( var j = 0; j < outps.length; j++)
				{
					var block = outps[j];
					if (year == 0) //set year to first year found
					{
						var iv = parseInt(block);
						if (iv > new Date().getFullYear())
						{
							year = iv;
						}
					}
				}
				
				if (year != 0)
					item.year = year;

				switch(hol.mode)
				{
					case -1: //Nested Holiday
						smsg = msg;
						if (msg == "BIRTHDAY") smsg = "ALL";
						var tempret = CheckHoliday(smsg, hol.sub) //Check all the subs
						for ( var j = 0; j < tempret.length; j++) 
						{
							retme[ct] = tempret[j]; //Add items in return list to current returnlist
							retme[ct].name = item.name + retme[ct].name; //modify name for picture finding
							retme[ct].safename = retme[ct].safename + " " + item.safename; //display text name modify
							ct++; //counter add
						}
						break;
					case 0: //Normal Day/Month Item
						item.day = hol.day;
						item.month = hol.month;
						break;
					case 1: //Day of Week and Week Number per Month - Ex: Thanksgiving
						item.week = hol.week;
						item.dayofweek = hol.dayofweek;
						item.month = hol.month;
						break;
					case 2: //Day of Month based on a day of week - Ex: Friday the 13th
						item.day = hol.day;
						item.dayofweek = hol.dayofweek;
						break;
					case 3: //Easter
						break;
					default:
						console.log(hol);
				}
				if (hol.mode != -1)
				{
					retme[ct] = item;
					ct++;
				}

				break;
			}
		}
	}
	return retme; //returns list of holidays asked for
}

async function loadHurricaneHelpers()
{
	if (global.dbAccess[1] && global.dbAccess[0])
		await getHurricaneInfo();
	
	if(!fs.existsSync(babadata.datalocation + '/hurricanes.json')) 
	{
		fs.writeFileSync(babadata.datalocation + '/hurricanes.json', JSON.stringify([]));
	}

	let rawdata = fs.readFileSync(babadata.datalocation + '/hurricanes.json');
	let baadata = JSON.parse(rawdata);

	return baadata;
}

function checkHurricane(hurricaneName, hurricaneJsonI)
{
	var huricaneNameLetter = hurricaneName.charAt(0).toUpperCase();
	var match = hurricaneJsonI.Name.toLowerCase() == hurricaneName.toLowerCase() || 
	(hurricaneJsonI.Name.charAt(0).toLowerCase() == huricaneNameLetter.toLowerCase() && (hurricaneJsonI.systemType != "POTENTIAL TROPICAL CYCLONE" && hurricaneJsonI.systemType != "TROPICAL DEPRESSION")) ||
	hurricaneJsonI.Number == hurricaneName

	return match;
}

function parseHurricaneDate(date)
{
	// format example 20240926 09:00:00 PM UTC
	var year = date.substring(0, 4);
	var month = date.substring(4, 6);
	var day = date.substring(6, 8);
	var time = date.substring(9, 17);
	var ampm = date.substring(18, 20);

	var ddd = Date.parse(month + " " + day + " " + year + " " + time + " " + ampm + " UTC");
	return ddd;
}

async function checkHurricaneStuff(hurricanename)
{
    var hurricaneJson = await loadHurricaneHelpers();

	var thisYear = new Date().getFullYear();

	// iNum = size of hurricaneJson
	var iNum = hurricaneJson.length;
	var huricaneNameLetter = hurricanename.charAt(0).toUpperCase();

	// check if name is in the list
	for (var i in hurricaneJson)
	{
		// compare lowercase, if not found, compare first letter, if not found, compare number
		if (checkHurricane(hurricanename, hurricaneJson[i]))
		{
			console.log("Hurricane Info Found for " + hurricanename);
			var xml = await fetch(hurricaneJson[i].XMLURL).then(response => response.text());	
			var lastUpdated = xml.split("<messageDateTimeUTC>")[1].split("</messageDateTimeUTC>")[0];
			var lastUpdatedDate = parseHurricaneDate(lastUpdated);
			// if lastUpdated is different than hurricaneJson[i].lastUpdated, update the hurricaneJson[i].lastUpdated
			var newDay = new Date(lastUpdatedDate);
			//  dbDay is hurricaneJson[i].LastUpdated as local time
			var dbDay = new Date(hurricaneJson[i].LastUpdated);
			if (newDay > dbDay)
			{
				console.log("Hurricane Info Updated for " + hurricanename);
				hurricaneJson[i].LastUpdated = newDay.toISOString().slice(0, 19).replace('T', ' ');
				hurricaneJson[i].Updated = true;
				var systemType = xml.split("<systemType>")[1].split("</systemType>")[0];
				var saffirsympson = xml.split("<systemSaffirSimpsonCategory>")[1].split("</systemSaffirSimpsonCategory>")[0];
				hurricaneJson[i].Type = systemType;
				hurricaneJson[i].Category = saffirsympson;
				hurricaneJson[i].Name = xml.split("<systemName>")[1].split("</systemName>")[0];
			}
			
			hurricaneJson[i].OverideText = 
				hurricaneJson[i].Name.charAt(0).toLowerCase() == huricaneNameLetter.toLowerCase() ? {"AltName": hurricanename} : 
				(hurricaneJson[i].Number == hurricanename ? {"NumberSearch": hurricanename} : null);

			iNum = i;
			fs.writeFileSync(babadata.datalocation + '/hurricanes.json', JSON.stringify(hurricaneJson));
			break;
		}
	}

	if (iNum == hurricaneJson.length)
	{
		console.log("Hurricane Info Not Found for " + hurricanename + " searching for it");
		// loop until xml file cant be found
		var xmlFound = true;
		var iNumTemp = iNum;
		while (xmlFound)
		{
			iNumTemp++;

			var hurricanenameNum = iNumTemp;
			if (hurricanenameNum < 10) hurricanenameNum = "0" + hurricanenameNum;
			var url = "https://www.nhc.noaa.gov/storm_graphics/AT" + hurricanenameNum + "/atcf-al" + hurricanenameNum + thisYear + ".xml";

			var urlE = uExist(url);

			if (!urlE)
			{
				xmlFound = false;
				break;
			}

			var xml = await fetch(url).then(response => response.text());

			if (xml.includes("Page Not Found") || xml.includes("503 Service Temporarily Unavailable"))
			{
				xmlFound = false;
				break;
			}

			var id = hurricanenameNum + "" + thisYear;
			var lastUpdated = xml.split("<messageDateTimeUTC>")[1].split("</messageDateTimeUTC>")[0];
			var stormName = xml.split("<systemName>")[1].split("</systemName>")[0];
			var number = iNumTemp;
			var systemType = xml.split("<systemType>")[1].split("</systemType>")[0];
			var saffirsympson = xml.split("<systemSaffirSimpsonCategory>")[1].split("</systemSaffirSimpsonCategory>")[0];
			var imgURL = "https://www.nhc.noaa.gov/storm_graphics/AT" + hurricanenameNum + "/refresh/AL" + hurricanenameNum + thisYear + "_5day_cone_no_line_and_wind+png/";
			var xmlURL = url;
			var year = thisYear;

			var lUpdateDate = new Date(parseHurricaneDate(lastUpdated));

			var item = {
				"ID": id,
				"LastUpdated": lUpdateDate.toISOString().slice(0, 19).replace('T', ' '),
				"Name": stormName,
				"Number": number,
				"Type": systemType,
				"Category": saffirsympson,
				"ImageURL": imgURL,
				"XMLURL": xmlURL,
				"Year": year,
				"Updated": true,
				"OverideText": 
					stormName.charAt(0).toLowerCase() == huricaneNameLetter.toLowerCase() ? {"AltName": hurricanename} : 
					(number == hurricanename ? {"NumberSearch": hurricanename} : null)
			};

			iNum = checkHurricane(hurricanename, item) ? iNumTemp - 1 : iNum;

			console.log("Getting Hurricane Info for " + stormName + " from " + url);

			hurricaneJson.push(item);
	
			fs.writeFileSync(babadata.datalocation + '/hurricanes.json', JSON.stringify(hurricaneJson));
		}
	}

	var pickedItem = hurricaneJson[iNum];

	if (global.dbAccess[1] && global.dbAccess[0])
	{
		saveUpdatedHurrInfo();
	}

	return pickedItem;
}

function monthFromInt(mint)
{
	switch(mint)
	{
		case 1:
			return "January";
		case 2:
			return "Febuary";
		case 3:
			return "March";
		case 4:
			return "April";
		case 5:
			return "May";
		case 6:
			return "June";
		case 7:
			return "July";
		case 8:
			return "August";
		case 9:
			return "September";
		case 10:
			return "October";
		case 11:
			return "November";
		default:
			return "December";
	}
}

var cleanupFn = function cleanup() 
{
	console.log("Ending Delayed Messages");
	if (to != null)  
		to.forEach(clearTimeout);
}

global.CommandHelperCleanup = cleanupFn;

process.on('SIGINT', cleanupFn);
process.on('SIGTERM', cleanupFn);

module.exports = {
    getErrorFlag,
    MakeImage,
    FindNextHoliday,
    reverseDelay,
    EmbedHaikuGen,
    CheckHoliday,
	loadHurricaneHelpers,
	checkHurricaneStuff,
	monthFromInt
};