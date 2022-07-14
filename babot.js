const fs = require('fs');
const { Client, Intents, Collection } = require('discord.js'); //discord module for interation with discord api
const Discord = require('discord.js'); //discord module for interation with discord api
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
var babadata = require('./babotdata.json'); //baba configuration file
const txtCommands = require('./textCommands.js');
//const { setCommandRoles } = require('./helperFunc');
const { voiceChannelChange, startUpChecker } = require("./voice.js");
const { cacheOpts } = require('./database');

// Initialize Discord Bot
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES], partials: ["CHANNEL"]});
bot.login(babadata.token); //login

bot.on('ready', function (evt) 
{
	console.log('Connected');
	cacheOpts(function()
	{
		startUpChecker(bot);
	});
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
	voiceChannelChange(newMember, oldMember);
});

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

