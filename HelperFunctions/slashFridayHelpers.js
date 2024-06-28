var babadata = require('../babotdata.json'); //baba configuration file
// var request = require('node-fetch');
// const Discord = require('discord.js'); //discord module for interation with discord api
const fs = require('fs');
const { NameFromUserIDID } = require('../databaseandvoice');
// const images = require('images');
// const Jimp = require('jimp');
// const fetch = require('node-fetch');

// const options = { year: 'numeric', month: 'long', day: 'numeric' }; // for date parsing to string

// const emotions = ["splendid", "exciting", "sad", "boring", "fun", "exquisite", "happy", "pretty eventful", "slow to start but it picked up later in the day", "not so good", "very good", "legal", "spungungulsumplus", "fish"];
// const persontype = ["madam", "friend", "enemy", "brother", "brother man", "BROTHERRRRRR", "bungle bus", "uncle", "second cousin twice removed", "uncles dogs sisters boyfriends moms second cousins cat", "leg", "adam"];
// const game = ["TF2", "Ultimate Admiral: Dreadnoughts", "Fishing Simulator", "Sea of Thieves", "Factorio", "Forza Horizon 5", "nothing", "Fallout: New Vegas", "Stabbing Simulator (IRL)"];
// const emotion2 = ["fun", "exciting", "monotonous", "speed run", "pretty eventful", "frog", "emotional", "devoid of all emotions", "mike"];
// const bye = ["bid you a morrow", "will see you soon", "want to eat your soul, so watch out", "am going to leave now", "hate everything, goodbye", "am monke, heee heee hoo hoo", "wish you good luck on your adventures", "am going to go to bed now", "want to sleep but enevitably will not get any as i will be gaming all night, good morrow", "am going to go to the morrow lands", "will sleep now", "am pleased to sleep"];
// const emoji = ["ඞ", "🐸", "🍆", "💄", "⛧", "🎄", "🐷", "🐎", "🐴", "🐍", "⚡", "🪙", "🖕", "🚊", "🏻🏻", "🤔", "🌳", "🌲", "🌴", "🌵", "🐀", "🍝", "𓀒"];

// const localesz = ["in class", "in bed", "at Adam's House", "in the car driving to [l2]", "waiting for the bus", "playing slots", "doing cocaine", "in the bathroom", "in the shower", "in your walls ;),"];
// const l2 = ["the store", "New York", "Adam's House", "nowhere", "school", "a bacon festival", "somewhere under the sea"]

