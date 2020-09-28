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
      if(message.content.toLowerCase().includes('!delete')//code to del and move to log
         {
            if(message.member.roles.cache.has(babadata.adminid)//check if admin
                {
                    var message_id = message.content.replace(/\D/g,''); //get message id
                    //log message
                    //del message
                }
         }
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
});

//not shure what this does also but it was in jeremy's code so
var cleanupFn = function cleanup() 
{
    console.log("Logging off");
    bot.destroy();
}

process.on('SIGINT', cleanupFn);
process.on('SIGTERM', cleanupFn);
