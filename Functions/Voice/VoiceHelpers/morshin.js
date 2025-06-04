var babadata = require('../../../babotdata.json'); //baba configuration file

const fs = require('fs');

const Discord = require('discord.js'); //discord module for interation with discord api

const { getD1 } = require('../../../Tools/overrides');
const { PickThePerfectUsername } = require('../../Database/databaseVoiceController.js');
    
var rawdata = fs.readFileSync(babadata.datalocation + "emojiJSONCache.json");
var emojis = JSON.parse(rawdata).emojis;

async function babaMorshu(mode, text, index)
{
    // for pauses
    text = text.replaceAll("...", "\n.\n");

    text = text.replaceAll("ඞ", " among us ");
    text = text.replaceAll("𓀒", " man falling ");

    // replace all the time tags with human readable dates
	var chunks = smartSplitTimeTags(text);

	for (var i = 0; i < chunks.length; i++)
	{
		// if chunks[i] is a timestamp, convert to human readable date
		if (chunks[i].includes("<t:"))
		{
			chunks[i] = readableTimeStamp(chunks[i]);
		}
	}

	text = chunks.join("");

    // replace all the discord special tags with their actual names
	text = await parseDiscordStuff(text);

	// replace all the numbers with spaces if the number is greater than 6 characters
	chunks = text.match(/(\d+|[^\d]+)/g);

	for (var i = 0; i < chunks.length; i++)
	{
		// if chunks is a number, and length is greater than 6 characters, split into numbers with spaces ex: 12345678 -> 1 2 3 4 5 6 7 8
		if (!isNaN(chunks[i]) && chunks[i].length > 6)
		{
			var newStrng = "";
			for (var j = 0; j < chunks[i].length; j++)
			{
				newStrng += chunks[i][j] + " ";
			}
			chunks[i] = newStrng.trim();
		}
	}

	text = chunks.join("");

    // replace all the unicode emojis with their names
    emojis.forEach(e => 
    {
        const emojiRegex = new RegExp(e.emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        text = text.replaceAll(emojiRegex,  " " + e.name + " ");
    });

    var morshuPromise = new Promise((resolve, reject) => {
        fetch('https://morshu.yoinks.org/morsh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
            {
                message: text,
                response_type: mode
            })
        }).then(res => res.arrayBuffer())
        .then((data) => {
            const nodeBuffer = Buffer.from(data);
            // save the file if success to babadata.temp + "morshu.mp3" or babadata.temp + "morshu.mp4"
            // data will be a buffer of the file in either mp3 or mp4 format

            if (mode == "audio")
            {
                var newFile = new Discord.AttachmentBuilder(nodeBuffer, { name: 'Morshu.mp3', description : text });

                resolve({file: newFile});
            }
            else if (mode == "video")
            {
                var newFile = new Discord.AttachmentBuilder(nodeBuffer, { name: 'Morshu.mp4', description : text });

                resolve({file: newFile});
            }
        })
        .catch((error) => {
            console.error(error);
            resolve({file : null});
        });
    });

    return morshuPromise;
}

function smartSplitTimeTags(text) 
{
	const regex = /<t:\d+(?::[tTfFdDrR])?>|[\s\S]/g;  // Match either a full time tag or any single character
	const rawMatches = [...text.matchAll(regex)].map(m => m[0]);
  
	// Now merge consecutive text characters into bigger text chunks:
	const chunks = [];
	let buffer = "";
	for (const part of rawMatches) 
	{
	  	if (part.startsWith("<t:") && part.endsWith(">")) 
		{
			// Flush buffer if there's text
			if (buffer) 
			{
				chunks.push(buffer);
				buffer = "";
			}
			chunks.push(part);
	  	} 
		else 
			buffer += part;
	}
	if (buffer) chunks.push(buffer);
  
	return chunks;
}