async function funnyDOWText(dowNum, authorID, recrused = 0, ToBeCounted = [], headLevel = 0)
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
		optionsDOW = generateOps(optionsDOW, authorID, "DOW");
	}

	var tod = new Date();
	var pretext = optionsDOW[Math.floor(Math.random() * optionsDOW.length)];

	var textos = [];
	for (var i = 0; i < 12; i++)
		textos.push(pretext.text);

	if (recrused == 0)
	{
		if (pretext.h1)
		{
			for (var i = 0; i < 1; i++)
				textos.push("# " + pretext.text);
		}
	
		if (pretext.h2)
		{
			for (var i = 0; i < 2; i++)
				textos.push("## " + pretext.text);
		}
	
		if (pretext.h3)
		{
			for (var i = 0; i < 4; i++)
				textos.push("### " + pretext.text);
		}
	}

	var text = textos[Math.floor(Math.random() * textos.length)];

	text = "{repeat:{brepeat:[INTSmall]:[Num]}:H}hgregg!"

	text = repeatCheck(text, "b");

	// set headLevel to number of # at start of text
	if (text.startsWith("#") && recrused == 0)
	{
		headLevel = 4 - text.match(/#/g).length;
	}

	var TBDItem = { "UID": pretext.UID, "LayerDeep": recrused, "Group": 0, "Text": pretext.text, "HeadLevel": headLevel, "Sender": authorID};
	ToBeCounted.push(TBDItem);

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

	prevActualDOW = new Date(tod.getFullYear(), tod.getMonth(), tod.getDate() - (7 - num));
	nextActualDOW = new Date(tod.getFullYear(), tod.getMonth(), tod.getDate() + num);

	if (text == null) text = "You are not allowed to enjoy [DAY], you are a bad person!";

	var todOnlyDate = new Date(tod.getFullYear(), tod.getMonth(), tod.getDate());

	var imonthN = ""
	if (nextActualDOW.getMonth() < 9) imonthN = "0" + (nextActualDOW.getMonth() + 1);
	else imonthN = tod.getMonth() + 1;

	var imonthP = ""
	if (prevActualDOW.getMonth() < 9) imonthP = "0" + (prevActualDOW.getMonth() + 1);
	else imonthP = tod.getMonth() + 1;

	var idayN = ""
	if (nextActualDOW.getDate() < 10) idayN = "0" + nextActualDOW.getDate();
	else idayN = nextActualDOW.getDate();

	var idayNplus1 = ""
	if (nextActualDOW.getDate() + 1 < 10) idayNplus1 = "0" + (nextActualDOW.getDate() + 1);
	else idayNplus1 = nextActualDOW.getDate() + 1;

	var idayP = ""
	if (prevActualDOW.getDate() < 10) idayP = "0" + prevActualDOW.getDate();
	else idayP = prevActualDOW.getDate();

	var idayPplus1 = ""
	if (prevActualDOW.getDate() + 1 < 10) idayPplus1 = "0" + (prevActualDOW.getDate() + 1);
	else idayPplus1 = prevActualDOW.getDate() + 1;

	// text = text.replaceAll("[td TS-D]", "<t:" + Math.floor(tod.getTime() / 1000) + ":D>");
	// text = text.replaceAll("[td TS-R]", "<t:" + Math.floor(tod.getTime() / 1000) + ":R>");
	// text = text.replaceAll("[td TS-F]", "<t:" + Math.floor(tod.getTime() / 1000) + ":F>");
	// text = text.replaceAll("[tdMid TS-R]", "<t:" + Math.floor(todOnlyDate.getTime() / 1000) + ":R>");
	// text = text.replaceAll("[tdMid TS-D]", "<t:" + Math.floor(todOnlyDate.getTime() / 1000) + ":D>");
	// text = text.replaceAll("[tdMid TS-F]", "<t:" + Math.floor(todOnlyDate.getTime() / 1000) + ":F>");
	// text = text.replaceAll("[tdEOD TS-R]", "<t:" + Math.floor(todOnlyDate.getTime() / 1000) + ":R>");
	// text = text.replaceAll("[tdEOD TS-D]", "<t:" + Math.floor(todOnlyDate.getTime() / 1000) + ":D>");
	// text = text.replaceAll("[tdEOD TS-F]", "<t:" + Math.floor(todOnlyDate.getTime() / 1000) + ":F>");
	
	text = replaceNested(text, ToBeCounted, recrused, headLevel, authorID);
	
	// if contains {RECURSIVE} then replace with result of funnyDOWText(dowNum, authorID) -- loop until no more {RECURSIVE}
	// if contains <RECURSIVE> then replace with result of funnyDOWText(dowNum, authorID) but made URL safe -- loop until no more <RECURSIVE>

	while (text.includes("{RECURSIVE}") || text.includes("<RECURSIVE>") || text.includes("{REVERSE}"))
	{
		if (text.includes("{RECURSIVE}"))
		{
			text = text.replace("{RECURSIVE}", await funnyDOWText(dowNum, authorID, recrused+1, ToBeCounted, headLevel));
		}

		if (text.includes("<RECURSIVE>"))
		{
			text = text.replace("<RECURSIVE>", onlyLettersNumbers(await funnyDOWText(dowNum, authorID, recrused+1, ToBeCounted, headLevel)));
		}

		if (text.includes("{REVERSE}"))
		{
			var res = await funnyDOWText(dowNum, authorID, recrused+1, ToBeCounted, headLevel);
			text = text.replace("{REVERSE}", res.split("").reverse().join(""));
		}
	}

	// fix: today stated x ago is not correct (displays current time not midnight)

	text = text.replaceAll("[d]", num);
	text = text.replaceAll("[month]", tod.getMonth());
	text = text.replaceAll("[todaylong]", tod.toDateString());
	text = text.replaceAll("[dow]", dow[tod.getDay()]);
	text = text.replaceAll("[DAY]", dow[dowNum]);
	text = text.replaceAll("[ACY]", dowACY[dowNum]);

	text = text.replaceAll("[intYEAR->]", nextActualDOW.getFullYear());
	text = text.replaceAll("[intMONTH->]", imonthN);
	text = text.replaceAll("[intDAY->]", idayN);
	text = text.replaceAll("[intDAY+1->]", idayNplus1);

	text = text.replaceAll("[intYEAR<-]", prevActualDOW.getFullYear());
	text = text.replaceAll("[intMONTH<-]", imonthP);
	text = text.replaceAll("[intDAY<-]", idayN);
	text = text.replaceAll("[intDAY+1<-]", idayPplus1);

	if (text.includes("[TS-"))
	{
		subtext = "";
		pickedDay = nextActualDOW;
		if (text.includes("<-"))
		{
			pickedDay = prevActualDOW;
			subtext = "<-";
		}
		else if (text.includes("->"))
			subtext = "->";

		if (text.includes("E59"))
		{
			subtext += "E59";
			pickedDay = new Date(pickedDay.getFullYear(), pickedDay.getMonth(), pickedDay.getDate(), 23, 59, 59, 999);
		}

		if (text.includes("-R"))
			text = text.replaceAll("[TS-R" + subtext + "]", "<t:" + Math.floor(pickedDay.getTime() / 1000) + ":R>");
		else if (text.includes("-D"))
			text = text.replaceAll("[TS-D" + subtext + "]", "<t:" + Math.floor(pickedDay.getTime() / 1000) + ":D>");
		else if (text.includes("-F"))
			text = text.replaceAll("[TS-F" + subtext + "]", "<t:" + Math.floor(pickedDay.getTime() / 1000) + ":F>");
	}

	// text = text.replaceAll("[TS-R<-]", "<t:" + Math.floor(prevActualDOW.getTime() / 1000) + ":R>");
	// text = text.replaceAll("[TS-R->]", "<t:" + Math.floor(nextActualDOW.getTime() / 1000) + ":R>");
	// text = text.replaceAll("[TS-D<-]", "<t:" + Math.floor(prevActualDOW.getTime() / 1000) + ":D>");
	// text = text.replaceAll("[TS-D->]", "<t:" + Math.floor(nextActualDOW.getTime() / 1000) + ":D>");
	// text = text.replaceAll("[TS-F]", "<t:" + Math.floor(nextActualDOW.getTime() / 1000) + ":F>");
	
	if (text.includes("[SENDER]"))
	{
		if (!(global.dbAccess[1] && global.dbAccess[0]))
		{
			text = text.replaceAll("[SENDER]", "BUDDY");
		}
		else
		{
			console.log("Whomst lookup for id " + authorID);

			// make sure to replace [SENDER] with the name of the user who called the command, needs to wait for the result
			
			var res = await NameFromUserIDID(authorID);

			// res is an object promise, need to get the value from it

			if (res.length == 0)
			{
				console.log(`Whomst lookup for id ${id} returned no results`)
				text = text.replaceAll("[SENDER]", "BUDDY");
			}
			else
			{
				text = text.replaceAll("[SENDER]", res[0].PersonName);
			}			
		}
	}


	if (text.includes("[td"))
	{
		subtext = "";
		pickedDay = tod;
		if (text.includes("Mid"))
		{
			pickedDay = todOnlyDate;
			subtext = "Mid";
		}
		else if (text.includes("EOD"))
		{
			pickedDay = new Date(tod.getFullYear(), tod.getMonth(), tod.getDate(), 23, 59, 59, 999);
			subtext = "EOD";
		}
		
		if (text.includes("-R"))
			text = text.replaceAll("[td" + subtext + " TS-R]", "<t:" + Math.floor(pickedDay.getTime() / 1000) + ":R>");
		else if (text.includes("-D"))
			text = text.replaceAll("[td" + subtext + " TS-D]", "<t:" + Math.floor(pickedDay.getTime() / 1000) + ":D>");
		else if (text.includes("-F"))
			text = text.replaceAll("[td" + subtext + " TS-F]", "<t:" + Math.floor(pickedDay.getTime() / 1000) + ":F>");
	}

	// while (text.includes("[emotion]"))
	// 	text = text.replace("[emotion]", emotions[Math.floor(Math.random() * emotions.length)]);
	
	// while (text.includes("[game]"))
	// 	text = text.replace("[game]", game[Math.floor(Math.random() * game.length)]);

	// while (text.includes("[emotion2]"))
	// 	text = text.replace("[emotion2]", emotion2[Math.floor(Math.random() * emotion2.length)]);

	// while (text.includes("[person]"))	
	// 	text = text.replace("[person]", persontype[Math.floor(Math.random() * persontype.length)]);	

	// while (text.includes("[goodbye]"))
	// 	text = text.replace("[goodbye]", bye[Math.floor(Math.random() * bye.length)]);

	// while (text.includes("[emoji]"))
	// 	text = text.replace("[emoji]", emoji[Math.floor(Math.random() * emoji.length)]);

	// while (text.includes("[location]"))
	// 	text = text.replace("[location]", localesz[Math.floor(Math.random() * localesz.length)]);

	// while (text.includes("[l2]"))
	// 	text = text.replace("[l2]", l2[Math.floor(Math.random() * l2.length)]);

	// text = text.replace("[emotion]", emotions[Math.floor(Math.random() * emotions.length)]);
	// text = text.replace("[emotion]", emotions[Math.floor(Math.random() * emotions.length)]);
	// text = text.replace("[game]", game[Math.floor(Math.random() * game.length)]);
	// text = text.replace("[emotion2]", emotion2[Math.floor(Math.random() * emotion2.length)]);
	// text = text.replace("[person]", persontype[Math.floor(Math.random() * persontype.length)]);
	// text = text.replace("[goodbye]", bye[Math.floor(Math.random() * bye.length)]);
	// text = text.replace("[emoji]", emoji[Math.floor(Math.random() * emoji.length)]);

	text = text.replaceAll("\\n", "\n");

	// if length is greater than 1000, call again
	if (text.length > 2000)
	{
		return funnyDOWText(dowNum, authorID);
	}

	// if recusion level is 0, save ToBeCounted to file
	if (recrused == 0)
	{
		// console.log("Items in that /DOW call:");
		// // log ToBeCounted to console
		// for (var i = 0; i < ToBeCounted.length; i++)
		// {
		// 	console.log(ToBeCounted[i]);
		// }
		// console.log("");

		// load in global.fridayCounter
		var fc = global.fridayCounter;
		for (var i = 0; i < ToBeCounted.length; i++)
		{
			// if fc["UID--GROUP"] is not defined, define as 1, else increment
			if (fc[ToBeCounted[i].UID + "--" + ToBeCounted[i].Group + "--" + ToBeCounted[i].Sender] == null)
			{
				fc[ToBeCounted[i].UID + "--" + ToBeCounted[i].Group + "--" + ToBeCounted[i].Sender] = [];
			}

			if (fc[ToBeCounted[i].UID + "--" + ToBeCounted[i].Group + "--" + ToBeCounted[i].Sender][ToBeCounted[i].LayerDeep] == null)
			{
				fc[ToBeCounted[i].UID + "--" + ToBeCounted[i].Group + "--" + ToBeCounted[i].Sender][ToBeCounted[i].LayerDeep] = [];
			}

			if (fc[ToBeCounted[i].UID + "--" + ToBeCounted[i].Group + "--" + ToBeCounted[i].Sender][ToBeCounted[i].LayerDeep][ToBeCounted[i].HeadLevel] == null)
			{
				fc[ToBeCounted[i].UID + "--" + ToBeCounted[i].Group + "--" + ToBeCounted[i].Sender][ToBeCounted[i].LayerDeep][ToBeCounted[i].HeadLevel] = 1;
			}
			else
			{
				fc[ToBeCounted[i].UID + "--" + ToBeCounted[i].Group + "--" + ToBeCounted[i].Sender][ToBeCounted[i].LayerDeep][ToBeCounted[i].HeadLevel]++;
			}
		}


		// save global.fridayCounter to file
		fs.writeFileSync(babadata.datalocation + "/fridayCounter.json", JSON.stringify(fc));
	}

	text = repeatCheck(text);

	return text;
}

