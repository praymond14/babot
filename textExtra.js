const { SetHolidayChan } = require("./helperFunc");
var babadata = require('./babotdata.json'); //baba configuration file
const { controlDOW, cacheDOW } = require("./database");


function Seperated(vle)
{
	if (vle.length > 2000)
	{
		var vleNew = vle.substring(0, 2000);
		var lindex = vleNew.lastIndexOf("\n");
		vle = vleNew.substring(lindex + 1) + vle.substring(2000);
		vleNew = vleNew.substring(0, lindex);

		var sgtuff = [vleNew];
		var s2 = Seperated(vle);
		sgtuff = sgtuff.concat(s2);
		return sgtuff;
	}
	else return [vle];
}


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
		else if (msgContent.includes("odd"))
		{
			var name = message.content.split(' ').slice(1, ).join(' '); //get the name for the role
			var count = name.match(/(\d+)/);
			if (count == null) count = 50;
			else count = count[0];

			odd = ["`Logs:`"];

			g.fetchAuditLogs({limit: count})
			.then(audit => 
			{
				var entries = audit.entries.toJSON();
				for (var i = 0; i < entries.length; i++)
				{
					var k = entries[i];
					var act = k.action;
					var user = k.executor.id;
					var reason = k.reason;
					var target = k.target;
					var chaib = k.changes;

					var outpiut = "`" + act + "` by <@" + user + ">";

					if (reason != null) outpiut += " for `" + reason + "`:";
					else outpiut += ":";
					if (k.targetType == "USER") outpiut += " <@" + target + ">";
					else if (k.targetType == "GUILD_MEMBER") outpiut += " <@" + target.user.id + ">";
					else if (k.targetType == "CHANNEL") outpiut += " <#" + target.id + ">";
					else if (k.targetType == "ROLE") outpiut += " <@&" + target.id + ">";
					else if (k.targetType == "INVITE") outpiut += " " + target.code;
					else if (k.targetType == "WEBHOOK") outpiut += " " + target.name;
					else if (k.targetType == "EMOJI") outpiut += " " + target.name;
					else if (k.targetType == "MESSAGE") outpiut += " " + target.id;
					else if (k.targetType == "THREAD") outpiut += " <#" + target.id + ">";

					outpiut += " at " + k.createdAt;
					outpiut += "\n";

					if (chaib != null)
					{
						var putter = [];
						for (var j = 0; j < chaib.length; j++)
						{
							var c = chaib[j];
							var key = c.key;
							var old = c.old;
							var neww = c.new;
							
							if (old == undefined)
								putter.push("> `" + key + ": " + neww + "`");
							else
								putter.push("> `" + key + ": " + old + " -> " + neww + "`");
						}

						outpiut += putter.join("\n");
					}
					else outpiut += "> `(No Changes)`";

					odd.push(outpiut);
				}
				var vle = odd.join("\n");
				var msgs = Seperated(vle)
				
				for (var i = 0; i < msgs.length; i++)
				{
					message.author.send(msgs[i]);
				}
			}).catch(console.error);
		}
	}
}

module.exports = {
	TextCommandBackup
}