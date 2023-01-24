const { SetHolidayChan } = require("./helperFunc");
var babadata = require('./babotdata.json'); //baba configuration file
const { controlDOW, cacheDOW } = require("./database");
const fs = require('fs');


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

function generateTabs(num)
{
	var strg = "";
	for (var i = 0; i < num; i++)
		strg += "	";
	return strg;
}

function objectParse(obj, ind)
{	
	var obje = [];
	for (var key in obj)
	{
		if (obj.hasOwnProperty(key))
		{
			if (typeof obj[key] === 'object' && obj[key] !== null)
			{
				var strg = "";
				if (isNaN(key)) strg += generateTabs(ind);
				var nind = ind;
				if (isNaN(key))
				{
					strg += key + ": \n"
					nind++;
				}
				strg += objectParse(obj[key], nind);
				obje.push(strg);
			}
			else
			{
				var strg = "";
				strg += generateTabs(ind);
				if (!isNaN(key))
					strg += obj[key];
				else
					strg += key + ": " + obj[key];

				obje.push(strg);
			}
		}
	}
	return obje.join("\n");
}

function twoObjectParseCompare(old, neww, ind, arraymode = false)
{
	var objs = [];

	picked = old;
	if (arraymode)
	{
		if (old.length < neww.length)
			picked = neww;
	}
	for (var key in picked)
	{
		if (old.hasOwnProperty(key) || arraymode)
		{
			if (old[key] != neww[key] || arraymode)
			{
				if (typeof old[key] === 'object' && old[key] !== null)
				{
					if (Array.isArray(old[key]) && Array.isArray(neww[key]))
					{
						if (old[key].length == neww[key].length && old[key].length == 0)
							continue;
					}
					var strg = "";
					if (isNaN(key)) strg += generateTabs(ind);
					var nind = ind;
					if (isNaN(key))
					{
						strg += key + ": \n"
						nind++;
					}
					strg += twoObjectParseCompare(old[key], neww[key], nind, Array.isArray(old[key]));

					objs.push(strg);
				}
				else
				{
					var strg = "";
					strg += generateTabs(ind);
					if (!isNaN(key))
						strg += old[key] + " -> " + neww[key];
					else
						strg += key + ": " + old[key] + " -> " + neww[key];

					objs.push(strg);
				}
			}
		}
	}
	return objs.join("\n");
}

function parseItems(old, neww)
{
	if (old == undefined)
	{
		strg = neww
		if (typeof neww === 'object' && neww !== null)
		{
			strg = objectParse(neww, 1);
		}
	}
	else
	{
		strg = old + " -> " + neww
		if (typeof old === 'object' && old !== null)
		{
			var am = Array.isArray(old);
			strg = twoObjectParseCompare(old, neww, 1 - (am ? (old.length > 1 || neww.length > 1 ? 0 : 1) : 0), am);
		}
	}

	return strg;
}


