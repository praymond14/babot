var babadata = require('./babotdata.json'); //baba configuration file
var request = require('node-fetch');
const Discord = require('discord.js'); //discord module for interation with discord api
const fs = require('fs');
const images = require('images');
const Jimp = require('jimp');

const options = { year: 'numeric', month: 'long', day: 'numeric' }; // for date parsing to string

const emotions = ["splendid", "exciting", "sad", "boring", "fun", "exquisite", "happy", "pretty eventful", "slow to start but it picked up later in the day", "not so good", "very good", "legal", "spungungulsumplus", "fish"];
const persontype = ["friend", "enemy", "brother", "BROTHERRRRRR", "bungle bus", "uncle", "second cousin twice removed", "uncles dogs sisters boyfriends moms second cousins cat", "leg", "adam"];
const game = ["TF2", "Ultimate Admiral: Dreadnoughts", "Fishing Simulator", "Sea of Thieves", "Factorio", "Forza Horizon 5", "nothing", "Fallout: New Vegas", "Stabbing Simulator (IRL)"];
const emotion2 = ["fun", "exciting", "monotonous", "speed run", "pretty eventful", "frog", "emotional", "devoid of all emotions"];
const bye = ["bid you a morrow", "will see you soon", "want to eat your soul, so watch out", "am going to leave now", "hate everything, goodbye", "am monke, heee heee hoo hoo", "wish you good luck on your adventures", "am going to go to bed now", "want to sleep but enevitably will not get any as i will be gaming all night, good morrow", "am going to go to the morrow lands", "will sleep now", "am pleased to sleep"];
const emoji = ["ඞ", "🐸", "🍆", "💄", "⛧", "🎄", "🐷", "🐎", "🐴", "🐍", "⚡", "🪙", "🖕", "🚊", "🏻🏻", "🤔", "🌳", "🌲", "🌴", "🌵", "🐀", "🍝", "𓀒"];

var lookuptable = {};

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

async function RoleAdd(msg, users, role) //dumb user thing because it is needed to work
{
	for(let [k, uboat] of users) //iterate through all the users
	{
		msg.guild.members.fetch(uboat.id).then(mem => mem.roles.add(role)); //check if user is memeber
		//add role to user
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

function timedOutFrog(i, texts, message, templocal)
{
	setTimeout(function()
	{ 
		var ti = texts[i];
		message.channel.send(ti).catch(error => {
			var newAttch = new Discord.MessageAttachment().setFile(templocal + "error.png"); //makes a new discord attachment (default fail image)
			message.channel.send({ content: "It is Wednesday, My BABAs", files: [newAttch] }); // send file
		})
	}, 1000);
}

function getD1()
{
	var dateoveride = [false, 3, 9]; //allows for overiding date manually (testing)
	var yr = new Date().getFullYear(); //get this year
	var dy = dateoveride[0] ? dateoveride[2] : new Date().getDate(); //get this day
	var my = dateoveride[0] ? dateoveride[1] - 1 : new Date().getMonth(); //get this month
	var d1 = new Date(yr, my, dy);
	return d1;
}

function getErrorFlag()
{
	return babadata.datalocation + "Flags/" + "error.png";
}

function sqlEscapeStringThingforAdamBecauseHeWillDoanSQLInjectionOtherwise(str)
 {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) 
	{
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\"+char;
            default:
                return char;
        }
    });
}

function GetDate(d1, yr, holidayinfo) //Gets the specified date from the selected holiday at the year provided
{
	let d2 = new Date(); //new Date
	switch(holidayinfo.mode)
	{
		case 5:
			if (holidayinfo.year)
			{
				yr = holidayinfo.year;
				holidayinfo.year = 0;
			}
		case 0:
			//console.log(yr);
			if (holidayinfo.month == 0)
				holidayinfo.month = 1;

			if (holidayinfo.day == 0)
				holidayinfo.day = 1;

			d2 = new Date(yr, holidayinfo.month - 1, holidayinfo.day); //get holiday
			break;
		case 1:
			var wk = holidayinfo.week;
			var mnth = holidayinfo.month;

			if (holidayinfo.week < 0)
			{
				wk++;
				mnth++;
			}

			d2 = new Date(yr, mnth - 1, 1); //get first of specified month
			var dtcalc = 1 + (holidayinfo.dayofweek - d2.getDay() - 7) % 7;
			dtcalc = dtcalc + (7 * wk); //calculate the day of the month

			d2 = new Date(yr, mnth - 1, dtcalc); //get holiday
			break;
		case 2:
			var sm = d1.getMonth() + 1; //get the month to start on
			if (d1.getDate() > holidayinfo.day) //add one month if day is past specified day
				sm++;

			let retd = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate() - 1); //set to day before today
			for (var i = sm; i <= 12; i++)
			{
				let d3 = new Date(yr, i - 1, holidayinfo.day); //get each months specified day
				if (d3.getDay() == holidayinfo.dayofweek) //check each months specified day is correct DOW
				{
					retd = d3; //set day
					break;
				}
			}
			d2 = retd;
			break;
		case 3:
			var ea = getEaster(yr); //get easter
			d2 = new Date(yr, ea[0] - 1, ea[1]); //get holiday
			break;
		default:
			console.log(holidayinfo);
	}

	if (isNaN(d2))
	{
		// Need to return special value to indicate that the date is invalid such that it still displays right date
		return new Date(200000, 0, 1);
	}

	if (holidayinfo.name == "date" && holidayinfo.day != d2.getDate())
	{
		d2 = GetDate(new Date(yr + 1, 0, 1), yr + 1, holidayinfo); //re-call function w/year of next
	}
	
	if (d2.getTime() < d1.getTime()) //check if day is post holiday and make next holiday year + 1
	{
		if (holidayinfo.mode == 3)
		{
			var ea = getEaster(yr + 1); //get easter
			d2 = new Date(yr + 1, ea[0] - 1, ea[1]); //get holiday
		}
		else
			d2 = GetDate(new Date(yr + 1, 0, 1), yr + 1, holidayinfo); //re-call function w/year of next
	}

	if (holidayinfo.name == "date")
		holidayinfo.safename = d2.toLocaleDateString('en-US', options); //display value

	return d2;
}

