const { babaFriday,  babaHelp, babaPlease, babaPizza, babaVibeFlag, babaYugo, babaHaikuEmbed, babaWednesday, babaDayNextWed, babaJeremy, babaHurricane, babaRepost, babaWeather } = require("./commandFunctions.js");
const { Client, Intents } = require('discord.js'); //discord module for interation with discord api
const Discord = require('discord.js'); //discord module for interation with discord api
var babadata = require('./babotdata.json'); //baba configuration file
//let request = require('request'); // not sure what this is used for //depricated
const fs = require('fs'); //file stream used for del fuction
//const voice = require('@discordjs/voice')
//var prism = require("prism-media");
//var ffmpeg = require('fluent-ffmpeg');

const { SetHolidayChan, CheckFrogID, handleButtonsEmbed, preformEasterEggs } = require("./HelperFunctions/basicHelpers.js");
const { getErrorFlag } = require("./HelperFunctions/commandHelpers.js");
const { setGrole, setVote, setVBH, movetoChannel, timedOutFrog } = require("./HelperFunctions/adminHelpers.js");
const { normalizeMSG } = require("./HelperFunctions/dbHelpers.js");


//To Do:
/*
	- Stop Calls to Funciton until images posted! - Sami
	- Bruh Mode? - Ryan
	- make if (message.content.includes("847324692288765993")) do somthing more interesting
*/


const { Console } = require('console');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const { TextCommandBackup } = require("./textExtra.js");
const { funnyDOWText } = require("./HelperFunctions/slashFridayHelpers.js");
//const { spawn } = require("child_process");
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

//const opusDecoder = new prism.opus.Decoder({
//	frameSize: 960,
//	channels: 2,
//	rate: 48000,
//});