function readableTimeStamp(stampString)
{
	var timestamp = stampString.match(/\d+/g);
	// make a date with the timestamp and offset by current timezone
	var date = new Date(parseInt(timestamp[0]) * 1000);
	
	// if stampstring is <t:NUMBER> append a :f to it
	stampString = stampString.replace(/<t:(\d+)>/g, '<t:$1:f>');
	
	// change the string based on the type of timestamp (:t, :T, :f, :F, :d, :D, :R)
	switch (stampString[stampString.length - 2])
	{
		case 't':
			return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });
		case 'T':
			return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric' });
		case 'f':
			return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
		case 'F':
			return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
		case 'd':
			return date.toLocaleDateString('en-US');
		case 'D':
			return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
		case 'R':
			// return relative time
			var now = getD1(true);
			var diff = date - now;
			var mins = Math.floor(diff / 60000);
			// if the date is in the past, return x seconds/minutes/hours/days ago
			// if the date is in the future, return in x seconds/minutes/hours/days
			// if the date is now, return just now
			if (mins < 0)
			{
				mins = Math.abs(mins);
				if (mins < 60)
				{
					return mins + " minutes ago";
				}
				else if (mins < 1440)
				{
					return Math.floor(mins / 60) + " hours ago";
				}
				else
				{
					return Math.floor(mins / 1440) + " days ago";
				}
			}
			else if (mins == 0)
			{
				return "Just now";
			}
			else
			{
				if (mins < 60)
				{
					return "In " + mins + " minutes";
				}
				else if (mins < 1440)
				{
					return "In " + Math.floor(mins / 60) + " hours";
				}
				else
				{
					return "In " + Math.floor(mins / 1440) + " days";
				}
			}
		default:
			return stampString;
	}
}

async function getAUserName(userID)
{
	var userGetPromise = new Promise((resolve, reject) => {
		var guildID = babadata.testing === undefined ? "454457880825823252" : "522136584649310208";
		global.Bot.guilds.fetch(guildID).then(guild => {
			guild.members.fetch(userID).then(member => {
				resolve(PickThePerfectUsername(member));
			}).catch((error) => {
				console.error(error);
				resolve("User not found");
			});
		}).catch((error) => {
			console.error(error);
			resolve("Guild not found");
		});
	});

	return userGetPromise;
}

async function getAChannelName(channelID)
{
    var channelGetPromise = new Promise((resolve, reject) => {
        var guildID = babadata.testing === undefined ? "454457880825823252" : "522136584649310208";
        global.Bot.guilds.fetch(guildID).then(guild => {
            var channel = guild.channels.cache.get(channelID);
            if (channel != null)
                resolve(channel.name);
            else
                resolve("Channel not found");
        }).catch((error) => {
            console.error(error);
            resolve("Guild not found");
        });
    });

    return channelGetPromise;
}

async function getARoleName(roleID)
{
    var roleGetPromise = new Promise((resolve, reject) => {
        var guildID = babadata.testing === undefined ? "454457880825823252" : "522136584649310208";
        global.Bot.guilds.fetch(guildID).then(guild => {
            var role = guild.roles.cache.get(roleID);
            if (role != null)
                resolve(role.name);
            else
                resolve("Role not found");
        }).catch((error) => {
            console.error(error);
            resolve("Guild not found");
        });
    });

    return roleGetPromise;
}

async function parseDiscordStuff(text)
{
	var listOfItems = parseDiscordSpecial(text);

	var newText = "";
	for (var i = 0; i < listOfItems.length; i++)
	{
		var item = listOfItems[i];
		switch (item.type)
		{
			case "channel":
                var channel = await getAChannelName(item.id);
                newText += channel;
				break;
			case "role":
                var role = await getARoleName(item.id);
                newText += role;
				break;
			case "user":
				var user = await getAUserName(item.id);
				newText += user;
				break;
			case "emoji":
			case "animated_emoji":
				newText += item.name;
				break;
			case "text":
				newText += item.text;
				break;
			default:
				newText += item.text;
				break;
		}
	}

	return newText;
}

function parseDiscordSpecial(text) 
{
	const regex = /(<#(\d+)>|<@&(\d+)>|<@(\d+)>|<(a?):(\w+):(\d+)>|([^<]+))/g;
  
	const matches = [...text.matchAll(regex)];
  
	return matches.map(match => 
	{
		const [fullMatch, , channelId, roleId, userId, animatedFlag, emojiName, emojiId, plainText] = match;
  
		if (channelId) 
		{
		  	return { type: "channel", text: fullMatch, id: channelId };
		}
		if (roleId) 
		{
		  	return { type: "role", text: fullMatch, id: roleId };
		}
		if (userId) 
		{
		  	return { type: "user", text: fullMatch, id: userId };
		}
		if (emojiId) 
		{
			return {
				type: animatedFlag ? "animated_emoji" : "emoji",
				text: fullMatch,
				name: emojiName,
				id: emojiId
			};
		}
		if (plainText)
		{
		  	return { type: "text", text: plainText };
		}
  
		return null;
	})
	.filter(Boolean);
}

module.exports = {
	babaMorshu
};