function MakeImage(templocal, base, wednesdayoverlay, weeks, outputname, holidayinfo, textoverlay) //Image Creation is now function
{
	var plu = false;
	if (weeks > 999999) 
	{
		plu = true;
		weeks = 999999;
	}

	var bonus = 0;
	var yeartop = holidayinfo.year && holidayinfo.name != "date" ? true : false;

	if (weeks > 100) //set bonus val and reset weeks to between 1 - 100
	{
		bonus = Math.floor(weeks / 100);
		weeks = weeks % 100;
	}
	
	var im = images(templocal + base) //creates the image using secified overlays
		.draw(images(templocal + "mydudes.png"), 0, 0)
		.draw(images(templocal + wednesdayoverlay), 0, 0);

	if (!(bonus > 0 && weeks == 0)) //if weeks is 0 and bonus is real - no printing zero
	{
		im = im.draw(images(templocal + weeks + ".png"), 0, 0)
			   .draw(images(templocal + wednesdayoverlay), 0, 0);
	}

	var res = BonusGenerator(bonus, im, templocal, weeks, 1, 1, plu);
	im = res[0];
	var textlocal = res[1];

	im.save(templocal + outputname); //save the image

	setTimeout(function()
	{
		if (holidayinfo.name == "date" || textoverlay || yeartop) //overide the image with text if a date
		{
			Jimp.read(templocal + outputname)
				.then(function (image) {
					loadedImage = image;
					return Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
				})
				.then(function (font) {
					loadedImage.print(font, 
									yeartop ? 10 : (textoverlay ? 50 : 90),
									textlocal + (yeartop ? 35 : 0),
									yeartop ? holidayinfo.year : holidayinfo.safename,
									textoverlay ? 367 : 467)
									.write(templocal + outputname);
				})
				.catch(function (err) {
					console.error(err);
				});
		}
	}, 500);
}

