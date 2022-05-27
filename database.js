const fs = require('fs');
var babadata = require('./babotdata.json'); //baba configuration file
var mysql = require('mysql2');
const { FindDate } = require('./helperFunc');

var con;

function handleDisconnect(print) 
{
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
		console.log('db error', err);
		handleDisconnect(err.code);
	});
}
  
handleDisconnect("Initializing");

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

function FormatPurityList(resultList, type)
{
	var lists = [];
	for (var x in resultList)
	{
		lists[x] = {};
		lists[x].Name = resultList[x].Name;
		lists[x].Count = resultList[x].Count;
		lists[x].Accidental = resultList[x].Accidental;
		lists[x].Purity = resultList[x].Purity;
		lists[x].ID = resultList[x].ID;
	}

	lists.sort(compare);

	var retme = ""
	for (var x in lists)
	{
		var lin = lists[x];
		retme += GenInfo(lin, type);

		if (x < lists.length - 1)
			retme += "\n\n";
	}

	return retme;
}

function GenInfo(line, type)
{
	line.Purity = +Number(line.Purity).toFixed(3);
	return line.Name + (type == 2 ? "" : " [<" + (type == 1 ? "#" : "@") + line.ID + ">]") + "\n\t`" + line.Count + " Haikus` - `" + line.Accidental + " Accidental` - `" + line.Purity + "% Purity`";
}

function HPLGenChannel(callback)
{
	con.query("SELECT ChannelName as Name, haiku.ChannelID as ID, Count(*) as Count, SUM(IF(Accidental = '1', 1, 0)) as Accidental, SUM(IF(Accidental = '1', 1, 0))/COUNT(Accidental) * 100 As Purity FROM haiku Left Join channelval on haiku.ChannelID = channelval.ChannelID Group by haiku.ChannelID", function (err, result) 
	{
		if (err) throw err;
		return callback(result);
	});
}

function HPLGenUsers(callback)
{
	con.query("SELECT haiku.PersonName as Name, DiscordID as ID, Count(*) as Count, SUM(IF(Accidental = '1', 1, 0)) as Accidental, SUM(IF(Accidental = '1', 1, 0))/COUNT(Accidental) * 100 As Purity FROM haiku Left Join userval on haiku.PersonName = userval.PersonName Group by haiku.PersonName", function (err, result) 
	{
		if (err) throw err;
		return callback(result);
	});
}

function HPLSelectChannel(callback, msgContent)
{
	con.query(`SELECT ChannelName as Name, haiku.ChannelID as ID, Count(*) as Count, SUM(IF(Accidental = '1', 1, 0)) as Accidental, SUM(IF(Accidental = '1', 1, 0))/COUNT(Accidental) * 100 As Purity FROM haiku 
	Left Join channelval on haiku.ChannelID = channelval.ChannelID 
	Where Lower('` + msgContent + `') LIKE CONCAT('%', Lower(channelName), '%')
	or Lower('` + msgContent + `') LIKE CONCAT('%', Lower(haiku.ChannelID), '%') 
	Group by haiku.ChannelID`, function (err, result)
	{
		if (err) throw err;
		return callback(result);
	});
}

function HPLSelectDate(callback, msgContent)
{
	console.log(msgContent);
	con.query(`SELECT date as Name, Count(*) as Count, SUM(IF(Accidental = '1', 1, 0)) as Accidental, SUM(IF(Accidental = '1', 1, 0))/COUNT(Accidental) * 100 As Purity FROM haiku 
	Where Lower("` + msgContent + `") LIKE CONCAT("%", Lower(date), "%")
	Group by date`, function (err, result)
	{
		if (err) throw err;
		return callback(result);
	});
}

