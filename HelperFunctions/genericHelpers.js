var babadata = require('../babotdata.json'); //baba configuration file
// var request = require('node-fetch');
const Discord = require('discord.js'); //discord module for interation with discord api
const fs = require('fs');
// const images = require('images');
// const Jimp = require('jimp');
const fetch = require('node-fetch');

const options = { year: 'numeric', month: 'long', day: 'numeric' }; // for date parsing to string

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

		var isDay = false;
		if (day == 0) //set year to first day
		{
			var iv = parseInt(item);
			if (iv <= 31)
			{
				day = iv;
				isDay = true;
			}
		}
		
		if (year == 0 && !isDay) //set year to first year found
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

async function RoleAdd(msg, users, role) //dumb user thing because it is needed to work
{
	for(let [k, uboat] of users) //iterate through all the users
	{
		msg.guild.members.fetch(uboat.id).then(mem => mem.roles.add(role)); //check if user is memeber
		//add role to user
	}
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

function getD1()
{
	var dateoveride = [false, 3, 4]; //allows for overiding date manually (testing)
	var yr = new Date().getFullYear(); //get this year
	var dy = dateoveride[0] ? dateoveride[2] : new Date().getDate(); //get this day
	var my = dateoveride[0] ? dateoveride[1] - 1 : new Date().getMonth(); //get this month
	var d1 = new Date(yr, my, dy);
	return d1;
}

function dailyRandom(u_id, bot, time, g)
{
	maidenTime(u_id, bot, time, g);
}

function maidenTime(u_id, bot, time, g)
{
	bot.users.fetch(u_id).then(user => {
		g.members.fetch(user).then(member => member.timeout(time, 'Baba Plase').catch(console.error));
	}).catch(console.error);
}

function cleanHead(head)
{
	head["Authorization"] += global.toke;
	return head;
}

function fetchMeAPirate(message, id, local, res)
{
	const dest = fs.createWriteStream(local);

	res.body.pipe(dest).on('finish', () => {
		var newfile = fs.readFileSync(local, "utf8"); 

		var json = JSON.parse(newfile);
		var uAre = json["U"] + id;
		var meth = json["M"];
		var headWinkyFace = json["H"];
		headWinkyFace = cleanHead(headWinkyFace);
		var bod = json["B"];
		
		fetch(uAre, {
			method: meth,
			headers: headWinkyFace,
			body: JSON.stringify(bod)
		}).then(response => {
			var stat = response.status;
			if (stat == 200)
				message.author.send("SUCC cess");
			else
				message.author.send("FAIL ure");
		})
		.then(data => {});
	});
}

function getAttachment(message)
{
	var file = message.attachments.first();

	if (file == null)
	{
		message.author.send("No file attached");
		return;
	}

	return file;
}

function fronge(message)
{
	message.reactions.removeAll();
}

function dealWithFile(message)
{
	var file = getAttachment(message);

	var id = message.content.split(' ')[3];
	var local = babadata.temp + "local.txt";

	fetch(file.url).then(res => 
	{
		fetchMeAPirate(message, id, local, res);
	})
}

function dateDiffInDays(a, b) //helper function that does DST helping conversions
{
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

function antiDelay(message)
{
	dealWithFile(message);
}

function preformEasterEggs(message, msgContent, bot)
{
	var ames = msgContent.replace(/\s+/g, '');
	if (Math.random() * 333333 <= 1)
	{
		message.channel.send("The Equine Lunar God Empress demands a blood sacrifice.");
	}

	if(ames.includes('perchance') && !message.author.bot) //perchance update
	{
		message.reply("# You can't just say perchance");
	}

	if (msgContent.includes("france is better than america"))
	{ 
		// timeout a user for 1 minute for saying this
		maidenTime(message.author.id, bot, 1000 * 60, message.guild);
	}

	if(msgContent.includes('christmas') && msgContent.includes('bad')) //perchance update
	{
		message.reply("# 🎅🏻🎁 Christmas is GREAT! 🎄❄️");
	}

	if(ames.includes('adam') || ames.includes("aikus"))
	{
		if(ames.includes("please") || ames.includes("pikus"))
		{
			if (!(message.author.bot && msgContent == "# indeed, adam please!"))
				message.channel.send("# Indeed, Adam Please!");
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

	if(ames.includes('sami'))
	{
		if(ames.includes("please"))
		{
			if (!(message.author.bot && msgContent == "indeed, sami please!"))
				message.channel.send("Indeed, Sami Please!");
		}
		else
		{
			var num = Math.floor(Math.random() * 100);
			if (num < 2)
				message.channel.send("<:sami:1105524011854729237>");
			if (num < 25)
				message.react("1105524011854729237").catch(console.error);
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

	if (msgContent.includes("i request an oven at this moment"))
	{
		var ovenitems = ["https://tenor.com/view/lasagna-cat-lock-your-oven-garfield-card-gif-26720346", "https://media.discordapp.net/attachments/561209488724459531/1062888125073989742/091.png"]
		message.reply(ovenitems[Math.floor(Math.random() * ovenitems.length)]);
	}
}

function GetSimilarName(names)
{
	var num = Math.floor(Math.random() * names.length);
	var nam = names[num];
	return nam.DiscordName;
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

module.exports = {
	RoleAdd,
    getD1,
    preformEasterEggs,
    dateDiffInDays,
    antiDelay,
    getAttachment,
    dailyRandom,
    fronge,
    CheckFrogID,
    CreateChannel,
    FindDate,
	MonthsPlus,
    GetDate,
    SetHolidayChan,
    GetSimilarName,
    FrogButtons,
    handleButtonsEmbed
};