function TextCommandBackup(bot, message, sentvalid, msgContent, g)
{
    if (sentvalid) // put in own file or something eventually
	{
		if (msgContent.includes("🐸 debug")) //0 null, 1 spook, 2 thanks, 3 crimbo, 4 defeat
		{
			if (msgContent.includes("---"))
			{
				var i = msgContent.indexOf("---");
				var sub = msgContent.substring(i + 3);
				SetHolidayChan(g, sub, 3);
				message.author.send("`Re-enabling Old Channel`");
			}
			else
			{
				var rename = "";
				if (msgContent.includes("-n")) rename = "-n"; else rename = "";

				if (msgContent.includes("0"))
					SetHolidayChan(g, "null");
				else if (msgContent.includes("1"))
					SetHolidayChan(g, "spook" + rename);
				else if (msgContent.includes("2"))
					SetHolidayChan(g, "thanks" + rename);
				else if (msgContent.includes("3"))
					SetHolidayChan(g, "crimbo" + rename);
				else if (msgContent.includes("4"))
					SetHolidayChan(g, "defeat" + rename);
				else if (msgContent.includes("5"))
				{
					SetHolidayChan(g, "null", 0);
					message.author.send("`Resetting Holiday Values`");
				}
			}

			setTimeout(function()
			{
				let rawdata = fs.readFileSync(__dirname + '/babotdata.json');
				babadata = JSON.parse(rawdata);
				message.author.send("```HC: " + babadata.holidaychan + "\nHV: " + babadata.holidayval + "```");
			}, 1000);
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

			var hiddenChan = g.channels.cache.get(message_id); //gets the special archive channel
			const guildUser = g.members.fetch(message.author);
			const canSend = guildUser.communicationDisabledUntilTimestamp;

			if(!canSend)
			{
				if (msgContent.includes("i-u"))
				{
					var user_id = message.content.split(' ')[2];
					var mess = message.content.split(' ').slice(3, ).join(' '); //get the name for the role

					if (user_id == null || user_id.trim() == "") 
					{
						message.author.send("`Invalid User ID`");
						return;
					}

					g.members.fetch(user_id).then(user => {
						var nname = user.nickname;
						if (nname == null) nname = user.user.username;

						var avatarimg = user.user.avatarURL();

						hiddenChan.createWebhook(nname,
						{
							avatar: avatarimg,
							reason: 'Baba Plase'
						})
						.then(webhook =>
						{
							webhook.send(mess);

							setTimeout(() => {
								webhook.delete('Baba Plase');
							}, 10000);
						});
					}).catch(console.error);
				}
				else
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
			if (count > 100) count = 100;

			odd = ["`Logs:`"];

			g.fetchAuditLogs({limit: count})
			.then(audit => 
			{
				var entries = audit.entries.toJSON();
				for (var i = 0; i < entries.length; i++)
				{
					var k = entries[i];
					var act = k.action;
					var user = k.executor ? k.executor.id : 0;
					var reason = k.reason;
					var target = k.target;
					var chaib = k.changes;

					var outpiut = "`" + act + (user != 0 ? "` by <@" + user + ">" : "`");

					if (reason != null) outpiut += " for `" + reason + "`:";
					else outpiut += ":";
					if (k.targetType == "USER") outpiut += " <@" + target + ">";
					else if (k.targetType == "GUILD_MEMBER") outpiut += " <@" + target.user.id + ">";
					else if (k.targetType == "MEMBER") outpiut += " <@" + target.user.id + ">";
					else if (k.targetType == "CHANNEL") outpiut += " <#" + target.id + ">";
					else if (k.targetType == "ROLE") outpiut += " <@&" + target.id + ">";
					else if (k.targetType == "INVITE") outpiut += " " + target.code;
					else if (k.targetType == "WEBHOOK") outpiut += " " + target.name;
					else if (k.targetType == "EMOJI") outpiut += " " + target.name;
					else if (k.targetType == "MESSAGE") outpiut += " " + target.id;
					else if (k.targetType == "THREAD") outpiut += " <#" + target.id + ">";
					else if (k.targetType == "INTEGRATION") outpiut += " " + target.name;
					else if (k.targetType == "STAGE_INSTANCE") outpiut += " " + target.id;
					else if (k.targetType == "STICKER") outpiut += " " + target.name;
					else if (k.targetType == "GUILD") outpiut += " " + target.id;

					outpiut += " at `" + k.createdAt + "`";
					outpiut += "\n";

					var op2 = "> `(No Changes)`";

					if (chaib != null)
					{
						var op3 = "";
						var putter = [];
						for (var j = 0; j < chaib.length; j++)
						{
							var c = chaib[j];
							var key = c.key;
							var old = c.old;
							var neww = c.new;
							
							var strg = parseItems(old, neww);
							
							var ct = strg.toString().split(/\r\n|\r|\n/);
							if (ct.length > 1)
							{
								putter.push("> `" + key + ":`");
								for (var k = 0; k < ct.length; k++)
								{
									if (ct[k] == "")
										continue;
									putter.push("> `" + ct[k] + "`");
								}
							}
							else
							{
								putter.push("> `" + key + ": " + strg + "`");
							}
						}

						op3 += putter.join("\n");
						
						if (op3.trim() != "")
							op2 = op3;
					}

					outpiut += op2;

					odd.push(outpiut);
				}
				var vle = odd.join("\n");
				var msgs = Seperated(vle)
				
				for (var i = 0; i < msgs.length; i++)
				{
					message.author.send(msgs[i]);
				}
			}).catch((error) => {
				console.error(error);
				message.channel.send("Error: " + error);
			});
		}
	}
}

module.exports = {
	TextCommandBackup
}

// add function: "are you gonna" that will check if the day call command has happened and what channel if it already occured, else post "perchance"
// call command after successful call -> say channel name and time
// call command after time end -> say channel name/time or "nothing"
// call command before end of time -> say "perchance"