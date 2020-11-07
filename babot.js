var Discord = require('discord.js'); //discord module for interation with discord api
var babadata = require('./babotdata.json'); //baba configuration file
let request = require(`request`);
let fs = require(`fs`);

// Initialize Discord Bot
var bot = new Discord.Client();

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
		if(message.content.toLowerCase().includes('christmas') && message.content.toLowerCase().includes('wednesday')) //reply with password file string if baba password
		{
			var yr = new Date().getFullYear(); //get this year
			var dy = new Date().getDate() + 1; //get this day
			var my = new Date().getMonth() + 1; //get this month

			let d1 = new Date(yr, my, dy); //get today
			let d2 = new Date(yr, 12, 25); //get christmas

			var dow = (d1.getDay() + 5) % 7;//get day of week

			if (d2.getTime() < d1.getTime()) //check if day is post christmas and make next xmas year + 1
				d2 = new Date(yr + 1, 12, 25);

			let weeks = Math.floor(Math.abs((d1.getTime() - d2.getTime()) / 3600000 / 24 / 7)); // how many weeks

			if (dow <= 3 && !(dy == 26 && my == 12)) // modify weeks for wednesdays
				weeks = weeks + 1;

			var tempFilePath = babadata.temp + "/Christmas/" + weeks + "christmaswed512.png"; // temp file location 
			newAttch = new Discord.MessageAttachment().setFile(tempFilePath); //makes a new discord attachment
			message.channel.send(text, newAttch); // send file
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
