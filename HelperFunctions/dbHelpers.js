var babadata = require('../babotdata.json'); //baba configuration file
// var request = require('node-fetch');
// const Discord = require('discord.js'); //discord module for interation with discord api
const fs = require('fs');
// const images = require('images');
// const Jimp = require('jimp');
// const fetch = require('node-fetch');

// const options = { year: 'numeric', month: 'long', day: 'numeric' }; // for date parsing to string

var lookuptable = {};
global.reverseLook = {};

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

function loadInDBFSV()
{
	var rawdata = fs.readFileSync(babadata.datalocation + "comparisions.fsv", {encoding:'utf8', flag:'r'});
	//console.log(rawdata);
	var result = rawdata.split(/\r?\n/);
	for (var i = 1; i < result.length; i++)
	{
		var lnez = result[i].split("🐸");
		var actual = "";
		var atchually = "";
		for (var j = 1; j < lnez.length - 2; j++)
		{
			iteml = lnez[j].toLowerCase();

			if (j == 1) 
			{
				actual = iteml;
				atchually = lnez[j];
				if (global.reverseLook[lnez[j]] == undefined) global.reverseLook[lnez[j]] = [];
			}
			else
			{
				if (typeof lookuptable[iteml] == 'undefined' && iteml != actual)
				{
					lookuptable[iteml] = actual;
				}

				if (global.reverseLook[atchually] == undefined) global.reverseLook[atchually] = [];
					global.reverseLook[atchually].push(lnez[j]);
			}
		}
	}
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

module.exports = {
    sqlEscapeStringThingforAdamBecauseHeWillDoanSQLInjectionOtherwise,
    loadInDBFSV,
    normalizeMSG
};