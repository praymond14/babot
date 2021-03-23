var Discord = require('discord.js'); //discord module for interation with discord api
var babadata = require('./babotdata.json'); //baba configuration file
let request = require('request'); // not sure what this is used for
let fs = require('fs'); //file stream used for del fuction
var images = require("images"); //image manipulation used for the wednesday frogs

//To Do:
/*
	- Stop Calls to Funciton until images posted! - Sami
	- Bruh Mode? - Ryan
*/

// Initialize Discord Bot
var bot = new Discord.Client();
const { Console } = require('console');
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
});

//stuff when message is recived.
bot.on('message', message => 
{
	if(message.content.toLowerCase().includes('!baba') && !message.author.bot) //if message contains baba and is not from bot
	{
		var text = 'BABA IS ADMIN'; //start of reply string for responce message.
		if(message.content.toLowerCase().includes('help')) //reply with help text is baba help
		{
			text += '\n use !BABA password to get passwords for servers';
		}
		if(message.content.toLowerCase().includes('password')) //reply with password file string if baba password
		{
			text += '\n' + babadata.pass;
		}

		if (message.content.toLowerCase().includes('wednesday') || message.content.toLowerCase().includes('days until'))
		{
			let rawdata = fs.readFileSync(babadata.wednesdaylocation + "FrogHolidays/" + 'frogholidays.json'); //load file each time of calling wednesday
			let holidays = JSON.parse(rawdata);

			var dateoveride = [false, 1, 3]; //allows for overiding date manually (testing)
	
			var yr = 2021;//new Date().getFullYear(); //get this year
			var dy = dateoveride[0] ? dateoveride[2] : new Date().getDate(); //get this day
			var my = dateoveride[0] ? dateoveride[1] - 1 : new Date().getMonth(); //get this month

			let d1 = new Date(yr, my, dy); //get today
			var dow_d1 = (d1.getDay() + 4) % 7;//get day of week (making wed = 0)
			let d1_useage = new Date(d1.getFullYear(), d1.getMonth(), 1); //today that has been wednesday shifted
			d1_useage.setDate(d1.getDate() - dow_d1);// modify today for wednesdays

			if (message.content.toLowerCase().includes('days until next wednesday'))
			{
				var ct = 7 - dow_d1;
				if (ct == 1)
					text += "\nIt is only " + ct + " day until the next Wednesday!"
				else
					text += "\nIt is only " + ct + " days until the next Wednesday!"
			}
	
			var IsHoliday = CheckHoliday(message.content, holidays); //get the holidays that are reqested

			if(IsHoliday.length > 0) //reply with password file string if baba password
			{
				for (i = 0; i < IsHoliday.length; i++) //loop through the holidays that are requested
				{
					var holidayinfo = IsHoliday[i];
	
					let d2 = GetDate(d1, yr, holidayinfo);
					if (message.content.toLowerCase().includes('days until')) //custom days until text output - for joseph
					{
						var diff = Math.abs(d2 - d1); //milliseconds
						var int = Math.ceil(diff / 1000 / 60/ 60 / 24); //convert to days and round up

						if (int != 0)
						{
							if (int == 1)
								text += "\n" + int + " Day until " + holidayinfo.safename; //future text
							else
								text += "\n" + int + " Days until " + holidayinfo.safename; //future text
						}
						
						if (!message.content.toLowerCase().includes('wednesday') && int != 0) //if no wednesday found, send output
						{
							message.channel.send(text);
							return;
						}
					}
	
					var dow_d2 = (d2.getDay() + 4) % 7;//get day of week (making wed = 0)
					let d2_useage = new Date(d2.getFullYear(), d2.getMonth(), 1); //holiday that has been wednesday shifted
					d2_useage.setDate(d2.getDate() - dow_d2);// modify holiday for wednesdays
	
					let weeks = Math.abs((d1_useage.getTime() - d2_useage.getTime()) / 3600000 / 24 / 7); // how many weeks
					
					if (weeks > 52) //edge case for the day after sometimes being dumb and a week off
						weeks = 52;
	
					if (weeks < .3) //for when it is the week before and set to .142
						weeks = 0;
	
					var wednesdayoverlay = "Wednesday_Plural.png"; //gets the wednesday portion
					if (weeks == 1)
						wednesdayoverlay = "Wednesday_Single.png"; //one week means single info
	
					var templocal = babadata.wednesdaylocation + "FrogHolidays/"; //creates the output frog image
	
					var outputname = "outputfrog_" + i + ".png"; //default output name
					if (d1.getTime() - d2.getTime() == 0)
					{
						outputname =  holidayinfo.name + ".png"; //if today is the event, show something cool
					}
					else
					{
						weeks = Math.floor(weeks);
						var base = holidayinfo.name + "_base.png";
						try 
						{
							images(templocal + base) //creates the image using secified overlays
								.draw(images(templocal + "mydudes.png"), 0, 0)
								.draw(images(templocal + wednesdayoverlay), 0, 0)
								.draw(images(templocal + weeks + ".png"), 0, 0)
								.draw(images(templocal + wednesdayoverlay), 0, 0)
								.save(templocal + outputname);
						}
						catch(err)
						{
							images(templocal + "default_base.png") //creates the image using secified overlays (default fail image)
								.draw(images(templocal + "mydudes.png"), 0, 0)
								.draw(images(templocal + wednesdayoverlay), 0, 0)
								.draw(images(templocal + weeks + ".png"), 0, 0)
								.draw(images(templocal + wednesdayoverlay), 0, 0)
								.save(templocal + outputname);
						}
						
					}
					
					var tempFilePath = templocal + outputname; // temp file location
	
					newAttch = new Discord.MessageAttachment().setFile(tempFilePath); //makes a new discord attachment
					message.channel.send(text, newAttch).catch(error => {
						newAttch = new Discord.MessageAttachment().setFile(templocal + "error.png"); //makes a new discord attachment (default fail image)
						message.channel.send(text, newAttch); // send file
					});
					text = "";
				}
			}
			else
			{
				if (text.includes('Wednesday'))
					message.channel.send(text);
				else
					message.channel.send(text + "\nIt is Wednesday, My Dudes");
			}
		}
		else
		{
			message.channel.send(text);
		}
	}
	if(message.content.toLowerCase().includes('!delete')) //code to del and move to log
	{
		if(message.member.roles.cache.has(babadata.adminid)) //check if admin
		{
			var message_id = message.content.replace(/\D/g,''); //get message id
			var chanMap = message.guild.channels.cache; //get a map of the channelt in the guild
			for(let [k, chan] of chanMap) //iterate through all the channels
			{
				if(chan.type == "text") //make sure the channel is a text channel
				{
					chan.messages.fetch(message_id).then(message => deleteAndArchive(message)).catch(console.error); //try to get the message, if it exists call deleteAndArchive, otherwise catch the error
				}
			}
		}
	}
	if(message.content.toLowerCase().includes('!setvote')) //code to set vote
	{
		if(message.member.roles.cache.has(babadata.adminid)) //check if admin
		{
			var message_id = message.content.replace(/\D/g,''); //get message id
			var chanMap = message.guild.channels.cache; //get a map of the channelt in the guild
			for(let [k, chan] of chanMap) //iterate through all the channels
			{
				if(chan.type == "text") //make sure the channel is a text channel
				{
					chan.messages.fetch(message_id).then(message => setVote(message)).catch(console.error); //try to get the message, if it exists call setVote, otherwise catch the error
				}
			}
		}
	}
	if(message.content.toLowerCase().includes('!banhammer')) //code to set ban hammer
	{
		if(message.member.roles.cache.has(babadata.adminid)) //check if admin
		{
			var message_id = message.content.replace(/\D/g,''); //get message id
			var chanMap = message.guild.channels.cache; //get a map of the channelt in the guild
			for(let [k, chan] of chanMap) //iterate through all the channels
			{
				if(chan.type == "text") //make sure the channel is a text channel
				{
					chan.messages.fetch(message_id).then(message => setVBH(message)).catch(console.error); //try to get the message, if it exists call setVBH, otherwise catch the error
				}
			}
		}
	}
	if(message.content.toLowerCase().includes('!grole')) //code to set game role
	{
		if(message.member.roles.cache.has(babadata.adminid)) //check if admin
		{
			role_name = message.content.split(' ').slice(0, 2).join(' ').substring(6).replace(' ',''); //get the name for the role
			var message_id = message.content.replace(role_name,''); //remove role name from string
			message_id = message_id.replace(/\D/g,''); //get message id
			var chanMap = message.guild.channels.cache; //get a map of the channelt in the guild
			for(let [k, chan] of chanMap) //iterate through all the channels
			{
				if(chan.type == "text") //make sure the channel is a text channel
				{
					chan.messages.fetch(message_id).then(message => setGrole(message, role_name)).catch(console.error); //try to get the message, if it exists call setGrole, otherwise catch the error
				}
			}
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
	try 
	{
		var role = msg.guild.roles.cache.find(r => r.name === rname); //get the role if already made (in case of redundancy)
	
		if (role == null) //if null make new role
		{
			console.log("Creating Role + " + rname);

			//create the role
			await msg.guild.roles.create({
				data: {
				  name: rname
				},
				reason: 'bot do bot thing',
			  }).catch(console.error);

			role = msg.guild.roles.cache.find(r => r.name === rname); //set role to the role that was made
		}

		var reactMap = msg.reactions.cache; //get a map of the reactions
		for(let [k, reee] of reactMap) //iterate through all the reactions
		{
			reee.users.fetch().then((users) => {
				RoleAdd(msg, users, role); //call the dumb roll function to do the work (had to be done)
			}).catch(console.error);
		}
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
		let mem = msg.guild.member(uboat); //check if user is memeber
		mem.roles.add(role); //add role to user
	}
}

async function setVote(msg) //reacts to message with 👍 and 👎 for votes
{
	try 
	{
		var role = msg.guild.roles.cache.find(r => r.name === rname); //get the role if already made (in case of redundancy)
	
		if (role == null) //if null make new role
		{
			console.log("Creating Role + " + rname);

			//create the role
			await msg.guild.roles.create({
				data: {
				  name: rname
				},
				reason: 'bot do bot thing',
			  }).catch(console.error);

			role = msg.guild.roles.cache.find(r => r.name === rname); //set role to the role that was made
		}

		var reactMap = msg.reactions.cache; //get a map of the reactions
		for(let [k, reee] of reactMap) //iterate through all the reactions
		{
			reee.users.fetch().then((users) => {
				RoleAdd(msg, users, role); //call the dumb roll function to do the work (had to be done)
			}).catch(console.error);
		}
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
		let mem = msg.guild.member(uboat); //check if user is memeber
		mem.roles.add(role); //add role to user
	}
}

async function setVote(msg) //reacts to message with 👍 and 👎 for votes
{
	var hiddenChan = msg.guild.channels.cache.get(babadata.logchn); //gets the special archive channel
	var usr = msg.author; //gets the user that sent the message

	msg.react('👍');
	msg.react('👎');
}

async function setVBH(msg) //reacts to message with emoji defined by babadata.emoji (in json file)
{
	var hiddenChan = msg.guild.channels.cache.get(babadata.logchn); //gets the special archive channel
	var usr = msg.author; //gets the user that sent the message

	msg.react(babadata.emoji); //reply with ban hammer emoji
}

async function deleteAndArchive(msg) //archive the message and delete it
{
	var hiddenChan = msg.guild.channels.cache.get(babadata.logchn); //gets the special archive channel
	var usr = msg.author; //gets the user that sent the message
	var savemsg = "This message sent by: <@" + usr + ">\n> "; //sets the header of the message to mention the original poster
	savemsg += msg.content; //insert the actual message below
	var attch = msg.attachments; //get the attacments from the original message
	hiddenChan.send(savemsg,); //send the text
	var newAttach;
	var icount = 0;
	for(let [k, img] of attch)
	{
		setTimeout(function()
		{ 
			DelayedDeletion(hiddenChan, img); //download the image and reupload it
		}, 3000 * icount); //delayed so all images can get loaded

		icount ++;
	}

	var waittime = icount == 0 ? 0 : 2000 + (2000 * icount);

	setTimeout(function(){ msg.delete(); }, waittime); //deletes the og message (delayed for the file transfer)
}

function GetDate(d1, yr, holidayinfo) //Gets the specified date from the selected holiday at the year provided
{
	let d2 = new Date(); //new Date
	switch(holidayinfo.mode)
	{
		case 0:
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

	if (d2.getTime() < d1.getTime()) //check if day is post holiday and make next holiday year + 1
	{
		d2 = GetDate(new Date(yr + 1, 0, 1), yr + 1, holidayinfo); //re-call function w/year of next
	}

	return d2;
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

function CheckHoliday(msg, holdaylist) //checks if any of the holiday list is said in the message
{
	var retme = [];
	var ct = 0;
	for (x in holdaylist) 
	{
		var hol = holdaylist[x];
		for (i = 0; i < hol.name.length; i++) 
		{
			if (msg.toLowerCase().includes(hol.name[i].replace("[NY]", new Date().getFullYear() + 1))) //checks if the holiday name is in the message
			{
				var item = {};
				item.name = x; //picture lookup value
				item.mode = hol.mode; //date calc value
				item.safename = hol.safename; //display value
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

	setTimeout(function(){ hiddenChan.send("", newAttch); }, 1000); //sends the attachment (delayed by 1 sec to allow for download)

	setTimeout(function(){ fs.unlinkSync(tempFilePath); }, 2000); //deletes file from local system (delayed by 3 sec to allow for download and upload)
}

const download = (url, path, callback) => { //download function
	request.head(url, (err, res, body) => {
	  request(url)
		.pipe(fs.createWriteStream(path))
		.on('close', callback)
	})
  }
  
//not shure what this does also but it was in jeremy's code so
var cleanupFn = function cleanup() 
{
	  console.log("Logging off");
	  bot.destroy();
}

process.on('SIGINT', cleanupFn);
process.on('SIGTERM', cleanupFn);
