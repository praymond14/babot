const { userJoinedVoice, userLeftVoice, checkUserVoiceCrash, endLeftUsersCrash, checkAndCreateUser, optIn } = require("./database");
var babadata = require('./babotdata.json'); //baba configuration file
const fs = require('fs');

function voiceChannelChange(newMember, oldMember)
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
        userJoinedVoice(newUserID, newUserChannel, guild);
    }
    if (oldUserChannel != null && newUserChannel != oldUserChannel)
    {
        userLeftVoice(oldUserID, oldUserChannel, guild);
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
    
    guild.members.fetch(userID)
    .then(user => checkAndCreateUser(userID, user.user.username, function() 
    {
        optOut(user, val, function(){});
    }))

    return true;
    /*
    guild.channels.fetch(babadata.botchan).then(channel => {
        channel.send("<@" + userID + "> would you like to opt in for baba voice activity data analysis?\n"
        + "Type `/optin` to opt in, or `/optout` to opt out (default).\n" + 
        "This data will be used to create fun charts and do predictive analysis of voice activity." +
        "If you don't want to see this message, call one of the commands");
    })
    .catch(console.error);

    // do the @ of person and add to opt out first
    console.log("No In"); */
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

module.exports = 
{
	voiceChannelChange,
    startUpChecker
}
