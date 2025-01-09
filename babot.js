const fs = require('fs');
var util = require('util');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js'); //discord module for interation with discord api
const Discord = require('discord.js'); //discord module for interation with discord api
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
var babadata = require('./babotdata.json'); //baba configuration file
const txtCommands = require('./textCommands.js');
//const { setCommandRoles } = require('./helperFunc');

const { cacheOpts, handleDisconnect, eventDB, voiceChannelChange, startUpChecker, logVCC, clearVCCList } = require('./databaseandvoice');
const { dailyCallStart } = require('./dailycall.js');
const { contextInfo, modalInfo, buttonInfo, stringSelectInfo, userSelectInfo, channelSelectInfo } = require('./contextMenu');
const { log } = require('console');

global.dbAccess = [!process.argv.includes("-db"), process.argv.includes("-db") ? false : true];
global.starttime = new Date();
global.DailyErrors = 0;

global.toke = babadata.token;
global.interactions = {};

global.loggedVCC = [];

global.Bot = null;

// append to existing log file without overwriting
var log_file = fs.createWriteStream(babadata.temp + 'debug.log', {flags : 'a'});
var log_stdout = process.stdout;
console.log = function(d, ignoresave=false) 
{
	if (!ignoresave)
		log_file.write(util.format(d) + '\n');
	log_stdout.write(util.format(d) + '\n');
};

console.error = function(d) 
{
	log_file.write('---------------------------------\n');
	log_file.write('Caught Exception:\n');
	log_file.write(util.format(d) + '\n');
	log_file.write('---------------------------------\n');
	log_stdout.write(util.format(d) + '\n');
};

console.log("Starting up on " + global.starttime);

// Initialize Discord Bot
const bot = new Client({ intents: 
	[
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildScheduledEvents,
		GatewayIntentBits.AutoModerationConfiguration,
		GatewayIntentBits.AutoModerationExecution
	], partials: 
	[
		Partials.User,
		Partials.Channel,
		Partials.GuildMember,
		Partials.Message,
		Partials.Reaction,
		Partials.GuildScheduledEvent,
		Partials.ThreadMember
	]});

bot.login(global.toke); //login

bot.on('ready', function (evt) 
{
	global.Bot = bot;
	console.log('Connected');

	if (global.dbAccess[1])
	{
		handleDisconnect("Initializing");

		cacheOpts(function()
		{
			if (babadata.testing === undefined)
			{
				clearVCCList();
				//startUpChecker(bot);
			}
		});
	}
	
	dailyCallStart(bot);
});

bot.commands = new Collection();

const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js')); //get all .js files in the commands folder

// v14 works
for(const file of commandFiles) { //adds all commands in the commands folder
	const command = require(`./Commands/${file}`);
	bot.commands.set(command.data.name, command);
}

// v14 works
bot.on('messageCreate', async message => {await txtCommands.babaMessage(bot, message)}); //baba message handler

// v14 works
bot.on('voiceStateUpdate', (oldMember, newMember) => 
{
	// console.log(global.dbAccess[0]);
	// console.log(global.dbAccess[1]);
	if (babadata.testing === undefined)
	{
		if (global.dbAccess[1] && global.dbAccess[0])
			voiceChannelChange(newMember, oldMember);

		if (!global.dbAccess[1] && global.dbAccess[0])
		{
			var time = new Date();
			logVCC(newMember, oldMember, time);
		}
	}
});

// v14 works
bot.on('guildScheduledEventCreate', async event => {eventDB(event, "create")});
bot.on('guildScheduledEventUpdate', async (eold, enew) => {eventDB(enew, "update")});
bot.on('guildScheduledEventDelete', async event => {eventDB(event, "delete")});
 
// v14 works
bot.on('guildScheduledEventUserAdd', async (event, user) => {eventDB(event, "useradd", user)});
bot.on('guildScheduledEventUserRemove', async (event, user) => {eventDB(event, "userremove", user)});

bot.on('interactionCreate', async interaction => {
	if (interaction.isContextMenuCommand()) 
	{
		contextInfo(interaction, bot);
		return;
	}
	else if (interaction.isModalSubmit())
	{
		modalInfo(interaction, bot);
		return;
	}
	else if (interaction.isButton())
	{
		buttonInfo(interaction, bot);
		return;
	}
	else if (interaction.isStringSelectMenu())
	{
		stringSelectInfo(interaction, bot);
		return;
	}
	else if (interaction.isUserSelectMenu())
	{
		userSelectInfo(interaction, bot);
		return;
	}
	else if (interaction.isChannelSelectMenu())
	{
		channelSelectInfo(interaction, bot);
		return;
	}
		

	if(!interaction.isCommand()) return;

	const command = bot.commands.get(interaction.commandName);

	if(!command) return;

	try {
		await command.execute(interaction, bot);
		const message = await interaction.fetchReply();
		await txtCommands.babaMessage(bot, message);
	} catch(error) {
		console.error(error);
		await interaction.reply({ content: 'An error occured while executing that command.', ephemeral: true });
	}
}); //baba slash handler

//not shure what this does also but it was in jeremy's code so
var cleanupFn = function cleanup() 
{
	console.log("Logging off");
	console.log("");
	bot.destroy();
}

global.CleanupEverything = function()
{
	global.DailyCallCleanup();
	global.DBVoiceCleanup();
	global.CommandHelperCleanup();
	cleanupFn();
}

process.on('SIGINT', cleanupFn);
process.on('SIGTERM', cleanupFn);

process.on('uncaughtException', function (err) 
{
	global.DailyErrors++;
	console.log("---------------------------------");
	console.log("Uncaught Exception:");
	console.log("Incrementing DailyErrors to " + global.DailyErrors);
	console.log(err);
	console.log("---------------------------------");

	if (global.DailyErrors > 50)
	{
		console.log("Too many errors, shutting down");
		global.CleanupEverything();
	}
});