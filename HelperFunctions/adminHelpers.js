var babadata = require('../babotdata.json'); //baba configuration file
var request = require('node-fetch');
const Discord = require('discord.js'); //discord module for interation with discord api
const fs = require('fs');
// const images = require('images');
// const Jimp = require('jimp');
// const fetch = require('node-fetch');

// const options = { year: 'numeric', month: 'long', day: 'numeric' }; // for date parsing to string
const { RoleAdd } = require('./basicHelpers.js');

async function setGrole(msg, rname) //creates role and sets users
{
	console.log(msg);
	try 
	{
		var role = null;
		await msg.guild.roles.fetch().then(roles => {
			roles.each(r => { //iterate through all the channels
				if (r.name === rname) //make sure the channel is a text channel
				{
					role = r;				
				}
			});
		});

		if (role == null) //if null make new role
		{
			console.log("Creating Role: " + rname);

			//create the role
			await msg.guild.roles.create({
				name: rname,
				reason: 'bot do bot thing',
			}).catch(console.error);

			await msg.guild.roles.fetch().then(roles => {
				roles.each(r => { //iterate through all the channels
					if (r.name === rname) //make sure the channel is a text channel
					{
						role = r;				
					}
				});
			});		
		}

		setTimeout(function()
		{ 
			var reactMap = msg.reactions.cache; //get a map of the reactions
			for(let [k, reee] of reactMap) //iterate through all the reactions
			{
				reee.users.fetch().then((users) => {
					RoleAdd(msg, users, role); //call the dumb roll function to do the work (had to be done)
				}).catch(console.error);
			}
		}, 2000); //delayed
		//create role with no permisions, gray color that can be @ by every one
		//get user list from reacations
		//give users role
		
	} 
	catch (error) 
	{
		console.log("nos"); //if error this goes
	}
}

async function setVote(msg) //reacts to message with 👍 and 👎 for votes
{
	var usr = msg.author; //gets the user that sent the message

	msg.react('👍');
	msg.react('👎');
}

async function setVBH(msg) //reacts to message with emoji defined by babadata.emoji (in json file) for our implimentation that is the ban hammer emoji
{
	var usr = msg.author; //gets the user that sent the message

	msg.react(babadata.emoji); //reply with ban hammer emoji
}

async function movetoChannel(msg, channel, logchan, silent) //archive the message and delete it
{
	var hiddenChan = msg.guild.channels.cache.get(logchan); //gets the special archive channel
	var usr = msg.author; //gets the user that sent the message
	var savemsg = "";
	if (!silent) savemsg = "This message sent by: <@" + usr + "> in <#" + channel.id + ">\n> "; //sets the header of the message to mention the original poster
	savemsg += msg.content; //insert the actual message below

	if (silent == 2) savemsg += "\n\n> Sent by: <@" + usr + ">";

	var attch = msg.attachments; //get the attacments from the original message

	if (hiddenChan == null) //if the channel does not exist
		return;	

	hiddenChan.send(savemsg); //send the text

	if (!silent)
	{
		var reactMap = msg.reactions.cache; //get a map of the reactions
		var memgage = "";
		for(let [k, reee] of reactMap) //iterate through all the reactions
		{
			memgage += k + ": " + reee.count + " reactions\n";
		}
	
		if (memgage != "")
		{
			hiddenChan.send("```" + memgage + "```",); //send the text
		}
	}
	var icount = 0;
	for(let [k, img] of attch)
	{
		setTimeout(function()
		{ 
			DelayedDeletion(hiddenChan, img); //download the image and reupload it
		}, 4000 * icount); //delayed so all images can get loaded

		icount ++;
	}

	var waittime = icount == 0 ? 0 : 3000 + (4000 * icount);

	setTimeout(function(){ msg.delete(); }, waittime); //deletes the og message (delayed for the file transfer)
}

async function DelayedDeletion(hiddenChan, img) //download function used when the delay call is ran
{
	var suffix = img.url.substring(img.url.lastIndexOf('.')); //gets the file extension
	// remove anything ? and after
	suffix = suffix.split("?")[0];
	var tempFilePath = babadata.temp + "tempfile" + suffix; // temp file location 
	var url = img.url;

	download(url, tempFilePath, () => { //downloads the file to the system at tempfile location
		console.log('Done!')
	})

	var newAttch = tempFilePath; //makes a new discord attachment

	var newAttch = new Discord.AttachmentBuilder(tempFilePath, 
		{ name: 'file' + suffix, description : "Twas deleted from a place in time, ADAM PLEASE!"}); //makes a new discord attachment

	setTimeout(function(){ hiddenChan.send({files: [newAttch] }); }, 2000); //sends the attachment (delayed by 1 sec to allow for download)

	setTimeout(function(){ fs.unlinkSync(tempFilePath); }, 3000); //deletes file from local system (delayed by 3 sec to allow for download and upload)
}

function timedOutFrog(i, texts, message, templocal)
{
	setTimeout(function()
	{ 
		var ti = texts[i];
		message.channel.send(ti).catch(error => {
			var newAttch = new Discord.AttachmentBuilder(templocal + "error.png", 
				{ name: 'error.png', description : "Error Fronge!"}); //makes a new discord attachment

			message.channel.send({ content: "It is Wednesday, My BABAs", files: [newAttch] }); // send file
		})
	}, 1000);
}

const download = (url, path, callback) => 
{ //download function to replace the old one.
    request(url)
        .then(res => {
            const dest = fs.createWriteStream(path);
            res.body.pipe(dest);
    });
}

async function setCommandRoles(guild)
{
	const permissions = 
	{
		id: babadata.adminId,
		type: 'ROLE',
		permission: true,
	};

    let commandsList = await guild.commands.fetch();
    await commandsList.forEach(slashCommand => {
        console.log(`Changing command ${slashCommand.name}`);
		
		if (!slashCommand.defaultPermission)
		{
			guild.commands.permissions.add({
				command: slashCommand.id,
				permissions: [permissions]
			});
		}
    });
}

module.exports = {
	setGrole,
	setVote,
	setVBH,
	movetoChannel,
    timedOutFrog,
    setCommandRoles
};