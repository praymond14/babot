var cowsay = require('cowsay');
var Discord = require('discord.js');
var auth = require('./bauth.json');

// Initialize Discord Bot
var bot = new Discord.Client();

bot.login(auth.token);

bot.on('ready', function (evt) 
{
    console.log('Connected');
});


bot.on('message', message => 
{
    if(message.content.includes('@545036997920817162'))
    {
      message.channel.send('BABA IS YOU');
    }
});

var cleanupFn = function cleanup() 
{
    console.log("Logging off");
    bot.destroy();
}

process.on('SIGINT', cleanupFn);
process.on('SIGTERM', cleanupFn);