function replaceNested(text, ToBeCounted = null, recrused = 0, headLevel = 0, authorID = 0)
{
	var replaced = true;
	var replacements = global.replacements;

	if (replacements == null)
	{
		replaced = false;
	}

	while (replaced)
	{
		replaced = false;

		// loop throught replacements
		for (var i = 0; i < Object.keys(replacements).length; i++)
		{
			var key = Object.keys(replacements)[i];
			var value = replacements[key];

			var regex = new RegExp("\\[" + key + "\\]", "g");

			if (text.match(regex))
			{
				while (text.match(regex))
				{
					var numbo = Math.floor(Math.random() * value.length);
					text = text.replace("[" + key + "]", value[numbo].text);

					if (ToBeCounted != null)
					{
						TBDItem = { "UID": value[numbo].UID, "LayerDeep": recrused, "Group": 1, "Text": value[numbo].text, "HeadLevel": headLevel, "Sender": authorID};
						ToBeCounted.push(TBDItem);
					}
				}
				replaced = true;
			}
		}
	}

	return text;
}

function repeatCheck(text, prefix = "")
{
	// new /friday option tag items go here:
	// {repeat:x:[Value]} - repeat the value x times
	// repeat is not case sensitive in the regex
	// regex: {[rR][eE][pP][eE][aA][tT][sSnN]?:(\d+):((.|\n)*)}
	// {repeat:5:[frog]} - frog frog frog frog frog
	// {repeat:3:[frog{repeat:2:[frog]}]} - start with outer repeat, then go inwards 

	var pf = "";
	if (prefix != "")
	{
		pf = "[" + prefix.toLowerCase() + prefix.toUpperCase() + "]";
	}

	var regexString = "{" + pf + "[rR][eE][pP][eE][aA][tT][sSnN]?:(\\d+):((.|\n)*)}";

	if (prefix == "b")
	{
		regexString =  "{" + pf + "[rR][eE][pP][eE][aA][tT][sSnN]?:(\\[(.*)\\]):((.|\n)*)}";
	}

	var RegexExpress = new RegExp(regexString, "g");
	var RegexExpress2 = new RegExp(regexString + ":", "g");
	var match = text.match(RegexExpress);
	var match2 = text.match(RegexExpress2);
	if (match2 != null) 
	{
		match = match2;
		match = match.map(x => x.slice(0, -1));
	}

	while (match != null)
	{
		for (var i = 0; i < match.length; i++)
		{
			var matchi = match[i];
			if (prefix == "b")
			{
				// get the middle value
				var middle = matchi.split(":")[1];
				var middle2 = replaceNested(middle);
				matchi = matchi.replace(middle, middle2);
			}

			var num = parseInt(matchi.match(/\d+/)[0]);
			var value = matchi.split(":").pop();

			value = value.replaceAll("}", "");

			var containsS = matchi.split(":")[0].toLowerCase().includes("s");
			var containsN = matchi.split(":")[0].toLowerCase().includes("n");

			var newString = "";
			for (var j = 0; j < num; j++)
			{
				newString += value + (containsS ? " " : containsN ? "\n" : "");
			}

			text = text.replace(match[i], newString);
		}

		match = text.match(RegexExpress);
		match2 = text.match(RegexExpress2);
		if (match2 != null) 
		{
			match = match2;
			match = match.map(x => x.slice(0, -1));
		}
	}

	return text;
}

