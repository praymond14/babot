var babadata = require('./babotdata.json'); //baba configuration file
const fs = require('fs');
const { NameFromUserIDID } = require('./databaseVoiceController');
const { FindDate } = require('./HelperFunctions/basicHelpers');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function FilterUser(messageTerm, haikuList)
{
    var messageTerm = messageTerm.toLowerCase();
    var filterToDiscordName = haikuList.filter(function(haiku)
    {
        var lowerDiscordName = haiku.DiscordName.toLowerCase();
        return messageTerm.includes(lowerDiscordName);
    });

    var filteredAltEventNames = [];
    for (const [key, value] of Object.entries(global.userCache))
    {
        altNames = value.AltNames;
        var filteredAltNames = altNames.filter(function(altName)
        {
            if (altName == null) return false;
            var lowerAltName = altName.toLowerCase();
            return messageTerm.includes(lowerAltName);
        });

        if (filteredAltNames.length > 0)
        {
            filteredAltEventNames.push(value.PersonName);
        }
    }

    var filteredList = haikuList.filter(function(haiku) 
    {
        var lowerName = haiku.PersonName.toLowerCase();
        var lowerID = haiku.DiscordID.toLowerCase();

        if (messageTerm.includes(lowerName) || messageTerm.includes(lowerID))
        {
            return true;
        }

        // if filterToDiscordName is not empty, then we check if PersonName is in filterToDiscordName
        if (filterToDiscordName.length > 0)
        {
            for (var x in filterToDiscordName)
            {
                if (filterToDiscordName[x].PersonName == haiku.PersonName)
                {
                    return true;
                }
            }
        }

        // if filteredAltEventNames is not empty, then we check if PersonName is in filteredAltEventNames
        if (filteredAltEventNames.length > 0)
        {
            for (var x in filteredAltEventNames)
            {
                if (filteredAltEventNames[x] == haiku.PersonName)
                {
                    return true;
                }
            }
        }
    });

    return filteredList;
}

function FilterChannel(messageTerm, haikuList)
{
    var messageTerm = messageTerm.toLowerCase();
    var filteredList = haikuList.filter(function(haiku) 
    {
        var lowerChannel = haiku.ChannelName.toLowerCase();
        var lowerChannelID = haiku.ChannelID.toLowerCase();
        return messageTerm.includes(lowerChannel) || messageTerm.includes(lowerChannelID);
    });

    return filteredList;
}

function FilterDate(haikuList, BFE, Year, Month, Day)
{
    if (BFE == "Exact")
    {
        var filteredList = haikuList.filter(function(haiku) 
        {
            var haikuDate = new Date(haiku.Date);
            return  (Year == null ? true : haikuDate.getFullYear() == Year) &&
                    (Month == null ? true : haikuDate.getMonth() == Month) &&
                    (Day == null ? true : haikuDate.getDate() == Day);
        });

        return filteredList;
    }
    else if (BFE == "Before")
    {
        var filteredList = haikuList.filter(function(haiku) 
        {
            var haikuDate = new Date(haiku.Date);
            return  (Year == null ? true : haikuDate.getFullYear() <= Year) &&
                    (Month == null ? true : haikuDate.getMonth() <= Month) &&
                    (Day == null ? true : haikuDate.getDate() <= Day);
        });

        return filteredList;
    }
    else if (BFE == "After")
    {
        var filteredList = haikuList.filter(function(haiku) 
        {
            var haikuDate = new Date(haiku.Date);
            return  (Year == null ? true : haikuDate.getFullYear() >= Year) &&
                    (Month == null ? true : haikuDate.getMonth() >= Month) &&
                    (Day == null ? true : haikuDate.getDate() >= Day);
        });

        return filteredList;
    }

    return null;
}

function FilterKeyword(messageTerm, haikuList)
{
    var splitbySpace = messageTerm.split(" ");
    // check if all words are in the haiku
    var filteredList = haikuList.filter(function(haiku) 
    {
        var lowerHaiku = haiku.Haiku.toLowerCase();
        for (var x in splitbySpace)
        {
            if (!lowerHaiku.includes(splitbySpace[x].toLowerCase()))
            {
                return false;
            }
        }

        return true;
    });

    return filteredList;
}

