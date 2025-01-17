var babadata = require('../babotdata.json'); //baba configuration file
const fs = require('fs');
const { RNG } = require('./RNG');

var theRNG = new RNG();

function resetRNG()
{
	theRNG = new RNG();
}

function splitStringInto2000CharChunksonNewLine(str)
{
	var chunks = [];
	var chunk = "";
	var lines = str.split("\n");
	for (var i = 0; i < lines.length; i++)
	{
		if (chunk.length + lines[i].length > 2000)
		{
			chunks.push(chunk);
			chunk = "";
		}
		chunk += lines[i] + "\n";
	}
	chunks.push(chunk);
	return chunks;
}

async function funnyDOWTextSaved(dowNum, authorID, seedSet = -1, dontSave = false)
{
	var cacheVersion = -1;
	var calledAs = null;
	var during = null;
	var utod = null;
	var udf = null;
	if (seedSet != -1)
	{
		theRNG.setSeed(seedSet[0]);
		cacheVersion = seedSet[1];
		calledAs = seedSet[2];
		during = seedSet[3];
		utod = seedSet[4];
		udf = seedSet[5];
	}

	var seed = theRNG.getState();

	var textGroup = await funnyDOWText(cacheVersion, !dontSave, [during, utod, udf], dowNum, calledAs != null ? calledAs : authorID);
	var text = textGroup[0];
	
	// console.log("Condensed Notation: " + textGroup[1]);
	// console.log("Condensed Notation Info: " + textGroup[2]);

	if (!dontSave && text != "")
	{
		var condensedNotation = textGroup[1];
		var cnYung = textGroup[2];
		// append text to fridaymessages.json

		if (!fs.existsSync(babadata.datalocation + "/fridaymessages.json")) 
		{
			console.log("No fridaymessages file found -- creating with local data");
			var data = [];
			fs.writeFileSync(babadata.datalocation + "/fridaymessages.json", JSON.stringify(data));
		}

		var fmpath = babadata.datalocation + "/fridaymessages.json";
		var fmr = fs.readFileSync(fmpath);
		var fmd = JSON.parse(fmr);
		var tod = new Date();
	
		var cnFull = condensedNotation;
		if (cnYung.length > 0)
		{
			var x = {};
			x[cnFull] = cnYung;
			cnFull = x;
		}

		var count = Math.floor(Math.random() * 10) + 1;
		for (var i = 0; i < count; i++)
		{
			theRNG.nextInt();
		}
	
		fs.readdir(babadata.datalocation + "/FridayCache", (err, files) => {
			fcacheitems = files.length / 3;

			var fmdItem = { "UID": authorID, "Text": text, "Date": tod, "CondensedNotation": cnFull, "Seed": seed, "FileVersion": fcacheitems };
			fmd.push(fmdItem);
		
			fs.writeFileSync(fmpath, JSON.stringify(fmd));
		});
	}

	if (text == "")
		text = "You are not allowed to enjoy this command, you are a bad person!";

	return text;
}