function onlyLettersNumbers(text)
{
	// remove all non-alphanumeric characters
	text = text.replace(/[^a-zA-Z0-9]/g, '');

	if (text == "")
		// set to a random string of 1 to 10 characters
		text = Math.random().toString(36).substring(2, Math.floor(Math.random() * 10) + 2);

	return text;
}

function URLSafe(text)
{
	text = text.replaceAll(" ", "%20");
	text = text.replaceAll(":", "%3A");
	text = text.replaceAll("?", "%3F");
	text = text.replaceAll("!", "%21");
	text = text.replaceAll(";", "%3B");
	text = text.replaceAll("=", "%3D");
	text = text.replaceAll("&", "%26");
	text = text.replaceAll("#", "%23");
	text = text.replaceAll("/", "%2F");
	text = text.replaceAll("\\", "%5C");
	text = text.replaceAll("@", "%40");
	text = text.replaceAll("$", "%24");
	text = text.replaceAll("%", "%25");
	text = text.replaceAll("^", "%5E");
	text = text.replaceAll("*", "%2A");
	text = text.replaceAll("(", "%28");
	text = text.replaceAll(")", "%29");
	text = text.replaceAll("[", "%5B");
	text = text.replaceAll("]", "%5D");
	text = text.replaceAll("{", "%7B");
	text = text.replaceAll("}", "%7D");
	text = text.replaceAll("|", "%7C");
	text = text.replaceAll("<", "%3C");
	text = text.replaceAll(">", "%3E");
	text = text.replaceAll("`", "%60");
	text = text.replaceAll("~", "%7E");
	text = text.replaceAll("'", "%27");
	text = text.replaceAll("\"", "%22");

	return text;
}

