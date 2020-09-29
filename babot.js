var Discord = require('discord.js'); //discord stuff
var babadata = require('./babotdata.json');//contains all data for baba to run

// Initialize Discord Bot
var bot = new Discord.Client();

bot.login(babadata.token); //login

//not shure what this does but it was in jeremy's code so
bot.on('ready', function (evt) 
{
    console.log('Connected');
});

//stuff when message is recived.
bot.on('message', message => 
{
    //code to do log stuff
    if(message.content.toLowerCase().includes('baba') && !message.content.toLowerCase().includes('baba is admin'))
    {
      var text = 'BABA IS ADMIN';
      //message.channel.send('BABA IS ADMIN');
      if(message.content.toLowerCase().includes('help'))
         {
            text += '\n use BABA password to get passwords for servers';
         }
      if(message.content.toLowerCase().includes('password'))
        {
            text += '\n' + babadata.pass;
        }
     message.channel.send(text);
    }
    if(message.content.toLowerCase().includes('!delete'))//code to del and move to log
         {
            if(message.member.roles.cache.has(babadata.adminid))//check if admin
                {
                    var message_id = message.content.replace(/\D/g,''); //get message id
                    //log message
                    //get a map of the channelt in the guild
                    var chanMap = message.guild.channels.cache;
                    //iterate through all the channels
                    for(let [k, chan] of chanMap){
                        //make sure the channel is a text channel
                        if(chan.type == "text"){
                            //try to get the message, if it exists call deleteAndArchive, otherwise catch the error
                            chan.messages.fetch(message_id).then(message => deleteAndArchive(message)).catch(console.error);
                        }

                    }
                }
         }
});

//archive the message and delete it
function deleteAndArchive(msg){
    //gets the special archive channel
    var hiddenChan = msg.guild.channels.cache.get(babadata.logchn);
    //gets the user that sent the message
    var usr = msg.author;
    //sets the header of the message to mention the original poster
    var savemsg = "This message sent by: <@" + usr + ">\n> "
    //insert the actual message below
    savemsg += msg.content;
    //get the attacments from the original message
    var attch = msg.attachments;
    var newAttch;
    for(let [k, img] of attch){
        //attach the last image
        newAttch = new Discord.MessageAttachment().setFile(img.url);
    }
    //send the message
    hiddenChan.send(savemsg, newAttch);
    //delete the original
    msg.delete();
}

//not shure what this does also but it was in jeremy's code so
var cleanupFn = function cleanup() 
{
    console.log("Logging off");
    bot.destroy();
}

process.on('SIGINT', cleanupFn);
process.on('SIGTERM', cleanupFn);
