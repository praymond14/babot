const { setGrole, setVote, setVBH, movetoChannel, SetHolidayChan, MonthsPlus, CreateChannel, CheckFrogID, getErrorFlag, timedOutFrog } = require("./helperFunc.js");
const { babaFriday,  babaHelp, babaPlease, babaPizza, babaVibeFlag, babaYugo, babaHaikuEmbed, babaWednesday, babaDayNextWed } = require("./commandFunctions.js");
const { Client, Intents } = require('discord.js'); //discord module for interation with discord api
const Discord = require('discord.js'); //discord module for interation with discord api
var babadata = require('./babotdata.json'); //baba configuration file
//let request = require('request'); // not sure what this is used for //depricated
const fs = require('fs'); //file stream used for del fuction


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
function babaMessage(bot, message)
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
			message.channel.send(babaFriday());
		}

		if (msgContent.includes("please")) //this could do something better but its ok for now
		{
			message.channel.send(babaPlease());
		}

		if (msgContent.includes("order pizza"))
		{
			message.channel.send(babaPizza());
		}

		if(msgContent.includes('help')) //reply with help text is baba help
		{
			message.channel.send(babaHelp());
		}

		if (msgContent.includes('flag') && (msgContent.includes('night shift') || msgContent.includes('vibe time')))
		{
			var flagcontent = babaVibeFlag();
			message.channel.send(flagcontent).catch(error => {
				newAttch = new Discord.MessageAttachment().setFile(getErrorFlag());
				message.channel.send({content: flagcontent.content, files: [newAttch] }); // send file
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
			message.channel.send(babaYugo());
		}

		if (msgContent.includes('haiku')) // add custom haiku search term?
		{
			var purity = msgContent.includes("purity");
			var list = msgContent.includes("list");
			var chans = msgContent.includes("channels");
			var mye = msgContent.includes("my") ? message.author.id : 0;
			var buy = msgContent.includes("by");
			babaHaikuEmbed(purity, list, chans, mye, buy, msgContent, function(embed) 
			{
				message.channel.send({ content: "BABA MAKE HAIKU", embeds: [embed] });
			});
		}

		if (msgContent.includes('wednesday') || msgContent.includes('days until') || msgContent.includes('when is') || msgContent.includes('day of week'))
		{
			if (msgContent.includes('days until next wednesday'))
				message.channel.send(babaDayNextWed());

			babaWednesday(msgContent, function(texts)
			{
				var templocal = babadata.datalocation + "FrogHolidays/"; //creates the output frog image

				for ( var i = 0; i < texts.length; i++)
				{
					if (texts[i].files == null)
						message.channel.send(texts[i]);
					else
						timedOutFrog(i, texts, message, templocal);
				}
			});
		}
	}
	if(msgContent.includes('!bdelete')) //code to del and move to log
	{
		if(message.channel.type != "DM" && message.member.roles.cache.has(babadata.adminid)) //check if admin
		{
			var message_id = message.content.replace(/\D/g,''); //get message id
			var fnd = false;
			var chanMap = message.guild.channels.fetch().then(channels => {
				channels.each(chan => { //iterate through all the channels
					if (!fnd && chan.type == "GUILD_TEXT") //make sure the channel is a text channel
					{
						chan.messages.fetch(message_id).then(message => 
						{
							fnd = true;
							movetoChannel(message, chan, babadata.logchan)
						}).catch(console.error); //try to get the message, if it exists call deleteAndArchive, otherwise catch the error
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
			var fnd = false;
			var chanMap = message.guild.channels.fetch().then(channels => {
				channels.each(chan => { //iterate through all the channels
					if (!fnd && chan.type == "GUILD_TEXT") //make sure the channel is a text channel
					{
						chan.messages.fetch(message_id).then(message =>
						{
							fnd = true;
							movetoChannel(message, chan, babadata.politicschan)
						}).catch(console.error); //try to get the message, if it exists call deleteAndArchive, otherwise catch the error
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
			var fnd = false;
			var chanMap = message.guild.channels.fetch().then(channels => {
				channels.each(chan => { //iterate through all the channels
					if (!fnd && chan.type == "GUILD_TEXT") //make sure the channel is a text channel
					{
						chan.messages.fetch(message_id).then(message => 
						{
							fnd = true;
							setVote(message)
						}).catch(console.error); //try to get the message, if it exists call setVote, otherwise catch the error
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
			var fnd = false;
			var chanMap = message.guild.channels.fetch().then(channels => {
				channels.each(chan => { //iterate through all the channels
					if (!fnd && chan.type == "GUILD_TEXT") //make sure the channel is a text channel
					{
						chan.messages.fetch(message_id).then(message => 
						{
							fnd = true;
							setVBH(message)
						}).catch(console.error); //try to get the message, if it exists call setVBH, otherwise catch the error
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

module.exports = {
	babaMessage
}