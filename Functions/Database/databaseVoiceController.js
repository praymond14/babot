var babadata = require('../../babotdata.json'); //baba configuration file

const fs = require('fs');
var mysql = require('mysql2');

const { getD1 } = require('../../Tools/overrides');

var con;

var timeoutDisconnect = null;
var timeoutClear = null;
var timeoutFix = null;

var timeoutCT = -1;

// Helper Functions


function splitStringInto1900CharChunksonSpace(str)
{
	var chunks = [];
	var chunk = "";
	var lines = str.split(" ");
	for (var i = 0; i < lines.length; i++)
	{
		if (chunk.length + lines[i].length > 1900)
		{
			chunks.push(chunk);
			chunk = "";
		}
		chunk += lines[i] + "\n";
	}
	chunks.push(chunk);
	return chunks;
}

function StartDB(printOut)
{
	console.log(printOut + " - Starting Database Connection");
	con = mysql.createConnection({
		host: babadata.database.host,
		user: babadata.database.user,
		password: babadata.database.password,
		database: babadata.database.database,
		port: babadata.database.port,
		charset : 'utf8mb4_general_ci'
	});

    if (timeoutCT <= 0)
    {
	    var loggedUsersVCC = fs.readFileSync(babadata.datalocation + "loggedUsersVCC.csv");
        loggedUsersVCC = loggedUsersVCC.toString();
        var lines = loggedUsersVCC.split("\n");
        lines.pop();

        if (lines.length > 0)
        {
            if (timeoutFix != null) clearTimeout(timeoutFix);

            timeoutFix = setTimeout(function()
            {
                if (global.dbAccess[1] && global.dbAccess[0])
                {
                    console.log("Restoring User Voice Data", false, true);
                    clearVCCList();
                }
                else
                {
                    console.log("Database Not Accessible, Not Restoring Right Now", false, true);
                }
            }, 20000);
        }
    }

    con.on('error', function(err) 
	{
        console.log("Database Error: " + err, false, true);

        if (timeoutCT == -1)
            timeoutCT++;
        timeoutCT++;

        var timestring = getD1().toLocaleTimeString();
        console.log("Timeout CT: " + timeoutCT + " - " + timestring, false, true);

        if (timeoutCT >= 8)
        {
            if (timeoutClear != null) clearTimeout(timeoutClear);
            if (timeoutDisconnect != null) clearTimeout(timeoutDisconnect);
            if (timeoutFix != null) clearTimeout(timeoutFix);

            console.log("Too many timeouts, entering minutely check mode", false, true);

            global.dbAccess[1] = false;
            timeoutDisconnect = setTimeout(StartDB, 60000, err.code);
            timeoutClear = setTimeout(function()
            {
                timeoutCT = 0; 
                global.dbAccess[1] = true; 
                console.log("Database Access Restored", false, true);

                if (global.dbAccess[1] && global.dbAccess[0])
                {
                    console.log("Restoring User Voice Data in 90 seconds", false, true);
                    timeoutFix = setTimeout(function()
                    {
                        console.log("Restoring User Voice Data", false, true);
                        clearVCCList();
                    }, 90000);
                }
            }, 90000);
        }
        else
            StartDB(err.code);
    });
}

function callSQLQuery(query)
{
    return new Promise((resolve, reject) =>
    {
        if ((global.dbAccess[1] && global.dbAccess[0]))
        {
            con.query(query, function (err, result)
            {
                if (err) 
                {
                    ErrorWithDB(err, query);
                    reject(err);
                }
    
                if (timeoutCT > 0)
                {
                    timeoutCT = 0;
                    global.dbAccess[1] = true;
                    console.log("Timeout CT Reset", false, true);
                }
                resolve(result);
            });
        }
        else
        {
            console.log("Query did not Run:", false, true);
            console.log(query, false, true);
            console.log("Database Not Accessible", false, true);
            reject("Database Not Accessible");
        }
        
    });
}

function validErrorCodes(err)
{
    var catchCodes = ["ETIMEDOUT", "ER_HOST_NOT_PRIVILEGED", "ECONNREFUSED"];
    return catchCodes.includes(err);
}

function dbErrored(err)
{
    console.error(err);
    con.end();
    con = null;
    StartDB(err.code);
}

function ErrorWithDB(err, query)
{
    console.log("Error Occured because of Query: ", false, true);
    console.log(query, false, true);

    DMMePlease("Error Occured because of Query: ");
    var qChunks = splitStringInto1900CharChunksonSpace(query);
    for (var i = 0; i < qChunks.length; i++)
    {
        DMMePlease("```"  + qChunks[i] + "```");
    }

    DMMePlease("Error: \n```" + err + "```");

    if (!validErrorCodes(err.code))
        dbErrored(err.code);
}

function DMMePlease(sourceMessage)
{
    console.log("DMMePlease: " + sourceMessage, false, true);
    var guildID = babadata.testing === undefined ? "454457880825823252" : "522136584649310208";
    var logThreadChanID = babadata.testing === undefined ? "1337944450084769876" : "1337943563996106915";
    var channelOfThread = babadata.testing === undefined ? "509401300874690590" : "757071872721682594";

    global.Bot.guilds.fetch(guildID).then(async guild =>
    {
        guild.channels.fetch(channelOfThread).then(channel => 
        {
            channel.threads.fetch(logThreadChanID).then(thread =>
            {
                thread.send(sourceMessage);
            })
        })
        .catch(console.error);
    }).catch(console.error);
}

// Name User ID Functions -------------------------------------------------------------------------------------------------------------------------------------------

function NameFromUserIDID(userID)
{
    var PromisedName = new Promise((resolve, reject) =>
    {
        if (global.userCache[userID] != null)
        {
            // console.log("NameFromUserID Cache Hit", false, true);
            resolve(global.userCache[userID]);
        }
        else
        {
            // call LoadUserValuesCache
            LoadUserValuesCache().then(() =>
            {
                if (global.userCache[userID] != null)
                {
                    resolve(global.userCache[userID]);
                }
                else
                {
                    reject("NameFromUserID");
                }
            }).catch((err) => {reject("NameFromUserID")});
        }
    });

    return PromisedName;
}

