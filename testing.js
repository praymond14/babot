// // const { babaUntilHolidays } = require("./commandFunctions");
// // const { LoadAllTheCache, StartDB } = require("./databaseVoiceController");

// // global.dbAccess = [!process.argv.includes("-db"), process.argv.includes("-db") ? false : true];

// // StartDB("Init");
// // LoadAllTheCache().then(() => {
// //     var evt = babaUntilHolidays("!baba wednesday christmas", { id: "360228104997961740" }, "04");
// //     console.log(evt);
// // });
// // async function checkForMorshus(text)
// // {
// // 	// check for {MORSHUIFY_AUDIO} or {MORSHUIFY_VIDEO}
// // 	// if found, replace all text after with morshu audio in 900 char chunks (split on spaces if possible)

// // 	if (text.includes("{MORSHUIFY_AUDIO}"))
// // 	{
// // 		var start = text.indexOf("{MORSHUIFY_AUDIO}");
// //         var end = text.length;
// //         var morshutext = text.substring(start, end);

// // 		text = text.replace(morshutext, "").trim();
// //         morshutext = morshutext.replaceAll("{MORSHUIFY_AUDIO}", "").trim();

// //         // split morshutext into 900 char chunks
// // 	}
// // }

// // checkForMorshus("Hello {MORSHUIFY_AUDIO} World!");
// // var text = "Baba works in 16 different 12345678901111-bit threads for 9000 years";

// // // Match either sequences of digits OR sequences of non-digit characters
// // var chunks = text.match(/(\d+|[^\d]+)/g);

// // // Trim spaces if you want (optional)
// // // chunks = chunks.map(chunk => chunk.trim()).filter(chunk => chunk.length > 0);

// // for (var i = 0; i < chunks.length; i++)
// // {
// // 	// if chunks is a number, and length is greater than 6 characters, split into numbers with spaces ex: 12345678 -> 1 2 3 4 5 6 7 8
// // 	if (!isNaN(chunks[i]) && chunks[i].length > 6)
// // 	{
// // 		var newStrng = "";
// // 		for (var j = 0; j < chunks[i].length; j++)
// // 		{
// // 			newStrng += chunks[i][j] + " ";
// // 		}
// // 		chunks[i] = newStrng.trim();
// // 	}
// // }

// // var text2 = chunks.join("");

// // console.log(text2);

// function readableTimeStamp(stampString)
// {
// 	var timestamp = stampString.match(/\d+/g);
// 	// make a date with the timestamp and offset by current timezone
// 	var date = new Date(parseInt(timestamp[0]) * 1000);
	
// 	// change the string based on the type of timestamp (:t, :T, :f, :F, :d, :D, :R)
// 	switch (stampString[stampString.length - 2])
// 	{
// 		case 't':
// 			return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });
// 		case 'T':
// 			return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric' });
// 		case 'f':
// 			return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
// 		case 'F':
// 			return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
// 		case 'd':
// 			return date.toLocaleDateString('en-US');
// 		case 'D':
// 			return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
// 		case 'R':
// 			// return relative time
// 			var now = new Date();
// 			var diff = date - now;
// 			var mins = Math.floor(diff / 60000);
// 			// if the date is in the past, return x seconds/minutes/hours/days ago
// 			// if the date is in the future, return in x seconds/minutes/hours/days
// 			// if the date is now, return just now
// 			if (mins < 0)
// 			{
// 				mins = Math.abs(mins);
// 				if (mins < 60)
// 				{
// 					return mins + " minutes ago";
// 				}
// 				else if (mins < 1440)
// 				{
// 					return Math.floor(mins / 60) + " hours ago";
// 				}
// 				else
// 				{
// 					return Math.floor(mins / 1440) + " days ago";
// 				}
// 			}
// 			else if (mins == 0)
// 			{
// 				return "Just now";
// 			}
// 			else
// 			{
// 				if (mins < 60)
// 				{
// 					return "In " + mins + " minutes";
// 				}
// 				else if (mins < 1440)
// 				{
// 					return "In " + Math.floor(mins / 60) + " hours";
// 				}
// 				else
// 				{
// 					return "In " + Math.floor(mins / 1440) + " days";
// 				}
// 			}
// 		default:
// 			return "Invalid timestamp type!";
// 	}
	
// }

// const text = "<t:1742856016:t> <t:1742856022:T> <t:1742856027:d> <t:1742856031:D> <t:1742856039:f> <t:1742856043:F> <t:1742956047:R>";

// const chunks = text.match(/<t:\d+:[tTfFdDR]>|[^<]+/g);

// for (var i = 0; i < chunks.length; i++)
// {
// 	// if chunks[i] is a timestamp, convert to human readable date
// 	if (chunks[i].includes("<t:"))
// 	{
// 		chunks[i] = readableTimeStamp(chunks[i]);
// 	}
// }

// console.log(chunks);



// var started = new Date(parseInt("1742869086840"));
// console.log(started);
// var now = new Date("2025-03-25T02:19:00.001Z");
// var percentageFromStartToEnd = (now - started) / (new Date("2025-03-25T03:19:00.001Z") - started);
// // convert the percentage to a color between green and red
// var green = Math.floor(255 * percentageFromStartToEnd);
// var red = Math.floor(255 * (1 - percentageFromStartToEnd));

// var redHex = red.toString(16);
// if (redHex.length == 1)
// 	redHex = "0" + redHex;

// var greenHex = green.toString(16);
// if (greenHex.length == 1)
// 	greenHex = "0" + greenHex;

// var colorString = "#" + redHex + greenHex + "00";
// console.log(colorString);


// var userNamedList = ["Isaac", "Baba", "Baba"];

// var userNamedListString = userNamedList.join(", ");
// if (userNamedList.length > 1)
// 	userNamedListString = userNamedListString.substring(0, userNamedListString.lastIndexOf(",")) + (userNamedList.length > 2 ? "," : "") + " and" + userNamedListString.substring(userNamedListString.lastIndexOf(",") + 1);
// else if (userNamedList.length == 1)
// 	userNamedListString = userNamedList[0];