import {
	setGrole,
	setVote,
	setVBH,
	movetoChannel,
	GetDate,
	MakeImage,
	dateDiffInDays,
	FindDate,
	SetHolidayChan,
	MonthsPlus,
	CreateChannel,
	CheckFrogID,
	FindNextHoliday,
	CheckHoliday,
} from "./helperFunc.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { Client, Intents } = require('discord.js'); //discord module for interation with discord api
const Discord = require('discord.js'); //discord module for interation with discord api
var babadata = require('./babotdata.json'); //baba configuration file
//let request = require('request'); // not sure what this is used for //depricated
import fs from "fs"; //file stream used for del fuction
import images from "images"; //image manipulation used for the wednesday frogs
import Jimp  from "jimp";  //image ability to add text

let databaseofhaiku = {haikus: [], purity: {date: [], person: [], channel: []}}; //haiku list
const options = { year: 'numeric', month: 'long', day: 'numeric' }; // for date parsing to string

//To Do:
/*
	- Stop Calls to Funciton until images posted! - Sami
	- Bruh Mode? - Ryan
	- Memorial Day - Last Select Day of Month
	- make a better to do list
	- make if (message.content.includes("847324692288765993")) do somthing more interesting
*/


const { Console } = require('console');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
/* [ 	["christmas", 12, 25, 0, 0], 
	["thanksgiving", 11, 0, 4, 4], 
	["st patrick", 3, 17, 0, 0],
	["halloween", 10, 31, 0, 0],
	["new year", 1, 1, 0, 0],
	["summer solstice", 6, 21, 0, 0],
	["winter solstice", 12, 21, 0, 0],
	["valentine", 2, 14, 0, 0],
	["easter", 2, 14, 0, 0],
	["friday", 2, 14, 0, 0]
]; */ // ["name", month, day of week, week num, weekday] -- day of week for exact date holiday, week num + weekday for holidays that occur on specific week/day of week
// 0 = Sunday, 1 = Monday ... 6 = Saturday for option 5