// Event DB Functions -----------------------------------------------------------------------------------------------------------------------------------------------
function EventDB(event, change, user)
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
            var qurey = `INSERT INTO scheduleevent (eventID, creatorID, name, channelID, description, StartTime, EndTime, status, Location) VALUES ("${eid}", "${cid}", "${name}", "${chanid}", "${desc}", "${start}", "${end}", "${status}", "${loc}")`;
            callSQLQuery(qurey)
            .then((result) => {})
            .catch((err) => {DMMePlease("Error Creating Event: " + err)});
        }
        else if (change == "delete")
        {
            var qurey = `UPDATE scheduleevent Set status = "CANCELED" WHERE eventID = "${eid}"`;
            callSQLQuery(qurey)
            .then((result) => {})
            .catch((err) => {DMMePlease("Error Deleting Event: " + err)});
        }
        else if (change == "update")
        {
            var qurey = `UPDATE scheduleevent Set creatorID = "${cid}", name = "${name}", channelID = "${chanid}", description = "${desc}", StartTime = "${start}", EndTime = "${end}", status = "${status}", Location = "${loc}" WHERE eventID = "${eid}"`;
            callSQLQuery(qurey)
            .then((result) => {})
            .catch((err) => {DMMePlease("Error Updating Event: " + err)});
        }
    }
    else 
    {
        var uid = user.id;
        var time = getD1();
        var mpre = time.getMonth() + 1 < 10 ? 0 : "";
        var dpre = time.getUTCDate() < 10 ? 0 : "";
        var jtime = `${time.getFullYear()}-${mpre}${time.getMonth() + 1}-${dpre}${time.getUTCDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
        if (change == "useradd")
        {
            var query = `UPDATE eventpurity SET flaked = 0, timesrejoined = timesrejoined + 1, joined = 1, latestjointime = "${jtime}", flaketime = null WHERE eventID = "${eid}" AND userID = "${uid}"`;
            callSQLQuery(query)
            .then((result) =>
            {
                if (result.affectedRows == 0)
                {
                    var innrquery = `INSERT INTO eventpurity (eventID, userID, flaked, timesrejoined, joined, latestjointime, initjointime) VALUES ("${eid}", "${uid}", 0, 1, 1, "${jtime}", "${jtime}")`;
                    callSQLQuery(innrquery)
                    .then((result) => {})
                    .catch((err) => {DMMePlease("Error Adding User to Event: " + err)});
                }
            })
            .catch((err) => {DMMePlease("Error Updating User in Event: " + err)});
        }
        else if (change == "userremove")
        {
            var query = `UPDATE eventpurity SET flaked = 1, joined = 0, flaketime = "${jtime}", latestjointime = null WHERE eventID = "${eid}" AND userID = "${uid}"`;
            callSQLQuery(query)
            .then((result) => {})
            .catch((err) => {DMMePlease("Error Removing User from Event: " + err)});
        }
    }
}

// Opting Functions -------------------------------------------------------------------------------------------------------------------------------------------------

function optIn(user, type)
{
    var PromisedOptIn = new Promise((resolve, reject) =>
    {
        var query = `UPDATE opting Set Val='in' WHERE DiscordID = "${user.id}" AND ItemToRemove = "${type}"`;
        callSQLQuery(query)
        .then((result) =>
        {
            if (result.affectedRows == 0)
            {
                var query = `INSERT INTO opting (DiscordID, ItemToRemove, Val) VALUES ("${user.id}", "${type}", "in")`;
                callSQLQuery(query)
                .then((result) => {resolve("OptIn")})
                .catch((err) => {reject("OptIn")});
            }
            else
            {
                resolve("OptIn");
            }
        })
        .catch((err) => {reject("OptIn")});
    });

    return PromisedOptIn;
}

function optOut(user, type)
{
    var PromisedOptOut = new Promise((resolve, reject) =>
    {
        var query = `UPDATE opting Set Val='out' WHERE DiscordID = "${user.id}" AND ItemToRemove = "${type}"`;
        callSQLQuery(query)
        .then((result) =>
        {
            if (result.affectedRows == 0)
            {
                var query = `INSERT INTO opting (DiscordID, ItemToRemove, Val) VALUES ("${user.id}", "${type}", "out")`;
                callSQLQuery(query)
                .then((result) => {resolve("OptOut")})
                .catch((err) => {reject("OptOut")});
            }
            else
            {
                resolve("OptOut");
            }
        })
        .catch((err) => {reject("OptOut")});
    });

    return PromisedOptOut;
}

// Voice Channel Functions ------------------------------------------------------------------------------------------------------------------------------------------

function CheckAndCreateUser(userID, userName)
{
    var PromisedUser = new Promise((resolve, reject) =>
    {
        var query = `Select * from userval where DiscordID = "${userID}"`;
        callSQLQuery(query)
        .then((result) =>
        {
            if (result.length == 0)
            {
                var query = `INSERT INTO userval (DiscordID, PersonName) VALUES ("${userID}", "${userName}")`;
                callSQLQuery(query)
                .then((result) => {resolve("User Created")})
                .catch((err) => {reject("CreateUser")});
            }
            else
            {
                resolve("User Exists");
            }
        })
        .catch((err) => {reject("CreateUser")});
    });

    return PromisedUser;
}

function checkAndCreateChannel(channelID, channelName)
{
    var PromisedChannel = new Promise((resolve, reject) =>
    {
        var query = `Select * from channelval where ChannelID = "${channelID}"`;
        callSQLQuery(query)
        .then((result) =>
        {
            if (result.length == 0)
            {
                var query = `INSERT INTO channelval (ChannelID, ChannelName, Type) VALUES ("${channelID}", "${channelName}", "Voice")`;
                callSQLQuery(query)
                .then((result) => {resolve("Channel Created")})
                .catch((err) => {reject("CreateChannel")});
            }
            else
            {
                resolve("Channel Exists");
            }
        })
        .catch((err) => {reject("CreateChannel")});
    });

    return PromisedChannel;
}

function userVoiceChange(queryz, userID, channelID, guild, subtext)
{
    var PromisedVoiceChange = new Promise((resolve, reject) =>
    {
        var query = queryz;
        callSQLQuery(query)
        .then((result) =>
        {
            resolve(queryz);
        })
        .catch((err) => 
        {
            if (err != null && err.sqlMessage != null && err.sqlMessage.includes("voiceactivity_ibfk_1"))
            {
                console.log("Error: " + err.sqlMessage, false, true);
                guild.channels.fetch(channelID)
                .then(channel => 
                {
                    checkAndCreateChannel(channelID, channel.name).then(() =>
                    {
                        userVoiceChange(queryz, userID, channelID, guild, subtext).then((result) => {resolve(result)}).catch((err) => {reject(err)});
                    })
                    .catch((err) => {reject("CreateChannel")});
                })
                .catch(console.error);
            }
            else if (err != null && err.sqlMessage != null && err.sqlMessage.includes("voiceactivity_ibfk_2"))
            {
                console.log("Error: " + err.sqlMessage, false, true);
                guild.members.fetch(userID)
                .then(user => 
                {
                    CheckAndCreateUser(userID, user.user.username).then(() =>
                    {
                        userVoiceChange(queryz, userID, channelID, guild, subtext).then((result) => {resolve(result)}).catch((err) => {reject(err)});
                    })
                    .catch((err) => {reject("CreateUser")});
                })
                .catch(console.error);
            }
            else
            {
                console.log("Error: " + err, false, true);
                reject("UserVoiceChange");
            }
        });
    });

    return PromisedVoiceChange;
}

function userJoinedVoice(userID, channelID, guild, overideTime = null)
{
    var PromisedUserJoined = new Promise((resolve, reject) =>
    {
        var dt = overideTime == null ? getD1() : overideTime;
        var dtsrart = dt.toISOString().slice(0, 19).replace('T', ' ');
        var q = `INSERT INTO voiceactivity (ChannelID, UserID, StartTime) VALUES ("${channelID}", "${userID}", "${dtsrart}")`;
        userVoiceChange(q, userID, channelID, guild, "JoinVoice").then((result) => {resolve(result)}).catch((err) => {reject("JoinVoice")});
    });

    return PromisedUserJoined;
}

function userLeftVoice(userID, channelID, guild, overideTime = null)
{
    var PromisedUserLeft = new Promise((resolve, reject) =>
    {
        var dt = overideTime == null ? getD1() : overideTime;
        var dtsrart = dt.toISOString().slice(0, 19).replace('T', ' ');
        var q = `UPDATE voiceactivity SET EndTime = "${dtsrart}" WHERE UserID = "${userID}" AND ChannelID = "${channelID}" AND EndTime IS NULL`;
        userVoiceChange(q, userID, channelID, guild, "JoinVoice").then((result) => {resolve(result)}).catch((err) => {reject("LeaveVoice")});
    });

    return PromisedUserLeft;
}

function logVCC(newMemberID, newChannelID, oldMemberID, oldChannelID, guildID)
{
    var time = getD1();
	console.log("Logging VCC Data: " + newMemberID + " " + oldMemberID + " " + newChannelID + " " + oldChannelID + " " + time + " " + guildID, false, true);
	// save time as a number
	time = time.getTime();

	if (!fs.existsSync(babadata.datalocation + "loggedUsersVCC.csv"))
	{
		fs.writeFileSync(babadata.datalocation + "loggedUsersVCC.csv", "");
	}

	fs.appendFileSync(babadata.datalocation + "loggedUsersVCC.csv", newMemberID + "," + newChannelID + "," + oldMemberID + "," + oldChannelID + "," + time + "," + guildID + "\n");
}

function clearVCCList()
{
	// load loggedUsersVCC.json
	var loggedUsersVCC = fs.readFileSync(babadata.datalocation + "loggedUsersVCC.csv");
	// clear the file
	fs.writeFileSync(babadata.datalocation + "loggedUsersVCC.csv", "");

	loggedUsersVCC = loggedUsersVCC.toString();

	// loop through each line
	// for each line, get the newMember.id, newMember.channelId, oldMember.id, oldMember.channelId, time
	// call voiceChannelChangeLOGGED(newMember.id, oldMember.id, newMember.channelId, oldMember.channelId, time)
	var lines = loggedUsersVCC.split("\n");
	for (var i = 0; i < lines.length; i++)
	{
		saveStuff(lines[i], i);
	}
}

function saveStuff(lineWhole, i)
{
	setTimeout(function() 
	{
		if (lineWhole.length > 0)
		{
			var line = lineWhole.split(",");
			var newMemberID = line[0];
			var newChannelID = line[1] == "null" ? null : line[1];
			var oldMemberID = line[2];
			var oldChannelID = line[3] == "null" ? null : line[3];
			var time = line[4];
			// convert time to Date object
			time = new Date(parseInt(time));
			
			var guildID = line[5];
			voiceChannelChangeLOGGED(newMemberID, oldMemberID, newChannelID, oldChannelID, time, guildID);
		}
	}, i * 100);
}

function voiceChannelChangeLOGGED(newMemberID, oldMemberID, newChannelID, oldChannelID, overideTime = null, guildID)
{
	global.Bot.guilds.fetch(guildID).then(async guild =>
	{
        const VCCChangeAsync = async function() 
        {
            if (newChannelID != null && newChannelID != oldChannelID && userOptValue(guild, newMemberID, "voice"))
            {
                var uJV = await userJoinedVoice(newMemberID, newChannelID, guild, overideTime);
                console.log("Join Update: " + uJV, false, true);
            }

            if (oldChannelID != null && newChannelID != oldChannelID)
            {
                var uLV = await userLeftVoice(oldMemberID, oldChannelID, guild, overideTime);
                console.log("Leave Update: " + uLV, false, true);
            }
        };

        if (newChannelID != oldChannelID)
        {
            VCCChangeAsync().then(() =>
            {
                console.log("Voice Channel Change Complete from Logged Values", false, true);
            }).catch((err) => 
            {
                DMMePlease("Error in Voice Channel Change from Logged Values: " + err);
                logVCC(newMemberID, newChannelID, oldMemberID, oldChannelID, guildID);
            });
        }
	});
}

function voiceChannelChange(newMember, oldMember)
{
    const VCCChangeAsync = async function() 
    {
        var newUserID = newMember.id;
        var oldUserID = oldMember.id;
        var newUserChannel = newMember.channelId;
        var oldUserChannel = oldMember.channelId;
    
        var guild = newMember.guild;

        if (newUserChannel != null && newUserChannel != oldUserChannel && await userOptValue(guild, newUserID, "voice"))
        {
            var uJV = await userJoinedVoice(newUserID, newUserChannel, guild);
            console.log("Join Update: " + uJV, false, true);
        }
    
        if (oldUserChannel != null && newUserChannel != oldUserChannel)
        {
            var uLV = await userLeftVoice(oldUserID, oldUserChannel, guild);
            console.log("Leave Update: " + uLV, false, true);
        }
    }
    
    if (newMember.channelId != oldMember.channelId)
    {
        VCCChangeAsync().then(() =>
        {
            console.log("Voice Channel Change Complete", false, true);
        }).catch((err) => 
        {
            DMMePlease("Error in Voice Channel Change: " + err);
            logVCC(newMember.id, newMember.channelId, oldMember.id, oldMember.channelId, newMember.guild.id);
        });
    }
}

function userOptValue(guild, userID, val)
{
    var PromisedOptVal = new Promise((resolve, reject) => {
        let rawdata = fs.readFileSync(babadata.datalocation + "optscache.json");
        let optscache = JSON.parse(rawdata);
    
        for (var i = 0 ; i < optscache.length; i++)
        {
            var opt = optscache[i];
            if (opt.DiscordID == userID && opt.Item == val)
            {
                resolve(opt.Opt == "in");
                return;
            }
        }
        
        guild.members.fetch(userID)
        .then(user => 
        {
            CheckAndCreateUser(userID, user.user.username).then(async (result) => 
            {
                var OptInOrOut = null;
                if (babadata.testing != undefined)
                    OptInOrOut = optIn;
                else
                    OptInOrOut = optOut;

                OptInOrOut(user, val).then((result) =>
                {
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

                    resolve(false);
                })
                .catch((err) => {
                    console.log(err);
                    resolve(false);
                });
            })
            .catch((err) => {
                console.log(err);
                resolve(false);
            });
        });
    });

    return PromisedOptVal;
}

// Slash Friday Saving Functions ------------------------------------------------------------------------------------------------------------------------------------

function SaveSlashFridayJson(testingOveride = false)
{
    var PromisedSave = new Promise((resolve, reject) =>
    {
        var retVal = "Friday Counter has not been updated, as it is Empty";
        if ((global.dbAccess[1] && global.dbAccess[0]))
        {
            if (testingOveride && babadata.testing !== undefined)
            {
                console.log("Saving Friday Counter to Database (Testing Overide)", false, true);
                IncrementCounters().then(() =>
                {
                    retVal = "Friday Counter Updated (Testing Overide)";
                    resolve(retVal);
                }).catch((err) => {resolve("Friday Counter Failed to Update (Testing Overide): " + err)});
            }
    
            // save to database
            if (babadata.testing === undefined)
            {
                console.log("Saving Friday Counter to Database", false, true);
                IncrementCounters().then(() =>
                {
                    retVal = "Friday Counter Updated";
                    resolve(retVal);
                }).catch((err) => {resolve("Friday Counter Failed to Update: " + err)});
            }
        }

        resolve(retVal);
    });

    return PromisedSave;
}

function IncrementCounters()
{
    const CounterAsync = async function()
    {
        // Increment Friday Counter
        const FridayResult = await FridayCounterIncrement();
        console.log("Friday Counter: " + FridayResult, false, true);

        // Increment Friday Messages
        const FridayMessagesResult = await FridayMessagesUpdate();
        console.log("Friday Messages: " + FridayMessagesResult, false, true);
    }

    var PromisedIncrement = new Promise((resolve, reject) =>
    {
        CounterAsync().then(() => 
        {
            console.log("All Counters Incremented", false, true);
            resolve("SuccCess");
        }).catch((err) => 
        {
            DMMePlease("Error Incrementing Counters: " + err);
            reject("IncrementCounters: " + err);
        });
    });

    return PromisedIncrement;
}

function FridayCounterIncrement()
{
    var PromisedFridayCounter = new Promise((resolve, reject) =>
    {
        var fridayJson = fs.readFileSync(babadata.datalocation + "fridayCounter.json");
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
        queryMiddle = queryMiddle.slice(0, -1);

        var query = qureyStart + queryMiddle + qureyEnd;
        callSQLQuery(query)
        .then((result) =>
        {
			var data = {};
			fs.writeFileSync(babadata.datalocation + "fridayCounter.json", JSON.stringify(data));
            global.fridayCounter = {};
            resolve("SuccCess");
        })
        .catch((err) => 
        {
            DMMePlease("Error Incrementing Friday Counter: " + err);
            reject("FridayCounter");
        });
    });

    return PromisedFridayCounter;
}

function FridayMessagesUpdate()
{
    var PromisedFridayMessages = new Promise((resolve, reject) =>
    {
        var fridayMessages = fs.readFileSync(babadata.datalocation + "fridaymessages.json");
        var friday = JSON.parse(fridayMessages);
    
        if (friday.length == 0)
        {
            resolve("Friday Messages Empty");
            return;
        }

        var qureyStart2 = `INSERT INTO myitisfriday (Sender,TimeStamp,Message,Condensed,Seed,FileVersion) VALUES `;
        var queryMiddle2 = "";

        for (var i = 0; i < friday.length; i++)
        {
            // var fmdItem = { "UID": authorID, "Text": text, "Date": tod, "CondensedNotation": cnFull, "Seed": seed, "FileVersion": fc };
            var fmdItem = friday[i];
            var sender = fmdItem.UID;
    
            var d1 = new Date(fmdItem.Date);
            var mpre1 = d1.getMonth() + 1 < 10 ? 0 : "";
            var dpre1 = d1.getUTCDate() < 10 ? 0 : "";
    
            var time = `${d1.getFullYear()}-${mpre1}${d1.getMonth() + 1}-${dpre1}${d1.getDate()} ${d1.getHours()}:${d1.getMinutes()}:${d1.getSeconds()}`
            
            var msg = fmdItem.Text;
            // replace all " with ""
            msg = msg.replace(/"/g, '""');
            var cond = fmdItem.CondensedNotation;
            // if cond is object, convert to string
            if (typeof cond === 'object')
            {
                cond = JSON.stringify(cond);
                cond = cond.replace(/"/g, '""');
            }
    
            var seed = fmdItem.Seed;
    
            // add to query
            queryMiddle2 += `("${sender}", "${time}", "${msg}", "${cond}", "${seed}", "${fmdItem.FileVersion}"),`;
        }
    
        // remove last comma
        queryMiddle2 = queryMiddle2.slice(0, -1);

        var query2 = qureyStart2 + queryMiddle2;
        callSQLQuery(query2)
        .then((result) =>
        {
			var data = [];
			fs.writeFileSync(babadata.datalocation + "fridaymessages.json", JSON.stringify(data));
            resolve("SuccCess");
        })
        .catch((err) => 
        {
            DMMePlease("Error Updating Friday Messages: " + err);
            reject("FridayMessages");
        });
    });

    return PromisedFridayMessages;
}

// Cache Functions  ------------------------------------------------------------------------------------------------------------------------------------------------

function LoadAllTheCache()
{
    const CachceAsync = async function() 
    {
        // Emoji Cache
        const EmojiResult = await LoadEmojiCache();
        console.log("Emoji Cache: " + EmojiResult, false, true);

        // React Values - REACTOcache.json - `Select * from reacto`
        const ReactResult = await LoadReactCache();
        console.log("React Cache: " + ReactResult, false, true);

        // Fish Values - FISHcache.json - `Select * from fishdb`
        const FishResult = await LoadFishCache();
        console.log("Fish Cache: " + FishResult, false, true);

        // Frog Values - FROGcache.json - `Select * from frog`
        const FrogResult = await LoadFrogCache();
        console.log("Frog Cache: " + FrogResult, false, true);
        // Frog Control Options - FROGcontrol.json - `Select * from frogcontrol`
        const FrogControlResult = await LoadFrogControlCache();
        console.log("Frog Control Cache: " + FrogControlResult, false, true);

        // DOWItems Cache - DOWItems.json - `Select * from dow` -> `Select * from dowitems`
        const DOWItemsResult = await LoadDOWItemsCache();
        console.log("DOWItems Cache: " + DOWItemsResult, false, true);

        // Channel Name Cache - channelCache.json - `Select * from channelval`
        const ChannelNamesResult = await LoadChannelNamesCache();
        console.log("Channel Names Cache: " + ChannelNamesResult, false, true);

        // User Name Cache - userCache.json - `Select * from userval`
        const UserValuesResult = await LoadUserValuesCache();
        console.log("User Values Cache: " + UserValuesResult, false, true);
        
        // Please Values - Pleasedcache.json - `SELECT PersonName, UserID, DefaultNormalChance, DefaultH1Chance, DefaultH2Chance, DefaultH3CHance, DefaultRNGFontChance, DefaultFlagChance FROM pleased
                                            // Left Join userval on pleased.UserID = userval.DiscordID;`
        const PleasedResult = await LoadPleasedCache();
        console.log("Pleased Cache: " + PleasedResult, false, true);
        // Please Overide Options - PleasedOVERIDEcache.json - `SELECT PersonName, OverideUserIDs, UserID, DefaultNormalChance, DefaultH1Chance, DefaultH2Chance, DefaultH3CHance, DefaultRNGFontChance, DefaultFlagChance FROM pleasedOverides
                                                            //  Left Join userval on pleasedOverides.UserID = userval.DiscordID;`
        const PleasedOverideResult = await LoadPleasedOverideCache();
        console.log("Pleased Overide Cache: " + PleasedOverideResult, false, true);    
        
        // Baba Wednesday Database
        const BabaWednesdayResult = await LoadHolidaysCache();
        console.log("Baba Wednesday Cache: " + BabaWednesdayResult, false, true);

        // Haiku Database
        const HaikuResult = await LoadHaikusCache();
        console.log("Haiku Cache: " + HaikuResult, false, true);

        // Opts Cache - optscache.json - `Select * from opting`
        const OptResult = await LoadOptCache();
        console.log("Opts Cache: " + OptResult, false, true);
    
        // Slash Friday Values -- DOWcache.json - `SELECT * FROM dowfunny left join fridaytimegates on dowfunny.UID = fridaytimegates.fUID`
            // Friday Control Options -- DOWcontrol.json - `Select * from dowcontrol`
            // Friday Sub Options -- FridayLoops.json - `Select * from fridaynestedloops`
            // Time Gates -- TimeGates.json - `Select * from timegatess`
        const FridayResult = await LoadAllSlashFridayStuff();
        console.log("Friday Cache: " + FridayResult, false, true);

        // TODO: On the first of the month, update frogholidays folder from downloading bikus.org/frogholidays.zip, and to add a flag to force download images from force cache download
    }

    var PromisedAllCache = new Promise((resolve, reject) =>
    {
        CachceAsync().then(() => 
        {
            console.log("All Cache Loaded", false, true);
            resolve("SuccCess");
        }).catch((err) => 
        {
            DMMePlease("Error Loading Cache: " + err);
            reject("AllCache");
        });
    });

    return PromisedAllCache;
}

