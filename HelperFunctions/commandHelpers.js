var babadata = require('../babotdata.json'); //baba configuration file
// var request = require('node-fetch');
const Discord = require('discord.js'); //discord module for interation with discord api
const fs = require('fs');
const images = require('images');
const Jimp = require('jimp');
const fetch = require('node-fetch');

const options = { year: 'numeric', month: 'long', day: 'numeric' }; // for date parsing to string
const { dateDiffInDays, antiDelay, GetDate, GetSimilarName, uExist } = require('./basicHelpers.js');

function getErrorFlag()
{
	return babadata.datalocation + "Flags/" + "error.png";
}

function MakeImage(templocal, base, wednesdayoverlay, weeks, outputname, holidayinfo, textoverlay) //Image Creation is now function
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
	
	var im = images(templocal + base) //creates the image using secified overlays
		.draw(images(templocal + "mydudes.png"), 0, 0)
		.draw(images(templocal + wednesdayoverlay), 0, 0);

	if (!(bonus > 0 && weeks == 0)) //if weeks is 0 and bonus is real - no printing zero
	{
		im = im.draw(images(templocal + weeks + ".png"), 0, 0)
			   .draw(images(templocal + wednesdayoverlay), 0, 0);
	}

	var res = BonusGenerator(bonus, im, templocal, weeks, 1, 1, plu);
	im = res[0];
	var textlocal = res[1];

	im.save(templocal + outputname); //save the image

	setTimeout(function()
	{
		if (holidayinfo.name == "date" || textoverlay || yeartop) //overide the image with text if a date
		{
			Jimp.read(templocal + outputname)
				.then(function (image) {
					loadedImage = image;
					return Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
				})
				.then(function (font) {
					loadedImage.print(font, 
									yeartop ? 10 : (textoverlay ? 50 : 90),
									textlocal + (yeartop ? 35 : 0),
									yeartop ? holidayinfo.year : holidayinfo.safename,
									textoverlay ? 367 : 467)
									.write(templocal + outputname);
				})
				.catch(function (err) {
					console.error(err);
				});
		}
	}, 500);
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

function BonusGenerator(bonus, im, templocal, weeks, ct, ln, moere) //for more than 100 weeks
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
			var ni = images(427, 512 + mult); //new imgre
		
			var h = Math.pow(10, (ct + 1) % 4) * bonus; // value of the image
			
			if (h > 1000)
				h = 1000;

			var whitenm = "White" + GetWhite(Math.pow(100, (ct - 1) % 4) * weeks) + ".png"; //white overaly because otherwise there will be 1000 image
			
			if (h == 900 && moere) h = h + "+";

			if (ct != 3 && weeks != 0) //only block white on values where last line wasnt 1000
				im.draw(images(templocal + whitenm), 0, 0);

			ni.draw(images(templocal + h + ".png"), 0, 0) //make new image with hundred mult and old image
				.draw(im, 0, (ln == 0 ? 0 : 40)) // redraw img
				.draw(images(templocal + h + ".png"), 0, 0);//make new image with hundred mult and old image
			
			if (ln != 0)
				ni.draw(images(templocal + "TopWhite.png"), 0, 0);//get rid of black spots
		
			im = ni;
		}

		if (invisbonus) //reset bonus so no ecxtra 1 is printed
			bonus = 0;

		if (ct == 2) //push value through on 1000's
		{
			bonusbonus = (bonusbonus * 10) + bonus;
		}

		var res = BonusGenerator(bonusbonus, im, templocal, (kip ? weeks : bonus), (ct == 3 ? ct + 2 : ct + 1), ln + (kip ? 0 : 1), moere); //do it again
		
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
		setTimeout(function(){hiddenChan.send(mess);}, delay);
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
        var bad = new Discord.MessageEmbed() // embed for the haiku
        .setColor("#" + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F"))
        .setDescription("No Haikus Found!")
        .setFooter(footobj);
        obj.embeds = [bad];
        return [obj];
    }

	if (haiku.length == 1)
		return [SingleHaiku(haiku[0], simnames)];
	else
	{
		var objs = [];
		for (var e = 0; e < haiku.length; e++)
		{
			var ovb = SingleHaiku(haiku[e], simnames, e, haiku.length);
			
			var row = new Discord.MessageActionRow();

			if (haiku.length > 100) 
			{
				var p100btn = new Discord.MessageButton().setCustomId("page"+(e - 100)).setLabel("-100").setStyle("PRIMARY");
				if (e < 100)
				{
					p100btn.setDisabled(true);
				}
				row.addComponents(p100btn);
			}

			var pButton = new Discord.MessageButton().setCustomId("page"+(e - 1)).setLabel("Previous").setStyle("PRIMARY");
			var nButton = new Discord.MessageButton().setCustomId("page"+(1 + e)).setLabel("Next").setStyle("PRIMARY");

			if (e == 0)
			{
				pButton.setDisabled(true);
			}
			if (e == haiku.length - 1)
			{
				nButton.setDisabled(true);
			}
	
			row.addComponents(pButton, nButton);
			
			if (haiku.length > 100) 
			{
				var n100btn = new Discord.MessageButton().setCustomId("page"+(e + 100)).setLabel("+100").setStyle("PRIMARY");
				if (e >= haiku.length - 100)
				{
					n100btn.setDisabled(true);
				}
				row.addComponents(n100btn);
			}
			
			ovb.components = [row];
			objs.push(ovb);
		}
		
		return objs;
	}
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

