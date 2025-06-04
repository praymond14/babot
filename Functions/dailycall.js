var babadata = require('../babotdata.json'); //baba configuration file

const fs = require('fs');

const Discord = require('discord.js'); //discord module for interation with discord api

const { loadInDBFSV } = require('./HelperFunctions/dbHelpers.js');
const { SetHolidayChan, CreateChannel, MonthsPlus } = require('./HelperFunctions/basicHelpers.js');
const { FindNextHoliday, CheckHoliday } = require('./HelperFunctions/commandHelpers.js');
const { ObtainDBHolidays } = require('./Database/databaseandvoice');
const { LoadAllTheCache, SaveSlashFridayJson } = require('./Database/databaseVoiceController');
const { resetRNG } = require('./HelperFunctions/slashFridayHelpers.js');
const { DailyReminderCall, StartTheReminders } = require('./HelperFunctions/remindersByBaba.js');
const { getD1 } = require('../Tools/overrides.js');

var to = null;
var toWed = null;
var toTyp = null;

global.BirthdayToday = null;

function dailyCallStart(bot, dirName)
{
	loadInDBFSV();
	bot.guilds.fetch(babadata.guildId).then(guild =>
	{
		dailyCall(bot, guild, dirName);
	});
}

async function DisplayBirthdays(guild)
{
	if ((global.dbAccess[1] && global.dbAccess[0]))
	{
		var holidays = ObtainDBHolidays();
		
		let d1 = getD1(); //get today
		var yr = d1.getFullYear();
		var hols = FindNextHoliday(d1, yr, CheckHoliday("BIRTHDAY", holidays));
		global.BirthdayToday = null;

		var generalChan = guild.channels.fetch(babadata.generalchan).then(channel => {
			if (hols.length > 0)
			{
				var names = [];
				for (var i = 0; i < hols.length; i++)
				{
					if (hols[i].day == d1.getDate() && hols[i].month == d1.getMonth() + 1)
					{
						names.push(hols[i]["safename"]);
					}
				}
				if (names.length > 0)
				{
					global.BirthdayToday = names;
					channel.sendTyping();
					console.log("Celebrating: " + names.join(" and "))
					channel.send("!baba wednesday " + names.join(" and "));
				}
			}
		})
		.catch(console.error);
	}
}

function BabaTyping(guild, now)
{
	var eightAM = getD1();
	eightAM.setHours(8);

	var tenPM = getD1();
	tenPM.setHours(23);

	var timeToEightAM = Math.max(eightAM.getTime() - now.getTime(), 0);
	var timeToTenPM = Math.max(tenPM.getTime() - now.getTime(), 0);

	var rndTime = Math.floor(Math.random() * (timeToTenPM - timeToEightAM)) + timeToEightAM;

	toTyp = setTimeout(function()
	{
		var generalChan = guild.channels.fetch(babadata.generalchan).then(channel => {
			channel.sendTyping();
		})
		.catch(console.error);
		toTyp = null;
	}, rndTime);
}

function genMessages(itemlist)
{
	var msgall = [];
	for (var i = 0; i < itemlist.length; i++)
	{
		for (var j = 0; j < itemlist[i]["Occurances"]; j++)
		{
			msgall.push(itemlist[i]["Name"]);
		}
	}
	return msgall;
}

function generateItems(dow)
{
	let path = babadata.datalocation + "DOWitems.json";

	if (!fs.existsSync(path)) 
	{
		console.log("No DOWitems file found -- using default");

		var defaultItems = {};
		defaultItems[dow] = { "Items" : [ { "Name" : "Baba is Pleased", "Occurances" : 1 } ], "Probaility" : 1, "Start" : "00:00:00", "End" : "23:59:59" };
		return defaultItems;
	}

    let rawdata = fs.readFileSync(babadata.datalocation + "DOWitems.json");

    var adam = JSON.parse(rawdata);
	return adam;
}