function LoadEmojiCache()
{
    var PromisedEmoji = new Promise((resolve, reject) =>
    {
        var emojiurl = "https://raw.githubusercontent.com/chalda-pnuzig/emojis.json/refs/heads/master/src/list.with.modifiers.json";

        fetch(emojiurl).then(res => res.json()).then(json => {
            // save to emojiJSONCache
            var newEmojis = groupEmojiByTones(json);
            json.emojis = newEmojis;

            fs.writeFileSync(babadata.datalocation + "emojiJSONCache.json", JSON.stringify(json));
            resolve("SuccCess");
        }).catch((err) => {reject("Emoji")});
    });

    return PromisedEmoji;
}

function LoadReactCache()
{
    var PromisedReact = new Promise((resolve, reject) =>
    {
        var query = `Select * from reacto`;
        var jsonLocation = babadata.datalocation + "REACTOcache.json";

        callSQLQuery(query)
        .then((result) =>
        {
            var opts = [];
            for (var i = 0; i < result.length; i++)
            {
                var res = result[i];
                var resj = 
                {
                    "Phrase": res.phrase,
                    "ReactIDs": res.reactIDs,
                    "AlternatePhrases": res.altPhrases,
                    "IgnoredPhrases": res.ignorePhrases,
                    "IgnorePlease": res.IgnorePlease,
                    "StartDate": res.StartTime,
                    "EndDate": res.EndTime,
                    "Prompt": res.Prompt,
                }
    
                // if startdate != null set year to this year
                if (resj.StartDate != null)
                    resj.StartDate.setFullYear(getD1().getFullYear());
    
                // if enddate != null set year to this year
                if (resj.EndDate != null)
                    resj.EndDate.setFullYear(getD1().getFullYear());
    
                // if startdate == null set to earliest date
                if (resj.StartDate == null)
                    resj.StartDate = new Date(0);
    
                // if enddate == null set to latest date
                if (resj.EndDate == null)
                    resj.EndDate = new Date(8640000000000000);
    
                // split reactIDs by comma
                resj.ReactIDs = resj.ReactIDs.split(",");
                for (var j = 0; j < resj.ReactIDs.length; j++)
                {
                    // trim spaces
                    resj.ReactIDs[j] = resj.ReactIDs[j].trim();
                    var reactID = resj.ReactIDs[j].split(":");
                    resj.ReactIDs[j] = {"ID": reactID[0], "Chance": reactID[1] ? reactID[1] : 100};
                }
    
                // loop through reactIDs and add id to ReactIDList, chance number of times
                resj.ReactIDList = [];
                for (var j = 0; j < resj.ReactIDs.length; j++)
                {
                    for (var k = 0; k < resj.ReactIDs[j].Chance; k++)
                    {
                        resj.ReactIDList.push(resj.ReactIDs[j].ID);
                    }
                }
    
                // split altPhrases by comma, if not null
                if (resj.AlternatePhrases != null)
                    resj.AlternatePhrases = resj.AlternatePhrases.split(",");
                else 
                    resj.AlternatePhrases = [];
    
                // loop through alternate phrases and change from "val" to ["val"], or "a+b" to ["a", "b"]
                for (var j = 0; j < resj.AlternatePhrases.length; j++)
                {
                    // trim spaces
                    resj.AlternatePhrases[j] = resj.AlternatePhrases[j].trim();
                    resj.AlternatePhrases[j] = resj.AlternatePhrases[j].split("+");
                }
    
                // split ignoredPhrases by comma, if not null
                if (resj.IgnoredPhrases != null)
                    resj.IgnoredPhrases = resj.IgnoredPhrases.split(",");
                else
                    resj.IgnoredPhrases = [];
    
                // loop through ignored phrases and change from "val" to ["val"], or "a+b" to ["a", "b"]
    
                for (var j = 0; j < resj.IgnoredPhrases.length; j++)
                {
                    // trim spaces
                    resj.IgnoredPhrases[j] = resj.IgnoredPhrases[j].trim();
                    resj.IgnoredPhrases[j] = resj.IgnoredPhrases[j].split("+");
                }
    
                opts.push(resj);
            }
    
            var data = JSON.stringify(opts);
            fs.writeFileSync(jsonLocation, data);
            resolve("SuccCess");
        })
        .catch((err) => {reject("React")});
    });

    return PromisedReact;
}

