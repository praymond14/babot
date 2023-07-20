const fs = require('fs');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js'); //discord module for interation with discord api
const Discord = require('discord.js'); //discord module for interation with discord api
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
var babadata = require('./babotdata.json'); //baba configuration file
const txtCommands = require('./textCommands.js');
//const { setCommandRoles } = require('./helperFunc');

const { voiceChannelChange, startUpChecker } = require("./voice.js");
const { cacheOpts, handleDisconnect, eventDB } = require('./database');
const { dailyCallStart } = require('./dailycall.js');
const { contextInfo, modalInfo } = require('./contextMenu');

global.dbAccess = [!process.argv.includes("-db"), process.argv.includes("-db") ? false : true];
global.starttime = new Date();

global.toke = babadata.token;


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

// v14 works
for(const file of commandFiles) { //adds all commands in the commands folder
	const command = require(`./Commands/${file}`);
	bot.commands.set(command.data.name, command);
}

// v14 works
bot.on('messageCreate', async message => {txtCommands.babaMessage(bot, message)}); //baba message handler

// v14 works
bot.on('voiceStateUpdate', (oldMember, newMember) => 
{
	// if (babadata.testing === undefined && (global.dbAccess[1] && global.dbAccess[0]))
	if (global.dbAccess[1] && global.dbAccess[0])
		voiceChannelChange(newMember, oldMember);
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

	if(!interaction.isCommand()) return;

	const command = bot.commands.get(interaction.commandName);

	if(!command) return;

	try {
		await command.execute(interaction, bot);
		const message = await interaction.fetchReply();
		txtCommands.babaMessage(bot, message);
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