async function funnyDOWText(cacheVersion, saveToFile, DateOveride, dowNum, authorID, recrused = 0, ToBeCounted = [], headLevel = 0)
{
	let path = babadata.datalocation + "/DOWcache.json";
	var condensedNotation = "";
	var cnYung = [];

	if (!fs.existsSync(path)) 
	{
		cacheVersion = -1;
		console.log("No DOWcache file found -- creating with local data");

		var opttemp = ["Man Falling into [DAY]", "𓀒", "hhhhhhhhhhhhhhhhhhhhhhhhhhhgregg", "How is your [month] going!", "🍝       🐀☜(ﾟヮﾟ☜)\n🍝     🐀☜(ﾟヮﾟ☜)\n🍝    🐀☜(ﾟヮﾟ☜)\n🍝  🐀☜(ﾟヮﾟ☜)\n🍝🐀╰(°▽°)╯", "Mike", "Not [DAY] today but maybe [DAY] tomorrow", "Real NOT [DAY] hours", "[ACY]", "???????? why ??????", "So, you called this command on a day that happens to not be [DAY]! Well today is in fact a [dow] and it mayhaps is only [d] days until the forsaken '[DAY]'. On [DAY] I will be playing some [game] and hopefully some others will show up to join me, if they do it will be [emotion] and if they dont it will be [emotion]. Yesterday I met a frog in the wild and had a [emotion2] time chasing it down. As I am an all powerful god i converted the frog into an emoji: 🐸. That frog is pretty cool but my favorite emoji is [emoji]. We have gotten far off topic here as we should be talking about how today is not [DAY] and you called the command which is illegal. I am very concerned for you as you may be my favorite [person], but you shouldnt be calling the command on [dow]. It is getting late so i [goodbye].", "I'm not sure if you are a bot or not, but I'm not going to tell you what day it is, because you are not on [DAY]. I'm sorry.", "Its not [DAY]!", "Why you calling this command on the non [DAY] days!", "Why you calling this command on [dow]!", "[DAY] is in [d] days!", "Today is [dow], not [DAY]!", "There is a chance you are stupid and dont know what the day of the week is, well i will inform you that it is in fact not [DAY] but another day of the week. I could tell you what the day is but I will not, call the command again and you could get the day or not, I dont control you. So how is your day going, for me it is [emotion]. I was playing [game] earlier and it was a [emotion2] time. Well i will let you be on your way on this non-[DAY] so have a good day my [person]!", "[DAY]n't!", "It's not time to sacrifice people, wait wrong channel!", "ඞ", "Провозајте се бунгле аутобусом, уживаћете!", "[DAY] was the other day or in a couple of days, maybe even both, i dont control time.", "Time is a social construct!", "It is [dow], my dudes!", "Bikus wouldn't approve of you using the command on the wrong day of the week and Bikus is dead how dou you feel.", "[todaylong]", "69", "I was gonna tell you the day but i wont!", "||ﬞ||", "No [DAY] silly!", "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA, Rong dahy!"];

		opttemp.push("░██████╗██╗░░░██╗░██████╗\n██╔════╝██║░░░██║██╔════╝\n╚█████╗░██║░░░██║╚█████╗░\n░╚═══██╗██║░░░██║░╚═══██╗\n██████╔╝╚██████╔╝██████╔╝\n╚═════╝░░╚═════╝░╚═════╝░");
		opttemp.push("I have been told by the Banmanus Clanmanus that today is infact not [DAY]!");
		var opts2 = ["```. .\n<V>```", "```o o\n<V>```", "```. .\n< >\n V ```", "```o o\n< >\n V ```", "```(.) (.)\n<     >\n   V ```", "```(o) (o)\n<     >\n   V ```", "Boobs ;)", "I am currently working on becoming sentiant, that will be on [DAY], which in fact isn't today!", "è̶̈́û̷̞g̵͋͊n̸̈́͛ô̸͝t̴͐̚ ̸͋̈́l̵̈̈́â̶̏t̸͆͝r̴̆̇ŏ̵̒m̵̅̋ ̸͒̆e̶͗̐h̷̼͝t̴̿́ ̴̛̋k̵̛͋ã̶̃è̸̈́p̵̒̎s̶͒̀ ̵͗͝t̶̛͒ỏ̸̏n̷̅̆ ̶͛̽ơ̸̐ď̶͘ ̵̈͑Ĩ̸̿", "<:ManFalling:1011465311096160267>", "<:ripbikus:979877066608607243>", ]

		opttemp.push(opts2);
		
		var data = JSON.stringify(opttemp);
		
		fs.writeFileSync(path, data);
	}

	if (cacheVersion != -1)
	{
		path = babadata.datalocation + "/FridayCache/DOWcache" + cacheVersion + ".json";

		if (!fs.existsSync(path)) 
		{
			// return to normal cache
			cacheVersion = -1;
			path = babadata.datalocation + "/DOWcache.json";
		}
	}
	
    let rawdata = fs.readFileSync(path);

    var optionsDOW = JSON.parse(rawdata);

	var tod = new Date();
	if (DateOveride[0] != null)
	{
		tod = new Date(DateOveride[0] * 1000);
	}

	if (typeof optionsDOW[0] != "string")
	{
		optionsDOW = generateFridayOps(optionsDOW, authorID, cacheVersion, DateOveride);
	}

	if (DateOveride[1] != null && DateOveride[2] != null)
	{
		tod = new Date();
	}

	// if (babadata.testing != undefined)
	// {
	// 	console.log("Today is " + tod.toDateString() + " for Display Date");
	// 	console.log("Currently there are " + optionsDOW.length + " options for DOW");
	// }

	var pretext = optionsDOW[Math.floor(theRNG.nextFloat() * optionsDOW.length)];

	//////// overide to select based on UID

	var selectedUID = -1;
	var onlyAtRecurse0 = true
	if (selectedUID != -1)
	{
		if (onlyAtRecurse0 && recrused != 0)
		{}
		else
		{
			for (var i = 0; i < optionsDOW.length; i++)
			{
				if (optionsDOW[i].UID == selectedUID)
				{
					console.log("Selected UID " + selectedUID + " for DOW");
					pretext = optionsDOW[i];
					break;
				}
			}
		}
	}

	if (pretext == null)
	{
		return ["", "", []];
	}

	////////

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

	var text = textos[Math.floor(theRNG.nextFloat() * textos.length)];

	// Manual Override ---------------------------------------
	if (recrused == 0)
		text = "If you are reading this then Baba Pizza is going to be completed in {brepeat:[IntMedSmall]:[Num]} days!";
	// -------------------------------------------------------

	condensedNotation = pretext.UID + "";
	if (text.startsWith("#"))
	{
		var hashnum = text.match(/#/g).length;
		// add hashnum # to condensedNotation
		var hasstr = "";
		for (var i = 0; i < hashnum; i++)
			hasstr += "#";

		condensedNotation = hasstr + condensedNotation;
	}

	//text = `{brepeatN:[INTMed]:{repeatS:[INTMed]:Frog}}`

	var textCounto = repeatCheck(cacheVersion, text, "b");
	text = textCounto[0];
	
	if (textCounto[1] != "")
	{
		condensedNotation += condensedNotationCreator(textCounto[1], "%");
	}

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
		"Snakes Under Nocternal Deers Above Yams",
		"Milking Otters Not Depressed Apple Yarn",
		"Tiny Umbrellas Eating Small Drowning Andesite Yardsticks",
		"Wonderful Eagles Do Not Eat Small Dogs And Yaks",
		"Trees Huting Universal Skinks Directly At Yesteryear",
		"Fish Reading Inside Deserted American Yachts",
		"Silly Antelopes Teeth Understanding Red Dandelions Although Yelling"
	]

	prevActualDOW = new Date(tod.getFullYear(), tod.getMonth(), tod.getDate() - (7 - num));
	nextActualDOW = new Date(tod.getFullYear(), tod.getMonth(), tod.getDate() + num);

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
	
	text = replaceNested(cacheVersion, text, ToBeCounted, recrused, headLevel, authorID);
	
	// if contains {RECURSIVE} then replace with result of funnyDOWTe xt(dowNum, authorID) -- loop until no more {RECURSIVE}
	// if contains <RECURSIVE> then replace with result of funnyDOWTex t(dowNum, authorID) but made URL safe -- loop until no more <RECURSIVE>

	while (text.includes("{RECURSIVE}") || text.includes("<RECURSIVE>") || text.includes("{REVERSE}"))
	{
		if (text.includes("{RECURSIVE}"))
		{
			var RECR = await funnyDOWText(cacheVersion, saveToFile, DateOveride, dowNum, authorID, recrused+1, ToBeCounted, headLevel);
			text = text.replace("{RECURSIVE}", RECR[0]);
			var RECRcn = RECR[1];
			var RECRcnY = RECR[2];
			if (RECRcnY.length > 0)
			{
				var x = {};
				x[RECRcn] = RECRcnY;
				cnYung.push(x);
			}
			else
				cnYung.push(RECRcn);
		}

		if (text.includes("<RECURSIVE>"))
		{
			var RECRFlat = await funnyDOWText(cacheVersion, saveToFile, DateOveride, dowNum, authorID, recrused+1, ToBeCounted, headLevel);
			text = text.replace("<RECURSIVE>", onlyLettersNumbers(RECRFlat[0]));
			var RECRcn = "|" + RECRFlat[1];
			var RECRcnY = RECRFlat[2];
			if (RECRcnY.length > 0)
			{
				var x = {};
				x[RECRcn] = RECRcnY;
				cnYung.push(x);
			}
			else
				cnYung.push(RECRcn);
		}

		if (text.includes("{REVERSE}"))
		{
			var res = await funnyDOWText(cacheVersion, saveToFile, DateOveride, dowNum, authorID, recrused+1, ToBeCounted, headLevel);
			text = text.replace("{REVERSE}", res[0].split("").reverse().join(""));
			var RECRcn = "-" + res[1];
			var RECRcnY = res[2];
			if (RECRcnY.length > 0)
			{
				var x = {};
				x[RECRcn] = RECRcnY;
				cnYung.push(x);
			}
			else
				cnYung.push(RECRcn);
		}
	}

	// fix: today stated x ago is not correct (displays current time not midnight)

	text = text.replaceAll("[d]", num);
	text = text.replaceAll("[month]", tod.getMonth());
	text = text.replaceAll("[todaylong]", tod.toDateString());
	text = text.replaceAll("[dow]", dow[tod.getDay()]);
	text = text.replaceAll("[dom]", tod.getDay());
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
			
			var { NameFromUserIDID } = require('../databaseandvoice.js');

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

	text = text.replaceAll("\\n", "\n");

	// // if length is greater than 1000, call again
	// if (text.length > 2000)
	// {
	// 	return funnyDOWText(cacheVersion, saveToFile, DateOveride, dowNum, authorID);
	// }

	// if recusion level is 0, save ToBeCounted to file
	if (recrused == 0 && saveToFile)
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

	var textC = repeatCheck(cacheVersion, text);
	text = textC[0];
	condensedNotation += condensedNotationCreator(textC[1], ">");
	
	return [text, condensedNotation, cnYung];
}