function LoadFishCache()
{
    var PromisedFish = new Promise((resolve, reject) =>
    {
        var query = `Select * from fishdb`;
        var jsonLocation = babadata.datalocation + "FISHcache.json";

        callSQLQuery(query)
        .then((result) =>
        {
            var opts = [];
            for (var i = 0; i < result.length; i++)
            {
                var res = result[i];
                text = "https://bikus.org/Images/Fish/" + res.FishIMGURL;
                var resj = 
                {
                    "url": text,
                    "FishWords": res.FishWords,
                    "FishBuff": res.WithFishMultBuff,
                    "ProcFishless": res.ProcOnWordsNoFish,
                    "ProcChance": res.ProcChance,
                    "DefaultOccCount": res.DefaultOccCount,
                }

                opts.push(resj);
            }

            var data = JSON.stringify(opts);
            fs.writeFileSync(jsonLocation, data);
            resolve("SuccCess");
        })
        .catch((err) => {reject("Fish")});
    });

    return PromisedFish;
}

function LoadReminderCache()
{
    var PromisedReminders = new Promise((resolve, reject) =>
    {
        var testIndex = babadata.testing === undefined ? "0" : "1";

        var query = `Select * from reminders where Testing = ` + testIndex;
        var jsonLocation = babadata.datalocation + "reminders.json";

        callSQLQuery(query)
        .then((result) =>
        {
            var opts = [];
            for (var i = 0; i < result.length; i++)
            {
                var res = result[i];

                var files = null;
                if (res.Files != null && res.Files.length > 0)
                    files = res.Files.split(",");

                
                var ctimez = new Date(res.Date);
                var offset = ctimez.getTimezoneOffset();
                ctimez.setMinutes(ctimez.getMinutes() - offset);

                var resj = 
                {
                    "Source": res.Source,
                    "Message": res.Message,
                    "Files": files,
                    "Date": ctimez,
                    "ChannelID": res.ChannelID,
                    "UserID": res.UserID,
                    "ThreadParentID": res.ThreadParentID,
                    "EnableAtPerson": res.EnabledAtPerson,
                    "State": "Pending",
                    "ID": res.ID,
                    "UpdateDB": false
                }

                opts.push(resj);
            }

            var data = JSON.stringify(opts);
            fs.writeFileSync(jsonLocation, data);
            resolve("SuccCess");
        })
        .catch((err) => {reject("Reminders")});
    });

    return PromisedReminders;
}