//stuff when message is recived.
async function babaMessage(bot, message)
{
	let rawdata = fs.readFileSync(babadata.datalocation + "FrogHolidays/" + 'frogholidays.json'); //load file each time of calling wednesday
	let frogdata = JSON.parse(rawdata);
	var g, rl = null;
	var sentvalid = false;
	var idint = CheckFrogID(frogdata, message.author.id);
	var rid = frogdata.froghelp.rfrog[0];
	var msgContent = normalizeMSG(message.content.toLowerCase());

	if (message.channel.type == 1 && idint >= 0)
	{
		rid = frogdata.froghelp.rfrog[idint];
		g = bot.guilds.resolve(frogdata.froghelp.mainfrog);
		rl = g.roles.cache.find(r => r.id === rid);
		sentvalid = true;
	}
	
	TextCommandBackup(bot, message, sentvalid, msgContent, g)
	
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

	if(msgContent.includes(yr - 1) && msgContent.includes("560231259842805770") && msgContent.includes("563063109422415872") && !message.author.bot && message.author.id == "360228104997961740") //if message contains baba and is not from bot
	{
		let rawdata = fs.readFileSync(__dirname + '/babotdata.json');
		let baadata = JSON.parse(rawdata);

		babadata = baadata;
		if (babadata.holidayval == "defeat")
		{
			//560231259842805770  563063109422415872
			SetHolidayChan(message.guild, "null", 0);
		}
	}
	

	/*
	var streamies = {};
	if (msgContent.includes("voice time"))
	{
		connection = voice.joinVoiceChannel({
            channelId: message.guild.members.cache.get(message.author.id).voice.channel.id, //the id of the channel to join (we're using the author voice channel)
            guildId: message.guild.id, //guild id (using the guild where the message has been sent)
            adapterCreator: message.guild.voiceAdapterCreator //voice adapter creator
        });


		connection.receiver.speaking.on('start', (userId) => {
			console.log("start" + userId);
			console.log(streamies[userId]);
            if (streamies[userId] == null || Number.isInteger(streamies[userId]))
			{
				if (streamies[userId] == null) streamies[userId] = 0;
				var ct = streamies[userId];

				var dest = fs.createWriteStream('output' + userId + " - " + ct + '.pcm');
				streamies[userId] = {"id": ct, "sub": connection.receiver.subscribe(userId), "stream": dest};
				streamies[userId].sub.pipe(opusDecoder).pipe(streamies[userId].stream);
			}
        })
		
		connection.receiver.speaking.on('end', (userId) => {
			console.log("end" + userId);
			if (streamies[userId] != null)
			{
				var ct = streamies[userId].id;
				var proc = new ffmpeg();

				proc.addInput("output" + userId + " - " + ct + ".pcm")
				.on('end', function() {
					
				})
				.addInputOptions(['-y', '-f s16le', '-ar 44.1k', '-ac 2'])
				.output("output" + userId + " - " + ct + ".wav")
				.run()
				
				//exec("ffmpeg -y -f s16le -ar 44.1k -ac 2 -i output" + userId + ".pcm output" + userId + ".mp3")
				//var writeStream = fs.createWriteStream('samples/output'+ ct + '.pcm')
				streamies[userId].sub.unpipe();
				streamies[userId].sub.destroy();
				streamies[userId].stream.end();
				streamies[userId] = ct + 1;
				//fs.unlinkSync('output' + userId + " - " + (streamies[userId] - 1) + '.pcm');
			}
		})

	}
	*/

	preformEasterEggs(message, msgContent, bot)

	if(msgContent.includes('!baba')) //if message contains baba and is not from bot
	{
		message.channel.sendTyping();
		if (msgContent.includes("baba is help") && message.author.bot)
			return
		
		var exampleEmbed = null;
		var text = 'BABA IS ADMIN'; //start of reply string for responce message.
		
		if(msgContent.includes('password')) //reply with password file string if baba password
		{
			text += '\n' + babadata.pass;
		}

		message.channel.send({ content: text });

		if (msgContent.includes("friday"))
		{
			message.channel.sendTyping();
			var tod = new Date();
			if (tod.getDay() != 5)
			{

				var text = await funnyDOWText(5, message.author.id);

				message.channel.send(text);
			}
			else
			{
				message.channel.send(await babaFriday());
			}
		}

		if (msgContent.includes("please")) //this could do something better but its ok for now
		{
			message.channel.sendTyping();
			var cont = babaPlease()
			if (cont != null)
			{
				message.channel.send(cont);
			}
		}

		if (msgContent.includes("order pizza"))
		{
			message.channel.sendTyping();
			message.channel.send(babaPizza());
		}

		if (msgContent.includes("hurricane"))
		{
			message.channel.sendTyping();
			babaHurricane("", function(val)
			{
				message.channel.send(val);
			});
		}

		if (msgContent.includes("repost"))
		{
			message.channel.sendTyping();
			message.channel.send(babaRepost());
		}

		if (msgContent.includes("jeremy"))
		{
			message.channel.send(babaJeremy());
		}

		// if (msgContent.includes("cat"))
		// {
		// 	message.channel.send(babaCat());
		// }

		if (msgContent.includes("weather"))
		{
			message.channel.sendTyping();
			babaWeather("deets", "Apex NC", function(val)
			{
				message.channel.send(val);
			});
		}

		if(msgContent.includes('help')) //reply with help text is baba help
		{
			message.channel.sendTyping();
			message.channel.send(babaHelp());
		}

		if (msgContent.includes('flag') && (msgContent.includes('night shift') || msgContent.includes('vibe time')))
		{
			message.channel.sendTyping();
			var flagcontent = babaVibeFlag();
			message.channel.send(flagcontent).catch(error => {

				var newAttch = new Discord.AttachmentBuilder(getErrorFlag(), 
					{ name: 'errrrrr.png', description : "No flag for you bud hee!"}); //makes a new discord attachment

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
		if(msgContent.includes('make yugo'))
		{
			message.channel.sendTyping();
			message.channel.send(babaYugo());
		}

		if (msgContent.includes('haiku')) // add custom haiku search term?
		{
			message.channel.sendTyping();
			var purity = msgContent.includes("purity");
			var list = msgContent.includes("list");
			var chans = msgContent.includes("channels");
			var mye = msgContent.includes("my") ? message.author.id : 0;
			var buy = msgContent.includes("by");
			var info = {"ipp": 5, "page": 0};
			babaHaikuEmbed(purity, list, chans, mye, buy, msgContent, info, function(cont) 
			{
				message.channel.send(cont[info.page]).then(m2 => 
				{
					if (cont[info.page].components != null)
					{
						handleButtonsEmbed(message.channel, m2, message.author.id, cont);
					}
				})
				.catch(console.error);;
			});
		}

		if (msgContent.includes('wednesday') || msgContent.includes('days until') || msgContent.includes('when is') || msgContent.includes('day of week'))
		{
			message.channel.sendTyping();
			if (msgContent.includes('days until next wednesday'))
				message.channel.send(babaDayNextWed());

			await babaWednesday(msgContent, message.author, function(texts)
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
		message.channel.sendTyping();
		if(message.channel.type != 1 && message.member.roles.cache.has(babadata.adminId)) //check if admin
		{
			var message_id = message.content.replace(/\D/g,''); //get message id
			var fnd = false;
			
			var chanMap = message.guild.channels.fetch().then(channels => {
				channels.each(chan => { //iterate through all the channels
					if (!fnd && chan.type == 0) //make sure the channel is a text channel
					{
						chan.threads.fetch().then(thread => 
							thread.threads.each(thr =>
							{
								thr.messages.fetch(message_id).then(message => 
								{
									fnd = true;
									movetoChannel(message, thr, babadata.logchan)
								}).catch(function (err) {});
							})
						).catch(function (err) {});
	
						chan.messages.fetch(message_id).then(message => 
						{
							fnd = true;
							movetoChannel(message, chan, babadata.logchan)
						}).catch(function (err) {}); 
					}
				});
			});
		}
	}
	// move messsage to politics channel
	if(msgContent.includes('!political'))
	{
		message.channel.sendTyping();
		if(message.channel.type != 1 && message.member.roles.cache.has(babadata.adminId)) //check if admin
		{
			var message_id = message.content.replace(/\D/g,''); //get message id
			var fnd = false;
			
			var chanMap = message.guild.channels.fetch().then(channels => {
				channels.each(chan => { //iterate through all the channels
					if (!fnd && chan.type == 0) //make sure the channel is a text channel
					{
						chan.threads.fetch().then(thread => 
							thread.threads.each(thr =>
							{
								thr.messages.fetch(message_id).then(message => 
								{
									fnd = true;
									movetoChannel(message, thr, babadata.politicschan)
								}).catch(function (err) {});
							})
						).catch(function (err) {});
	
						chan.messages.fetch(message_id).then(message => 
						{
							fnd = true;
							movetoChannel(message, chan, babadata.politicschan)
						}).catch(function (err) {}); 
					}
				});
			});
		}
	}
	if(msgContent.includes('!setvote')) //code to set vote
	{
		message.channel.sendTyping();
		if(message.channel.type != 1 && message.member.roles.cache.has(babadata.adminId)) //check if admin
		{
			var message_id = message.content.replace(/\D/g,''); //get message id
			var fnd = false;

			var chanMap = message.guild.channels.fetch().then(channels => {
				channels.each(chan => { //iterate through all the channels
					if (!fnd && chan.type == 0) //make sure the channel is a text channel
					{
						chan.threads.fetch().then(thread => 
							thread.threads.each(thr =>
							{
								thr.messages.fetch(message_id).then(message => 
								{
									fnd = true;
									setVote(message)
								}).catch(function (err) {});
							})
						).catch(function (err) {});
	
						chan.messages.fetch(message_id).then(message => 
						{
							fnd = true;
							setVote(message)
						}).catch(function (err) {}); 
					}
				});
			});
		}
	}
	if(msgContent.includes('!bsetstatus')) //code to set game
	{
		message.channel.sendTyping();
		if(message.channel.type != 1 && message.member.roles.cache.has(babadata.adminId)) //check if admin
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
		message.channel.sendTyping();
		if(message.channel.type != 1 && message.member.roles.cache.has(babadata.adminId)) //check if admin
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
		message.channel.sendTyping();
		if(message.channel.type != 1 && message.member.roles.cache.has(babadata.adminId)) //check if admin
		{
			var message_id = message.content.replace(/\D/g,''); //get message id
			var fnd = false;
			
			var chanMap = message.guild.channels.fetch().then(channels => {
				channels.each(chan => { //iterate through all the channels
					if (!fnd && chan.type == 0) //make sure the channel is a text channel
					{
						chan.threads.fetch().then(thread => 
							thread.threads.each(thr =>
							{
								thr.messages.fetch(message_id).then(message => 
								{
									fnd = true;
									setVBH(message)
								}).catch(function (err) {});
							})
						).catch(function (err) {});
	
						chan.messages.fetch(message_id).then(message => 
						{
							fnd = true;
							setVBH(message)
						}).catch(function (err) {}); 
					}
				});
			});
		}
	}
	if(msgContent.includes('!grole')) //code to set game role
	{
		message.channel.sendTyping();
		if(message.channel.type != 1 && message.member.roles.cache.has(babadata.adminId)) //check if admin
		{
			role_name = message.content.split(' ').slice(0, 2).join(' ').substring(6).replace(' ',''); //get the name for the role
			var message_id = message.content.replace(role_name,''); //remove role name from string
			message_id = message_id.replace(/\D/g,''); //get message id
			var fnd = false;
			
			var chanMap = message.guild.channels.fetch().then(channels => {
				channels.each(chan => { //iterate through all the channels
					if (!fnd && chan.type == 0) //make sure the channel is a text channel
					{
						chan.threads.fetch().then(thread => 
							thread.threads.each(thr =>
							{
								thr.messages.fetch(message_id).then(message => 
								{
									fnd = true;
									setGrole(message, role_name);
								}).catch(function (err) {});
							})
						).catch(function (err) {});
	
						chan.messages.fetch(message_id).then(message => 
						{
							fnd = true;
							setGrole(message, role_name);
						}).catch(function (err) {}); 
					}
				});
			});
		}
	}

	if (msgContent.includes("robot") && global.ResetDaily)
	{
		message.channel.sendTyping();
		global.ResetDaily = false;
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