function GenerateRandomHaiku(haikuList)
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
    for (var x in haikuList)
    {
        var hform = haikuList[x].HaikuFormatted.replace("\r \r ", "\r\n\r\n").split("\r\n\r\n");

        fives.push(hform[0]);
        sevens.push(hform[1]);
        fives.push(hform[2]);
    }

    var thefive = fives[Math.floor(Math.random() * fives.length)];
    var theseven = sevens[Math.floor(Math.random() * sevens.length)];
    var thefive2 = fives[Math.floor(Math.random() * fives.length)];

    object.HaikuFormatted = thefive + "\r\n\r\n" + theseven + "\r\n\r\n" + thefive2;

    return object;
}

function GenerateAssociatedNames(haikuList, discordID)
{
    var associatedNames = [];
    for (var x in haikuList)
    {
        if (haikuList[x].DiscordID == discordID)
        {
            associatedNames.push(haikuList[x].DiscordName);
        }
    }

    // remove duplicates
    associatedNames = associatedNames.filter(function(item, pos) {
        return associatedNames.indexOf(item) == pos;
    });

    return associatedNames;
}

function GetPurityList(haikuList, pMode)
{
    var purityList = [];
    
    for (var x in haikuList)
    {
        var obj = {};
        var haiku = haikuList[x];
        if (pMode == "chans")
        {
            // see if haiku.ChannelName is in purityList
            var found = false;
            for (var y in purityList)
            {
                if (purityList[y].Name == haiku.ChannelName)
                {
                    found = true;
                    obj = purityList[y];
                    break;
                }
            }

            if (!found)
            {
                obj.Name = haiku.ChannelName;
                obj.ID = haiku.ChannelID; 
                obj.Count = 0;
                obj.Accidental = 0;
                obj.Purity = 0;

                purityList.push(obj);
            }
        }
        else if (pMode == "users")
        {
            // see if haiku.PersonName is in purityList
            var found = false;
            for (var y in purityList)
            {
                if (purityList[y].Name == haiku.PersonName)
                {
                    found = true;
                    obj = purityList[y];
                    break;
                }
            }

            if (!found)
            {
                obj.Name = haiku.PersonName;
                obj.ID = haiku.DiscordID;
                obj.Count = 0;
                obj.Accidental = 0;
                obj.Purity = 0;

                purityList.push(obj);
            }
        }
        else if (pMode == "date")
        {
            // see if haiku.Date is in purityList
            var found = false;
            for (var y in purityList)
            {
                if (purityList[y].Name == haiku.Date)
                {
                    found = true;
                    obj = purityList[y];
                    break;
                }
            }

            if (!found)
            {
                obj.Name = haiku.Date;
                obj.Count = 0;
                obj.Accidental = 0;
                obj.Purity = 0;

                purityList.push(obj);
            }
        }

        obj.Count++;
        obj.Accidental += haiku.Accidental;
        obj.Purity += obj.Accidental / obj.Count;
    }

    return purityList;
}

