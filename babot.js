import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { Client, Intents } = require('discord.js'); //discord module for interation with discord api
const Discord = require('discord.js'); //discord module for interation with discord api
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
var babadata = require('./babotdata.json'); //baba configuration file
import {
	CreateHaikuDatabase,
	babaMessage,
} from './textCommands.js';

// Initialize Discord Bot
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES], partials: ["CHANNEL"]});
bot.login(babadata.token); //login

bot.on('ready', function (evt) 
{
	console.log('Connected');

	CreateHaikuDatabase(); // load it in
});

bot.on('messageCreate', message => {babaMessage(bot, message)}); //baba message handler

//not shure what this does also but it was in jeremy's code so
var cleanupFn = function cleanup() 
{
	  console.log("Logging off");
	  bot.destroy();
}

process.on('SIGINT', cleanupFn);
process.on('SIGTERM', cleanupFn);