function LoadFrogCache()
{
    var PromisedFrog = new Promise((resolve, reject) =>
    {
        var query = `Select * from frog`;
        var jsonLocation = babadata.datalocation + "FROGcache.json";

        callSQLQuery(query)
        .then((result) =>
        {
            var opts = [];
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
            fs.writeFileSync(jsonLocation, data);
            resolve("SuccCess");
        })
        .catch((err) => {reject("Frog")});
    });

    return PromisedFrog;
}

function LoadFrogControlCache()
{
    var PromisedFrogControl = new Promise((resolve, reject) =>
    {
        var query = `Select * from frogcontrol`;
        var jsonLocation = babadata.datalocation + "FROGcontrol.json";

        callSQLQuery(query)
        .then((result) =>
        {
            var opts = [];
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
            fs.writeFileSync(jsonLocation, data);
            resolve("SuccCess");
        })
        .catch((err) => {reject("FrogControl")});
    });

    return PromisedFrogControl;
}

function LoadDOWItemsCache()
{
    var PromisedDOWItems = new Promise((resolve, reject) =>
    {
        var query = `Select * from dow`;
        var jsonLocation = babadata.datalocation + "DOWItems.json";

        callSQLQuery(query)
        .then((result) =>
        {
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

            var query = `Select * from dowitems`;
            callSQLQuery(query)
            .then((result) =>
            {
                for (var i = 0; i < result.length; i++)
                {
                    var res = result[i];
                    var itm = {};
                    itm.Name = res.name;
                    itm.Occurances = res.occ;
                    
                    adam[res.dow].Items.push(itm);
                }

                var data = JSON.stringify(adam);
                fs.writeFileSync(jsonLocation, data);
                resolve("SuccCess");
            })
            .catch((err) => {reject("DOWItems")});
        })
        .catch((err) => {reject("DOWItems")});
    });

    return PromisedDOWItems;
}

function LoadChannelNamesCache()
{
    var PromisedChannelNames = new Promise((resolve, reject) =>
    {
        var query = `Select * from channelval`;
        global.channelCache = {};
    
        callSQLQuery(query)
        .then((result) =>
        {
            for (var i = 0; i < result.length; i++)
            {
                var res = result[i];
                global.channelCache[res.ChannelID] = res.ChannelName;
            }
            resolve("SuccCess");
        })
        .catch((err) => {reject("ChannelNames")});
    });

    return PromisedChannelNames;
}

function LoadUserValuesCache()
{
    var PromisedUserValues = new Promise((resolve, reject) =>
    {
        var query = `SELECT * FROM userval Left join alteventnames on BirthdayEventID = EventID`;
        global.userCache = {};
    
        callSQLQuery(query)
        .then((result) =>
        {
            for (var i = 0; i < result.length; i++)
            {
                var res = result[i];
                if (global.userCache[res.DiscordID] != null)
                {
                    global.userCache[res.DiscordID].AltNames.push(res.EventName);
                }
                else
                {
                    var resj =
                    {
                        "PersonName": res.PersonName,
                        "AltNames": [ res.EventName ]
                    }
                    global.userCache[res.DiscordID] = resj;
                }
            }
            resolve("SuccCess");
        })
        .catch((err) => {reject("UserValues")});
    });

    return PromisedUserValues;
}

