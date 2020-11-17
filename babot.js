var Discord = require('discord.js'); //discord module for interation with discord api
var babadata = require('./babotdata.json'); //baba configuration file
let request = require(`request`);
let fs = require(`fs`);
var images = require("images");

// Initialize Discord Bot
var bot = new Discord.Client();
var holidays = [
	["christmas", 12, 25, 0, 0], 
	["thanksgiving", 11, 0, 4, 4], 
	["st patrick", 3, 17, 0, 0],
	["halloween", 10, 31, 0, 0],
	["new year", 1, 1, 0, 0],
	["summer solstice", 6, 21, 0, 0],
	["winter solstice", 12, 21, 0, 0],
	["valentine", 2, 14, 0, 0]
]; // ["name", month, day of week, week num, weekday] -- day of week for exact date holiday, week num + weekday for holidays that occur on specific week/day of week
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
		var text = 'BABA IS ADMIN';
		if(message.content.toLowerCase().includes('help')) //reply with help text is baba help
		{
			text += '\n use !BABA password to get passwords for servers';
		}
		if(message.content.toLowerCase().includes('password')) //reply with password file string if baba password
		{
			text += '\n' + babadata.pass;
		}

		var IsHoliday = CheckHoliday(message.content); //get the holidays that are reqested

		if(IsHoliday.length > 0 && message.content.toLowerCase().includes('wednesday')) //reply with password file string if baba password
		{
			for (i = 0; i < IsHoliday.length; i++) //loop through the holidays that are requested
			{
				var holidayinfo = holidays[IsHoliday[i]];

				var yr = new Date().getFullYear(); //get this year
				var dy = new Date().getDate() + 1; //get this day
				var my = new Date().getMonth() + 1; //get this month

				let d1 = new Date(yr, my, dy); //get today
				//d1 = new Date(yr, 3, 17);  //Testing specific days

				let d2 = GetDate(yr, holidayinfo);

				if (d2.getTime() < d1.getTime()) //check if day is post holiday and make next holiday year + 1
					d2 = GetDate(yr + 1, holidayinfo);

				var dow_d1 = (d1.getDay() + 1) % 7;//get day of week
				var dow_d2 = (d2.getDay() + 2) % 7;//get day of week

				let d1_useage = new Date(d1.getFullYear(), d1.getMonth(), 1); //today that has been wednesday shifted
				let d2_useage = new Date(d2.getFullYear(), d2.getMonth(), 1); //holiday that has been wednesday shifted

				d1_useage.setDate(d1.getDate() - dow_d1);// modify today for wednesdays
				d2_useage.setDate(d2.getDate() - dow_d2);// modify holiday for wednesdays

				let weeks = Math.abs((d1_useage.getTime() - d2_useage.getTime()) / 3600000 / 24 / 7); // how many weeks

				if (weeks > 52) //edge case for the day after sometimes being dumb and a week off
					weeks = 52;

				var wednesdayoverlay = "Wednesday_Plural.png"; //gets the wednesday portion
				if (weeks == 1)
					wednesdayoverlay = "Wednesday_Single.png"; //one week means single info

				var templocal = babadata.wednesdaylocation + "FrogHolidays/"; //creates the output frog image

				var outputname = "outputfrog_" + i + ".png"; //default output name
				if (d1.getTime() - d2.getTime() == 0)
				{
					outputname =  holidayinfo[0] + ".png"; //if today is the event, show something cool
				}
				else
				{
					weeks = Math.ceil(weeks);
					var base = holidayinfo[0] + "_base.png";
					images(templocal + base) //creates the image using secified overlays
						.draw(images(templocal + "mydudes.png"), 0, 0)
						.draw(images(templocal + wednesdayoverlay), 0, 0)
						.draw(images(templocal + weeks + ".png"), 0, 0)
						.draw(images(templocal + wednesdayoverlay), 0, 0)
						.save(templocal + outputname);
				}
				
				var tempFilePath = templocal + outputname; // temp file location 
				newAttch = new Discord.MessageAttachment().setFile(tempFilePath); //makes a new discord attachment
				message.channel.send(text, newAttch); // send file
				text = "";
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
});

//archive the message and delete it
async function deleteAndArchive(msg)
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

function GetDate(yr, holidayinfo) //Gets the specified date from the selected holiday at the year provided
{
	let d2 = new Date();

	if(holidayinfo[2] > 0)
		d2 = new Date(yr, holidayinfo[1], holidayinfo[2]); //get holiday
	else
	{ // gets the holiday for days that are specific weekday events ex: thanksgiving
		d2 = new Date(yr, holidayinfo[1], 1);
		var dtcalc = 7 * (holidayinfo[3] - 1);
		dtcalc = dtcalc + (holidayinfo[4] - ((d2.getDay() + 5) % 7)) + 1;

		d2 = new Date(yr, holidayinfo[1], dtcalc);
	}
	return d2;
}

function CheckHoliday(msg) //checks if any of the holiday list is said in the message
{
	var retme = [];
	var ct = 0;
	for (i = 0; i < holidays.length; i++) 
	{
		if (msg.toLowerCase().includes(holidays[i][0])) //checks if the holiday name is in the message
		{
			retme[ct] = i; //adds the holidat id to list
			ct++;
		}
	}
	return retme; //teturns list of holidays asked for
}

async function DelayedDeletion(hiddenChan, img) //download function used when the delay call is ran
{
	var tempFilePath = babadata.temp + "tempfile" + img.url.substring(img.url.lastIndexOf('.')); // temp file location 
	var url = img.url;

	download(url, tempFilePath, () => { //downloads the file to the system at tempfile location
		console.log('✅ Done!')
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
