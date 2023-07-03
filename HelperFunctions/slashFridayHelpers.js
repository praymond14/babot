var babadata = require('../babotdata.json'); //baba configuration file
// var request = require('node-fetch');
// const Discord = require('discord.js'); //discord module for interation with discord api
const fs = require('fs');
// const images = require('images');
// const Jimp = require('jimp');
// const fetch = require('node-fetch');

// const options = { year: 'numeric', month: 'long', day: 'numeric' }; // for date parsing to string

const emotions = ["splendid", "exciting", "sad", "boring", "fun", "exquisite", "happy", "pretty eventful", "slow to start but it picked up later in the day", "not so good", "very good", "legal", "spungungulsumplus", "fish"];
const persontype = ["madam", "friend", "enemy", "brother", "brother man", "BROTHERRRRRR", "bungle bus", "uncle", "second cousin twice removed", "uncles dogs sisters boyfriends moms second cousins cat", "leg", "adam"];
const game = ["TF2", "Ultimate Admiral: Dreadnoughts", "Fishing Simulator", "Sea of Thieves", "Factorio", "Forza Horizon 5", "nothing", "Fallout: New Vegas", "Stabbing Simulator (IRL)"];
const emotion2 = ["fun", "exciting", "monotonous", "speed run", "pretty eventful", "frog", "emotional", "devoid of all emotions", "mike"];
const bye = ["bid you a morrow", "will see you soon", "want to eat your soul, so watch out", "am going to leave now", "hate everything, goodbye", "am monke, heee heee hoo hoo", "wish you good luck on your adventures", "am going to go to bed now", "want to sleep but enevitably will not get any as i will be gaming all night, good morrow", "am going to go to the morrow lands", "will sleep now", "am pleased to sleep"];
const emoji = ["ඞ", "🐸", "🍆", "💄", "⛧", "🎄", "🐷", "🐎", "🐴", "🐍", "⚡", "🪙", "🖕", "🚊", "🏻🏻", "🤔", "🌳", "🌲", "🌴", "🌵", "🐀", "🍝", "𓀒"];

const localesz = ["in class", "in bed", "at Adam's House", "in the car driving to [l2]", "waiting for the bus", "playing slots", "doing cocaine", "in the bathroom", "in the shower", "in your walls ;),"];
const l2 = ["the store", "New York", "Adam's House", "nowhere", "school", "a bacon festival", "somewhere under the sea"]

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
		optionsDOW = generateOps(optionsDOW, authorID, "DOW");
	}

	var tod = new Date();
	var pretext = optionsDOW[Math.floor(Math.random() * optionsDOW.length)];

	var textos = [];
	for (var i = 0; i < 12; i++)
		textos.push(pretext.text);

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

	var text = textos[Math.floor(Math.random() * textos.length)];
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


	text = text.replaceAll("[TS-R<-]", "<t:" + Math.floor(prevActualDOW.getTime() / 1000) + ":R>");
	text = text.replaceAll("[TS-R->]", "<t:" + Math.floor(nextActualDOW.getTime() / 1000) + ":R>");
	text = text.replaceAll("[TS-D<-]", "<t:" + Math.floor(prevActualDOW.getTime() / 1000) + ":D>");
	text = text.replaceAll("[TS-D->]", "<t:" + Math.floor(nextActualDOW.getTime() / 1000) + ":D>");
	text = text.replaceAll("[TS-F]", "<t:" + Math.floor(nextActualDOW.getTime() / 1000) + ":F>");
	text = text.replaceAll("[td TS-D]", "<t:" + Math.floor(tod.getTime() / 1000) + ":D>");
	text = text.replaceAll("[td TS-R]", "<t:" + Math.floor(tod.getTime() / 1000) + ":R>");
	text = text.replaceAll("[td TS-F]", "<t:" + Math.floor(tod.getTime() / 1000) + ":F>");
	text = text.replaceAll("[tdMid TS-R]", "<t:" + Math.floor(todOnlyDate.getTime() / 1000) + ":R>");
	text = text.replaceAll("[tdMid TS-D]", "<t:" + Math.floor(todOnlyDate.getTime() / 1000) + ":D>");
	text = text.replaceAll("[tdMid TS-F]", "<t:" + Math.floor(todOnlyDate.getTime() / 1000) + ":F>");
	
	while (text.includes("[emotion]"))
		text = text.replace("[emotion]", emotions[Math.floor(Math.random() * emotions.length)]);
	
	while (text.includes("[game]"))
		text = text.replace("[game]", game[Math.floor(Math.random() * game.length)]);

	while (text.includes("[emotion2]"))
		text = text.replace("[emotion2]", emotion2[Math.floor(Math.random() * emotion2.length)]);

	while (text.includes("[person]"))	
		text = text.replace("[person]", persontype[Math.floor(Math.random() * persontype.length)]);	

	while (text.includes("[goodbye]"))
		text = text.replace("[goodbye]", bye[Math.floor(Math.random() * bye.length)]);

	while (text.includes("[emoji]"))
		text = text.replace("[emoji]", emoji[Math.floor(Math.random() * emoji.length)]);

	while (text.includes("[location]"))
		text = text.replace("[location]", localesz[Math.floor(Math.random() * localesz.length)]);

	while (text.includes("[l2]"))
		text = text.replace("[l2]", l2[Math.floor(Math.random() * l2.length)]);

	// text = text.replace("[emotion]", emotions[Math.floor(Math.random() * emotions.length)]);
	// text = text.replace("[emotion]", emotions[Math.floor(Math.random() * emotions.length)]);
	// text = text.replace("[game]", game[Math.floor(Math.random() * game.length)]);
	// text = text.replace("[emotion2]", emotion2[Math.floor(Math.random() * emotion2.length)]);
	// text = text.replace("[person]", persontype[Math.floor(Math.random() * persontype.length)]);
	// text = text.replace("[goodbye]", bye[Math.floor(Math.random() * bye.length)]);
	// text = text.replace("[emoji]", emoji[Math.floor(Math.random() * emoji.length)]);

	text = text.replaceAll("\\n", "\n");

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