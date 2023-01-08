const fs = require('fs');
const { Client, Intents, Collection } = require('discord.js'); //discord module for interation with discord api
const Discord = require('discord.js'); //discord module for interation with discord api
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
var babadata = require('./babotdata.json'); //baba configuration file
const txtCommands = require('./textCommands.js');
//const { setCommandRoles } = require('./helperFunc');
const { voiceChannelChange, startUpChecker } = require("./voice.js");
const { cacheOpts, handleDisconnect, eventDB } = require('./database');
const { dailyCallStart } = require('./dailycall.js');

global.dbAccess = [!process.argv.includes("-db"), process.argv.includes("-db") ? false : true];
global.starttime = new Date();

// Initialize Discord Bot
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_SCHEDULED_EVENTS], partials: ["CHANNEL"]});
bot.login(babadata.token); //login

bot.on('ready', function (evt) 
{
	console.log('Connected');

	if (global.dbAccess[1])
	{
		handleDisconnect("Initializing");

		cacheOpts(function()
		{
			if (babadata.testing === undefined)
			{
				startUpChecker(bot);
			}
		});
	}
	
	dailyCallStart(bot);
});

bot.commands = new Collection();

const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js')); //get all .js files in the commands folder

for(const file of commandFiles) { //adds all commands in the commands folder
	const command = require(`./Commands/${file}`);
	bot.commands.set(command.data.name, command);
}

bot.on('messageCreate', async message => {txtCommands.babaMessage(bot, message)}); //baba message handler

bot.on('voiceStateUpdate', (oldMember, newMember) => 
{
	if (babadata.testing === undefined && (global.dbAccess[1] && global.dbAccess[0]))
		voiceChannelChange(newMember, oldMember);
});

bot.on('guildScheduledEventCreate', async event => {eventDB(event, "create")});
bot.on('guildScheduledEventUpdate', async (eold, enew) => {eventDB(enew, "update")});
bot.on('guildScheduledEventDelete', async event => {eventDB(event, "delete")});
 

bot.on('guildScheduledEventUserAdd', async (event, user) => {eventDB(event, "useradd", user)});
bot.on('guildScheduledEventUserRemove', async (event, user) => {eventDB(event, "userremove", user)});

bot.on('interactionCreate', async interaction => {
	if(!interaction.isCommand()) return;

	const command = bot.commands.get(interaction.commandName);

	if(!command) return;

	try {
		await command.execute(interaction, bot);
	} catch(error) {
		console.error(error);
		await interaction.reply({ content: 'An error occured while executing that command.', ephemeral: true });
	}
}); //baba slash handler

//not shure what this does also but it was in jeremy's code so
var cleanupFn = function cleanup() 
{
	console.log("Logging off");
	bot.destroy();
}

process.on('SIGINT', cleanupFn);
process.on('SIGTERM', cleanupFn);