function LoadPleasedCache()
{
    var PromisedPleased = new Promise((resolve, reject) =>
    {
        var query = `SELECT PersonName, UserID, DefaultNormalChance, DefaultH1Chance, DefaultH2Chance, DefaultH3CHance, DefaultRNGFontChance, DefaultFlagChance FROM pleased
	                 Left Join userval on pleased.UserID = userval.DiscordID;`;
        var jsonLocation = babadata.datalocation + "Pleasedcache.json";

        callSQLQuery(query)
        .then((result) =>
        {
            var opts = [];
            for (var i = 0; i < result.length; i++)
            {
                var res = result[i];
                var resj = 
                {
                    "PersonName": res.PersonName,
                    "UserID": res.UserID,
                    "DefaultNormalChance": res.DefaultNormalChance,
                    "DefaultH1Chance": res.DefaultH1Chance,
                    "DefaultH2Chance": res.DefaultH2Chance,
                    "DefaultH3CHance": res.DefaultH3CHance,
                    "DefaultRNGFontChance": res.DefaultRNGFontChance,
                    "DefaultFlagChance": res.DefaultFlagChance,
                }

                opts.push(resj);
            }

            var data = JSON.stringify(opts);
            fs.writeFileSync(jsonLocation, data);
            resolve("SuccCess");
        })
        .catch((err) => {reject("Pleased")});
    });

    return PromisedPleased;
}

function LoadPleasedOverideCache()
{
    var PromisedPleasedOveride = new Promise((resolve, reject) =>
    {
        var query = `SELECT PersonName, OverideUserIDs, UserID, DefaultNormalChance, DefaultH1Chance, DefaultH2Chance, DefaultH3CHance, DefaultRNGFontChance, DefaultFlagChance FROM pleasedOverides
                     Left Join userval on pleasedOverides.UserID = userval.DiscordID;`;
        var jsonLocation = babadata.datalocation + "PleasedOVERIDEcache.json";

        callSQLQuery(query)
        .then((result) =>
        {
			var opts = {};
			for (var i = 0; i < result.length; i++)
			{
				var res = result[i];
				var resj = 
				{
					"UID": res.UserID,
					"OverideUIDs": res.OverideUserIDs,
					"DefaultNormalChance": res.DefaultNormalChance,
					"DefaultH1Chance": res.DefaultH1Chance,
					"DefaultH2Chance": res.DefaultH2Chance,
					"DefaultH3Chance": res.DefaultH3CHance,
					"DefaultRNGFontChance": res.DefaultRNGFontChance,
					"DefaultFlagChance": res.DefaultFlagChance
				}

				opts[res.PersonName] = resj;
			}

            var data = JSON.stringify(opts);
            fs.writeFileSync(jsonLocation, data);
            resolve("SuccCess");
        })
        .catch((err) => {reject("PleasedOveride")});
    });

    return PromisedPleasedOveride;
}

function LoadOptCache()
{
    var PromisedOpt = new Promise((resolve, reject) =>
    {
        var query = `Select * from opting`;
        var jsonLocation = babadata.datalocation + "optscache.json";

        callSQLQuery(query)
        .then((result) =>
        {
            var opts = [];
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
            fs.writeFileSync(jsonLocation, data);
            resolve("SuccCess");
        })
        .catch((err) => {reject("Opts")});
    });

    return PromisedOpt;
}

function LoadAllSlashFridayStuff()
{
    var PromisedFriday = new Promise((resolve, reject) =>
    {
        // load in dowcache and fridayloops from json files
        let rawdata = fs.readFileSync(babadata.datalocation + "DOWcache.json");
        var tempdowcache = JSON.parse(rawdata);
        var newdowcache = null;
    
        let rawloops = fs.readFileSync(babadata.datalocation + "FridayLoops.json");
        var tempfridayloops = JSON.parse(rawloops);
        var newfridayloops = null;
    
        let rawcontrol = fs.readFileSync(babadata.datalocation + "DOWcontrol.json");
        var tempdowcontrol = JSON.parse(rawcontrol);
        var newdowcontrol = null;

        const FridayAsync = async function() 
        {    
            // Time Gates -- TimeGates.json - `Select * from timegatess`
            const TimeGatesResult = await LoadTimeGatesCache();
            console.log("Time Gates Cache: " + TimeGatesResult, false, true);
    
            // Slash Friday Values -- DOWcache.json - `SELECT * FROM dowfunny left join fridaytimegates on dowfunny.UID = fridaytimegates.fUID`
            newdowcache = await LoadFridayCache();
            console.log("Friday Cache: SuccCess", false, true);
            // Friday Control Options -- DOWcontrol.json - `Select * from dowcontrol`
            newdowcontrol = await LoadFridayControlCache();
            console.log("Friday Control Cache: SuccCess", false, true);
            // Friday Sub Options -- FridayLoops.json - `Select * from fridaynestedloops`
            newfridayloops = await LoadFridayLoopsCache();
            console.log("Friday Loops Cache: SuccCess", false, true);
        }

        FridayAsync().then(() => 
        {
            // we do the saving stuff here
            var changes = false;
            if (newdowcache.length != tempdowcache.length)
                changes = true;
            else
            {
                for (var i = 0; i < newdowcache.length; i++)
                {
                    if (newdowcache[i].text != tempdowcache[i].text)
                    {
                        changes = true;
                        break;
                    }
                }
            }

            if (!changes)
            {
                // compare newfridayloops to tempfridayloops
                if (Object.keys(newfridayloops).length != Object.keys(tempfridayloops).length)
                    changes = true;
                else
                {
                    for (var x in newfridayloops)
                    {
                        if (tempfridayloops[x] == null)
                        {
                            changes = true;
                            break;
                        }
                        if (newfridayloops[x].length != tempfridayloops[x].length)
                        {
                            changes = true;
                            break;
                        }
                        for (var i = 0; i < newfridayloops[x].length; i++)
                        {
                            if (newfridayloops[x][i].text != tempfridayloops[x][i].text)
                            {
                                changes = true;
                                break;
                            }
                        }
                        if (changes)
                            break;
                    }
                }
            }

            if (!changes)
            {
                // compare newdowcontrol to tempdowcontrol
                if (newdowcontrol.length != tempdowcontrol.length)
                    changes = true;
                else
                {
                    for (var i = 0; i < newdowcontrol.length; i++)
                    {
                        if (newdowcontrol[i].Control != tempdowcontrol[i].Control)
                        {
                            changes = true;
                            break;
                        }
                    }
                }
            }

            if (changes)
            {
                console.log("Changes Detected, Saving Cache", false, true);
                // if babadata.datalocation + "FridayCache" doesn't exist, create it
                if (!fs.existsSync(babadata.datalocation + "FridayCache"))
                {
                    fs.mkdirSync(babadata.datalocation + "FridayCache");
                }

                // save tempfridayloops to babadata.datalocation + "FridayCache/FridayLoops" + fcacheitems + ".json";
                var fcacheitems = 0;
                // set to number of files in directory / 3
                fs.readdir(babadata.datalocation + "FridayCache", (err, files) => {
                    fcacheitems = files.length / 3;
                    var data = JSON.stringify(tempfridayloops);
                    fs.writeFileSync(babadata.datalocation + "FridayCache/FridayLoops" + fcacheitems + ".json", data);
                });

                // save tempdowcache to babadata.datalocation + "FridayCache/DOWcache" + dcacheitems + ".json";
                var dcacheitems = 0;
                // set to number of files in directory / 3
                fs.readdir(babadata.datalocation + "FridayCache", (err, files) => {
                    dcacheitems = files.length / 3;
                    var data = JSON.stringify(tempdowcache);
                    fs.writeFileSync(babadata.datalocation + "FridayCache/DOWcache" + dcacheitems + ".json", data);
                });

                // save tempdowcontrol to babadata.datalocation + "FridayCache/DOWcontrol" + dcontrolitems + ".json";
                var dcontrolitems = 0;
                // set to number of files in directory / 3
                fs.readdir(babadata.datalocation + "FridayCache", (err, files) => {
                    dcontrolitems = files.length / 3;
                    var data = JSON.stringify(tempdowcontrol);
                    fs.writeFileSync(babadata.datalocation + "FridayCache/DOWcontrol" + dcontrolitems + ".json", data);
                });


                // update TimeGates.json by adding another row (items + 1)
                let rawdata = fs.readFileSync(babadata.datalocation + "TimeGates.json");
                var tempTimeGates = JSON.parse(rawdata);
                // get length of tempTimeGates
                var items = tempTimeGates.length;

                var ctimez = getD1();
                var offset = ctimez.getTimezoneOffset();
                ctimez.setMinutes(ctimez.getMinutes() - offset);

                // add new row to tempTimeGates
                var newboy = {
                    "VersionNumber": items,
                    "DateTime": ctimez
                }
                tempTimeGates.push(newboy);

                // save tempTimeGates to TimeGates.json
                var data = JSON.stringify(tempTimeGates);
                fs.writeFileSync(babadata.datalocation + "TimeGates.json", data);

                if (babadata.testing === undefined)
                {
                    // update db with newboy
                    con.query(`INSERT INTO timegates (VersionNumber, DateTime) VALUES ("${items}", "${newboy.DateTime.toISOString().slice(0, 19).replace('T', ' ')}")`, 
                    function (err, result)
                    {
                        if (err)
                        {
                            if (validErrorCodes(err.code))
                            {
                                EnterDisabledMode(err);
                                return;
                            }
                            else
                                dbErrored(err)
                        }
                    });
                }
                resolve("SuccCess, Changes Detected");
            }
            else
            {
                resolve("SuccCess, No Changes Detected");
            }
        })
        .catch((err) => {reject(err)});
    });

    return PromisedFriday;
}

