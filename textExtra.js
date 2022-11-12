const { SetHolidayChan } = require("./helperFunc");
var babadata = require('./babotdata.json'); //baba configuration file
const { controlDOW, cacheDOW } = require("./database");


function TextCommandBackup(bot, message, sentvalid, msgContent, g)
{
    if (sentvalid) // put in own file or something eventually
	{
		if (msgContent.includes("🐸 debug")) //0 null, 1 spook, 2 thanks, 3 crimbo, 4 defeat
		{
			if (msgContent.includes("0"))
				SetHolidayChan(message.guild, "null");
			else if (msgContent.includes("1"))
				SetHolidayChan(message.guild, "spook");
			else if (msgContent.includes("2"))
				SetHolidayChan(message.guild, "thanks");
			else if (msgContent.includes("3"))
				SetHolidayChan(message.guild, "crimbo");
			else if (msgContent.includes("4"))
				SetHolidayChan(message.guild, "defeat");
	
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
			var message_id = message.content.split(' ')[1];
			
			var mess = message.content.split(' ').slice(2, ).join(' '); //get the name for the role
			message_id = message_id.replace(/\D/g,''); //get message id
			var hiddenChan = g.channels.cache.get(message_id); //gets the special archive channel
			const guildUser = g.members.fetch(message.author);
			const canSend = guildUser.communicationDisabledUntilTimestamp;

			if(!canSend)
			{
				hiddenChan.send(mess).then(msg=>
				{
					if (msgContent.includes("🐸"))
					{
						msg.react("🐸");
					}
					if (msgContent.includes("s-d"))
					{
						setTimeout(function(){msg.delete();}, 8000);
					}
				});
			}
		}
		else if (msgContent.includes("reee"))
		{
			var message_id = message.content.split(' ')[1]; //get the name for the role
			
			var mess = message.content.split(' ').slice(2, ).join(' '); //get the name for the role
			message_id = message_id.replace(/\D/g,''); //get message id

			var items = mess.split(" ");
			var chanMap = g.channels.fetch().then(channels => {
				channels.each(chan => { //iterate through all the channels
					if (chan.type == "GUILD_TEXT") //make sure the channel is a text channel
					{
						chan.messages.fetch(message_id).then(message => 
						{
							for (var i = 0; i < items.length; i++)
							{
								if (items[i].includes("<"))
								{
									items[i] = items[i].match(/(\d+)/)[0];
								}
								console.log(items[i]);
								message.react(items[i]).catch(console.error);
							}
						}).catch(console.error); //try to get the message, if it exists call setVote, otherwise catch the error
					}
				});
			});
		}
		else if (msgContent.includes("tim"))
		{
			var u_id = message.content.split(' ').slice(1, 2).join(' ').replace(' ',''); //get the name for the role
			
			var mess = message.content.split(' ').slice(2, ).join(' '); //get the name for the role
			u_id = u_id.replace(/\D/g,''); //get message id

			var time = mess.match(/(\d+)/);
			if (time != null) time = time[0] * 60 * 1000;

			bot.users.fetch(u_id).then(user => {
				g.members.fetch(user).then(member => member.timeout(time, 'Baba Plase')
				.catch(console.error));
			}).catch(console.error);
		}
		else if (msgContent.includes("refried beans")) //probably would break adams brain
		{
			if ((global.dbAccess[1] && global.dbAccess[0]))
			{
				cacheDOW();
				message.author.send("DOW cache updated (hopefully)");
			}
			else
			{
				message.author.send("DOW cache not updated");
			}
		}
		else if (msgContent.includes("rbcont")) //probably would break adams brain
		{
			var u_id = message.content.split(' ').slice(1, 2).join(' ').replace(' ',''); //get the name for the role
			
			var mess = message.content.split(' ').slice(2, ).join(' '); //get the name for the role
			u_id = u_id.replace(/\D/g,''); //get message id

			var time = mess.match(/(\d+)/);
			if (time != null) time = time[0];

			if (time < 0) time = 0;
			if (time > 2) time = 2;

			if ((global.dbAccess[1] && global.dbAccess[0]))
			{
				controlDOW(u_id, time);
				message.author.send("DOW control for <@" + u_id + "> set to " + time);
			}
			else
			{
				message.author.send("DOW control not updated");
			}
		}
		else if (msgContent.includes("saintnick"))
		{
			var name = message.content.split(' ').slice(1, ).join(' '); //get the name for the role

			g.members.fetch(bot.user.id).then(member => {
				member.setNickname(name, "Baba Plase");
			});
		}
		else if (msgContent.includes("amhours"))
		{
			var u_id = message.content.split(' ').slice(1, 2).join(' ').replace(' ',''); //get the name for the role
			u_id = u_id.replace(/\D/g,''); //get message id
			
			var mess = message.content.split(' ').slice(2, ).join(' '); //get the name for the role
			bot.users.fetch(u_id).then(user => user.send(mess)).catch(console.error);
		}
	}
}

module.exports = {
	TextCommandBackup
}