function HPLSelectUser(callback, msgContent)
{
	con.query(`SELECT haiku.PersonName as Name, DiscordID as ID, Count(*) as Count, SUM(IF(Accidental = '1', 1, 0)) as Accidental, SUM(IF(Accidental = '1', 1, 0))/COUNT(Accidental) * 100 As Purity FROM haiku 
	Left Join userval on haiku.PersonName = userval.PersonName 
	Where LOWER(haiku.PersonName) in (Select distinct LOWER(PersonName) from haiku Where Lower("` + msgContent + `") LIKE CONCAT("%", Lower(DiscordName), "%"))
	or LOWER(haiku.PersonName) in (SELECT Lower(PersonName) FROM userval Left join alteventnames on BirthdayEventID = EventID Where Lower("` + msgContent + `") LIKE CONCAT("%", Lower(EventName), "%"))
	or Lower("` + msgContent + `") LIKE CONCAT("%", Lower(DiscordID), "%") 
	or Lower("` + msgContent + `") LIKE CONCAT("%", Lower(haiku.PersonName), "%")
	Group by haiku.PersonName`, function (err, result)
	{
		if (err) throw err;
		return callback(result);
	});
}

function HaikuSelection(callback, by, msgContent)
{
	var query = `SELECT * FROM haiku
	Left Join userval on haiku.PersonName = userval.PersonName 
	Left Join channelval on haiku.ChannelID = channelval.ChannelID`
	if (by == 1)
	{
		query += ` Where LOWER(haiku.PersonName) in (Select distinct LOWER(PersonName) from haiku Where Lower("` + msgContent + `") LIKE CONCAT("%", Lower(DiscordName), "%"))
		or LOWER(haiku.PersonName) in (SELECT Lower(PersonName) FROM userval Left join alteventnames on BirthdayEventID = EventID Where Lower("` + msgContent + `") LIKE CONCAT("%", Lower(EventName), "%"))
		or Lower("` + msgContent + `") LIKE CONCAT("%", Lower(DiscordID), "%") 
		or Lower("` + msgContent + `") LIKE CONCAT("%", Lower(haiku.PersonName), "%")`;
	}
	else if (by == 2)
	{
		query += ` Where Lower('` + msgContent + `') LIKE CONCAT('%', Lower(channelName), '%')
		or Lower('` + msgContent + `') LIKE CONCAT('%', Lower(haiku.ChannelID), '%')`
	}
	else if (by == 3)
	{
		var IsDate = FindDate(msgContent);
		if (IsDate != null)
		{
			d1 = new Date(IsDate.year, IsDate.month - 1, IsDate.day);
			var mpre = d1.getMonth() + 1 < 10 ? 0 : "";
			var dpre = d1.getUTCDate() < 10 ? 0 : "";
			query += ` Where Lower("${d1.getFullYear()}-${mpre}${d1.getMonth() + 1}-${dpre}${d1.getUTCDate()}") LIKE CONCAT("%", Lower(date), "%")`;
		}
		else return callback(null);
	}

	con.query(query, function (err, result)
	{
		if (err) throw err;
		if (result.length == 0) return callback(null);

        var num = Math.floor(Math.random() * result.length);
        var haiku = result[num];

		var qq = `SELECT Distinct DiscordName FROM haiku where Lower(PersonName) = Lower("` + haiku.PersonName + `");`;

		con.query(qq, function (err2, result2)
		{
			if (err2) throw err2;
			return callback(haiku, result2);
		});
	});
}

function GetSimilarName(names)
{
	var num = Math.floor(Math.random() * names.length);
	var nam = names[num];
	return nam.DiscordName;
}

function ObtainDBHolidays(callback)
{
	con.query("SELECT * FROM event left join alteventnames on event.EventID = alteventnames.EventID;", function (err, result) 
	{
		if (err) throw err;
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
	console.log("Ending SQL Connection");
	con.end();
}

process.on('SIGINT', cleanupFn);
process.on('SIGTERM', cleanupFn);

module.exports = {
	FormatPurityList,
	HPLGenChannel,
	HPLGenUsers,
	HPLSelectChannel,
	HPLSelectDate,
	HPLSelectUser,
	HaikuSelection,
	GetSimilarName,
	ObtainDBHolidays
}