function funnyFrogText(authorID)
{
	let path = babadata.datalocation + "/FROGcache.json";

	if (!fs.existsSync(path)) 
	{
		console.log("No FROGcache file found -- creating with local data");

		var opttemp = ["https://tenor.com/view/frog-funny-funny-frog-picmix-blingee-gif-25200067"]
		opttemp.push(opts2);
		
		var data = JSON.stringify(opttemp);
		
		fs.writeFileSync(babadata.datalocation + "/FROGcache.json", data);
	}

    let rawdata = fs.readFileSync(babadata.datalocation + "/FROGcache.json");

	var optionsFROG = JSON.parse(rawdata);

	if (typeof optionsFROG[0] != "string")
	{
		optionsFROG = generateOps(optionsFROG, authorID, "FROG");
	}

	var text = optionsFROG[Math.floor(Math.random() * optionsFROG.length)].text;

	return text;
}

function generateOps(opsArray, authorID, prefix)
{
    let rawdata = fs.readFileSync(babadata.datalocation + "/" + prefix + "control.json");
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
		if (opsArray[i].StartTime != null)
		{
			var tod = new Date();
			var st = new Date(opsArray[i].StartTime);

			if (opsArray[i].EndTime != null)
			{
				var et = new Date(opsArray[i].EndTime);
				var startNormalizedToYear = new Date(tod.getFullYear(), st.getMonth(), st.getDate());
				var endNormalizedToYear = new Date(tod.getFullYear(), et.getMonth(), et.getDate());

				if (tod < startNormalizedToYear || tod > endNormalizedToYear)
					continue;
			}
			else
			{
				var startNormalizedToYear = new Date(tod.getFullYear(), st.getMonth(), st.getDate());

				if (tod != startNormalizedToYear)
					continue;
			}
		}

		if (opsArray[i].DayOfWeek != null)
		{
			var tod = new Date();
			var dow = tod.getDay();

			if (opsArray[i].DayOfWeek != dow)
				continue;
		}

		if (opsArray[i].OccuranceChance < 100)
		{
			if (Math.random() * 100 > opsArray[i].OccuranceChance)
				continue;
		}

		if (cLevel <= 1)
		{
			if (opsArray[i].enabledDef == true)
			{
				ops.push(opsArray[i]);
			}
		}

		if (cLevel >= 1)
		{
			if (opsArray[i].IDS != null && opsArray[i].IDS.toString().includes(authorID))
			{
				ops.push(opsArray[i]);
			}
		}
	}

	return ops;
}

function removeCountRuin(uid, g)
{
	g.members.fetch(uid).then(member => {
		member.roles.remove(babadata.countrole, "you are free to count!");
	});
}

module.exports = {
    funnyDOWText,
    funnyFrogText,
	removeCountRuin
};