function loadHurricaneHelpers()
{
	if(!fs.existsSync(babadata.datalocation + '/hurricaneHelp.json')) 
	{
		fs.writeFileSync(babadata.datalocation + '/hurricaneHelp.json', JSON.stringify({}));
	}

	let rawdata = fs.readFileSync(babadata.datalocation + '/hurricaneHelp.json');
	let baadata = JSON.parse(rawdata);

	return baadata;
}

async function checkHurricaneStuff(hurricanename, isFirst, eye)
{
    var hurricaneJson = loadHurricaneHelpers();

	var thisYear = new Date().getFullYear();
	var hurricanenameNum = hurricanename.toUpperCase().charCodeAt(0)

	hurricanenameNum = hurricanenameNum - 64;
	hurricanenameNum = hurricanenameNum + eye;

	if (hurricanenameNum < 10) hurricanenameNum = "0" + hurricanenameNum;

	var url = "https://www.nhc.noaa.gov/storm_graphics/AT" + hurricanenameNum + "/atcf-al" + hurricanenameNum + thisYear + ".xml";

	var urlE = uExist(url);

	if (!urlE)
	{
		if (isFirst)
			return false
		else
			return true;
	}

	var xml = await fetch(url).then(response => response.text());

	if (xml.includes("Page Not Found"))
	{
		if (isFirst)
			return false
		else
			return true;
	}
	var storm = xml.split("<systemName>")[1].split("</systemName>")[0];

	// check if in hurricaneJson
	if (hurricaneJson[storm] == null)
	{
		hurricaneJson[storm] = {"name": storm.toLowerCase(), "letter": storm.charAt(0), "url": ""};
		hurricaneJson[storm].url = "https://www.nhc.noaa.gov/storm_graphics/AT" + hurricanenameNum + "/refresh/AL" + hurricanenameNum + thisYear + "_5day_cone_no_line_and_wind+png/";
	}

	// save hurricaneJson
	fs.writeFileSync(babadata.datalocation + '/hurricaneHelp.json', JSON.stringify(hurricaneJson));

	// check if hurricaneName is in hurricaneJson
	if (hurricaneJson[hurricanename.toUpperCase()] != null)
		return true;
	else
		return false;
}

module.exports = {
    getErrorFlag,
    MakeImage,
    FindNextHoliday,
    reverseDelay,
    EmbedHaikuGen,
    CheckHoliday,
	loadHurricaneHelpers,
	checkHurricaneStuff
};