function LoadTimeGatesCache()
{
    var PromisedTimeGates = new Promise((resolve, reject) =>
    {
        var query = `Select * from timegates`;
        var jsonLocation = babadata.datalocation + "TimeGates.json";

        callSQLQuery(query)
        .then((result) =>
        {
            var opts = [];

			for (var i = 0; i < result.length; i++)
			{
				var res = result[i];

				var ctimez = new Date(res.DateTime);
				var offset = ctimez.getTimezoneOffset();
				ctimez.setMinutes(ctimez.getMinutes() - offset);

				var resj = 
				{
					"VersionNumber": res.VersionNumber,
					"DateTime": ctimez,
				}

				opts.push(resj);
			}
            
            var data = JSON.stringify(opts);
            fs.writeFileSync(jsonLocation, data);
            resolve("SuccCess");
        })
        .catch((err) => {reject("TimeGates")});
    });

    return PromisedTimeGates;
}

function LoadFridayCache()
{
    var PromisedFriday = new Promise((resolve, reject) =>
    {
        var query = `SELECT * FROM dowfunny left join fridaytimegates on dowfunny.UID = fridaytimegates.fUID`;
        var jsonLocation = babadata.datalocation + "DOWcache.json";

        callSQLQuery(query)
        .then((result) =>
        {
            var opts = [];
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
					"h3": res.h3,
					"Occurance": 100,

					"StartTime": res.StartTime,
					"EndTime": res.EndTime,
					"DayOfWeek": res.DayOfWeek,
					"OccuranceChance": res.OccuranceChance == null ? 100 : res.OccuranceChance,
				}

				opts.push(resj);
			}

            var data = JSON.stringify(opts);
            fs.writeFileSync(jsonLocation, data);
            resolve(opts);
        })
        .catch((err) => {reject("DOWCache")});
    });

    return PromisedFriday;
}

function LoadFridayControlCache()
{
    var PromisedFridayControl = new Promise((resolve, reject) =>
    {
        var query = `Select * from dowcontrol`;
        var jsonLocation = babadata.datalocation + "DOWcontrol.json";

        callSQLQuery(query)
        .then((result) =>
        {
            var opts = [];
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
            fs.writeFileSync(jsonLocation, data);
            resolve(opts);
        })
        .catch((err) => {reject("DOWControl")});
    });

    return PromisedFridayControl;
}

function LoadFridayLoopsCache()
{
    var PromisedFridayLoops = new Promise((resolve, reject) =>
    {
        var query = `Select * from fridaynestedloops`;
        var jsonLocation = babadata.datalocation + "FridayLoops.json";

        callSQLQuery(query)
        .then((result) =>
        {
            var opts = [];
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

			// fs.writeFileSync(babadata.datalocation + "FridayLoops.json", data);
			// let rawloops = fs.readFileSync(babadata.datalocation + "FridayLoops.json");

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

			//save to a json file -- testing dont delete shane like you love to delete these things, i saw what you did that one time
			var data = JSON.stringify(replacements);

            fs.writeFileSync(jsonLocation, data);
            resolve(replacements);
        })
        .catch((err) => {reject("FridayLoops")});
    });

    return PromisedFridayLoops;
}

function LoadHolidaysCache()
{
    var PromisedHolidays = new Promise((resolve, reject) =>
    {
        var query = `SELECT * FROM event left join alteventnames on event.EventID = alteventnames.EventID`;
        var jsonLocation = babadata.datalocation + "HolidayFrogs.json";

        callSQLQuery(query)
        .then((result) =>
        {
            var opts = [];
            for (var i = 0; i < result.length; i++)
            {
                var res = result[i];
                var resj = 
                {
                    "EventRealName": res.EventRealName,
                    "EventFrogName": res.EventFrogName,
                    "Mode": res.Mode,
                    "Day": res.Day,
                    "Month": res.Month,
                    "DOW": res.DOW,
                    "Week": res.Week,
                    "EventName": res.EventName,
                    "ParentEventID": res.ParentEventID,
                    "EventID": res.EventID,
                }

                opts.push(resj);
            }

            var data = JSON.stringify(opts);
            fs.writeFileSync(jsonLocation, data);
            resolve("SuccCess");
        })
        .catch((err) => {reject("Holidays")});
    });

    return PromisedHolidays;
}

function LoadHaikusCache()
{
    var PromisedHaikus = new Promise((resolve, reject) =>
    {
        var query = `SELECT * FROM haiku
                     Left Join userval on haiku.PersonName = userval.PersonName 
                     Left Join channelval on haiku.ChannelID = channelval.ChannelID`;
        var jsonLocation = babadata.datalocation + "HaikusCache.json";

        callSQLQuery(query)
        .then((result) =>
        {
            var opts = [];
            for (var i = 0; i < result.length; i++)
            {
                var res = result[i];
                var resj = 
                {
                    "PersonName": res.PersonName,

                    "DiscordID": res.DiscordID,
                    "DiscordName": res.DiscordName,

                    "Haiku": res.Haiku,
                    "HaikuFormatted": res.HaikuFormatted,

                    "Accidental": res.Accidental,

                    "Date": res.Date,
                    "URL": res.URL,

                    "ChannelID": res.ChannelID,
                    "ChannelName": res.ChannelName,
                }

                opts.push(resj);
            }

            var data = JSON.stringify(opts);
            fs.writeFileSync(jsonLocation, data);
            resolve("SuccCess");
        })
        .catch((err) => {reject("Haikus")});
    });

    return PromisedHaikus;
}

function controlDOW(id, level, prefix)
{
	var lcx = prefix.toLowerCase();
    var PromisedControlDOW = new Promise((resolve, reject) =>
    {
        var query = `Select * from ${lcx}control where ID${prefix}Control = "${id}"`;
        callSQLQuery(query)
        .then((result) =>
        {
            if (result.length == 0)
                query = `INSERT INTO ${lcx}control (ID${prefix}Control, controlLevel) VALUES ("${id}", "${level}")`;
            else
                query = `UPDATE ${lcx}control Set controlLevel = "${level}" WHERE ID${prefix}Control = "${id}"`;

            callSQLQuery(query)
            .then((result) =>
            {
                if (prefix == "DOW")
                {
                    LoadAllSlashFridayStuff();
                }
                else if (prefix == "FROG")
                {
                    LoadFrogCache();
                }
                resolve("SuccCess");
            }) 
            .catch((err) => {reject(lcx + "Control")});
        })
        .catch((err) => {reject(lcx + "Control")});
    });

    return PromisedControlDOW;
}

// Emoji Functions  --------------------------------------------------------------------------------------------------------------------------------------------------

function getGroupedEmoji(emojiList, emojiName)
{
    for (var i = 0; i < emojiList.length; i++)
    {
        var emoji = emojiList[i];
        if (emoji.name == emojiName)
        {
            return emoji;
        }
    }

    return null;
}