function todayDay(dow, guild, now)
{
	var adam = generateItems(dow);
	var todayAdam = adam[dow];
	var rngchance = Math.random();
	console.log("RNG Chance is " + rngchance + " and the threshold is " + todayAdam["Probaility"]);
	if (rngchance < todayAdam["Probaility"])
	{
		console.log("Adam is happy today"); // copilot why?
		console.log("RNG Message Call ran for " + todayAdam["Items"][0]["Name"] + " with a " + (todayAdam["Probaility"] * 100) + "% chance");

		var msgs = genMessages(todayAdam["Items"]);

		var startDate = todayAdam["Start"];
		var endDate = todayAdam["End"];
		var start = new Date("1970-01-01T" + startDate);
		var end = new Date("1970-01-01T" + endDate);

		guild.channels.fetch()
		.then(channels => 
		{
			console.log(`There are ${channels.size} channels.`)
			bannedCats = ["955141276574035988", "955251220057047110", "587298042068074526"]; // categories to not post in
			bannedKittens = ["826320007675641876", "917516043583361034", "1064319655872827432", "882681066127777792", "1072288299361763378"]; // channels to not post in			
			coolCats = ["1203559278393430076", "915351407287222403", "979881683790733333", "1069025445162524792", "1072635694167634032", ]; // allowed channels, add exceptions manually
			
			for (let currenter of channels) 
			{
				if (currenter[1] != null && currenter[1].type == 0 && !bannedKittens.includes(currenter[1].id))
				{
					if (!bannedCats.includes(currenter[1].parentId))
						coolCats.push(currenter[1]);
				}

				// if currenter[1].id in coolCats as id replace with currenter[1]
				if (coolCats.includes(currenter[1].id))
				{
					coolCats[coolCats.indexOf(currenter[1].id)] = currenter[1];
				}
			}
			
			var coolestCat = coolCats[Math.floor(Math.random() * coolCats.length)];
			
			var eightAM = getD1();
			eightAM.setHours(start.getHours());
			eightAM.setMinutes(start.getMinutes());
			eightAM.setSeconds(start.getSeconds());
			eightAM.setMilliseconds(start.getMilliseconds());

			var tenPM = getD1();
			tenPM.setHours(end.getHours());
			tenPM.setMinutes(end.getMinutes());
			tenPM.setSeconds(end.getSeconds());
			tenPM.setMilliseconds(end.getMilliseconds());

			var timeToEightAM = Math.max(eightAM.getTime() - now.getTime(), 0);
			var timeToTenPM = Math.max(tenPM.getTime() - now.getTime(), 0);

			var rndTime = Math.floor(Math.random() * (timeToTenPM - timeToEightAM)) + timeToEightAM;
			console.log("Sending to " + coolestCat.name + " at " + new Date(now.getTime() + rndTime).toTimeString());

			var msg = msgs[Math.floor(Math.random() * msgs.length)];

			toWed = setTimeout(function()
			{
				// if coolestCat is a string, fetch the thread by searching all the channels for the thread with the id of coolestCat
				if (typeof coolestCat === 'string' || coolestCat instanceof String)
				{
					foundme = false;
					for (let currenter of channels) 
					{
						if (currenter[1].type == 0 && !foundme)
						{
							currenter[1].threads.fetch().then(threads =>
							{
								threads.threads.forEach(thread => 
								{
									if (thread.id == coolestCat)
									{
										thread.send(msg);
										foundme = true;
									}
								});
							});
							
							if (!foundme)
							{
								currenter[1].threads.fetchArchived().then(threads =>
								{
									threads.threads.forEach(thread => 
									{
										if (thread.id == coolestCat)
										{
											thread.send(msg);
										}
									});
								});
							}
						}

						if (foundme)
						{
							break;
						}
					}
				}
				else
				{
					coolestCat.send(msg);
				}
				toWed = null;
			}, rndTime);
		})
		.catch(console.error);
	}
}


async function dailyCall(bot, guild, sourceDir)
{
	resetRNG();
	global.DailyErrors = 0;
	let rawdataBB = fs.readFileSync(sourceDir + '/babotdata.json');
	babadata = JSON.parse(rawdataBB);

	var now = getD1(true, true) //todayish
	var nowAtMidnight = getD1(false, true); //todayish at midnight
	var d1Sim = getD1() //todayish

	console.log("Daily Call Running: " + now.toDateString());

	// Set holiday channel if it is a holiday
	let rawdata = fs.readFileSync(babadata.datalocation + "FrogHolidays/" + 'frogholidays.json'); //load file each time of calling wednesday
	let frogdata = JSON.parse(rawdata);
	var g = bot.guilds.resolve(frogdata.froghelp.mainfrog);
	holidayDaily(nowAtMidnight, g);

	DailyReminderCall();
	
	if (nowAtMidnight.getTime() != d1Sim.getTime())
		console.log("Simulating: " + d1Sim.toDateString() + " in the Program");

	if ((global.dbAccess[1] && global.dbAccess[0]))
	{
		await LoadAllTheCache().catch(() => {console.log("Error loading cache")});
	}
	
	await StartTheReminders().catch(() => {console.log("Error loading reminders")});

	// daily birthday informer
	DisplayBirthdays(guild);

	// Baba typing funny robot things
	global.ResetDaily = true;
	BabaTyping(guild, now);

	// Friday
	if (nowAtMidnight.getDay() == 5)
		console.log("FRIDAY!");
	
	// send the it is wednesday message/any other day messages
	todayDay(now.getDay(), guild, now);

	// save slash friday json info
	SaveSlashFridayJson();

	var midnight = getD1(false, true);
    midnight.setHours(24);
    midnight.setMinutes(0);
    midnight.setSeconds(20);
    midnight.setMilliseconds(0);
	var timeToMidnight = midnight.getTime() - now.getTime();

	console.log("Calling next command in: " + timeToMidnight / 1000 / 60 + " minutes");
	to = setTimeout(function()
	{
		dailyCall(bot, guild, sourceDir);
	}, timeToMidnight);
}


function holidayDaily(d1, server)
{
	if (d1.getMonth() < 9)
	{
		if (babadata.holidayval != "defeat" && d1.getMonth() == 0 && d1.getDate() == 1 && babadata.holidayval != "null")
		{
			SetHolidayChan(server, "defeat");
		}
	}
	else if (d1.getMonth() >= 9)
	{
		if (babadata.holidaychan == 0)
		{
			CreateChannel(server, "text channels", d1);
		}
		MonthsPlus(server, d1);
	}
}


var cleanupFn = function cleanup() 
{
	console.log("Ending Daily Call Timer");
	if (to != null)  
		clearTimeout(to);
	if (toWed != null)  
		clearTimeout(toWed);
	if (toTyp != null)
		clearTimeout(toTyp);
}

global.DailyCallCleanup = cleanupFn;

process.on('SIGINT', cleanupFn);
process.on('SIGTERM', cleanupFn);

module.exports = {
    dailyCallStart
};