const fs = require('fs');
var babadata = require('./babotdata.json'); //baba configuration file
var mysql = require('mysql2');
const { FindDate } = require('./HelperFunctions/basicHelpers.js');
const { error } = require('console');

var con;

var timeoutDisconnect = null;
var timeoutClear = null;

var timeoutCT = 0;

function validErrorCodes(err)
{
	var catchCodes = ["ETIMEDOUT", "ER_HOST_NOT_PRIVILEGED"];
	return catchCodes.includes(err);
}

function handleDisconnect(print) 
{
	if (timeoutCT == 0) 
	{
		console.log("Cleaning Timeouts in handleDisconnect");
		global.dbAccess[0] = true;

		if (timeoutDisconnect != null) clearTimeout(timeoutDisconnect);
		if (timeoutClear != null) clearTimeout(timeoutClear);

		timeoutDisconnect = null;
		timeoutClear = null;

		if (global.dbAccess[1] && global.dbAccess[0])
		{
			clearVCCList();
		}
	}

	console.log(print + " - Starting Database Connection");
	con = mysql.createConnection({
		host: babadata.database.host,
		user: babadata.database.user,
		password: babadata.database.password,
		database: babadata.database.database,
		port: babadata.database.port,
		charset : 'utf8mb4_general_ci'
	});

	con.on('error', function(err) 
	{
		//console.log('db error', err);
		if (validErrorCodes(err.code))
		{
			timeoutCT++;
			var timestring = new Date().toLocaleTimeString();
			console.log("Timeout CT: " + timeoutCT + " - " + timestring);
			if (timeoutCT >= 5)
			{
				if (timeoutClear != null) clearTimeout(timeoutClear);
				console.log("Too many timeouts, entering minutely check mode");
				global.dbAccess[0] = false;
				timeoutDisconnect = setTimeout(handleDisconnect, 60000, err.code);
				timeoutClear = setTimeout(function() 
				{ 
					timeoutCT = 0; 
					global.dbAccess[0] = true; 
					console.log("Database Access Restored");

					if (global.dbAccess[1] && global.dbAccess[0])
					{
						clearVCCList();
					}
				}, 90000);
			}
			else
				handleDisconnect(err.code);
		}
		else
		{
			timeoutCT = 0;
			handleDisconnect(err.code);
		}
	});
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

function FormatPurityList(resultList, type, pagestuff)
{
	var listsFull = [];

	var returns = [];

	for (var x in resultList)
	{
		listsFull[x] = {};
		listsFull[x].Name = resultList[x].Name;
		listsFull[x].Count = resultList[x].Count;
		listsFull[x].Accidental = resultList[x].Accidental;
		listsFull[x].Purity = resultList[x].Purity;
		listsFull[x].ID = resultList[x].ID;
	}

	listsFull.sort(compare);

    var pagetotal = Math.ceil(listsFull.length/ pagestuff.ipp);

	for (var pp = 0; pp < pagetotal; pp++)
	{
		var lists = [];
		for (var i = 0; i < listsFull.length; i++)
		{
			var pagelocal = Math.floor(i / pagestuff.ipp);
			if (pagelocal == pp)
			{
				lists.push(listsFull[i]);
			}
		}
		
		var retme = ""
		for (var x in lists)
		{
			var lin = lists[x];
			retme += GenInfo(lin, type);

			if (x < lists.length - 1)
				retme += "\n\n";
		}

		returns.push(retme);
	}

	return {"retstring": returns, "total": listsFull.length};
}

const options = { year: 'numeric', month: 'long', day: 'numeric' }; // for date parsing to string

function GenInfo(line, type)
{
	// if (type == 2) line.Name = line.Name.toLocaleDateString('en-US', options);
	if (type == 2) line.Name = "<t:" + line.Name.getTime() / 1000 + ":D>";
	line.Purity = +Number(line.Purity).toFixed(3);
	return line.Name + (type == 2 ? "" : " [<" + (type == 1 ? "#" : "@") + line.ID + ">]") + "\n\t`" + line.Count + " Haikus` - `" + line.Accidental + " Accidental` - `" + line.Purity + "% Purity`";
}

// HPL = Haiku Purity List

function HPLGenChannel(callback)
{
	if (timeoutCT > 0) return callback(null);
	
	con.query("SELECT ChannelName as Name, haiku.ChannelID as ID, Count(*) as Count, SUM(IF(Accidental = '1', 1, 0)) as Accidental, SUM(IF(Accidental = '1', 1, 0))/COUNT(Accidental) * 100 As Purity FROM haiku Left Join channelval on haiku.ChannelID = channelval.ChannelID Group by haiku.ChannelID", function (err, result) 
	{
		if (err) 
		{
			console.log(err);
			throw err;
		}
		return callback(result);
	});
}

function HPLGenUsers(callback)
{
	if (timeoutCT > 0) return callback(null);

	con.query("SELECT haiku.PersonName as Name, DiscordID as ID, Count(*) as Count, SUM(IF(Accidental = '1', 1, 0)) as Accidental, SUM(IF(Accidental = '1', 1, 0))/COUNT(Accidental) * 100 As Purity FROM haiku Left Join userval on haiku.PersonName = userval.PersonName Group by haiku.PersonName", function (err, result) 
	{
		if (err)
		{
			if (validErrorCodes(err.code))
			{
				EnterDisabledMode();
				return;
			}
			else
				throw err;
		}
		return callback(result);
	});
}

function HPLGenD8(callback)
{
	if (timeoutCT > 0) return callback(null);

	con.query("SELECT date as Name, Count(*) as Count, SUM(IF(Accidental = '1', 1, 0)) as Accidental, SUM(IF(Accidental = '1', 1, 0))/COUNT(Accidental) * 100 As Purity FROM haiku Group by date order by count desc, purity desc, name desc", function (err, result) 
	{
		if (err)
		{
			if (validErrorCodes(err.code))
			{
				EnterDisabledMode();
				return;
			}
			else
				throw err;
		}
		return callback(result);
	});
}

function searchPerson(msgContent)
{
	return ` LOWER(haiku.PersonName) in (Select distinct LOWER(PersonName) from haiku Where Lower("` + msgContent + `") LIKE CONCAT("%", Lower(DiscordName), "%"))
	or LOWER(haiku.PersonName) in (SELECT Lower(PersonName) FROM userval Left join alteventnames on BirthdayEventID = EventID Where Lower("` + msgContent + `") LIKE CONCAT("%", Lower(EventName), "%"))
	or Lower("` + msgContent + `") LIKE CONCAT("%", Lower(DiscordID), "%") 
	or Lower("` + msgContent + `") LIKE CONCAT("%", Lower(haiku.PersonName), "%")`;
}

function searchChannel(msgContent)
{
	return ` Lower('` + msgContent + `') LIKE CONCAT('%', Lower(channelName), '%')
	or Lower('` + msgContent + `') LIKE CONCAT('%', Lower(haiku.ChannelID), '%')`;
}

function searchDate(msgContent)
{
	return ` CONCAT("%", Lower(date), "%") REGEXP '` + msgContent + `'`;
}

function searchKeyword(msgContent)
{
	var addquery = [];

	var words = msgContent.split(" ");
	for (var x in words)
	{
		addquery.push(`Lower(haiku) Like CONCAT("%", Lower("` + words[x] + `"), "%")`)
	}

	return addquery.join(" AND ");
}

function HPLSelectChannel(callback, msgContent)
{
	if (timeoutCT > 0) return callback(null);

	con.query(`SELECT ChannelName as Name, haiku.ChannelID as ID, Count(*) as Count, SUM(IF(Accidental = '1', 1, 0)) as Accidental, SUM(IF(Accidental = '1', 1, 0))/COUNT(Accidental) * 100 As Purity FROM haiku 
	Left Join channelval on haiku.ChannelID = channelval.ChannelID 
	Where ` + searchChannel(msgContent) + 
	` Group by haiku.ChannelID`, function (err, result)
	{
		if (err)
		{
			if (validErrorCodes(err.code))
			{
				EnterDisabledMode();
				return;
			}
			else
				throw err;
		}
		return callback(result);
	});
}

function HPLSelectDate(callback, msgContent)
{
	if (timeoutCT > 0) return callback(null);
	
	con.query(`SELECT date as Name, Count(*) as Count, SUM(IF(Accidental = '1', 1, 0)) as Accidental, SUM(IF(Accidental = '1', 1, 0))/COUNT(Accidental) * 100 As Purity FROM haiku 
	Where `+ searchDate(msgContent) +
	`Group by date`, function (err, result)
	{
		if (err)
		{
			if (validErrorCodes(err.code))
			{
				EnterDisabledMode();
				return;
			}
			else
				throw err;
		}
		return callback(result);
	});
}

function HPLSelectUser(callback, msgContent)
{
	if (timeoutCT > 0) return callback(null);
	
	con.query(`SELECT haiku.PersonName as Name, DiscordID as ID, Count(*) as Count, SUM(IF(Accidental = '1', 1, 0)) as Accidental, SUM(IF(Accidental = '1', 1, 0))/COUNT(Accidental) * 100 As Purity FROM haiku 
	Left Join userval on haiku.PersonName = userval.PersonName
	Where ` + searchPerson(msgContent) +
	` Group by haiku.PersonName`, function (err, result)
	{
		if (err)
		{
			if (validErrorCodes(err.code))
			{
				EnterDisabledMode();
				return;
			}
			else
				throw err;
		}
		return callback(result);
	});
}

function HaikuSelection(callback, by, msgContent)
{
	if (timeoutCT > 0) return callback(null);
	
	var query = `SELECT * FROM haiku
	Left Join userval on haiku.PersonName = userval.PersonName 
	Left Join channelval on haiku.ChannelID = channelval.ChannelID`
	if (by == 1)
		query += " WHERE " + searchPerson(msgContent);
	else if (by == 2)
	{
		query += " WHERE " + searchChannel(msgContent);
	}
	else if (by == 3)
	{
		var IsDate = FindDate(msgContent, true);
		if (IsDate != null)
		{
			var year = IsDate.year;
			var month = IsDate.month;
			var day = IsDate.day;
			
			var mpre = month < 10 ? 0 : "";
			var dpre = day < 10 ? 0 : "";

			var ys = year == 0 ? ".*" : year;
			var ms = month == 0 ? ".*" : mpre + "" + month;
			var ds = day == 0 ? ".*" : dpre + "" + day;

			query += " WHERE " + searchDate(`${ys}-${ms}-${ds}`);
		}
		else return callback(null);
	}
	else if (by == 4)
	{
		var sd = msgContent[0];
		var startDate = null;
		var ed = msgContent[1];
		var endDate = null;
		var chan = msgContent[2];
		var pson = msgContent[3];
		var kword = msgContent[4];

		var addquery = [];

		if (sd != null)
			startDate = FindDate(sd, true);
		if (ed != null)
			endDate = FindDate(ed, true);

		if (startDate == null && endDate != null) 
		{
			startDate = endDate;
			endDate = null;
		}

		if (startDate != null)
		{
			var d1 = new Date(startDate.year, startDate.month - 1, startDate.day);
			var mpre1 = d1.getMonth() + 1 < 10 ? 0 : "";
			var dpre1 = d1.getUTCDate() < 10 ? 0 : "";
			if (endDate != null)
			{
				startDate = FindDate(sd);
				endDate = FindDate(ed);
				d1 = new Date(startDate.year, startDate.month - 1, startDate.day);
				mpre1 = d1.getMonth() + 1 < 10 ? 0 : "";
				dpre1 = d1.getUTCDate() < 10 ? 0 : "";

				var d2 = new Date(endDate.year, endDate.month - 1, endDate.day);
				var mpre2 = d2.getMonth() + 1 < 10 ? 0 : "";
				var dpre2 = d2.getUTCDate() < 10 ? 0 : "";

				var d1form = `${d1.getFullYear()}-${mpre1}${d1.getMonth() + 1}-${dpre1}${d1.getUTCDate()}`
				var d2form = `${d2.getFullYear()}-${mpre2}${d2.getMonth() + 1}-${dpre2}${d2.getUTCDate()}`

				if (endDate < startDate)
				{
					var temp = startDate;
					startDate = endDate;
					endDate = temp;
				}

				var q = ` date BETWEEN "${d1form}" AND "${d2form}"`
				addquery.push("(" + q + ")");
			}
			else
			{
				mpre1 = startDate.month < 10 ? 0 : "";
				dpre1 = startDate.day < 10 ? 0 : "";
				
				vosl = [];
				if (startDate.year != 0)
					vosl.push(`${startDate.year}-`);
				
				if (startDate.month != 0)
					vosl.push(`-${mpre1}${startDate.month}_`);

				if (startDate.day != 0)
					vosl.push(`_${dpre1}${startDate.day}`);

				volsconct = vosl.join("");

				volsconct = volsconct.replace(/--/g, "-");
				volsconct = volsconct.replace(/__/g, "_");
				volsconct = volsconct.replace(/_/g, "-");

				var volsplit = volsconct.split("--");

				if (volsplit.length > 1)
				{
					volsplit[0] += "-";
					volsplit[1] = "-" + volsplit[1];
				}

				//add all to query
				for (var x in volsplit)
				{
					addquery.push("(" + searchDate(volsplit[x]) + ")");
				}
				
				// addquery.push("(" + searchDate(`${d1.getFullYear()}-${mpre1}${d1.getMonth() + 1}-${dpre1}${d1.getUTCDate()}`) + ")");
			}
		}
		else if (sd != null)
		{
			startDate = FindDate(sd, true);
			if (startDate != null)
			{
				var year = startDate.year;
				var month = startDate.month;
				var day = startDate.day;
				
				var mpre = month < 10 ? 0 : "";
				var dpre = day < 10 ? 0 : "";
	
				var ys = year == 0 ? ".*" : year;
				var ms = month == 0 ? ".*" : mpre + "" + month;
				var ds = day == 0 ? ".*" : dpre + "" + day;
	
				query += " WHERE " + searchDate(`${ys}-${ms}-${ds}`);
			}
		}

		if (chan != null)
			addquery.push("(" + searchChannel(chan) + ")");

		if (pson != null)
			addquery.push("(" + searchPerson(pson) + ")");

		if (kword != null)
			addquery.push("(" + searchKeyword(kword) + ")");

		if (addquery.length)
			query += " WHERE ";

		query += addquery.join(" AND ");

		if (msgContent[5] == "purity")
		{
			var pMode = msgContent[6];
			var queueueueu = "SELECT " + (pMode == "chans" ? "ChannelName" : (pMode == "users" ? "haiku.PersonName" : "date"))
			queueueueu += " as Name";
			queueueueu += (pMode == "chans" ? ", haiku.ChannelID as ID" : (pMode == "users" ? ", DiscordID as ID" : ""))
			queueueueu += ", Count(*) as Count, SUM(IF(Accidental = '1', 1, 0)) as Accidental, SUM(IF(Accidental = '1', 1, 0))/COUNT(Accidental) * 100 As Purity FROM haiku";

			queueueueu += `
			Left Join userval on haiku.PersonName = userval.PersonName 
			Left Join channelval on haiku.ChannelID = channelval.ChannelID`;

			if (addquery.length)
				queueueueu += " WHERE ";

			queueueueu += addquery.join(" AND ");

			queueueueu += " " + (pMode == "chans" ? "Group by haiku.ChannelID" : (pMode == "users" ? "Group by haiku.PersonName" : "Group by date"));
			queueueueu += " order by count desc, purity desc, name desc";

			console.log(queueueueu);
			con.query(queueueueu, function (err, result) 
			{
				if (err)
				{
					if (validErrorCodes(err.code))
					{
						EnterDisabledMode();
						return;
					}
					else
						throw err;
				}
				return callback(result);
			});
			return;
		}
	}
	else if (by == 5)
	{
		query += " WHERE (" + searchKeyword(msgContent) + ")";
	}

	// query += " Where haiku.Index = 540";

	console.log(query);

	con.query(query, function (err, result)
	{
		if (err)
		{
			if (validErrorCodes(err.code))
			{
				EnterDisabledMode();
				return;
			}
			else
				throw err;
		}
		
		if (by == 6)
		{
			var object = {};
			object.PersonName = "No One";
			object.HaikuFormatted = "";
			object.DiscordName = "No One";
			object.Date = new Date();
			object.ChannelName = "No Channel";
			object.Accidental = 1;

			var fives = [];
			var sevens = [];

			for (var x in result)
			{
				result[x].HaikuFormatted = result[x].HaikuFormatted.replace(/(\r\n|\n|\r)/gm, "\r\n");

				//split on \r\n
				var lines = result[x].HaikuFormatted.split("\r\n");

				// trim start and end whitespace
				for (var i = 0; i < lines.length; i++)
				{
					lines[i] = lines[i].trim();
				}
				
				// remove blank lines
				lines = lines.filter(function (el) {
					return el != "";
				});
				
				fives.push(lines[0]);
				sevens.push(lines[1]);
				fives.push(lines[2]);
			}

			var thefive = fives[Math.floor(Math.random() * fives.length)];
			var theseven = sevens[Math.floor(Math.random() * sevens.length)];
			var thefive2 = fives[Math.floor(Math.random() * fives.length)];

			var retme = thefive + "\r\n\r\n" + theseven + "\r\n\r\n" + thefive2;

			object.HaikuFormatted = retme;
			return callback([object], null);
		}

		if (result.length == 0) return callback(null);

        var num = Math.floor(Math.random() * result.length);
        var haiku = [result[num]];

		if (by == 4 && msgContent[5] == "all")
		{
			haiku = result;
			return callback(haiku, null);
		}

		var qq = `SELECT Distinct DiscordName FROM haiku where Lower(PersonName) = Lower("` + haiku[0].PersonName + `");`;

		con.query(qq, function (err2, result2)
		{
			if (err2)
			{
				if (validErrorCodes(err.code))
				{
					EnterDisabledMode();
					return;
				}
				else
					throw err2;
			}
			return callback(haiku, result2);
		});
	});
}


function ObtainDBHolidays(callback)
{
	con.query("SELECT * FROM event left join alteventnames on event.EventID = alteventnames.EventID;", function (err, result) 
	{
		if (err)
		{
			if (validErrorCodes(err.code))
			{
				EnterDisabledMode();
				return;
			}
			else
				throw err;
		}
		var retme = {};
		for (var i = 0; i < result.length; i++)
		{
			var retter = retme;
			if (result[i].ParentEventID != null) retter = GetParent(retme, result[i].ParentEventID);
			var e = retter[result[i].EventRealName];
			if (e == undefined)
			{
				retter[result[i].EventRealName] = {};
				e = retter[result[i].EventRealName];
				e.safename = result[i].EventFrogName;
				e.mode = result[i].Mode;
				e.id = result[i].EventID;
	
				if (result[i].Day != null) e.day = result[i].Day;
				if (result[i].Month != null) e.month = result[i].Month;
				if (result[i].Week != null) e.week = result[i].Week;
				if (result[i].DOW != null) e.dayofweek = result[i].DOW;
	
				e.name = [];

				if (e.mode == -1) e.sub = {};
			}
			e.name.push(result[i].EventName);
		}
		return callback(retme);
	});
}

function NameFromUserIDID(id)
{
	var xxx = "";

	return new Promise((resolve, reject) =>
	{
		con.query(
			`SELECT PersonName FROM userval
			 WHERE DiscordID = "${id}"`,
			function (err, result)
			{
				if (err)
				{
					if (validErrorCodes(err.code))
					{
						EnterDisabledMode();
						return;
					}
					else
						throw err;
				}
				resolve(result);
			}
		);
	});
}

function NameFromUserID(callback, user)
{
	con.query(
		`SELECT PersonName FROM userval
		 WHERE DiscordID = "${user.id}"`,
		function (err, result)
		{
			if (err)
			{
				if (validErrorCodes(err.code))
				{
					EnterDisabledMode();
					return;
				}
				else
					throw err;
			}
			return callback(result);
		}
	);
}

function GetParent(retme, id)
{
	for (var x in retme)
	{
		if (retme[x].id == id) return retme[x].sub;
	}
	return retme;
}

var cleanupFn = function cleanup() 
{
	if ((global.dbAccess[1] && global.dbAccess[0]))
	{
		console.log("Ending SQL Connection");
		con.end();
	}

	if (timeoutClear != null)
	{
		console.log("Clearing Timeout - DB Reconnecter");
		clearTimeout(timeoutClear);
	}
	if (timeoutDisconnect != null)
	{
		console.log("Clearing Timeout - DB Checker");
		clearTimeout(timeoutDisconnect);
	}
}

function userVoiceChange(queryz, userID, channelID, guild)
{
	con.query(
		queryz,
		function (err, result)
		{
			if (err && err.sqlMessage.includes("voiceactivity_ibfk_1"))
			{
				console.log("Error: " + err.sqlMessage);
				guild.channels.fetch(channelID)
				.then(channel => checkAndCreateChannel(channelID, channel.name, function() 
				{
					userVoiceChange(queryz, userID, channelID, guild);
				}))
				.catch(console.error);
			}
			else if (err && err.sqlMessage.includes("voiceactivity_ibfk_2"))
			{
				console.log("Error: " + err.sqlMessage);
				guild.members.fetch(userID)
				.then(user => checkAndCreateUser(userID, user.user.username, function() 
				{
					userVoiceChange(queryz, userID, channelID, guild);
				}))
				.catch(console.error);
			}
			else
			{
				if (err)
				{
					if (validErrorCodes(err.code))
					{
						EnterDisabledMode();
						return;
					}
					else
						throw err;
				}
			}		
		}
	);
}

function userJoinedVoice(newUserID, newUserChannel, guild, overideDate = null)
{
	var dt = overideDate == null ? new Date() : overideDate;
	var dtsrart = dt.toISOString().slice(0, 19).replace('T', ' ');
	var q = `INSERT INTO voiceactivity (ChannelID, UserID, StartTime) VALUES ("${newUserChannel}", "${newUserID}", "${dtsrart}")`;
	userVoiceChange(q, newUserID, newUserChannel, guild);
}

function userLeftVoice(oldUserID, oldUserChannel, guild, overideDate = null)
{
	var dt = overideDate == null ? new Date() : overideDate;
	var dtsrart = dt.toISOString().slice(0, 19).replace('T', ' ');
	var q = `UPDATE voiceactivity SET EndTime = "${dtsrart}" WHERE UserID = "${oldUserID}" AND ChannelID = "${oldUserChannel}" AND EndTime IS NULL`;
	userVoiceChange(q, oldUserID, oldUserChannel, guild);
}

function checkUserVoiceCrash(userID, channelID, guild)
{
	con.query(`Select * from voiceactivity where UserID = "${userID}" AND ChannelID = "${channelID}" AND EndTime IS NULL`,
		function (err, result)
		{
			if (err)
			{
				if (validErrorCodes(err.code))
				{
					EnterDisabledMode();
					return;
				}
				else
					throw err;
			}
			if (result.length == 0)
			{
				userJoinedVoice(userID, channelID, guild);
			}
		}
	);
}

function checkAndCreateUser(userID, userName, callback)
{
	con.query(`Select * from userval where DiscordID = "${userID}"`,
		function (err, result)
		{
			if (err)
			{
				if (validErrorCodes(err.code))
				{
					EnterDisabledMode();
					return;
				}
				else
					throw err;
			}
			if (result.length == 0)
			{
				con.query(`INSERT INTO userval (DiscordID, PersonName) VALUES ("${userID}", "${userName}")`,
					function (err, result)
					{
						if (err && err.sqlMessage.includes("voiceactivity_ibfk_2"))
							console.log("Repeat User Error: " + err.sqlMessage);
						return callback();
					}
				);
			}
		}
	);
}

function checkAndCreateChannel(channelID, channelName, callback)
{
	con.query(`Select * from channelval where ChannelID = "${channelID}"`,
		function (err, result)
		{
			if (err)
			{
				if (validErrorCodes(err.code))
				{
					EnterDisabledMode();
					return;
				}
				else
					throw err;
			}
			if (result.length == 0)
			{
				console.log("Creating channel: " + channelID + " " + channelName);
				con.query(
					`INSERT INTO channelval (ChannelID, ChannelName, Type) VALUES ("${channelID}", "${channelName}", "Voice")`,
					function (err, result)
					{
						if (err)
						{
							if (validErrorCodes(err.code))
							{
								EnterDisabledMode();
								return;
							}
							else
								throw err;
						}
						return callback();
					}
				);
			}
		}
	);
}

function optIn(user, type, callback)
{
	con.query(
		`UPDATE opting Set Val='in' WHERE DiscordID = "${user.id}" AND ItemToRemove = "${type}"`,
		function (err, result)
		{
			if (err)
			{
				if (validErrorCodes(err.code))
				{
					EnterDisabledMode();
					return;
				}
				else
					throw err;
			}
			if (result.affectedRows == 0)
			{
				con.query(
					`INSERT INTO opting (DiscordID, ItemToRemove, Val) VALUES ("${user.id}", "${type}", "in")`,
					function (err, result)
					{
						if (err)
						{
							if (validErrorCodes(err.code))
							{
								EnterDisabledMode();
								return;
							}
							else
								throw err;
						}
						cacheOpts();
						return callback();
					}
				);
			}
			else
			{
				cacheOpts();
				return callback();
			}
		}
	);
}

function optOut(user, type, callback)
{
	con.query(
		`UPDATE opting Set Val='out' WHERE DiscordID = "${user.id}" AND ItemToRemove = "${type}"`,
		function (err, result)
		{
			if (err)
			{
				if (validErrorCodes(err.code))
				{
					EnterDisabledMode();
					return;
				}
				else
					throw err;
			}

			if (result.affectedRows == 0)
			{
				con.query(
					`INSERT INTO opting (DiscordID, ItemToRemove, Val) VALUES ("${user.id}", "${type}", "out")`,
					function (err, result)
					{
						if (err)
						{
							if (validErrorCodes(err.code))
							{
								EnterDisabledMode();
								return;
							}
							else
								throw err;
						}
						cacheOpts();
						return callback();
					}
				);
			}
			else 
			{
				cacheOpts();
				return callback();
			}
		}
	);
}

function endLeftUsersCrash(onlineusers, guild)
{
	con.query(`Select * from voiceactivity where EndTime IS NULL`,
	function (err, result)
	{
		if (err)
		{
			if (validErrorCodes(err.code))
			{
				EnterDisabledMode();
				return;
			}
			else
				throw err;
		}
		for (var i = 0; i < result.length; i++)
		{
			var res = result[i];
			if (!onlineusers.includes(res.UserID + "-" + res.ChannelID))
			{
				userLeftVoice(res.UserID, res.ChannelID, guild);
			}
		}
	}
	);
}

function cacheDOW()
{
	con.ping(function (err) 
	{
		if(err) 
		{
			console.log("Could not load the baba DB Cache!");
			handleDisconnect("CacheDOW");
			return;
		}
  	});

	global.channelCache = {};
	con.query(`Select * from channelval`,
		function (err, result)
		{
			if (err)
			{
				if (validErrorCodes(err.code))
				{
					EnterDisabledMode();
					return;
				}
				else
					throw err;
			}

			for (var i = 0; i < result.length; i++)
			{
				var res = result[i];
				global.channelCache[res.ChannelID] = res.ChannelName;
			}
		}
	);

	global.userCache = {};
	con.query(`Select * from userval`,
		function (err, result)
		{
			if (err)
			{
				if (validErrorCodes(err.code))
				{
					EnterDisabledMode();
					return;
				}
				else
					throw err;
			}
			
			for (var i = 0; i < result.length; i++)
			{
				var res = result[i];
				global.userCache[res.DiscordID] = res.PersonName;
			}
		}
	);

	con.query(`Select * from dow`,
	function (err, result)
		{
			if (err)
			{
				if (validErrorCodes(err.code))
				{
					EnterDisabledMode();
					return;
				}
				else
					throw err;
			}
			var adam = {};
			for (var i = 0; i < result.length; i++)
			{
				var res = result[i];
				adam[res.date] = {};
				adam[res.date].Probaility = res.probablilty;
				adam[res.date].Items = [];
				adam[res.date].Start = res.starttime;
				adam[res.date].End = res.endtime;
			}

			con.query(`Select * from dowitems`,
			function (err, result)
				{
					if (err)
					{
						if (validErrorCodes(err.code))
						{
							EnterDisabledMode();
							return;
						}
						else
							throw err;
					}
					for (var i = 0; i < result.length; i++)
					{
						var res = result[i];
						var itm = {};
						itm.Name = res.name;
						itm.Occurances = res.occ;
						
						adam[res.dow].Items.push(itm);
					}

					var data = JSON.stringify(adam);
					fs.writeFileSync(babadata.datalocation + "/DOWItems.json", data);
				}
			);
		}
	);

	con.query(`Select * from fridaynestedloops`,
	function (err, result)
		{
			var opts = [];
			if (err)
			{
				if (validErrorCodes(err.code))
				{
					EnterDisabledMode();
					return;
				}
				else
					throw err;
			}
			for (var i = 0; i < result.length; i++)
			{
				var res = result[i];
				text = res.text;
				var resj = 
				{
					"UID": res.UID,
					"text": text,
					"group": res.group,
					"weight": res.weight,
				}

				opts.push(resj);
			}

			// var data = JSON.stringify(opts);

			// fs.writeFileSync(babadata.datalocation + "/FridayLoops.json", data);
			// let rawloops = fs.readFileSync(babadata.datalocation + "/FridayLoops.json");

			var fridLoops = opts
		
			var replacements = {};
			var replacementsWeights = {};
			for (var i = 0; i < fridLoops.length; i++)
			{
				if (replacements[fridLoops[i].group] == null)
				{
					replacements[fridLoops[i].group] = [];
					replacementsWeights[fridLoops[i].group] = {"min": 1}
				}
		
				if (fridLoops[i].weight < replacementsWeights[fridLoops[i].group].min)
					replacementsWeights[fridLoops[i].group].min = fridLoops[i].weight;
		
			}
			
			for (var i = 0; i < fridLoops.length; i++)
			{
				gWeight = replacementsWeights[fridLoops[i].group].min;
				insertCount = gWeight == 1 ? fridLoops[i].weight : Math.floor((1 / gWeight) * fridLoops[i].weight);
		
				for (var j = 0; j < insertCount; j++)
					replacements[fridLoops[i].group].push({"text": fridLoops[i].text, "UID": fridLoops[i].UID});
			}

			// save to a json file -- testing dont delete shane like you love to delete these things, i saw what you did that one time
			//var data = JSON.stringify(replacements);
			//fs.writeFileSync(babadata.datalocation + "/FridayLoops.json", data);

			global.replacements = replacements;
		}
	);

	con.query(`Select * from frog`,
	function (err, result)
		{
			var opts = [];
			if (err)
			{
				if (validErrorCodes(err.code))
				{
					EnterDisabledMode();
					return;
				}
				else
					throw err;
			}
			for (var i = 0; i < result.length; i++)
			{
				var res = result[i];
				text = res.froglink;
				var resj = 
				{
					"text": text,
					"enabledDef": res.enabled,
					"IDS": res.overideIDs
				}

				opts.push(resj);
			}

			var data = JSON.stringify(opts);

			fs.writeFileSync(babadata.datalocation + "/FROGcache.json", data);
		}
	);

	con.query(`Select * from dowfunny`,
	function (err, result)
		{
			var opts = [];
			if (err)
			{
				if (validErrorCodes(err.code))
				{
					EnterDisabledMode();
					return;
				}
				else
					throw err;
			}
			for (var i = 0; i < result.length; i++)
			{
				var res = result[i];
				text = res.text;
				if (res.text2 != null)
				{
					text += " " + res.text2;
				}

				var resj = 
				{
					"UID": res.UID,
					"text": text,
					"enabledDef": res.enabled,
					"IDS": res.overideIDs,
					"h1": res.h1,
					"h2": res.h2,
					"h3": res.h3
				}

				opts.push(resj);
			}

			var data = JSON.stringify(opts);

			fs.writeFileSync(babadata.datalocation + "/DOWcache.json", data);
		}
	);
	
	con.query(`Select * from frogcontrol`,
	function (err, result)
		{
			var opts = [];
			if (err)
			{
				if (validErrorCodes(err.code))
				{
					EnterDisabledMode();
					return;
				}
				else
					throw err;
			}
			for (var i = 0; i < result.length; i++)
			{
				var res = result[i];

				var resj = 
				{
					"ID": res.IDFROGControl,
					"Control": res.controlLevel
				}

				opts.push(resj);
			}

			var data = JSON.stringify(opts);

			fs.writeFileSync(babadata.datalocation + "/FROGcontrol.json", data);
		}
	);
	
	con.query(`Select * from dowcontrol`,
	function (err, result)
		{
			var opts = [];
			if (err)
			{
				if (validErrorCodes(err.code))
				{
					EnterDisabledMode();
					return;
				}
				else
					throw err;
			}
			for (var i = 0; i < result.length; i++)
			{
				var res = result[i];

				var resj = 
				{
					"ID": res.IDDOWControl,
					"Control": res.controlLevel
				}

				opts.push(resj);
			}

			var data = JSON.stringify(opts);

			fs.writeFileSync(babadata.datalocation + "/DOWcontrol.json", data);
		}
	);
}

function controlDOW(id, level, prefix)
{
	var lcx = prefix.toLowerCase();
	con.query(`Select * from ${lcx}control where ID${prefix}Control = "${id}"`,
	function (err, result)
		{
			if (err)
			{
				if (validErrorCodes(err.code))
				{
					EnterDisabledMode();
					return;
				}
				else
					throw err;
			}
			if (result.length == 0)
			{
				con.query(`INSERT INTO ${lcx}control (ID${prefix}Control, controlLevel) VALUES ("${id}", "${level}")`,
				function (err, result)
					{
						if (err)
						{
							if (validErrorCodes(err.code))
							{
								EnterDisabledMode();
								return;
							}
							else
								throw err;
						}
						cacheDOW();
					}
				);
			}
			else
			{
				con.query(`UPDATE ${lcx}control Set controlLevel = "${level}" WHERE ID${prefix}Control = "${id}"`,
				function (err, result)
					{
						if (err)
						{
							if (validErrorCodes(err.code))
							{
								EnterDisabledMode();
								return;
							}
							else
								throw err;
						}
						cacheDOW();
					}
				);
			}
		}
	);
}

function cacheOpts(callback)
{
	con.query(`Select * from opting`,
		function (err, result)
		{
			var opts = [];
			if (err)
			{
				if (validErrorCodes(err.code))
				{
					EnterDisabledMode();
					return;
				}
				else
					throw err;
			}
			
			for (var i = 0; i < result.length; i++)
			{
				var res = result[i];
				var resj = {
					"DiscordID": res.DiscordID,
					"Item": res.ItemToRemove,
					"Opt": res.Val
				}
				opts.push(resj);
			}

			var data = JSON.stringify(opts);

			fs.writeFileSync(babadata.datalocation + "/optscache.json", data);
			
			if (callback)
				return callback();
		}
	);
}

function saveSlashFridayJson(testingOveride = false)
{
	var retVal = "Friday Counter has not been updated, as it is Empty";
	// if fridayCounter.json doesn't exist, create it
	if (!fs.existsSync(babadata.datalocation + "/fridayCounter.json"))
	{
		fs.writeFileSync(babadata.datalocation + "/fridayCounter.json", "");
	}

	// check for db access
	if ((global.dbAccess[1] && global.dbAccess[0]))
	{
		// check if /fridayCounter.json has any data
		// if it does, save it to the database
		// then clear the file
		// if it doesn't, do nothing

		var fridayCounterJson = fs.readFileSync(babadata.datalocation + "/fridayCounter.json");
		if (fridayCounterJson.length > 0)
		{
			if (testingOveride && babadata.testing !== undefined)
			{
				IncrementFridayCounter(fridayCounterJson);
				retVal = "Friday Counter Updated (Testing Overide)";
			}

			// save to database
			if (babadata.testing === undefined)
			{
				console.log("Saving Friday Counter to Database");
				IncrementFridayCounter(fridayCounterJson);
				retVal = "Friday Counter Updated";
				// clear the file
				fs.writeFileSync(babadata.datalocation + "/fridayCounter.json", "");
			}
		}
	}
	// set global.fridayCounter to the contents of /fridayCounter.json
	var fridayCounterJson = fs.readFileSync(babadata.datalocation + "/fridayCounter.json");
	if (fridayCounterJson.length > 0)
		global.fridayCounter = JSON.parse(fridayCounterJson);
	else
		global.fridayCounter = {};

	return retVal;
}


function IncrementFridayCounter(fridayJson)
{
	// parse json
	var friday = JSON.parse(fridayJson);
	var qureyStart = "INSERT INTO layersdeep (FridayUID,LoopsOrDOW,LayersDeep,Count,HeadingLevel,Sender) VALUES "
	var qureyEnd = `AS newDeepLayers ON DUPLICATE KEY UPDATE layersdeep.Count = layersdeep.Count + newDeepLayers.Count;`;
	var queryMiddle = "";
	for (var i = 0; i < Object.keys(friday).length; i++)
	{
		var key = Object.keys(friday)[i];
		var layersdeeps = friday[key];

		// uid is key before --, group is key after --
		var uid = key.split("--")[0];
		var group = key.split("--")[1];
		var user = key.split("--")[2];


		// update the value in the database for each layer in value, on new entry add it
		for (var deepness = 0; deepness < layersdeeps.length; deepness++)
		{
			var headingLevels = layersdeeps[deepness];
			if (headingLevels != null)
			{
				for (var heding = 0; heding < headingLevels.length; heding++)
				{
					var count = headingLevels[heding];
					if (count != null)
						queryMiddle += `("${uid}", "${group}", "${deepness}", "${count}", "${heding}", "${user}"),`;
				}
			}
		}
	}

	// remove last comma
	queryMiddle = queryMiddle.slice(0, -1);

	// add to database
	con.query(qureyStart + queryMiddle + qureyEnd,
		function (err, result)
		{
			if (err)
			{
				if (validErrorCodes(err.code))
				{
					EnterDisabledMode();
					return;
				}
				else
					throw err;
			}
		}
	);
}



function eventDB(event, change, user)
{
	var eid = event.id;
	if (!change.includes("user"))
	{
		var cid = event.creatorId;
		var chanid = event.channelId;
		var name = event.name;
		var desc = event.description;
		var d1 = new Date(event.scheduledStartTimestamp);
		var d2 = new Date(event.scheduledEndTimestamp);
		var status = event.status;
		switch (status)
		{
			case 1:
				status = "SCHEDULED";
				break;
			case 2:
				status = "ACTIVE";
				break;
			case 3:
				status = "COMPLETED";
				break;
			case 4:
				status = "CANCELED";
				break;
		}

		var loc = "Voice Channel";

		var mpre1 = d1.getMonth() + 1 < 10 ? 0 : "";
		var dpre1 = d1.getUTCDate() < 10 ? 0 : "";
		var mpre2 = d2.getMonth() + 1 < 10 ? 0 : "";
		var dpre2 = d2.getUTCDate() < 10 ? 0 : "";

		var start = `${d1.getFullYear()}-${mpre1}${d1.getMonth() + 1}-${dpre1}${d1.getUTCDate()} ${d1.getHours()}:${d1.getMinutes()}:${d1.getSeconds()}`
		var end = `${d2.getFullYear()}-${mpre2}${d2.getMonth() + 1}-${dpre2}${d2.getUTCDate()} ${d2.getHours()}:${d2.getMinutes()}:${d2.getSeconds()}`
		
		// add time leaving and joining
		if (event.entityMetadata != null)
		{
			loc = event.entityMetadata.location;
		}

		if (change == "create")
		{
			con.query(`INSERT INTO scheduleevent (eventID, creatorID, name, channelID, description, StartTime, EndTime, status, Location) VALUES ("${eid}", "${cid}", "${name}", "${chanid}", "${desc}", "${start}", "${end}", "${status}", "${loc}")`,
			function (err, result)
			{
				if (err)
				{
					if (validErrorCodes(err.code))
					{
						EnterDisabledMode();
						return;
					}
					else
						throw err;
				}
			});
		}
		else if (change == "delete")
		{
			con.query(`UPDATE scheduleevent Set status = "CANCELED" WHERE eventID = "${eid}"`,
			function (err, result)
			{
				if (err)
				{
					if (validErrorCodes(err.code))
					{
						EnterDisabledMode();
						return;
					}
					else
						throw err;
				}
			});
		}
		else if (change == "update")
		{
			con.query(`UPDATE scheduleevent Set creatorID = "${cid}", name = "${name}", channelID = "${chanid}", description = "${desc}", StartTime = "${start}", EndTime = "${end}", status = "${status}", Location = "${loc}" WHERE eventID = "${eid}"`,
			function (err, result)
			{
				if (err)
				{
					if (validErrorCodes(err.code))
					{
						EnterDisabledMode();
						return;
					}
					else
						throw err;
				}
			});
		}
	}
	else 
	{
		var uid = user.id;
		var time = new Date();
		var mpre = time.getMonth() + 1 < 10 ? 0 : "";
		var dpre = time.getUTCDate() < 10 ? 0 : "";
		var jtime = `${time.getFullYear()}-${mpre}${time.getMonth() + 1}-${dpre}${time.getUTCDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
		if (change == "useradd")
		{
			con.query(`UPDATE eventpurity SET flaked = 0, timesrejoined = timesrejoined + 1, joined = 1, latestjointime = "${jtime}", flaketime = null WHERE eventID = "${eid}" AND userID = "${uid}"`,
			function (err, result)
			{
				if (err)
				{
					if (validErrorCodes(err.code))
					{
						EnterDisabledMode();
						return;
					}
					else
						throw err;
				}

				if (result.affectedRows == 0)
				{
					con.query(`INSERT INTO eventpurity (eventID, userID, flaked, timesrejoined, joined, latestjointime, initjointime) VALUES ("${eid}", "${uid}", 0, 0, 1, "${jtime}", "${jtime}")`,
					function (err, result)
					{
						if (err)
						{
							if (validErrorCodes(err.code))
							{
								EnterDisabledMode();
								return;
							}
							else
								throw err;
						}
					});
				}
			});
		}
		else if (change == "userremove")
		{
			con.query(`UPDATE eventpurity SET flaked = 1, joined = 0, flaketime = "${jtime}", latestjointime = null WHERE eventID = "${eid}" AND userID = "${uid}"`,
			function (err, result)
			{
				if (err)
				{
					if (validErrorCodes(err.code))
					{
						EnterDisabledMode();
						return;
					}
					else
						throw err;
				}
			});
		}
	}
}

function EnterDisabledMode()
{
	console.log("Entering Disabled Mode");
}

process.on('SIGINT', cleanupFn);
process.on('SIGTERM', cleanupFn);


// VOICE DATA SECTION


function voiceChannelChange(newMember, oldMember, overideTime = null)
{
    let newUserID = newMember.id;
	let oldUserID = oldMember.id;
    let newUserChannel = newMember.channelId;
	let oldUserChannel = oldMember.channelId;

    var guild = newMember.guild;

    //console.log(newUserID + " joined vc with id " + newUserChannel);
    //console.log(newUserID + " left vc with id " + oldUserChannel);

    
    if (newUserChannel != null && newUserChannel != oldUserChannel && userOptOut(guild, newUserID, "voice"))
    {
        userJoinedVoice(newUserID, newUserChannel, guild, overideTime);
    }
    if (oldUserChannel != null && newUserChannel != oldUserChannel)
    {
        userLeftVoice(oldUserID, oldUserChannel, guild, overideTime);
    }
}

function userOptOut(guild, userID, val)
{
    let rawdata = fs.readFileSync(babadata.datalocation + "/optscache.json");
    let optscache = JSON.parse(rawdata);

    for (var i = 0 ; i < optscache.length; i++)
    {
        var opt = optscache[i];
        if (opt.DiscordID == userID && opt.Item == val)
        {
            return opt.Opt == "in";
        }
    }
    
    var zopt = val
    guild.members.fetch(userID)
    .then(user => checkAndCreateUser(userID, user.user.username, function() 
    {
        if (babadata.testing != undefined)
            optIn(user, val, function(){zopt = true});
        else
            optOut(user, val, function(){zopt = false});
    }))
    
    guild.channels.fetch(babadata.botchan).then(channel => {
        channel.send("<@" + userID + "> would you like to opt in for baba voice activity data analysis?\n"
        + "Type `/optin` to opt in, or `/optout` to opt out (default).\n" + 
        "This data will be used to create fun charts and do predictive analysis of voice activity.\n" +
        "If you don't want to see this message, call one of the commands.\n" +
        "Check out <#1069025445162524792> to see some cool charts that were made over the years.");
    })
    .catch(console.error);

    // do the @ of person and add to opt out first
    console.log("No In"); 

    return zopt;
}

function startUpChecker(client)
{
    client.guilds.cache.forEach(guild => {
        var onlineusers = [];
        guild.voiceStates.cache.forEach(voiceState => {
            if(voiceState.channel)
            {
                if (userOptOut(guild, voiceState.member.id, "voice"))
                {
                    var channelID = voiceState.channel.id;
                    var userID = voiceState.member.id;
    
                    var up = userID + "-" + channelID;
                    checkUserVoiceCrash(userID, channelID, guild);
                    onlineusers.push(up);
                }
            }
        });
        endLeftUsersCrash(onlineusers, guild);
    });  
}

function logVCC(newMember, oldMember, time)
{
    global.logVCC.push([newMember, oldMember, time]);
}

function clearVCCList()
{
	var lsit = global.loggedVCC;
	for (var x in lsit)
	{
		var item = lsit[x];
		voiceChannelChange(item[0], item[1], item[2]);
	}
	global.loggedVCC = [];
}







module.exports = {
	FormatPurityList,
	HPLGenChannel,
	HPLGenUsers,
	HPLSelectChannel,
	HPLSelectDate,
	HPLSelectUser,
	HaikuSelection,
	ObtainDBHolidays,
	NameFromUserID,
	NameFromUserIDID,
	userJoinedVoice,
	userLeftVoice,
	checkUserVoiceCrash,
	endLeftUsersCrash,
	checkAndCreateUser,
	checkAndCreateChannel,
	optIn,
	optOut,
	cacheOpts,
	HPLGenD8,
	handleDisconnect,
	cacheDOW,
	controlDOW,
	eventDB,
	saveSlashFridayJson,

	voiceChannelChange,
    startUpChecker,
    logVCC
}