var Discord = require('discord.js'); //discord module for interation with discord api
var babadata = require('./babotdata.json'); //baba configuration file
var request = require('request');
var fs = require('fs');

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
		message.channel.send(text);
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
function deleteAndArchive(msg)
{
	var hiddenChan = msg.guild.channels.cache.get(babadata.logchn); //gets the special archive channel
	var usr = msg.author; //gets the user that sent the message
	var savemsg = "This message sent by: <@" + usr + ">\n> "; //sets the header of the message to mention the original poster
	savemsg += msg.content; //insert the actual message below
	var attch = msg.attachments; //get the attacments from the original message
	hiddenChan.send(savemsg,); //send the text
	for(let [k, img] of attch)
	{
		//newAttch = new Discord.MessageAttachment().setFile(img.url); //get images
		
		var tempFilePath = babadata.temp + "tempfile" + img.url.substring(img.url.lastIndexOf('.') + 1); //temp file location
		var file = fs.createWriteStream(tempFilePath);
		request.get(img.url).on('error', console.error).pipe(file); // I have no idea how or if this works but it does some stuff
		fs.end();
		hiddenChan.send('attachment :'+k,{files: [tempFilePath]}); //send images
		fs.unlink(tempFilePath) //clean disk hopefully
	}
	msg.delete(); //delete the original
}

//not shure what this does also but it was in jeremy's code so
var cleanupFn = function cleanup() 
{
	console.log("Logging off");
	bot.destroy();
}

process.on('SIGINT', cleanupFn);
process.on('SIGTERM', cleanupFn);
