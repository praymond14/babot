var Discord = require('discord.js'); //discord stuff
var auth = require('./bauth.json'); //auth for discord
var passwords = require('./pass.json');//passwords

// Initialize Discord Bot
var bot = new Discord.Client();

bot.login(auth.token); //login

//not shure what this does but it was in jeremy's code so
bot.on('ready', function (evt) 
{
    console.log('Connected');
});

//stuff when message is recived.
bot.on('message', message => 
{
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
            text += '\n' + passwords.data;
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