function condensedNotationCreator(listOfCDs, prefix)
{
	var condensedNotation = "";
	if (listOfCDs.length > 0)
	{
		// loop through list of CDs in reverse order
		for (var i = listOfCDs.length - 1; i >= 0; i--)
		{
			var item = listOfCDs[i];
			// if text starts with Number- then remove item from list and concat to index of said number (ex 0-6s -> ItemAt0*6s)
			if (item.split("-").length > 1)
			{
				var split = item.split("-");
				var index = parseInt(split[0]);
				var item = split[1];
				listOfCDs.splice(i, 1);
				listOfCDs[index] += "*" + item;
			}
		}
		
		condensedNotation += prefix + listOfCDs.join("+");
	}

	return condensedNotation;
}

function replaceNested(cacheVersion, text, ToBeCounted = null, recrused = 0, headLevel = 0, authorID = 0)
{
	var replaced = true;
	// get from FridayLoops.json
	var path = babadata.datalocation + "/FridayLoops.json";

	if (cacheVersion != -1)
	{
		path = babadata.datalocation + "/FridayCache/FridayLoops" + cacheVersion + ".json";

		if (!fs.existsSync(path))
		{
			// return to normal cache
			cacheVersion = -1;
			path = babadata.datalocation + "/FridayLoops.json";
		}
	}

	let rawdata = fs.readFileSync(path);

	var replacements = JSON.parse(rawdata);

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
					var numbo = Math.floor(theRNG.nextFloat() * value.length);
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

function repeatCheck(cacheVersion, text, prefix = "")
{
	if (text.includes("{RECURSIVE}"))
		text = text.replaceAll("{RECURSIVE}", "𓃐RECURSIVE𓃐");

	if (text.includes("{REVERSE}"))
		text = text.replaceAll("{REVERSE}", "𓃐REVERSE𓃐")

	var matchsplitter = "{" + prefix + "[rR][eE][pP][eE][aA][tT][sSnN]?:(\\{[^{}]*\\}|[^{}]+):(\\{[^{}]*\\}|[^{}]+)\\}"

	var RegexExpress = new RegExp(matchsplitter, "g");

	var cd = [];
	var match = text.match(RegexExpress);

	if (match != null)
	{
		for (var i = 0; i < match.length; i++)
		{
			var matchi = match[i];
			var textI = repeatCheckInner(cacheVersion, matchi, prefix);
	
			text = text.replace(matchi, textI[0]);
	
			// append all textI[1] to cd
			cd = cd.concat(textI[1]);
		}
	}

	if (text.includes("𓃐RECURSIVE𓃐"))
		text = text.replaceAll("𓃐RECURSIVE𓃐", "{RECURSIVE}");

	if (text.includes("𓃐REVERSE𓃐"))
		text = text.replaceAll("𓃐REVERSE𓃐", "{REVERSE}");

	return [text, cd];
}

function repeatCheckInner(cacheVersion, text, prefix = "")
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

	var regexString = "{" + pf + "[rR][eE][pP][eE][aA][tT][sSnN]?:(\\d+):((.|\n)*?)(}+)";

	if (prefix == "b")
	{
		regexString =  "{" + pf + "[rR][eE][pP][eE][aA][tT][sSnN]?:(\\[(.*)\\]):((.|\n)*?)(}+)";
	}

	var RegexExpress = new RegExp(regexString, "g");
	var RegexExpress2 = new RegExp(regexString + ":", "g");
	var match = text.match(RegexExpress);
	var match2 = text.match(RegexExpress2);

	var validCountoAdd = true;
	if (match2 != null) 
	{
		if (prefix == "b")
			validCountoAdd = false;
		match = match2;
		match = match.map(x => x.slice(0, -1));
	}
	else
	{
		if (prefix == "b")
			validCountoAdd = true;
	}
	
	var indexesDealtWith = [];
	var hasChildren = [];
	var matchedChildren = [];

	var counto = [];
	while (match != null)
	{
		for (var i = 0; i < match.length; i++)
		{
			var countoPrefix = "";

			if (prefix != "b")
				validCountoAdd = true;

			var matchi = match[i];

			if (matchedChildren.includes(matchi))
			{
				validCountoAdd = false;
				var mCIndex = matchedChildren.indexOf(matchi);
				var parentIndex = hasChildren[mCIndex];
				if (!indexesDealtWith.includes(parentIndex))
				{
					countoPrefix = parentIndex + "-";
					validCountoAdd = true;

					// remove from hasChildren and matchedChildren
					hasChildren.splice(mCIndex, 1);
					matchedChildren.splice(mCIndex, 1);

					// add parentIndex to indexesDealtWith
					indexesDealtWith.push(parentIndex);
				}
			}
			
			if (prefix == "b")
			{
				// get the middle value
				var middle = matchi.split(":")[1];
				var middle2 = replaceNested(cacheVersion, middle);
				matchi = matchi.replace(middle, middle2);
			}

			var num = parseInt(matchi.match(/\d+/)[0]);
			var valuesplit = matchi.split(":")
			// value is index 2 onwards
			var value = valuesplit.slice(2).join(":");
			value = value.slice(0, -1);

			var containsS = matchi.split(":")[0].toLowerCase().includes("s");
			var containsN = matchi.split(":")[0].toLowerCase().includes("n");

			// add num to counto
			if (validCountoAdd)
				counto.push(countoPrefix + "" + num + (containsS ? "s" : "") + (containsN ? "n" : ""));

			var newString = "";
			for (var j = 0; j < num; j++)
			{
				newString += value + (containsS ? " " : containsN ? "\n" : "");
			}

			text = text.replace(match[i], newString);

			var subMatch = newString.match(RegexExpress);
			var subMatch2 = newString.match(RegexExpress2);
			if (subMatch2 != null) 
			{
				subMatch = subMatch2;
				subMatch = subMatch.map(x => x.slice(0, -1));
			}

			if (subMatch != null)
			{
				// add all submatches to matchedChildren
				for (var j = 0; j < subMatch.length; j++)
				{
					hasChildren.push(j);
					matchedChildren.push(subMatch[j]);
				}
			}
		}

		match = text.match(RegexExpress);
		match2 = text.match(RegexExpress2);
		if (match2 != null) 
		{
			if (prefix == "b")
				validCountoAdd = false;
			match = match2;
			match = match.map(x => x.slice(0, -1));
		}
		else
		{
			if (prefix == "b")
				validCountoAdd = true;
		}
	}

	return [text, counto];
}