//stuff when message is recived.
export function babaMessage(bot, message)
{
	let rawdata = fs.readFileSync(babadata.datalocation + "FrogHolidays/" + 'frogholidays.json'); //load file each time of calling wednesday
	let frogdata = JSON.parse(rawdata);
	var g, rl = null;
	var sentvalid = false;
	var idint = CheckFrogID(frogdata, message.author.id);
	var rid = frogdata.froghelp.rfrog[0];
	var msgContent = message.content.toLowerCase();

	if (message.channel.type == "DM" && idint >= 0)
	{
		rid = frogdata.froghelp.rfrog[idint];
		g = bot.guilds.resolve(frogdata.froghelp.mainfrog);
		rl = g.roles.cache.find(r => r.id === rid);
		sentvalid = true;
	}
	
	if (sentvalid)
	{
		if (msgContent.includes("🐸 debug")) //0 null, 1 spook, 2 thanks, 3 crimbo, 4 defeat
		{
			if (msgContent.includes("0"))
				SetHolidayChan(message, "null");
			else if (msgContent.includes("1"))
				SetHolidayChan(message, "spook");
			else if (msgContent.includes("2"))
				SetHolidayChan(message, "thanks");
			else if (msgContent.includes("3"))
				SetHolidayChan(message, "crimbo");
			else if (msgContent.includes("4"))
				SetHolidayChan(message, "defeat");
	
			message.author.send("```HC: " + babadata.holidaychan + "\nHV: " + babadata.holidayval + "```");
		}
		else if (msgContent.includes("clrre"))
		{
			var message_id = message.content.replace(/\D/g,''); //get message id
			var chanMap = g.channels.fetch().then(channels => {
				channels.each(chan => { //iterate through all the channels
					if (chan.type == "GUILD_TEXT") //make sure the channel is a text channel
					{
						chan.messages.fetch(message_id).then(message => message.reactions.removeAll()).catch(console.error); //try to get the message, if it exists call setVote, otherwise catch the error
					}
				});
			});
		}
		else if (msgContent.includes("funny silence"))
		{
			var message_id = message.content.replace(/\D/g,''); //get message id
			var chanMap = g.channels.fetch().then(channels => {
				channels.each(chan => { //iterate through all the channels
					if (chan.type == "GUILD_TEXT") //make sure the channel is a text channel
					{
						chan.messages.fetch(message_id).then(message => movetoChannel(message, chan, babadata.logchan)).catch(console.error); //try to get the message, if it exists call setVote, otherwise catch the error
					}
				});
			});
		}
		else if (msgContent.includes("silence"))
		{
			var message_id = message.content.replace(/\D/g,''); //get message id
			var chanMap = g.channels.fetch().then(channels => {
				channels.each(chan => { //iterate through all the channels
					if (chan.type == "GUILD_TEXT") //make sure the channel is a text channel
					{
						chan.messages.fetch(message_id).then(message => message.delete()).catch(console.error); //try to get the message, if it exists call setVote, otherwise catch the error
					}
				});
			});
		}
		else if (msgContent.includes("cmes"))
		{
			var message_id = message.content.split(' ').slice(1, 2).join(' ').replace(' ',''); //get the name for the role
			
			var mess = message.content.split(' ').slice(2, ).join(' '); //get the name for the role
			message_id = message_id.replace(/\D/g,''); //get message id
			var hiddenChan = g.channels.cache.get(message_id); //gets the special archive channel
			hiddenChan.send(mess);
		}
	}

	if (babadata.holidaychan == null)
	{
		let rawdata = fs.readFileSync(__dirname + '/babotdata.json');
		let baadata = JSON.parse(rawdata);
		baadata.holidaychan = "0";
		baadata.holidayval = "null";
		let n = JSON.stringify(baadata)
		fs.writeFileSync(__dirname + '/babotdata.json', n);

		babadata = baadata;
	}

	var dateoveride = [false, 1, 1]; //allows for overiding date manually (testing)

	var yr = new Date().getFullYear(); //get this year
	var dy = dateoveride[0] ? dateoveride[2] : new Date().getDate(); //get this day
	var my = dateoveride[0] ? dateoveride[1] - 1 : new Date().getMonth(); //get this month
	var d1 = new Date(yr, my, dy) //todayish

	if (babadata.holidayval == "defeat")
	{
		//560231259842805770  563063109422415872
		if(msgContent.includes(yr - 1) && msgContent.includes("560231259842805770") && msgContent.includes("563063109422415872") && !message.author.bot) //if message contains baba and is not from bot
		{
			SetHolidayChan(message, "null", 0);
		}
	}

	if (d1.getMonth() < 9 && message.guild != null)
	{
		if (babadata.holidayval != "defeat" && d1.getMonth() == 0 && d1.getDate() == 1 && babadata.holidayval != "null")
		{
			SetHolidayChan(message, "defeat");
		}
	}
	else if (d1.getMonth() >= 9 && message.guild != null)
	{
		if (babadata.holidaychan == 0)
		{
			var server = message.guild;
			CreateChannel(server, "text channels", message, d1);
		}
		MonthsPlus(message, d1);
	}

	if(message.content.toLowerCase().includes('perchance') && !message.author.bot) //perchance update
		{
			message.channel.send("You can't just say perchance");
		}
	if(message.content.toLowerCase().includes('!baba') && !message.author.bot) //if message contains baba and is not from bot
	{
		var exampleEmbed = null;
		var text = 'BABA IS ADMIN'; //start of reply string for responce message.
		
		if(msgContent.includes('password')) //reply with password file string if baba password
		{
			text += '\n' + babadata.pass;
		}
		if (message.content.includes("847324692288765993")) //this could do something better but its ok for now
		{
			text += "\nLET'S SAUSAGE";
		}

		message.channel.send({ content: text });

		if (msgContent.includes("friday"))
		{
			var templocal = babadata.datalocation + "FrogHolidays/"; //creates the output frog image
			newAttch = new Discord.MessageAttachment().setFile(templocal + "/Friday.jpg"); //makes a new discord attachment
			message.channel.send({ content: "FRIDAY!", files: [newAttch] });
		}

		if (msgContent.includes("please")) //this could do something better but its ok for now
		{
			var num = Math.floor(Math.random() * 100); //pick a random one
			if (num < 2)
				message.channel.send({ content: "AAAAAAAAAAA" });
			else if (num < 20)
				message.channel.send({ content: "BABA IS HAPPY!" });
			else if (num < 60)
				message.channel.send({ content: "BABA IS THANKS!" });
			else if (num == 69)
				message.channel.send({ content: "Nice!" });
		}

		if (msgContent.includes("order pizza"))
		{
			message.channel.send({ content: "Baba Pizza Ordering Service™ coming soon!" });
		}

		if(msgContent.includes('help')) //reply with help text is baba help
		{
			var helptext = "```Commands:"

			helptext += "\n" + "- !baba password - Gets the server password for games!"
			helptext += "\n" + "- !baba [night shift | vibe time] flag - Gets the current vibe time flag for the day!"
			helptext += "\n" + "- !baba make yugo - Baba will give you a yugo!"
			
			helptext += "\n" + "- !baba haiku - Pulls a random haiku from the haiku database of the server!"
			helptext += "\n" + "- !baba haiku purity list [channels] - Gets a list of all people or channels haiku purity's!"
			helptext += "\n" + "- !baba my haiku purity - Gets the haiku purity of the sender!"
			helptext += "\n" + "- !baba haiku purity [channel/person/date] - Gets the haiku purity of the the specified value!"
			
			helptext += "\n" + "- !baba wednesday {holiday} - Displays a frog with how many wednesdays until the specified holiday!"
			helptext += "\n" + "- !baba days until {holiday} - Displays how many days until specified holiday!"
			helptext += "\n" + "- !baba when is {holiday} - Displays the exact date of the specified holiday!"
			helptext += "\n" + "- !baba day of week {holiday} - Displays what day of week the specified holiday is!```"

			message.channel.send({ content: helptext });
		}

		if (msgContent.includes('flag') && (msgContent.includes('night shift') || msgContent.includes('vibe time')))
		{
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
			message.channel.send({content: flagtext, files: [newAttch] }).catch(error => {
				newAttch = new Discord.MessageAttachment().setFile(babadata.datalocation + "Flags/" + "error.png"); //makes a new discord attachment (default fail image)
				message.channel.send({content: flagtext, files: [newAttch] }); // send file
			});
		}
/*
		if (msgContent.includes("music"))
		{
			if (msgContent.includes("play"))
				message.channel.send("!play " + babadata.vibe);
			if (msgContent.includes("shuffle"))
				message.channel.send("!shuffle");
		}
*/
		if(msgContent.includes('make yugo')) //reply with password file string if baba password
		{
			var yugotext = "Here Yugo!";
			var num = Math.floor(Math.random() * 11); //pick a random one
			var yugo = babadata.datalocation + "Yugo/" + num.toString() + ".jpg";
			message.channel.send({ content: yugotext, files: [yugo] });
		}

		if (msgContent.includes('haiku')) // add custom haiku search term?
		{
			CreateHaikuDatabase(); // in case new haikus

			if (msgContent.includes("purity"))
			{
				var hpl = "No Haiku Purity Found!"
				var bonust = ""
				var bonupr = ""
				if (msgContent.includes("list"))
				{
					if (msgContent.includes("channels"))
					{
						hpl = FormatPurityList(databaseofhaiku.purity.channel, true);
						bonust = " List for Channels"
					}
					else
					{
						//people purity list
						hpl = FormatPurityList(databaseofhaiku.purity.person, false);
						bonust = " List"
					}
				}
				else
				{
					if (msgContent.includes("my"))
					{
						bonupr = "Your ";
						var ids = message.author.id;

						hpl = "No Haiku Purity Found for You :(";
						for ( var x in databaseofhaiku.purity.person)
						{
							var lin = databaseofhaiku.purity.person[x];
							if (lin.ID === ids.toString())
							{
								hpl = GenInfo(x, lin, 0);
							}
						}
					}
					else
					{
						var fnd = false;
						if (!fnd)
						{
							for ( var x in databaseofhaiku.purity.person)
							{
								var lin = databaseofhaiku.purity.person[x];
								if (msgContent.includes(x.toLowerCase()) || msgContent.includes(lin.ID))
								{
									fnd = true;
									hpl = GenInfo(x, lin, 0);
								}
							}
						}
						if (!fnd)
						{
							for ( var x in databaseofhaiku.purity.channel)
							{
								var lin = databaseofhaiku.purity.channel[x];
								if (msgContent.includes(x.toLowerCase()) || msgContent.includes(lin.ID))
								{
									fnd = true;
									hpl = GenInfo(x, lin, 1);
								}
							}
						}
						if (!fnd)
						{
							var IsDate = FindDate(IsHoliday, message.content);
							if (IsDate)
							{
								let d1 = new Date(IsDate.year, IsDate.month - 1, IsDate.day);
								for ( var x in databaseofhaiku.purity.date)
								{
									if (Date.parse(x) == Date.parse(d1))
									{
										var lin = databaseofhaiku.purity.date[x];
										fnd = true;
										hpl = GenInfo(d1.toLocaleDateString('en-US', options), lin, 2);
									}
								}
							}
						}
					}
				}

				exampleEmbed = new Discord.MessageEmbed() // embed for the haiku
				.setColor("#" + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F"))
				.setTitle(bonupr + "Haiku Purity" + bonust)
				.setDescription(hpl)
				.setFooter("Haikus by Baba!", "https://media.discordapp.net/attachments/574840583563116566/949515044746559568/JSO3bX0V.png");
			}
			else
			{
				var num = Math.floor(Math.random() * databaseofhaiku.haikus.length);
				var haiku = databaseofhaiku.haikus[num];

				if (msgContent.includes("by"))
				{
					var hpl = "No Haiku Purity Found!";
					var person = null;
					for ( var x in databaseofhaiku.purity.person)
					{
						var lin = databaseofhaiku.purity.person[x];
						if (msgContent.includes(x.toLowerCase()) || msgContent.includes(lin.ID))
						{
							fnd = true;
							person = x;
						}
					}

					if (person != null)
					{
						haiku = GetHaikuPerPerson(person);
					}
				}
	
				var showchan = Math.random();
				var showname = Math.random();
				var showdate = Math.random();
	
				//get signiture and things
				var outname = showname < .025 ? "Anonymous" : (showname < .325 ? haiku.Person : (showname < .5 ? haiku.DiscordName : GetSimilarName(haiku.Person))); // .85 > random discord name
				var channame = showchan < .35 ? haiku.Channel : "";
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
				.setDescription(haiku.HaikuFormat)
				.setFooter("- " + (!haiku.Accident ? "Purposful Haiku by " : "") + signature, "https://media.discordapp.net/attachments/574840583563116566/949515044746559568/JSO3bX0V.png");
				
			}
		}

		if (exampleEmbed != null) 
			message.channel.send({ content: "BABA MAKE HAIKU", embeds: [exampleEmbed] });

		if (msgContent.includes('wednesday') || msgContent.includes('days until') || msgContent.includes('when is') || msgContent.includes('day of week'))
		{
			let rawdata = fs.readFileSync(babadata.datalocation + "FrogHolidays/" + 'frogholidays.json'); //load file each time of calling wednesday
			let holidays = JSON.parse(rawdata);

			let d1 = new Date(yr, my, dy); //get today
			var dow_d1 = (d1.getDay() + 4) % 7;//get day of week (making wed = 0)
			let d1_useage = new Date(d1.getFullYear(), d1.getMonth(), 1); //today that has been wednesday shifted
			d1_useage.setDate(d1.getDate() - dow_d1); //modify today for wednesdays

			if (msgContent.includes('days until next wednesday'))
			{
				var dtnw = ""
				var ct = 7 - dow_d1;
				if (ct == 1)
					dtnw = "\nIt is only " + ct + " day until the next Wednesday!"
				else
					dtnw = "\nIt is only " + ct + " days until the next Wednesday!"
				
				message.channel.send({ content: dtnw });
			}
	
			var IsHoliday = CheckHoliday(message.content, holidays); //get the holidays that are reqested
			var IsDate = FindDate(IsHoliday, message.content);
			
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
			
			if(IsHoliday.length > 0) //reply with password file string if baba password
			{
				var templocationslist = [];

				for ( var i = 0; i < IsHoliday.length; i++) //loop through the holidays that are requested
				{
					var holidayinfo = IsHoliday[i];
	
					if (holidayinfo.name != "date" && holidayinfo.year)
						yr = holidayinfo.year;

					let d2 = GetDate(d1, yr, holidayinfo);

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
						message.channel.send({ content: additionaltext });

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

						if (holidayinfo.name == "date")
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

				setTimeout(function()
				{ 
					for (var j = 0; j < templocationslist.length; j++)
					{
						newAttch = new Discord.MessageAttachment().setFile(templocationslist[j]); //makes a new discord attachment
						message.channel.send({ content: "It is Wednesday, My BABAs", files: [newAttch] }).catch(error => {
							newAttch = new Discord.MessageAttachment().setFile(templocal + "error.png"); //makes a new discord attachment (default fail image)
							message.channel.send({ content: "It is Wednesday, My BABAs", files: [newAttch] }); // send file
						});
					}
				}, 500);
			}
			else
			{
				message.channel.send("It is Wednesday, My Dudes");
			}

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
	}
	if(msgContent.includes('!bdelete')) //code to del and move to log
	{
		if(message.channel.type != "DM" && message.member.roles.cache.has(babadata.adminid)) //check if admin
		{
			var message_id = message.content.replace(/\D/g,''); //get message id
			var chanMap = message.guild.channels.fetch().then(channels => {
				channels.each(chan => { //iterate through all the channels
					if (chan.type == "GUILD_TEXT") //make sure the channel is a text channel
					{
						chan.messages.fetch(message_id).then(message => movetoChannel(message, chan, babadata.logchan)).catch(console.error); //try to get the message, if it exists call deleteAndArchive, otherwise catch the error
					}
				});
			}); //get a map of the channelt in the guild
		}
	}
	if(msgContent.includes('!political')) //code to del and move to log
	{
		if(message.channel.type != "DM" && message.member.roles.cache.has(babadata.adminid)) //check if admin
		{
			var message_id = message.content.replace(/\D/g,''); //get message id
			var chanMap = message.guild.channels.fetch().then(channels => {
				channels.each(chan => { //iterate through all the channels
					if (chan.type == "GUILD_TEXT") //make sure the channel is a text channel
					{
						chan.messages.fetch(message_id).then(message => movetoChannel(message, chan, babadata.politicschan)).catch(console.error); //try to get the message, if it exists call deleteAndArchive, otherwise catch the error
					}
				});
			}); //get a map of the channelt in the guild
		}
	}
	if(msgContent.includes('!setvote')) //code to set vote
	{
		if(message.channel.type != "DM" && message.member.roles.cache.has(babadata.adminid)) //check if admin
		{
			var message_id = message.content.replace(/\D/g,''); //get message id
			var chanMap = message.guild.channels.fetch().then(channels => {
				channels.each(chan => { //iterate through all the channels
					if (chan.type == "GUILD_TEXT") //make sure the channel is a text channel
					{
						chan.messages.fetch(message_id).then(message => setVote(message)).catch(console.error); //try to get the message, if it exists call setVote, otherwise catch the error
					}
				});
			});
		}
	}
	if(msgContent.includes('!bsetstatus')) //code to set game
	{
		if(message.channel.type != "DM" && message.member.roles.cache.has(babadata.adminid)) //check if admin
		{
			var text = msgContent;
			var tyepe = -1;
			if (text.includes("idle"))
				tyepe = "idle";
			if (text.includes("afk"))
				tyepe = "idle";
			else if (text.includes("online"))
				tyepe = "online";
			else if (text.includes("woke"))
				tyepe = "online";
			else if (text.includes("invisible"))
				tyepe = "invisible";
			else if (text.includes("offline"))
				tyepe = "invisible";
			else if (text.includes("dnd"))
				tyepe = "dnd";
			else if (text.includes("do not disturb"))
				tyepe = "dnd";

			if (tyepe == -1)
				tyepe = "online";
			
			bot.user.setStatus(tyepe);
		}
	}
	if(msgContent.includes('!bsetgame')) //code to set game
	{
		if(message.channel.type != "DM" && message.member.roles.cache.has(babadata.adminid)) //check if admin
		{
			var text = msgContent;
			var tyepe = -1;
			var lc = 2;
			if (text.includes("watching"))
				tyepe = 3;
			else if (text.includes("playing"))
				tyepe = 0;
			else if (text.includes("listening"))
				tyepe = 2;
			else if (text.includes("competing"))
				tyepe = 5;
			else if (text.includes("streaming"))
				tyepe = 1;

			if (tyepe == -1)
			{
				tyepe = 0;
				lc = 1;
			}
			
			var mess = message.content.split(' ').slice(lc, ).join(' '); //get the name for the role

			var help = { type: tyepe };
			if (tyepe == 1)
				help.url = "https://www.twitch.tv/directory/game/Baba%20is%20You";
			
			bot.user.setActivity(mess, help);
		}
	}
	if(msgContent.includes('!banhammer')) //code to set ban hammer
	{
		if(message.channel.type != "DM" && message.member.roles.cache.has(babadata.adminid)) //check if admin
		{
			var message_id = message.content.replace(/\D/g,''); //get message id
			var chanMap = message.guild.channels.fetch().then(channels => {
				channels.each(chan => { //iterate through all the channels
					if (chan.type == "GUILD_TEXT") //make sure the channel is a text channel
					{
						chan.messages.fetch(message_id).then(message => setVBH(message)).catch(console.error); //try to get the message, if it exists call setVBH, otherwise catch the error
					}
				});
			});
		}
	}
	if(msgContent.includes('!grole')) //code to set game role
	{
		if(message.channel.type != "DM" && message.member.roles.cache.has(babadata.adminid)) //check if admin
		{
			role_name = message.content.split(' ').slice(0, 2).join(' ').substring(6).replace(' ',''); //get the name for the role
			var message_id = message.content.replace(role_name,''); //remove role name from string
			message_id = message_id.replace(/\D/g,''); //get message id
			var fnd = false;
			var chanMap = message.guild.channels.fetch().then(channels => {
				channels.each(chan => { //iterate through all the channels
					if (!fnd && chan.type == "GUILD_TEXT") //make sure the channel is a text channel
					{
						chan.messages.fetch(message_id).then(message => {
							fnd = true;
							setGrole(message, role_name);
						}).catch(console.error); //try to get the message, if it exists call setGrole, otherwise catch the error
					}
				});
			});
		}
	}
};

//async function tempoutput(msg, lp)  //temporary output function for testing
//{
//	var t = "";
//
//	for ( var i = 0; i < lp.length; i++) 
//	{
//		t += lp[i] + "\n";
//	}
//
//	msg.channel.send(t);
//}


function GetSimilarName(namesearch) //list of names based on person
{
	var bagohumans = []; // for the randomness
	for ( var x in databaseofhaiku.haikus)
	{
		var item = databaseofhaiku.haikus[x]; //get the item
		if (item.Person == namesearch)
		{
			var parthuman = item.DiscordName;
			if (!bagohumans.includes(parthuman))
			{
				bagohumans.push(parthuman); //add the name to the list
			}
		}
	}

	var num = Math.floor(Math.random() * bagohumans.length); //pick a random one
	var human = bagohumans[num];

	return human;
}

export function CreateHaikuDatabase() //database of haikus making
{
	let rawdata = fs.readFileSync(babadata.datalocation + "haikus.json"); //load file
	let sheetjson = JSON.parse(rawdata);

	if (sheetjson.Data.length - 1 == databaseofhaiku.haikus.length) //skip if size is same is fine
		return;

	databaseofhaiku.haikus = [];
	databaseofhaiku.purity.date = [];
	databaseofhaiku.purity.person = [];
	databaseofhaiku.purity.channel = [];

	var ct = 0;

	for (const num in sheetjson.Data) // loop though data sheet
	{
		var x = sheetjson.Data[num];
		if (num > 0)
		{
			var item = {} //create the item
			item.Person = x.A;
			item.Haiku = x.B;
			item.HaikuFormat = x.C;
			item.DiscordName = x.D;
			item.Accident = x.E == "Yes";
			item.Channel = x.F;
			item.Date = x.H;

			UpdatePurityScore(x.A, x.F, x.H, item.Accident);

			databaseofhaiku.haikus[ct] = item;
			ct++;
		}
	}

	for (const num in sheetjson.Accidental) // loop though data sheet
	{
		var x = sheetjson.Accidental[num];
		if (num > 0)
		{
			if (x.A)
				databaseofhaiku.purity.person[x.A].ID = x.B
			if (x.G)
				databaseofhaiku.purity.channel[x.G].ID = x.H
		}
	}
}

function UpdatePurityScore(person, channel, date, accidental)
{
	//person
	if (databaseofhaiku.purity.person[person] == undefined)
	{
		databaseofhaiku.purity.person[person] = {Count: 0, Accidental: 0, ID: ""};
	}
	databaseofhaiku.purity.person[person].Count ++;
	databaseofhaiku.purity.person[person].Accidental += accidental ? 1 : 0;

	//channel
	if (databaseofhaiku.purity.channel[channel] == undefined)
	{
		databaseofhaiku.purity.channel[channel] = {Count: 0, Accidental: 0, ID: ""};
	}
	databaseofhaiku.purity.channel[channel].Count ++;
	databaseofhaiku.purity.channel[channel].Accidental += accidental ? 1 : 0;

	//date
	if (databaseofhaiku.purity.date[date] == undefined)
	{
		databaseofhaiku.purity.date[date] = {Count: 0, Accidental: 0};
	}
	databaseofhaiku.purity.date[date].Count ++;
	databaseofhaiku.purity.date[date].Accidental += accidental ? 1 : 0;
}

function compare( a, b ) 
{
	if (a.Count < b.Count)
	{
	  return 1;
	}
	if (a.Count > b.Count)
	{
	  return -1;
	}
	return 0;
  }

function FormatPurityList(list, chan)
{
	lists = [];
	for ( var x in list)
	{
		var lin = list[x];
		lin.Name = x;
		lists.push(lin);
	}

	lists.sort(compare);

	var retme = ""
	for ( var x in lists)
	{
		var lin = lists[x];
		retme += GenInfo(lin.Name, lin, chan) + "\n\n";
	}

	return retme;
}

function GetHaikuPerPerson(person)
{
	var pickfrom = [];
	for (var h in databaseofhaiku.haikus)
	{
		if (databaseofhaiku.haikus[h].Person == person)
			pickfrom.push(databaseofhaiku.haikus[h]);
	}

	var num = Math.floor(Math.random() * pickfrom.length);
	var haiku = pickfrom[num];

	return haiku;
}

function GenInfo(x, line, chan)
{
	var pct = line.Accidental/parseFloat(line.Count); // purity percentage
	pct = (pct * 100)
	pct = +pct.toFixed(3);
	return x + (chan == 2 ? "" : " [<" + (chan == 1 ? "#" : "@") + line.ID + ">]") + "\n\t`" + line.Count + " Haikus` - `" + line.Accidental + " Accidental` - `" + pct + "% Purity`";
}
 