function HaikuSelection(messageTerm, mode)
{
    var haikuJson = fs.readFileSync(babadata.datalocation + "/HaikusCache.json");
    var haikuList = JSON.parse(haikuJson);
    var entierHaikuList = haikuList;

    if (mode == 1)
    {
        // filter by user (messageTerm)
        haikuList = FilterUser(messageTerm, haikuList);
    }
    else if (mode == 2)
    {
        // filter by channel (messageTerm)
        haikuList = FilterChannel(messageTerm, haikuList);
    }
    else if (mode == 3)
    {
        // filter by date (messageTerm)
		var IsDate = FindDate(messageTerm, true);
        var Year = IsDate.year;
        var Month = IsDate.month;
        var Day = IsDate.day;

        haikuList = FilterDate(haikuList, "Exact", Year == 0 ? null : Year, Month == 0 ? null : Month - 1, Day == 0 ? null : Day);
    }
    else if (mode == 5)
    {
        // filter by keyword (messageTerm)
        haikuList = FilterKeyword(messageTerm, haikuList);
    }
    else if (mode == 4)
    {
        // custom filter
		var sd = messageTerm[0];
		var startDate = null;
		var ed = messageTerm[1];
		var endDate = null;
		var chan = messageTerm[2];
		var pson = messageTerm[3];
		var kword = messageTerm[4];

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
            if (endDate != null)
            {
                if (endDate < startDate)
                {
                    var temp = startDate;
                    startDate = endDate;
                    endDate = temp;
                }

                haikuList = FilterDate(haikuList, "After", startDate.year, startDate.month - 1, startDate.day);
                haikuList = FilterDate(haikuList, "Before", endDate.year, endDate.month - 1, endDate.day);
            }
            else
            {
                haikuList = FilterDate(haikuList, "Exact", startDate.year, startDate.month - 1, startDate.day);
            }
        }

        if (chan != null)
        {
            haikuList = FilterChannel(chan, haikuList);
        }

        if (pson != null)
        {
            haikuList = FilterUser(pson, haikuList);
        }

        if (kword != null)
        {
            haikuList = FilterKeyword(kword, haikuList);
        }

        if (messageTerm[5] == "purity")
        {
            var pMode = messageTerm[6];
            
            var purityList = GetPurityList(haikuList, pMode);

            return purityList;
        }
    }

    // if no haikus in list, return null
    if (haikuList.length == 0) return null;

    var haiku = null;

    // if mode == 6 then we get a random generated haiku of 5-7-5, need function to generate haiku
    if (mode == 6) return [[GenerateRandomHaiku(haikuList)], null];

    // if mode == 4 and messageTerm[5] == "all" then we return the entire list
    if (mode == 4 && messageTerm[5] == "all") return [haikuList, null];

    haiku = haikuList[Math.floor(Math.random() * haikuList.length)];

    var associatedNames = GenerateAssociatedNames(entierHaikuList, haiku.DiscordID);

    return [[haiku], associatedNames];
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function NameFromUser(user)
{
    var userDBItemPromise = new Promise((resolve, reject) => {
        NameFromUserID(user.id).then((result) =>
        {
            resolve(result);
        });
    });

    return userDBItemPromise;
}

function NameFromUserID(userid)
{
    var userDBItemPromise = new Promise((resolve, reject) => {
        NameFromUserIDID(userid).then((result) =>
        {
            resolve(result.PersonName);
        }).catch((err) => 
        {
            var fakeVales = ["Buddy", "Pal", "Buddy Man", "Buddy Pal", "Fella", "Friend", "Friendo", "Friend Buddy", "Friend Pal", "Friend Buddy Pal"];
            fakeVales[Math.floor(Math.random() * fakeVales.length)];
            resolve(fakeVales[Math.floor(Math.random() * fakeVales.length)]);
        });
    });

    return userDBItemPromise;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function GenInfo(line, type)
{
	// if (type == 2) line.Name = line.Name.toLocaleDateString('en-US', options);
	if (type == 2) line.Name = "<t:" + line.Name.getTime() / 1000 + ":D>";
	line.Purity = +Number(line.Purity).toFixed(3);
	return line.Name + (type == 2 ? "" : " [<" + (type == 1 ? "#" : "@") + line.ID + ">]") + "\n\t`" + line.Count + " Haikus` - `" + line.Accidental + " Accidental` - `" + line.Purity + "% Purity`";
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function GetParent(retme, id)
{
	for (var x in retme)
	{
		if (retme[x].id == id) return retme[x].sub;
	}
	return retme;
}

function ObtainDBHolidays()
{
    let holidayJson = fs.readFileSync(babadata.datalocation + "/HolidayFrogs.json");
    var result = JSON.parse(holidayJson);

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

    return retme;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = {
    NameFromUser,
    NameFromUserID,
	FormatPurityList,
    ObtainDBHolidays,
    HaikuSelection
}