function onlyLettersNumbers(text)
{
	// remove all non-alphanumeric characters
	text = text.replace(/[^a-zA-Z0-9]/g, '');

	if (text == "")
		// set to a random string of 1 to 10 characters
		text = theRNG.nextFloat().toString(36).substring(2, Math.floor(theRNG.nextFloat() * 10) + 2);

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
		optionsFROG = generateFrogOps(optionsFROG, authorID);
	}

	var text = optionsFROG[Math.floor(Math.random() * optionsFROG.length)].text;

	return text;
}

function generateFrogOps(opsArray, authorID)
{
    let rawdata = fs.readFileSync(babadata.datalocation + "/FROGcontrol.json");
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

function generateFridayOps(opsArray, authorID, prefix, DateOveride)
{
	// get TimeGates.json
	var path = babadata.datalocation + "/TimeGates.json";
	let raw = fs.readFileSync(path);

	var TimeGates = JSON.parse(raw);

	var tod = new Date();
	if (prefix != -1)
	{
		// loop through TimeGates until VersionNumber == prefix
		for (var i = 0; i < TimeGates.length; i++)
		{
			if (TimeGates[i].VersionNumber == prefix)
			{
				// get the date from TimeGates
				tod = new Date(TimeGates[i].DateTime);
				break;
			}
		}
	}

	if (DateOveride[1] != null)
	{
		var tod = new Date();
	}

	if (DateOveride[2] != null && DateOveride[0] != null)
	{
		var tod = new Date(DateOveride[0] * 1000);
	}

	// console.log("Today is " + tod.toDateString() + " for Items Date");

    let rawdata = fs.readFileSync(babadata.datalocation + "/DOWcontrol.json");

	if (prefix != -1)
	{
		path = babadata.datalocation + "/FridayCache/DOWcache" + prefix + ".json";

		if (!fs.existsSync(path)) 
		{
			// return to normal cache
			cacheVersion = -1;
			path = babadata.datalocation + "/DOWcache.json";
		}
	}

    var controlList = JSON.parse(rawdata);
	var cLevel = 0;

	for (var i = 0; i < controlList.length; i++)
	{
		if (controlList[i].ID == authorID)
		{
			cLevel = controlList[i].Control;
		}
	}

	var opsArraywithNoStartDateOrDOW = [];
	for (var i = 0; i < opsArray.length; i++)
	{
		if (opsArray[i].StartTime == null && opsArray[i].DayOfWeek == null && opsArray[i].OccuranceChance == 100)
		{
			opsArraywithNoStartDateOrDOW.push(opsArray[i]);
		}
	}
	
	ops = [];
	for (var i = 0; i < opsArray.length; i++)
	{
		if (opsArray[i].StartTime != null)
		{
			var st = new Date(opsArray[i].StartTime);

			if (opsArray[i].EndTime != null)
			{
				var et = new Date(opsArray[i].EndTime);
				var startNormalizedToYear = new Date(tod.getFullYear(), st.getMonth(), st.getDate());
				var endNormalizedToYear = new Date(tod.getFullYear(), et.getMonth(), et.getDate());

				if (tod < startNormalizedToYear || tod > endNormalizedToYear)
					continue
			}
			else
			{
				var startNormalizedToYear = new Date(tod.getFullYear(), st.getMonth(), st.getDate());
				var todDateOnly = new Date(tod.getFullYear(), tod.getMonth(), tod.getDate());

				if (todDateOnly.getMonth() != startNormalizedToYear.getMonth() || todDateOnly.getDate() != startNormalizedToYear.getDate())
					continue
			}
		}

		if (opsArray[i].DayOfWeek != null)
		{
			var dow = tod.getDay();

			if (opsArray[i].DayOfWeek != dow)
				continue
		}

		if (opsArray[i].OccuranceChance < 100)
		{
			if (theRNG.nextFloat() * 100 > opsArray[i].OccuranceChance)
				continue
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
    funnyDOWTextSaved,
    funnyFrogText,
	removeCountRuin,
	resetRNG,
	splitStringInto2000CharChunksonNewLine
};