import { createRequire } from "module";
const require = createRequire(import.meta.url);
import fs from "fs"; //file stream used for del fuction
var babadata = require('./babotdata.json'); //baba configuration file

export function GetSimilarName(namesearch, databaseofhaiku) //list of names based on person
{
	var bagohumans = []; // for the randomness
	for ( var x in databaseofhaiku.haikus)
	{
		var item = databaseofhaiku.haikus[x]; //get the item
		if (item.Person == namesearch)
		{
			var parthuman = item.DiscordName;
			if (!bagohumans.includes(parthuman))
			{
				bagohumans.push(parthuman); //add the name to the list
			}
		}
	}

	var num = Math.floor(Math.random() * bagohumans.length); //pick a random one
	var human = bagohumans[num];

	return human;
}

export function CreateHaikuDatabase(databaseofhaiku) //database of haikus making
{
	let rawdata = fs.readFileSync(babadata.datalocation + "haikus.json"); //load file
	let sheetjson = JSON.parse(rawdata);

	if (sheetjson.Data.length - 1 == databaseofhaiku.haikus.length) //skip if size is same is fine
		return;

	databaseofhaiku.haikus = [];
	databaseofhaiku.purity.date = [];
	databaseofhaiku.purity.person = [];
	databaseofhaiku.purity.channel = [];

	var ct = 0;

	for (const num in sheetjson.Data) // loop though data sheet
	{
		var x = sheetjson.Data[num];
		if (num > 0)
		{
			var item = {} //create the item
			item.Person = x.A;
			item.Haiku = x.B;
			item.HaikuFormat = x.C;
			item.DiscordName = x.D;
			item.Accident = x.E == "Yes";
			item.Channel = x.F;
			item.Date = x.H;

			UpdatePurityScore(x.A, x.F, x.H, item.Accident, databaseofhaiku);

			databaseofhaiku.haikus[ct] = item;
			ct++;
		}
	}

	for (const num in sheetjson.Accidental) // loop though data sheet
	{
		var x = sheetjson.Accidental[num];
		if (num > 0)
		{
			if (x.A)
				databaseofhaiku.purity.person[x.A].ID = x.B
			if (x.G)
				databaseofhaiku.purity.channel[x.G].ID = x.H
		}
	}
}

function UpdatePurityScore(person, channel, date, accidental, databaseofhaiku)
{
	//person
	if (databaseofhaiku.purity.person[person] == undefined)
	{
		databaseofhaiku.purity.person[person] = {Count: 0, Accidental: 0, ID: ""};
	}
	databaseofhaiku.purity.person[person].Count ++;
	databaseofhaiku.purity.person[person].Accidental += accidental ? 1 : 0;

	//channel
	if (databaseofhaiku.purity.channel[channel] == undefined)
	{
		databaseofhaiku.purity.channel[channel] = {Count: 0, Accidental: 0, ID: ""};
	}
	databaseofhaiku.purity.channel[channel].Count ++;
	databaseofhaiku.purity.channel[channel].Accidental += accidental ? 1 : 0;

	//date
	if (databaseofhaiku.purity.date[date] == undefined)
	{
		databaseofhaiku.purity.date[date] = {Count: 0, Accidental: 0};
	}
	databaseofhaiku.purity.date[date].Count ++;
	databaseofhaiku.purity.date[date].Accidental += accidental ? 1 : 0;
}

function compare( a, b ) 
{
	if (a.Count < b.Count)
	{
	  return 1;
	}
	if (a.Count > b.Count)
	{
	  return -1;
	}
	return 0;
  }

export function FormatPurityList(list, chan)
{
	var lists = [];
	for ( var x in list)
	{
		var lin = list[x];
		lin.Name = x;
		lists.push(lin);
	}

	lists.sort(compare);

	var retme = ""
	for ( var x in lists)
	{
		var lin = lists[x];
		retme += GenInfo(lin.Name, lin, chan) + "\n\n";
	}

	return retme;
}

export function GetHaikuPerPerson(person, databaseofhaiku)
{
	var pickfrom = [];
	for (var h in databaseofhaiku.haikus)
	{
		if (databaseofhaiku.haikus[h].Person == person)
			pickfrom.push(databaseofhaiku.haikus[h]);
	}

	var num = Math.floor(Math.random() * pickfrom.length);
	var haiku = pickfrom[num];

	return haiku;
}

export function GenInfo(x, line, chan)
{
	var pct = line.Accidental/parseFloat(line.Count); // purity percentage
	pct = (pct * 100)
	pct = +pct.toFixed(3);
	return x + (chan == 2 ? "" : " [<" + (chan == 1 ? "#" : "@") + line.ID + ">]") + "\n\t`" + line.Count + " Haikus` - `" + line.Accidental + " Accidental` - `" + pct + "% Purity`";
}