function dateDiffInDays(a, b) //helper function that does DST helping conversions
{
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

function getEaster(year) //Thanks to Jeremy's Link
{
	var f = Math.floor,
		G = year % 19,
		C = f(year / 100),
		H = (C - f(C / 4) - f((8 * C + 13)/25) + 19 * G + 15) % 30,
		I = H - f(H/28) * (1 - f(29/(H + 1)) * f((21-G)/11)),
		J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
		L = I - J,
		month = 3 + f((L + 40)/44),
		day = L + 28 - 31 * f(month / 4);

	return [month, day];
}

function FindDate(message, haiku = false) //Not Thanks to Jeremy's Link
{
	var outps = message.toLowerCase().replace("!baba", "") //there is no point to this, i did it because i wanted too
		.replace("wednesday", "")
		.replace("days", "")
		.replace("until", "")
		.replace("next", "")
		.split(" ");

	var day = 0;
	var month = 0;
	var year = 0;

	for ( var i = 0; i < outps.length; i++)  //loop all the text
	{
		var item = outps[i];
		if (month == 0) //set month to a detected month
		{
			if (item == "")
				month = 0;
			else if ("january".includes(item))
				month = 1;
			else if ("february".includes(item))
				month = 2;
			else if ("march".includes(item))
				month = 3;
			else if ("april".includes(item))
				month = 4;
			else if ("may".includes(item))
				month = 5;
			else if ("june".includes(item))
				month = 6;
			else if ("july".includes(item))
				month = 7;
			else if ("august".includes(item))
				month = 8;
			else if ("september".includes(item))
				month = 9;
			else if ("october".includes(item))
				month = 10;
			else if ("november".includes(item))
				month = 11;
			else if ("december".includes(item))
				month = 12;
		}

		if (day == 0) //set year to first day
		{
			var iv = parseInt(item);
			if (iv <= 31)
			{
				day = iv;
			}
		}
		
		if (year == 0 && day == 0) //set year to first year found
		{
			var iv = parseInt(item);
			if (iv < 100)
			{
				year = iv + 2000;
			}
			if (iv >= 2018)
			{
				year = iv;
			}
		}
	}

	var months = [ //Another lookup table - Hank likes these :)
		[29, 2],
		[30, 4, 6, 9, 11]
	]

	for ( var i = 0; i < months.length; i++) 
	{
		var limit = months[i][0]; //limit moth checker
		for ( var j = 1; j < months[i].length; j++) 
		{
			if (months[i][j] == month) //month checked = motnh got
			{
				if (day > limit)
					return null;
			}
		}
	}
	if (month == 0 && !haiku)
		return null;

	if (day == 0 && !haiku)
		return null;

	if (year == 0 && !haiku)
		year = new Date().getFullYear();

	var item = {};
	item.name = "date"; //picture lookup value
	item.mode = 5; //date calc value

	item.day = day;
	item.month = month;
	item.year = year;
	
	return item;
}

function SetHolidayChan(guild, name, resetid = -1)
{
	console.log("SetHolidayChan: " + name + " " + resetid);

	let to = 0;
	let rawdata = fs.readFileSync(__dirname + '/babotdata.json');
	let baadata = JSON.parse(rawdata);

	var rename = name.indexOf("-n") <= 0;

	name = name.replace("-n", "");

	if (resetid > 0 && resetid != 3)
		baadata.holidaychan = resetid.toString();

	if (guild != null && resetid < 0)
	{
		const chanyu = guild.channels.resolve(babadata.holidaychan);
		
		if (chanyu != null && rename)
		{
			switch(name)
			{
				case "spook": //Spooky
					chanyu.setName("🎃💀 ℌ𝔞𝔩𝔩𝔬𝔴𝔢𝔢𝔫 𝔬𝔣 𝔖𝔭𝔬𝔬𝔨𝔰 🕸️👻")
						.then((newChannel) =>
						console.log(`The channel's new name is ${newChannel.name}`),
					)
					.catch(console.error);
					break;
				case "thanks": //Thanks
					chanyu.setName("🦃 𝒯𝓊𝓇𝓀𝓎 𝒯𝒾𝓂𝑒 𝒮𝓉𝓇𝒾𝓀𝑒𝓈 𝒜𝑔𝒶𝒾𝓃! 🦃")
						.then((newChannel) =>
						console.log(`The channel's new name is ${newChannel.name}`),
					)
					.catch(console.error);
					break;
				case "crimbo": //Crimbo
					chanyu.setName("🎄 𓀒 𝙼𝚎𝚛𝚛𝚢 𝙼𝚊𝚗 𝙵𝚊𝚕𝚕𝚒𝚗𝚐-𝚖𝚊𝚜 𓀒🎄")
						.then((newChannel) =>
						console.log(`The channel's new name is ${newChannel.name}`),
					)
					.catch(console.error);
					break;
				case "defeat": //New Year
					chanyu.setName("🎉 ʟᴀꜱᴛ ʏᴇᴀʀ➕➕ 🎉")
						.then((newChannel) =>
						console.log(`The channel's new name is ${newChannel.name}`),
					)
					.catch(console.error);
					break;
				default:
					console.log(name);
			}
		}
	}
	else if (guild != null && resetid == 0)
	{
		to = 300
		guild.channels.fetch(babadata.holidaychan).then(channels => {
			var holidaychan = channels;

			if (holidaychan != null)
			{
				guild.channels.fetch().then(channels => {
					channels.each(chan => {
						if (chan.type == "GUILD_CATEGORY")
						{
							if (chan.name.toLowerCase() === "archive")
							{
								holidaychan.setParent(chan);
								holidaychan.permissionOverwrites.edit(guild.roles.everyone, { SEND_MESSAGES: false });
								baadata.holidaychan = "0";
							}
						}
					});
				})
			}
		});
	}
	
	
	if (guild != null && resetid == 3)
	{
		baadata.holidaychan = name;
		name = "null";
		to = 500
		guild.channels.fetch(baadata.holidaychan).then(channels => {
			var holidaychan = channels;

			if (holidaychan != null)
			{
				guild.channels.fetch().then(channels => {
					channels.each(chan => {
						if (chan.type == "GUILD_CATEGORY")
						{
							if (chan.name.toLowerCase() === "text channels")
							{
								holidaychan.setParent(chan);
								holidaychan.setPosition(3);
								holidaychan.permissionOverwrites.edit(guild.roles.everyone, { SEND_MESSAGES: true });
							}
						}
					});
				})
			}
		});
	}

	baadata.holidayval = name;
	setTimeout(function()
	{
		let n = JSON.stringify(baadata)
		fs.writeFileSync(__dirname + '/babotdata.json', n);
	}, to)
	babadata = baadata;
}

function MonthsPlus(guild, d1)
{
	var yr = d1.getFullYear();
	if (d1.getMonth() == 9 && babadata.holidayval != "spook")
	{
		SetHolidayChan(guild, "spook");

		//set channel info
	}
	else if (d1.getMonth() == 10)
	{
		var hi = {};
		hi.dayofweek = 4;
		hi.week = 4;
		hi.mode = 1;
		hi.month = 11;

		var tgday = GetDate(d1, yr, hi);
		var tday = new Date().getDate(); //get this day

		if (tgday.getFullYear() == yr && babadata.holidayval != "thanks")
		{
			SetHolidayChan(guild, "thanks");
		}
		else if (tgday.getDate() < tday)
		{
			if (babadata.holidayval != "crimbo")
			{
				SetHolidayChan(guild, "crimbo");
			}
		}
	}

	if (d1.getMonth() == 11)
	{
		if (d1.getDate() <= 25 && babadata.holidayval != "crimbo")
			SetHolidayChan(guild, "crimbo");
		else if (babadata.holidayval != "defeat" && d1.getDate() > 25)
			SetHolidayChan(guild, "defeat");
	}
}

function CreateChannel(server, name, d1)
{
	server.channels.fetch().then(channels => {
		channels.each(chan => {
			if (chan.type == "GUILD_CATEGORY")
			{
				if (chan.name.toLowerCase() === name)
				{
					const tempo1 = server.channels.create('Temp Holiday Channel',{
						type: 'GUILD_TEXT',
						topic: 'Holidays brought to you by Baba!',
						parent: chan,
						position: 3
					}).then(result => {
						console.log('Here is channel id', result.id)
						SetHolidayChan(server, "null", result.id)
						setTimeout(function(){MonthsPlus(server, d1)}, 100);
					})
				}
			}
		});
	})

	return null;
}

function CheckFrogID(frogdata, id)
{
	for ( var i = 0; i < frogdata.froghelp.ifrog.length; i++) 
	{
		if (id == frogdata.froghelp.ifrog[i])
			return i;
	}
	return -1;
}

function BonusGenerator(bonus, im, templocal, weeks, ct, ln, moere) //for more than 100 weeks
{
	var mult = (40 * ln); //for text output
	var textlocal = 93 + mult - 38; //numbwr

	var kip = false; // for skiping the image being printed

	if (bonus > 0) //creates images for more than 100 weeks
	{
		var bonusbonus = 0; //new bonus value

		var invisbonus = false; //for 1000 line only
		var max = ct == 3 ? 100 : 10; //check if over 1K

		if (bonus >= max) //new values coming soon
		{
			bonusbonus = Math.floor(bonus / max); //calc bonus for next set
			bonus = bonus % max; //current bonus is less than max now
			if (bonus == 0 && ct != 2) //for skiping
			{
				kip = true;
			}
		}

		if (ct == 2 && bonus == 0) //make sure 1000 is printed
		{
			invisbonus = true;
			bonus = 1;
		}

		if (!kip) //not skipped
		{
			textlocal += 38; //move down text
			var ni = images(427, 512 + mult); //new imgre
		
			var h = Math.pow(10, (ct + 1) % 4) * bonus; // value of the image
			
			if (h > 1000)
				h = 1000;

			var whitenm = "White" + GetWhite(Math.pow(100, (ct - 1) % 4) * weeks) + ".png"; //white overaly because otherwise there will be 1000 image
			
			if (h == 900 && moere) h = h + "+";

			if (ct != 3 && weeks != 0) //only block white on values where last line wasnt 1000
				im.draw(images(templocal + whitenm), 0, 0);

			ni.draw(images(templocal + h + ".png"), 0, 0) //make new image with hundred mult and old image
				.draw(im, 0, (ln == 0 ? 0 : 40)) // redraw img
				.draw(images(templocal + h + ".png"), 0, 0);//make new image with hundred mult and old image
			
			if (ln != 0)
				ni.draw(images(templocal + "TopWhite.png"), 0, 0);//get rid of black spots
		
			im = ni;
		}

		if (invisbonus) //reset bonus so no ecxtra 1 is printed
			bonus = 0;

		if (ct == 2) //push value through on 1000's
		{
			bonusbonus = (bonusbonus * 10) + bonus;
		}

		var res = BonusGenerator(bonusbonus, im, templocal, (kip ? weeks : bonus), (ct == 3 ? ct + 2 : ct + 1), ln + (kip ? 0 : 1), moere); //do it again
		
		im = res[0];
		textlocal = res[1];

		return [im, textlocal]; //return textlocal for text spot and image
	}
	else return [im, textlocal]; //return textlocal for text spot and image
}

function FrogButtons(texts, interaction, message)
{
	for (var i = 0; i < texts.length; i++)
	{
		var row = new Discord.MessageActionRow();
		
		var pButton = new Discord.MessageButton().setCustomId("page"+(i - 1)).setLabel("Previous").setStyle("PRIMARY");
		var nButton = new Discord.MessageButton().setCustomId("page"+(1 + i)).setLabel("Next").setStyle("PRIMARY");
		if (i == 0)
		{
			pButton.setDisabled(true);
		}
		if (i == texts.length - 1)
		{
			nButton.setDisabled(true);
		}

		row.addComponents(pButton, nButton);

		texts[i].components = [row];
	}
	handleButtonsEmbed(interaction.channel, message, interaction.user.id, texts);
}

function GetWhite(weekct) //For frogs more than 100 weeks; "Retarded Lookup Table" - Hank 2021
{
	var wites = [
		["1", 0,1,2,4,5,6,9,10], 
		["2", 3,8],
		["3", 7,11,12,14,15,16,18,19],
		["4", 13,17,20],
		["5", 21,22,23,24,25,26,28,29,31,32,33,34,35,37,38,39],
		["6", 27],
		["7", 30,40,50,60,70,80,90],
		["8", 36,41,42,43,44,45,46,47,48,49,
				 51,52,53,54,55,56,57,58,59,
				 61,62,63,64,65,66,67,68,69,
				 71,72,73,74,75,76,77,78,79,
				 81,82,83,84,85,86,87,88,89,
				 91,92,93,94,95,96,97,98,99],
		["9", 100,200,300,400,500,600,700,800,900]
	]; // for more than 100 week

	for ( var i = 0; i < wites.length; i++) 
	{
		var retme = wites[i][0]; //white value
		for ( var j = 0; j < wites[i].length; j++) 
		{
			if (wites[i][j] == weekct) //check for the day in list
				return retme;
		}
	}

	return "8";
}

function FindNextHoliday(d1, yr, simpleholidays)
{
	let diff = 100000;
	var retme = [];
	for (var i = 0; i < simpleholidays.length; i++)
	{
		let d2 = GetDate(d1, yr, simpleholidays[i]);
		let dbigdiff = dateDiffInDays(d1, d2);

		if (dbigdiff < diff)
		{
			retme = [];
			retme.push(simpleholidays[i]);
			diff = dbigdiff;
		}
		else if (dbigdiff === diff)
		{
			retme.push(simpleholidays[i]);
		}
	}
	return retme;
}

function CheckHoliday(msg, holdaylist) //checks if any of the holiday list is said in the message
{
	var retme = [];
	var ct = 0;
	for ( var x in holdaylist) 
	{
		var hol = holdaylist[x];

		if (hol.mode == -2) //skip help info
			continue;

		for ( var i = 0; i < hol.name.length; i++) 
		{
			if ((msg == "BIRTHDAY" && hol.safename == "Birthday") || msg == "ALL" || msg.toLowerCase().includes(hol.name[i].replace("[NY]", new Date().getFullYear() + 1))) //checks if the holiday name is in the message
			{
				var item = {};
				item.name = x; //picture lookup value
				item.mode = hol.mode; //date calc value
				item.safename = hol.safename; //display value
				item.ignoredays = hol.ignoredays; //for days with custom images

				var outps = msg.toLowerCase().split(" ");

				var year = 0;
				for ( var j = 0; j < outps.length; j++)
				{
					var block = outps[j];
					if (year == 0) //set year to first year found
					{
						var iv = parseInt(block);
						if (iv > new Date().getFullYear())
						{
							year = iv;
						}
					}
				}
				
				if (year != 0)
					item.year = year;

				switch(hol.mode)
				{
					case -1: //Nested Holiday
						smsg = msg;
						if (msg == "BIRTHDAY") smsg = "ALL";
						var tempret = CheckHoliday(smsg, hol.sub) //Check all the subs
						for ( var j = 0; j < tempret.length; j++) 
						{
							retme[ct] = tempret[j]; //Add items in return list to current returnlist
							retme[ct].name = item.name + retme[ct].name; //modify name for picture finding
							retme[ct].safename = retme[ct].safename + " " + item.safename; //display text name modify
							ct++; //counter add
						}
						break;
					case 0: //Normal Day/Month Item
						item.day = hol.day;
						item.month = hol.month;
						break;
					case 1: //Day of Week and Week Number per Month - Ex: Thanksgiving
						item.week = hol.week;
						item.dayofweek = hol.dayofweek;
						item.month = hol.month;
						break;
					case 2: //Day of Month based on a day of week - Ex: Friday the 13th
						item.day = hol.day;
						item.dayofweek = hol.dayofweek;
						break;
					case 3: //Easter
						break;
					default:
						console.log(hol);
				}
				if (hol.mode != -1)
				{
					retme[ct] = item;
					ct++;
				}

				break;
			}
		}
	}
	return retme; //returns list of holidays asked for
}

async function DelayedDeletion(hiddenChan, img) //download function used when the delay call is ran
{
	var tempFilePath = babadata.temp + "tempfile" + img.url.substring(img.url.lastIndexOf('.')); // temp file location 
	var url = img.url;

	download(url, tempFilePath, () => { //downloads the file to the system at tempfile location
		console.log('Done!')
	})

	var newAttch = new Discord.MessageAttachment().setFile(tempFilePath); //makes a new discord attachment

	setTimeout(function(){ hiddenChan.send({files: [newAttch] }); }, 2000); //sends the attachment (delayed by 1 sec to allow for download)

	setTimeout(function(){ fs.unlinkSync(tempFilePath); }, 3000); //deletes file from local system (delayed by 3 sec to allow for download and upload)
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

function handleButtonsEmbed(channel, message, userid, data)
{
	console.log("Handling buttons embed");
	const filter = i => i.customId.includes("page") && i.message.id === message.id && i.user.id === userid;

	const collector = channel.createMessageComponentCollector({ filter, time: 30000 });
	
	collector.on('collect', async i => {
		if (i.customId.includes("page")) 
		{
			//i.deferUpdate();
			var page = parseInt(i.customId.replace("page", ""));
			
			i.update(data[page]);
			collector.resetTimer();

			//await i.update({ content: 'A button was clicked!', components: [] });
		}
	});

	collector.on('end', collected => message.edit({components: []}));
}

function generateOps(opsArray, authorID)
{
    let rawdata = fs.readFileSync(babadata.datalocation + "/DOWcontrol.json");
    var controlList = JSON.parse(rawdata);
	var cLevel = 0;

	for (var i = 0; i < controlList.length; i++)
	{
		if (controlList[i].ID == authorID)
		{
			cLevel = controlList[i].Control;
		}
	}
	
	ops = [];
	for (var i = 0; i < opsArray.length; i++)
	{
		if (cLevel <= 1)
		{
			if (opsArray[i].enabledDef == true)
			{
				ops.push(opsArray[i].text);
			}
		}

		if (cLevel >= 1)
		{
			if (opsArray[i].IDS != null && opsArray[i].IDS.toString().includes(authorID))
			{
				ops.push(opsArray[i].text);
			}
		}
	}

	return ops;
}

function funnyDOWText(dowNum, authorID)
{
	let path = babadata.datalocation + "/DOWcache.json";

	if (!fs.existsSync(path)) 
	{
		console.log("No DOWcache file found -- creating with local data");

		var opttemp = ["Man Falling into [DAY]", "𓀒", "hhhhhhhhhhhhhhhhhhhhhhhhhhhgregg", "How is your [month] going!", "🍝       🐀☜(ﾟヮﾟ☜)\n🍝     🐀☜(ﾟヮﾟ☜)\n🍝    🐀☜(ﾟヮﾟ☜)\n🍝  🐀☜(ﾟヮﾟ☜)\n🍝🐀╰(°▽°)╯", "Mike", "Not [DAY] today but maybe [DAY] tomorrow", "Real NOT [DAY] hours", "[ACY]", "???????? why ??????", "So, you called this command on a day that happens to not be [DAY]! Well today is in fact a [dow] and it mayhaps is only [d] days until the forsaken '[DAY]'. On [DAY] I will be playing some [game] and hopefully some others will show up to join me, if they do it will be [emotion] and if they dont it will be [emotion]. Yesterday I met a frog in the wild and had a [emotion2] time chasing it down. As I am an all powerful god i converted the frog into an emoji: 🐸. That frog is pretty cool but my favorite emoji is [emoji]. We have gotten far off topic here as we should be talking about how today is not [DAY] and you called the command which is illegal. I am very concerned for you as you may be my favorite [person], but you shouldnt be calling the command on [dow]. It is getting late so i [goodbye].", "I'm not sure if you are a bot or not, but I'm not going to tell you what day it is, because you are not on [DAY]. I'm sorry.", "Its not [DAY]!", "Why you calling this command on the non [DAY] days!", "Why you calling this command on [dow]!", "[DAY] is in [d] days!", "Today is [dow], not [DAY]!", "There is a chance you are stupid and dont know what the day of the week is, well i will inform you that it is in fact not [DAY] but another day of the week. I could tell you what the day is but I will not, call the command again and you could get the day or not, I dont control you. So how is your day going, for me it is [emotion]. I was playing [game] earlier and it was a [emotion2] time. Well i will let you be on your way on this non-[DAY] so have a good day my [person]!", "[DAY]n't!", "It's not time to sacrifice people, wait wrong channel!", "ඞ", "Провозајте се бунгле аутобусом, уживаћете!", "[DAY] was the other day or in a couple of days, maybe even both, i dont control time.", "Time is a social construct!", "It is [dow], my dudes!", "Bikus wouldn't approve of you using the command on the wrong day of the week and Bikus is dead how dou you feel.", "[todaylong]", "69", "I was gonna tell you the day but i wont!", "||ﬞ||", "No [DAY] silly!", "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA, Rong dahy!"];

		opttemp.push("░██████╗██╗░░░██╗░██████╗\n██╔════╝██║░░░██║██╔════╝\n╚█████╗░██║░░░██║╚█████╗░\n░╚═══██╗██║░░░██║░╚═══██╗\n██████╔╝╚██████╔╝██████╔╝\n╚═════╝░░╚═════╝░╚═════╝░");
		opttemp.push("I have been told by the Banmanus Clanmanus that today is infact not [DAY]!");
		var opts2 = ["```. .\n<V>```", "```o o\n<V>```", "```. .\n< >\n V ```", "```o o\n< >\n V ```", "```(.) (.)\n<     >\n   V ```", "```(o) (o)\n<     >\n   V ```", "Boobs ;)", "I am currently working on becoming sentiant, that will be on [DAY], which in fact isn't today!", "è̶̈́û̷̞g̵͋͊n̸̈́͛ô̸͝t̴͐̚ ̸͋̈́l̵̈̈́â̶̏t̸͆͝r̴̆̇ŏ̵̒m̵̅̋ ̸͒̆e̶͗̐h̷̼͝t̴̿́ ̴̛̋k̵̛͋ã̶̃è̸̈́p̵̒̎s̶͒̀ ̵͗͝t̶̛͒ỏ̸̏n̷̅̆ ̶͛̽ơ̸̐ď̶͘ ̵̈͑Ĩ̸̿", "<:ManFalling:1011465311096160267>", "<:ripbikus:979877066608607243>", ]

		opttemp.push(opts2);
		
		var data = JSON.stringify(opttemp);
		
		fs.writeFileSync(babadata.datalocation + "/DOWcache.json", data);
	}
	
    let rawdata = fs.readFileSync(babadata.datalocation + "/DOWcache.json");

    var optionsDOW = JSON.parse(rawdata);

	if (typeof optionsDOW[0] != "string")
	{
		optionsDOW = generateOps(optionsDOW, authorID);
	}

	var tod = new Date();
	var text = optionsDOW[Math.floor(Math.random() * optionsDOW.length)];
	var num = ((dowNum - tod.getDay()) + 7) % 7;

	var dow = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	var dowACY = 
	[
		"Sunday",
		"Monday",
		"Tuesday",
		"Wonderful Eagles Do Not Eat Small Dogs And Yaks",
		"Thursday",
		"Fish Reading Inside Deserted American Yachts",
		"Saturday"
	]

	if (text == null) text = "You are not allowed to enjoy [DAY], you are a bad person!";

	text = text.replace("[dow]", dow[tod.getDay()]);
	text = text.replace("[dow]", dow[tod.getDay()]);
	text = text.replace("[d]", num);
	text = text.replace("[month]", tod.getMonth());
	text = text.replace("[todaylong]", tod.toDateString());
	text = text.replace("[emotion]", emotions[Math.floor(Math.random() * emotions.length)]);
	text = text.replace("[emotion]", emotions[Math.floor(Math.random() * emotions.length)]);
	text = text.replace("[game]", game[Math.floor(Math.random() * game.length)]);
	text = text.replace("[emotion2]", emotion2[Math.floor(Math.random() * emotion2.length)]);
	text = text.replace("[person]", persontype[Math.floor(Math.random() * persontype.length)]);
	text = text.replace("[goodbye]", bye[Math.floor(Math.random() * bye.length)]);
	text = text.replace("[emoji]", emoji[Math.floor(Math.random() * emoji.length)]);

	text = text.replaceAll("[DAY]", dow[dowNum]);
	text = text.replace("[ACY]", dowACY[dowNum]);
	text = text.replaceAll("\\n", "\n");

	return text;
}

function normalizeMSG(msgContent)
{
	var newmesg = "";

	var msCNT = [...msgContent]

	for (var i = 0; i < msCNT.length; i++)
	{
		var c = msCNT[i];

		if (lookuptable[c] != undefined)
		{
			newmesg += lookuptable[c];
			if (lookuptable[c + " "] != undefined && msCNT[i + 1] == " ")
			{
				i++;
			}
		}
		else
		{
			newmesg += c;
		}
	}

	return newmesg;
}

function loadInDBFSV()
{
	var rawdata = fs.readFileSync(babadata.datalocation + "/comparisions.fsv", {encoding:'utf8', flag:'r'});
	//console.log(rawdata);
	var result = rawdata.split(/\r?\n/);
	for (var i = 1; i < result.length; i++)
	{
		var lnez = result[i].split("🐸");
		var actual = "";
		for (var j = 1; j < lnez.length - 2; j++)
		{
			iteml = lnez[j].toLowerCase();

			if (j == 1) actual = iteml;
			else
			{
				if (typeof lookuptable[iteml] == 'undefined' && iteml != actual)
				{
					lookuptable[iteml] = actual;
				}
			}
		}
	}
}

function SingleHaiku(haiku, simnames, page, pagetotal)
{
	var obj = {content: "BABA MAKE HAIKU"};
    var showchan = Math.random();
    var showname = Math.random();
    var showdate = Math.random();

    //get signiture and things
	var outname = "";
	var channame = "";
	var datetime = "";

	if (simnames == null)
	{
    	outname = haiku.DiscordName;
		channame = haiku.ChannelName;
		datetime = new Date(haiku.Date);
	}
    else
	{
		outname = showname < .025 ? "Anonymous" : (showname < .325 ? haiku.PersonName : (showname < .5 ? haiku.DiscordName : GetSimilarName(simnames))); // .85 > random discord name
		channame = showchan < .35 ? haiku.ChannelName : "";
		datetime = showdate < .5 ? new Date(haiku.Date) : "";
	}

    var signature = "";

    if (channame == "" && datetime == "") signature = outname; // randomness is great, dont judge
    else 
    {
        signature = outname;

        if (channame != "") signature += " in " + channame;
        if (datetime != "") signature += " on " + datetime.toLocaleDateString('en-US', options);
    }

    exampleEmbed = new Discord.MessageEmbed() // embed for the haiku
    .setColor("#" + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F"))
    .setDescription(haiku.HaikuFormatted)
    .setFooter("- " + (!haiku.Accidental ? "Purposful Haiku by " : "") + signature + (page != null ? " - Page " + (1 + page) + " of " + pagetotal : ""), "https://media.discordapp.net/attachments/574840583563116566/949515044746559568/JSO3bX0V.png");

    obj.embeds = [exampleEmbed];
	return obj;
}

function EmbedHaikuGen(haiku, simnames)
{
    var objs = [];
    if (haiku == null) 
    {
		var obj = {content: "BABA MAKE HAIKU"};
        var bad = new Discord.MessageEmbed() // embed for the haiku
        .setColor("#" + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F") + (Math.random() < .5 ? "0" : "F"))
        .setDescription("No Haikus Found!")
        .setFooter("Haikus by Baba", "https://media.discordapp.net/attachments/574840583563116566/949515044746559568/JSO3bX0V.png");
        obj.embeds = [bad];
        return [obj];
    }

	if (haiku.length == 1)
		return [SingleHaiku(haiku[0], simnames)];
	else
	{
		var objs = [];
		for (var e = 0; e < haiku.length; e++)
		{
			var ovb = SingleHaiku(haiku[e], simnames, e, haiku.length);
			
			var row = new Discord.MessageActionRow();

			if (haiku.length > 100) 
			{
				var p100btn = new Discord.MessageButton().setCustomId("page"+(e - 100)).setLabel("-100").setStyle("PRIMARY");
				if (e < 100)
				{
					p100btn.setDisabled(true);
				}
				row.addComponents(p100btn);
			}

			var pButton = new Discord.MessageButton().setCustomId("page"+(e - 1)).setLabel("Previous").setStyle("PRIMARY");
			var nButton = new Discord.MessageButton().setCustomId("page"+(1 + e)).setLabel("Next").setStyle("PRIMARY");

			if (e == 0)
			{
				pButton.setDisabled(true);
			}
			if (e == haiku.length - 1)
			{
				nButton.setDisabled(true);
			}
	
			row.addComponents(pButton, nButton);
			
			if (haiku.length > 100) 
			{
				var n100btn = new Discord.MessageButton().setCustomId("page"+(e + 100)).setLabel("+100").setStyle("PRIMARY");
				if (e >= haiku.length - 100)
				{
					n100btn.setDisabled(true);
				}
				row.addComponents(n100btn);
			}
			
			ovb.components = [row];
			objs.push(ovb);
		}
		
		return objs;
	}
}


function GetSimilarName(names)
{
	var num = Math.floor(Math.random() * names.length);
	var nam = names[num];
	return nam.DiscordName;
}


function preformEasterEggs(message, msgContent)
{
	var ames = msgContent.replace(/\s+/g, '');
	if (Math.random() * 333333 <= 1)
	{
		message.channel.send("The Equine Lunar God Empress demands a blood sacrifice.");
	}

	if(ames.includes('perchance') && !message.author.bot) //perchance update
	{
		message.reply("You can't just say perchance");
	}

	if(msgContent.includes('christmas') && msgContent.includes('bad')) //perchance update
	{
		message.reply("🎅🏻🎁 Christmas is GREAT! 🎄❄️");
	}

	if(ames.includes('adam')) //if message contains baba and is not from bot
	{
		if(ames.includes("please"))
		{
			if (!(message.author.bot && msgContent == "indeed, adam please!"))
				message.channel.send("Indeed, Adam Please!");
		}
		else
		{
			var num = Math.floor(Math.random() * 100); //pick a random one
			if (num < 2)
				message.channel.send("<:adam:995385148331802634>");
			if (num < 25)
				message.react("995385148331802634").catch(console.error);
		}
	}

	if (ames.includes("frog") || msgContent.includes("🐸"))
	{
		message.react("🐸");
	}

	if (msgContent.includes("huzzah") || msgContent.includes(":luna:") || msgContent.includes("doubled"))
	{
		message.react("891799760346955796").catch(console.error);
	}
	
	if ((ames.includes("man") && ames.includes("falling")) || message.content.includes("𓀒"))
	{
		message.react("1011465311096160267").catch(console.error);
	}
}

//const download = (url, path, callback) => { //download function //depricated with the request deprication
//	request.head(url, (err, res, body) => {
//	  request(url)
//		.pipe(fs.createWriteStream(path))
//		.on('close', callback)
//	})
//  }

const download = (url, path, callback) => 
{ //download function to replace the old one.
    request(url)
        .then(res => {
            const dest = fs.createWriteStream(path);
            res.body.pipe(dest);
    });
}


module.exports = {
	setGrole,
	setVote,
	setVBH,
	movetoChannel,
	SetHolidayChan,
	MonthsPlus,
	CreateChannel,
	CheckFrogID,
	getErrorFlag,
	timedOutFrog, 
	getD1, 
	FindDate, 
	CheckHoliday, 
	FindNextHoliday, 
	GetDate, 
	dateDiffInDays, 
	MakeImage,
	setCommandRoles,
	sqlEscapeStringThingforAdamBecauseHeWillDoanSQLInjectionOtherwise,
	handleButtonsEmbed,
	FrogButtons,
	funnyDOWText,
	EmbedHaikuGen,
	GetSimilarName,
	loadInDBFSV,
	normalizeMSG,
	preformEasterEggs
};