function groupEmojiByTones(emojiList)
{
    var list = emojiList.emojis;
    var grouped = [];
    for (var i = 0; i < list.length; i++)
    {
        var emoji = list[i];
        var eName = emoji.name;
        emoji.emojis = [];
        emoji.emojis.push(emoji.emoji);

		if (eName.includes("skin tone"))
        {
            var enameSplit = "";
            // split the name by "light", "medium", "dark", "mediumdark", "mediumlight"
            enameSplit = eName.replace("medium-dark skin tone", "")
            .replace("medium-light skin tone", "")
            .replace("light skin tone", "")
            .replace("medium skin tone", "")
            .replace("dark skin tone", "")
            .replace(" , ", " ");

            // remove trailing : or ,
            enameSplit = enameSplit.replace(/[:,\s]+$/, "");

            // trim
            enameSplit = enameSplit.trim();

            var parent = getGroupedEmoji(list, enameSplit);
            if (parent != null)
                parent.emojis.push(emoji.emoji);
            else
            {
                if (enameSplit != "")
                {
                    console.log("Parent not found: " + enameSplit);
                    emoji.name = enameSplit;
                    grouped.push(emoji);
                }
            }
        }
        else
        {
            var parent = getGroupedEmoji(grouped, eName); // check if already in list
            if (parent != null)
                parent.emojis.push(emoji.emoji);
            else
                grouped.push(emoji);
        }
    }

    return grouped;
}

// Hurricane Functions  ----------------------------------------------------------------------------------------------------------------------------------------------

async function saveUpdatedHurrInfo()
{
	return new Promise((resolve, reject) => 
	{
		if(!fs.existsSync(babadata.datalocation + '/hurricanes.json')) 
		{
			fs.writeFileSync(babadata.datalocation + '/hurricanes.json', JSON.stringify([]));
		}
	
		var data = fs.readFileSync(babadata.datalocation + "hurricanes.json");
		var hurrInfo = JSON.parse(data);
	
		for (var i = 0; i < hurrInfo.length; i++)
		{
			if (hurrInfo[i].Updated)
			{
				// update all the info
				var id = hurrInfo[i].ID;
				var name = hurrInfo[i].Name;
				var number = hurrInfo[i].Number;
				var type = hurrInfo[i].Type;
				var category = hurrInfo[i].Category;
				var imgURL = hurrInfo[i].ImageURL;
				var xmlURL = hurrInfo[i].XMLURL;
				var year = hurrInfo[i].Year;
				var lastUpdated = hurrInfo[i].LastUpdated;
	
				// insert into database, if it already exists, update it
				con.query(`Insert into hurricane (id, name, number, type, category, imageURL, XMLUrl, Year, lastupdated) VALUES ("${id}", "${name}", "${number}", "${type}", "${category}", "${imgURL}", "${xmlURL}", "${year}", "${lastUpdated}") ON DUPLICATE KEY UPDATE name = "${name}", type = "${type}", category = "${category}", lastupdated = "${lastUpdated}"`,
				function (err, result)
				{
					if (err)
					{
						if (validErrorCodes(err.code))
						{
							EnterDisabledMode(err);
							return;
						}
						else
							dbErrored(err)
					}
				});
	
				hurrInfo[i].Updated = false;
			}
		}

		resolve();
	});
}

async function getHurricaneInfo()
{
	return new Promise((resolve, reject) =>
	{
		// wait for saveUpdatedHurrInfo to finish
		saveUpdatedHurrInfo().then(() =>
		{
			con.query(`Select * from hurricane`,
			function (err, result)
				{
					var opts = [];
					if (err)
					{
						if (validErrorCodes(err.code))
						{
							EnterDisabledMode(err);
							return;
						}
						else
							dbErrored(err)
					}
		
					for (var i = 0; i < result.length; i++)
					{
						var res = result[i];
		
						if (res.Year != getD1().getFullYear())
							continue;
						
						// convert lastupdated to current timezone
						var ctimez = new Date(res.LastUpdated);
						var offset = ctimez.getTimezoneOffset();
						ctimez.setMinutes(ctimez.getMinutes() - offset);

						var resj = 
						{
							"ID": res.id,
							"LastUpdated": ctimez,
							"Name": res.name,
							"Number": res.number,
							"Type": res.type,
							"Category": res.category,
							"ImageURL": res.imageURL,
							"XMLURL": res.XMLUrl,
							"Year": res.Year,
							"Updated": false,
							"OverideText": null
						}

		
						opts.push(resj);
					}
		
					var data = JSON.stringify(opts);
		
					fs.writeFileSync(babadata.datalocation + "hurricanes.json", data);
				
					resolve();
				}
			);
		});
	});
}

// Reminder Functions  -----------------------------------------------------------------------------------------------------------------------------------------------

function AddReminderToDB(reminderItem)
{
    var fileString = "";
    if (reminderItem.Files != null)
    {
        for (var i = 0; i < reminderItem.Files.length; i++)
        {
            fileString += reminderItem.Files[i] + ",";
        }
    }

    var dtsrart = new Date(reminderItem.Date).toISOString().slice(0, 19).replace('T', ' ');

    return new Promise((resolve, reject) =>
    {
        var testIndex = babadata.testing === undefined ? false : true;

        var query = `Insert into reminders (Source, Message, UserID, Files, Date, ChannelID, ThreadParentID, EnabledAtPerson, ID, Testing) VALUES ("${reminderItem.Source}", "${reminderItem.Message}", "${reminderItem.UserID}", "${fileString}", "${dtsrart}", "${reminderItem.ChannelID}", "${reminderItem.ThreadParentID}", ${reminderItem.EnableAtPerson}, "${reminderItem.ID}", ${testIndex})`;
        callSQLQuery(query)
        .then(() => 
        {
            resolve("SuccCess");
        })
        .catch((err) => {reject("Reminder")});
    });
}

function EditReminderInDB(reminderItem)
{
    var fileString = "";
    if (reminderItem.Files != null)
    {
        for (var i = 0; i < reminderItem.Files.length; i++)
        {
            fileString += reminderItem.Files[i] + ",";
        }
    }

    var dtsrart = new Date(reminderItem.Date).toISOString().slice(0, 19).replace('T', ' ');

    return new Promise((resolve, reject) =>
    {
        var query = `Update reminders Set Source = "${reminderItem.Source}", Message = "${reminderItem.Message}", Files = "${fileString}", Date = "${dtsrart}", ChannelID = "${reminderItem.ChannelID}", ThreadParentID = "${reminderItem.ThreadParentID}", EnabledAtPerson = ${reminderItem.EnableAtPerson} WHERE ID = "${reminderItem.ID}"`;
        callSQLQuery(query)
        .then(() => 
        {
            resolve("SuccCess");
        })
        .catch((err) => {reject("Reminder")});
    });
}

function DeleteReminderInDB(reminderItem)
{
    return new Promise((resolve, reject) =>
    {
        var query = `Delete from reminders WHERE ID = "${reminderItem.ID}"`;
        callSQLQuery(query)
        .then(() => 
        {
            resolve("SuccCess");
        })
        .catch((err) => {reject("Reminder")});
    });
}

// Cleanup Functions  ------------------------------------------------------------------------------------------------------------------------------------------------

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
	if (timeoutFix != null)
	{
		console.log("Clearing Timeout - DB Fixer");
		clearTimeout(timeoutFix);
	}
}

process.on('SIGINT', cleanupFn);
process.on('SIGTERM', cleanupFn);

global.DBVoiceCleanup = cleanupFn;

module.exports = {
    LoadAllTheCache,
    controlDOW,
    SaveSlashFridayJson,
    EventDB,
    StartDB,
    voiceChannelChange,

    NameFromUserIDID,
    
    clearVCCList,
    optOut,
    optIn,

    getHurricaneInfo,
    saveUpdatedHurrInfo,

    DMMePlease,

    LoadReminderCache,
    AddReminderToDB,
    EditReminderInDB,
    DeleteReminderInDB
}