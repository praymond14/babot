const { Client, Intents } = require('discord.js'); //discord module for interation with discord api
const Discord = require('discord.js'); //discord module for interation with discord api
var babadata = require('./babotdata.json'); //baba configuration file
//let request = require('request'); // not sure what this is used for //depricated
var request = require('node-fetch');
let fs = require('fs'); //file stream used for del fuction
var images = require("images"); //image manipulation used for the wednesday frogs
var Jimp = require("jimp"); //image ability to add text

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

// Initialize Discord Bot
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES], partials: ["CHANNEL"]});

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

bot.login(babadata.token); //login

//not shure what this does but it was in jeremy's code so
bot.on('ready', function (evt) 
{
	console.log('Connected');

	CreateHaikuDatabase(); // load it in
});

//stuff when message is recived.
bot.on('messageCreate', message => 
{
	let rawdata = fs.readFileSync(babadata.datalocation + "FrogHolidays/" + 'frogholidays.json'); //load file each time of calling wednesday
	let frogdata = JSON.parse(rawdata);
	var g, rl = null;
	sentvalid = false;
	var idint = CheckFrogID(frogdata, message.author.id);
	rid = frogdata.froghelp.rfrog[0];

	if (message.channel.type == "DM" && idint >= 0)
	{
		rid = frogdata.froghelp.rfrog[idint];
		g = bot.guilds.resolve(frogdata.froghelp.mainfrog);
		rl = g.roles.cache.find(r => r.id === rid);
		sentvalid = true;
	}
	
	if (sentvalid)
	{
		if (message.content.toLowerCase().includes("🐸 debug")) //0 null, 1 spook, 2 thanks, 3 crimbo, 4 defeat
		{
			if (message.content.toLowerCase().includes("0"))
				SetHolidayChan(message, "null");
			else if (message.content.toLowerCase().includes("1"))
				SetHolidayChan(message, "spook");
			else if (message.content.toLowerCase().includes("2"))
				SetHolidayChan(message, "thanks");
			else if (message.content.toLowerCase().includes("3"))
				SetHolidayChan(message, "crimbo");
			else if (message.content.toLowerCase().includes("4"))
				SetHolidayChan(message, "defeat");
	
			message.author.send("```HC: " + babadata.holidaychan + "\nHV: " + babadata.holidayval + "```");
		}
		else if (message.content.toLowerCase().includes("clrre"))
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
		else if (message.content.toLowerCase().includes("funny silence"))
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
		else if (message.content.toLowerCase().includes("silence"))
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
		else if (message.content.toLowerCase().includes("cmes"))
		{
			var message_id = message.content.split(' ').slice(1, 2).join(' ').replace(' ',''); //get the name for the role
			
			var mess = message.content.split(' ').slice(2, ).join(' '); //get the name for the role
			message_id = message_id.replace(/\D/g,''); //get message id
			var hiddenChan = g.channels.cache.get(message_id); //gets the special archive channel
			hiddenChan.send(mess);
		}
		//else if (message.content.toLowerCase().includes("aa"))
		//{
		//	if (message.content.toLowerCase().includes("add"))
		//	{
		//		var chanMap = g.channels.fetch().then(channels => {
		//			channels.each(chan => { //iterate through all the channels
		//				if (chan.type == "GUILD_TEXT") //make sure the channel is a text channel
		//				{
		//					const botPermissionsIn  = chan.permissionsFor(rl);
		//					var perms = botPermissionsIn.toArray();
		//					var vc = false;
//
		//					for (i = 0; i < perms.length; i++) 
		//					{
		//						var p = perms[i];
		//						if (p === "VIEW_CHANNEL")
		//							vc = true;
		//					}
//
		//					if (!vc)
		//					{
		//						chan.permissionOverwrites.edit(rid, { VIEW_CHANNEL: true, READ_MESSAGE_HISTORY: true, SEND_MESSAGES: true });
		//					}
		//				}
		//			});
		//		});
		//	}
		//	else if (message.content.toLowerCase().includes("remove"))
		//	{
		//		var chanMap = g.channels.fetch().then(channels => {
		//			channels.each(chan => { //iterate through all the channels
		//				if (chan.type == "GUILD_TEXT") //make sure the channel is a text channel
		//				{
		//					chan.permissionOverwrites.delete(rid);
		//				}
		//			});
		//		});
		//	}
		//}
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
	d1 = new Date(yr, my, dy) //todayish

	if (babadata.holidayval == "defeat")
	{
		//560231259842805770  563063109422415872
		if(message.content.toLowerCase().includes(yr - 1) && message.content.toLowerCase().includes("560231259842805770") && message.content.toLowerCase().includes("563063109422415872") && !message.author.bot) //if message contains baba and is not from bot
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

	if(message.content.toLowerCase().includes('!baba') && !message.author.bot) //if message contains baba and is not from bot
	{
		var exampleEmbed = null;
		var text = 'BABA IS ADMIN'; //start of reply string for responce message.
		
		if(message.content.toLowerCase().includes('password')) //reply with password file string if baba password
		{
			text += '\n' + babadata.pass;
		}
		if (message.content.includes("847324692288765993")) //this could do something better but its ok for now
		{
			text += "LET'S SAUSAGE\n";
		}

		message.channel.send({ content: text });

		if (message.content.includes("please")) //this could do something better but its ok for now
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

		if (message.content.includes("order pizza"))
		{
			message.channel.send({ content: "Baba Pizza Ordering Service™ coming soon!" });
		}

		if(message.content.toLowerCase().includes('help')) //reply with help text is baba help
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

		if (message.content.toLowerCase().includes('flag') && (message.content.toLowerCase().includes('night shift') || message.content.toLowerCase().includes('vibe time')))
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
			
			newAttch = new Discord.MessageAttachment().setFile(babadata.datalocation + "Flags/" + "Night_Shift_" + sood + ".png"); //makes a new discord attachment
			message.channel.send({content: flagtext, files: [newAttch] }).catch(error => {
				newAttch = new Discord.MessageAttachment().setFile(babadata.datalocation + "Flags/" + "error.png"); //makes a new discord attachment (default fail image)
				message.channel.send({content: flagtext, files: [newAttch] }); // send file
			});
		}
/*
		if (message.content.toLowerCase().includes("music"))
		{
			if (message.content.toLowerCase().includes("play"))
				message.channel.send("!play " + babadata.vibe);
			if (message.content.toLowerCase().includes("shuffle"))
				message.channel.send("!shuffle");
		}
*/
		if(message.content.toLowerCase().includes('make yugo')) //reply with password file string if baba password
		{
			var yugotext = "Here Yugo!";
			var num = Math.floor(Math.random() * 11); //pick a random one
			var yugo = babadata.datalocation + "Yugo/" + num.toString() + ".jpg";
			message.channel.send({ content: yugotext, files: [yugo] });
		}

		if (message.content.toLowerCase().includes('haiku')) // add custom haiku search term?
		{
			CreateHaikuDatabase(); // in case new haikus

			if (message.content.toLowerCase().includes("purity"))
			{
				var hpl = "No Haiku Purity Found!"
				var bonust = ""
				var bonupr = ""
				if (message.content.toLowerCase().includes("list"))
				{
					if (message.content.toLowerCase().includes("channels"))
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
					if (message.content.toLowerCase().includes("my"))
					{
						bonupr = "Your ";
						var ids = message.author.id;

						hpl = "No Haiku Purity Found for You :(";
						for (x in databaseofhaiku.purity.person)
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
							for (x in databaseofhaiku.purity.person)
							{
								var lin = databaseofhaiku.purity.person[x];
								if (message.content.toLowerCase().includes(x.toLowerCase()) || message.content.toLowerCase().includes(lin.ID))
								{
									fnd = true;
									hpl = GenInfo(x, lin, 0);
								}
							}
						}
						if (!fnd)
						{
							for (x in databaseofhaiku.purity.channel)
							{
								var lin = databaseofhaiku.purity.channel[x];
								if (message.content.toLowerCase().includes(x.toLowerCase()) || message.content.toLowerCase().includes(lin.ID))
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
								for (x in databaseofhaiku.purity.date)
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

		if (message.content.toLowerCase().includes('wednesday') || message.content.toLowerCase().includes('days until') || message.content.toLowerCase().includes('when is') || message.content.toLowerCase().includes('day of week'))
		{
			let rawdata = fs.readFileSync(babadata.datalocation + "FrogHolidays/" + 'frogholidays.json'); //load file each time of calling wednesday
			let holidays = JSON.parse(rawdata);

			let d1 = new Date(yr, my, dy); //get today
			var dow_d1 = (d1.getDay() + 4) % 7;//get day of week (making wed = 0)
			let d1_useage = new Date(d1.getFullYear(), d1.getMonth(), 1); //today that has been wednesday shifted
			d1_useage.setDate(d1.getDate() - dow_d1); //modify today for wednesdays

			if (message.content.toLowerCase().includes('days until next wednesday'))
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
			
			if (message.content.toLowerCase().includes('next event'))
			{
				var hols = FindNextHoliday(d1, yr, CheckHoliday("ALL", holidays));
				for (i = 0; i < hols.length; i++) //loop through the holidays that are requested
				{
					IsHoliday.push(hols[i]);
				}
			}
			
			if(IsHoliday.length > 0) //reply with password file string if baba password
			{
				var templocationslist = [];

				for (i = 0; i < IsHoliday.length; i++) //loop through the holidays that are requested
				{
					var holidayinfo = IsHoliday[i];
	
					if (holidayinfo.name != "date" && holidayinfo.year)
						yr = holidayinfo.year;

					let d2 = GetDate(d1, yr, holidayinfo);

					var additionaltext = "";
					var showwed = false;

					if (message.content.toLowerCase().includes('wednesday'))
						showwed = true;

					if (message.content.toLowerCase().includes('when is')) //outputs the next occurance of the event
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
					
					if (message.content.toLowerCase().includes('day of week')) //custom days until text output - for joseph
					{
						var bonustext = holidayinfo.year != undefined ? " " + holidayinfo.year : "";
						var dowtext = holidayinfo.safename + bonustext + " is on " + d2.toLocaleDateString('en-US', {weekday: 'long'}); //future text
						
						additionaltext += dowtext + "\n";
					}

					if (message.content.toLowerCase().includes('days until')) //custom days until text output - for joseph
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

			//if (message.content.toLowerCase().includes('super cursed'))
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
	if(message.content.toLowerCase().includes('!bdelete')) //code to del and move to log
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
	if(message.content.toLowerCase().includes('!political')) //code to del and move to log
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
	if(message.content.toLowerCase().includes('!setvote')) //code to set vote
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
	if(message.content.toLowerCase().includes('!bsetgame')) //code to set game
	{
		if(message.channel.type != "DM" && message.member.roles.cache.has(babadata.adminid)) //check if admin
		{
			var text = message.content.toLowerCase();
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

			if (tyepe == -1)
			{
				tyepe = 0;
				lc = 1;
			}
			
			var mess = message.content.split(' ').slice(lc, ).join(' '); //get the name for the role
			bot.user.setActivity(mess, { type: tyepe });
		}
	}
	if(message.content.toLowerCase().includes('!banhammer')) //code to set ban hammer
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
	if(message.content.toLowerCase().includes('!grole')) //code to set game role
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
});

//async function tempoutput(msg, lp)  //temporary output function for testing
//{
//	var t = "";
//
//	for (i = 0; i < lp.length; i++) 
//	{
//		t += lp[i] + "\n";
//	}
//
//	msg.channel.send(t);
//}

async function setGrole(msg, rname) //creates role and sets users
{
	console.log(msg);
	try 
	{
		var role = null;
		await msg.guild.roles.fetch().then(roles => {
			roles.each(r => { //iterate through all the channels
				if (r.name === rname) //make sure the channel is a text channel
				{
					role = r;				
				}
			});
		});

		if (role == null) //if null make new role
		{
			console.log("Creating Role: " + rname);
			msg.channel.send("Role created: " + rname);

			//create the role
			await msg.guild.roles.create({
				name: rname,
				reason: 'bot do bot thing',
			}).catch(console.error);

			await msg.guild.roles.fetch().then(roles => {
				roles.each(r => { //iterate through all the channels
					if (r.name === rname) //make sure the channel is a text channel
					{
						role = r;				
					}
				});
			});		
		}

		setTimeout(function()
		{ 
			var reactMap = msg.reactions.cache; //get a map of the reactions
			for(let [k, reee] of reactMap) //iterate through all the reactions
			{
				reee.users.fetch().then((users) => {
					RoleAdd(msg, users, role); //call the dumb roll function to do the work (had to be done)
				}).catch(console.error);
			}
		}, 2000); //delayed
		//create role with no permisions, gray color that can be @ by every one
		//get user list from reacations
		//give users role
		
	} 
	catch (error) 
	{
		console.log("nos"); //if error this goes
	}
}

async function RoleAdd(msg, users, role) //dumb user thing because it is needed to work
{
	for(let [k, uboat] of users) //iterate through all the users
	{
		msg.guild.members.fetch(uboat.id).then(mem => mem.roles.add(role)); //check if user is memeber
		//add role to user
	}
}

async function setVote(msg) //reacts to message with 👍 and 👎 for votes
{
	var usr = msg.author; //gets the user that sent the message

	msg.react('👍');
	msg.react('👎');
}

async function setVBH(msg) //reacts to message with emoji defined by babadata.emoji (in json file) for our implimentation that is the ban hammer emoji
{
	var usr = msg.author; //gets the user that sent the message

	msg.react(babadata.emoji); //reply with ban hammer emoji
}

async function movetoChannel(msg, channel, logchan) //archive the message and delete it
{
	var hiddenChan = msg.guild.channels.cache.get(logchan); //gets the special archive channel
	var usr = msg.author; //gets the user that sent the message
	var savemsg = "This message sent by: <@" + usr + "> in <#" + channel.id + ">\n> "; //sets the header of the message to mention the original poster
	savemsg += msg.content; //insert the actual message below
	var attch = msg.attachments; //get the attacments from the original message

	hiddenChan.send(savemsg,); //send the text

	var reactMap = msg.reactions.cache; //get a map of the reactions
	var memgage = "";
	for(let [k, reee] of reactMap) //iterate through all the reactions
	{
		memgage += k + ": " + reee.count + " reactions\n";
	}

	if (memgage != "")
	{
		hiddenChan.send("```" + memgage + "```",); //send the text
	}

	var newAttach;
	var icount = 0;
	for(let [k, img] of attch)
	{
		setTimeout(function()
		{ 
			DelayedDeletion(hiddenChan, img); //download the image and reupload it
		}, 4000 * icount); //delayed so all images can get loaded

		icount ++;
	}

	var waittime = icount == 0 ? 0 : 3000 + (4000 * icount);

	setTimeout(function(){ msg.delete(); }, waittime); //deletes the og message (delayed for the file transfer)
}

function GetDate(d1, yr, holidayinfo) //Gets the specified date from the selected holiday at the year provided
{
	let d2 = new Date(); //new Date
	switch(holidayinfo.mode)
	{
		case 5:
			if (holidayinfo.year)
			{
				yr = holidayinfo.year;
				holidayinfo.year = 0;
			}
		case 0:
			//console.log(yr);
			if (holidayinfo.month == 0)
				holidayinfo.month = 1;

			if (holidayinfo.day == 0)
				holidayinfo.day = 1;

			d2 = new Date(yr, holidayinfo.month - 1, holidayinfo.day); //get holiday
			break;
		case 1:
			d2 = new Date(yr, holidayinfo.month - 1, 1); //get first of specified month
			var dtcalc = 1 + (holidayinfo.dayofweek - d2.getDay() - 7) % 7;
			dtcalc = dtcalc + (7 * holidayinfo.week); //calculate the day of the month

			d2 = new Date(yr, holidayinfo.month - 1, dtcalc); //get holiday
			break;
		case 2:
			var sm = d1.getMonth() + 1; //get the month to start on
			if (d1.getDate() > holidayinfo.day) //add one month if day is past specified day
				sm++;

			let retd = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate() - 1); //set to day before today
			for (var i = sm; i <= 12; i++)
			{
				let d3 = new Date(yr, i - 1, holidayinfo.day); //get each months specified day
				if (d3.getDay() == holidayinfo.dayofweek) //check each months specified day is correct DOW
				{
					retd = d3; //set day
					break;
				}
			}
			d2 = retd;
			break;
		case 3:
			var ea = getEaster(yr); //get easter
			d2 = new Date(yr, ea[0] - 1, ea[1]); //get holiday
			break;
		default:
			console.log(holidayinfo);
	}

	if (holidayinfo.name == "date" && holidayinfo.day != d2.getDate())
	{
		d2 = GetDate(new Date(yr + 1, 0, 1), yr + 1, holidayinfo); //re-call function w/year of next
	}

	if (d2.getTime() < d1.getTime()) //check if day is post holiday and make next holiday year + 1
	{
		if (holidayinfo.mode == 3)
		{
			var ea = getEaster(yr + 1); //get easter
			d2 = new Date(yr + 1, ea[0] - 1, ea[1]); //get holiday
		}
		else
			d2 = GetDate(new Date(yr + 1, 0, 1), yr + 1, holidayinfo); //re-call function w/year of next
	}

	if (holidayinfo.name == "date")
		holidayinfo.safename = d2.toLocaleDateString('en-US', options); //display value

	return d2;
}

function MakeImage(templocal, base, wednesdayoverlay, weeks, outputname, holidayinfo, textoverlay) //Image Creation is now function
{
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

	var res = BonusGenerator(bonus, im, templocal, weeks, 1, (weeks == 0 ? 0 : 1));
	im = res[0];
	var textlocal = res[1];

	im.save(templocal + outputname); //save the image

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
}

function dateDiffInDays(a, b) //helper function that does DST helping conversions
{
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

function getEaster(year) //Thanks to Jeremy's Link
{
	var f = Math.floor,
		G = year % 19,
		C = f(year / 100),
		H = (C - f(C / 4) - f((8 * C + 13)/25) + 19 * G + 15) % 30,
		I = H - f(H/28) * (1 - f(29/(H + 1)) * f((21-G)/11)),
		J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
		L = I - J,
		month = 3 + f((L + 40)/44),
		day = L + 28 - 31 * f(month / 4);

	return [month, day];
}

function FindDate(holidaysfound, message) //Not Thanks to Jeremy's Link
{
	var outps = message.toLowerCase().replace("!baba", "") //there is no point to this, i did it because i wanted too
		.replace("wednesday", "")
		.replace("days", "")
		.replace("until", "")
		.replace("next", "")
		.split(" ");

	var day = 0;
	var month = 0;
	var year = 0;

	for (i = 0; i < outps.length; i++)  //loop all the text
	{
		var item = outps[i];
		if (month == 0) //set month to a detected month
		{
			if (item == "")
				month = 0;
			else if ("january".includes(item))
				month = 1;
			else if ("february".includes(item))
				month = 2;
			else if ("march".includes(item))
				month = 3;
			else if ("april".includes(item))
				month = 4;
			else if ("may".includes(item))
				month = 5;
			else if ("june".includes(item))
				month = 6;
			else if ("july".includes(item))
				month = 7;
			else if ("august".includes(item))
				month = 8;
			else if ("september".includes(item))
				month = 9;
			else if ("october".includes(item))
				month = 10;
			else if ("november".includes(item))
				month = 11;
			else if ("december".includes(item))
				month = 12;
		}

		if (day == 0) //set year to first day
		{
			var iv = parseInt(item);
			if (iv <= 31)
			{
				day = iv;
			}
		}

		if (year == 0) //set year to first year found
		{
			var iv = parseInt(item);
			if (iv >= new Date().getFullYear())
			{
				year = iv;
			}
		}
	}

	var months = [ //Another lookup table - Hank likes these :)
		[29, 2],
		[30, 4, 6, 9, 11]
	]

	for (i = 0; i < months.length; i++) 
	{
		var limit = months[i][0]; //limit moth checker
		for (j = 1; j < months[i].length; j++) 
		{
			if (months[i][j] == month) //month checked = motnh got
			{
				if (day > limit)
					return null;
			}
		}
	}

	if (month == 0)
		return null;

	if (day == 0)
		return null;

	if (year == 0)
		year = new Date().getFullYear();

	var item = {};
	item.name = "date"; //picture lookup value
	item.mode = 5; //date calc value

	item.day = day;
	item.month = month;
	item.year = year;

	return item;
}

function SetHolidayChan(msg, name, resetid = -1)
{
	let to = 0;
	let rawdata = fs.readFileSync(__dirname + '/babotdata.json');
	let baadata = JSON.parse(rawdata);
	if (resetid > 0)
		baadata.holidaychan = resetid.toString();

	if (msg.guild != null && resetid < 0)
	{
		const chanyu = msg.guild.channels.resolve(babadata.holidaychan);
		
		if (chanyu != null)
		{
			switch(name)
			{
				case "spook": //Spooky
					chanyu.setName("🎃💀 Real Spooktoper Days 🕸️👻")
						.then((newChannel) =>
						console.log(`The channel's new name is ${newChannel.name}`),
					)
					.catch(console.error);
					break;
				case "thanks": //Thanks
					chanyu.setName("🦃 Turkey Hours AKA Thanksgiving")
						.then((newChannel) =>
						console.log(`The channel's new name is ${newChannel.name}`),
					)
					.catch(console.error);
					break;
				case "crimbo": //Crimbo
					chanyu.setName("🎄🎁 Crimbus 🎁🎄")
						.then((newChannel) =>
						console.log(`The channel's new name is ${newChannel.name}`),
					)
					.catch(console.error);
					break;
				case "defeat": //New Year
					chanyu.setName("🎉 New Year, New Wednesday 🎉")
						.then((newChannel) =>
						console.log(`The channel's new name is ${newChannel.name}`),
					)
					.catch(console.error);
					break;
				default:
					console.log(name);
			}
		}
	}
	else if (msg.guild != null && resetid == 0)
	{
		to = 300
		msg.guild.channels.fetch(babadata.holidaychan).then(channels => {
			var holidaychan = channels;

			if (holidaychan != null)
			{
				msg.guild.channels.fetch().then(channels => {
					channels.each(chan => {
						if (chan.type == "GUILD_CATEGORY")
						{
							if (chan.name.toLowerCase() === "archive")
							{
								holidaychan.setParent(chan);
								holidaychan.permissionOverwrites.edit(msg.guild.roles.everyone, { SEND_MESSAGES: false });
								baadata.holidaychan = "0";
							}
						}
					});
				})
			}
		});
	}

	baadata.holidayval = name;
	setTimeout(function()
	{
		let n = JSON.stringify(baadata)
		fs.writeFileSync(__dirname + '/babotdata.json', n);
	}, to)
	babadata = baadata;
}

function MonthsPlus(message, d1)
{
	var yr = d1.getFullYear();
	if (d1.getMonth() == 9 && babadata.holidayval != "spook")
	{
		SetHolidayChan(message, "spook");

		//set channel info
	}
	else if (d1.getMonth() == 10)
	{
		var hi = {};
		hi.dayofweek = 4;
		hi.week = 4;
		hi.mode = 1;
		hi.month = 11;

		var tgday = GetDate(d1, yr, hi);
		var tday = new Date().getDate(); //get this day

		if (tgday.getFullYear() == yr && babadata.holidayval != "thanks")
		{
			SetHolidayChan(message, "thanks");
		}
		else if (tgday.getDate() < tday)
		{
			if (babadata.holidayval != "crimbo")
			{
				SetHolidayChan(message, "crimbo");
			}
		}
	}

	if (d1.getMonth() == 11)
	{
		if (d1.getDate() <= 25 && babadata.holidayval != "crimbo")
			SetHolidayChan(message, "crimbo");
		else if (babadata.holidayval != "defeat")
			SetHolidayChan(message, "defeat");
	}
}

function CreateChannel(server, name, message, d1)
{
	server.channels.fetch().then(channels => {
		channels.each(chan => {
			if (chan.type == "GUILD_CATEGORY")
			{
				if (chan.name.toLowerCase() === name)
				{
					const tempo1 = server.channels.create('Temp Holiday Channel',{
						type: 'GUILD_TEXT',
						topic: 'Holidays brought to you by Baba!',
						parent: chan,
						position: 3
					}).then(result => {
						console.log('Here is channel id', result.id)
						SetHolidayChan(message, "null", result.id)
						setTimeout(function(){MonthsPlus(message, d1)}, 100);
					})
				}
			}
		});
	})

	return null;
}

function GetSimilarName(namesearch) //list of names based on person
{
	var bagohumans = []; // for the randomness
	for (x in databaseofhaiku.haikus)
	{
		item = databaseofhaiku.haikus[x]; //get the item
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

function CreateHaikuDatabase() //database of haikus making
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

	for (num in sheetjson.Data) // loop though data sheet
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

	for (num in sheetjson.Accidental) // loop though data sheet
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

function FormatPurityList(list, chan)
{
	var retme = ""
	for (x in list)
	{
		var lin = list[x];
		retme += GenInfo(x, lin, chan) + "\n\n";
	}

	return retme;
}

function GenInfo(x, line, chan)
{
	var pct = line.Accidental/parseFloat(line.Count); // purity percentage
	pct = (pct * 100)
	pct = +pct.toFixed(3);
	return x + (chan == 2 ? "" : " [<" + (chan == 1 ? "#" : "@") + line.ID + ">]") + "\n\t`" + line.Count + " Haikus` - `" + line.Accidental + " Accidental` - `" + pct + "% Purity`";
}

function CheckFrogID(frogdata, id)
{
	for (i = 0; i < frogdata.froghelp.ifrog.length; i++) 
	{
		if (id == frogdata.froghelp.ifrog[i])
			return i;
	}
	return -1;
}

function BonusGenerator(bonus, im, templocal, weeks, ct, ln) //for more than 100 weeks
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

		var res = BonusGenerator(bonusbonus, im, templocal, (kip ? weeks : bonus), (ct == 3 ? ct + 2 : ct + 1), ln + (kip ? 0 : 1)); //do it again
		
		im = res[0];
		textlocal = res[1];

		return [im, textlocal]; //return textlocal for text spot and image
	}
	else return [im, textlocal]; //return textlocal for text spot and image
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

	for (i = 0; i < wites.length; i++) 
	{
		var retme = wites[i][0]; //white value
		for (j = 0; j < wites[i].length; j++) 
		{
			if (wites[i][j] == weekct) //check for the day in list
				return retme;
		}
	}

	return "8";
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

function CheckHoliday(msg, holdaylist) //checks if any of the holiday list is said in the message
{
	var retme = [];
	var ct = 0;
	for (x in holdaylist) 
	{
		var hol = holdaylist[x];

		if (hol.mode == -2) //skip help info
			continue;

		for (i = 0; i < hol.name.length; i++) 
		{
			if (msg == "ALL" || msg.toLowerCase().includes(hol.name[i].replace("[NY]", new Date().getFullYear() + 1))) //checks if the holiday name is in the message
			{
				var item = {};
				item.name = x; //picture lookup value
				item.mode = hol.mode; //date calc value
				item.safename = hol.safename; //display value
				item.ignoredays = hol.ignoredays; //for days with custom images

				var outps = msg.toLowerCase().split(" ");

				var year = 0;
				for (i = 0; i < outps.length; i++)
				{
					var block = outps[i];
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
						var tempret = CheckHoliday(msg, hol.sub) //Check all the subs
						for (i = 0; i < tempret.length; i++) 
						{
							retme[ct] = tempret[i]; //Add items in return list to current returnlist
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

async function DelayedDeletion(hiddenChan, img) //download function used when the delay call is ran
{
	var tempFilePath = babadata.temp + "tempfile" + img.url.substring(img.url.lastIndexOf('.')); // temp file location 
	var url = img.url;

	download(url, tempFilePath, () => { //downloads the file to the system at tempfile location
		console.log('Done!')
	})

	newAttch = new Discord.MessageAttachment().setFile(tempFilePath); //makes a new discord attachment

	setTimeout(function(){ hiddenChan.send({files: [newAttch] }); }, 2000); //sends the attachment (delayed by 1 sec to allow for download)

	setTimeout(function(){ fs.unlinkSync(tempFilePath); }, 3000); //deletes file from local system (delayed by 3 sec to allow for download and upload)
}

//const download = (url, path, callback) => { //download function //depricated with the request deprication
//	request.head(url, (err, res, body) => {
//	  request(url)
//		.pipe(fs.createWriteStream(path))
//		.on('close', callback)
//	})
//  }

const download = (url, path, callback) => 
{ //download function to replace the old one.
    request(url)
        .then(res => {
            const dest = fs.createWriteStream(path);
            res.body.pipe(dest);
    });
}

  
//not shure what this does also but it was in jeremy's code so
var cleanupFn = function cleanup() 
{
	  console.log("Logging off");
	  bot.destroy();
}

process.on('SIGINT', cleanupFn);
process.on('SIGTERM', cleanupFn);
