var babadata = require('./babotdata.json'); //baba configuration file

const fs = require('fs');
var util = require('util');

const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js'); //discord module for interation with discord api

const { dailyCallStart } = require('./Functions/dailycall.js');
const { contextInfo, modalInfo, buttonInfo, stringSelectInfo, userSelectInfo, channelSelectInfo } = require('./Functions/contextMenu');
const { EventDB, voiceChannelChange, DMMePlease } = require('./Functions/Database/databaseVoiceController.js');
const { getOverides, getD1 } = require('./Tools/overrides.js');
const txtCommands = require('./TextCommands/textCommands.js');

var overrides = getOverides();

global.dbAccess = [!process.argv.includes("-db"), process.argv.includes("-db") ? false : true];
global.starttime = getD1(); //get today
global.DailyErrors = 0;
global.DebugFriday = overrides.DebugFriday;

global.toke = babadata.token;
global.interactions = {};

global.loggedVCC = [];

global.Bot = null;

uignoreErrors = overrides.uignoreErrors;

// append to existing log file without overwriting
var log_file = fs.createWriteStream(babadata.temp + 'debug.log', {flags : 'a'});
var db_log_file = fs.createWriteStream(babadata.temp + 'DBdebug.log', {flags : 'a'});
var log_stdout = process.stdout;
console.log = function(d, ignoresave=false, DBdebugLog=false) 
{
	if (!ignoresave)
	{
		if (DBdebugLog)
			db_log_file.write(util.format(d) + '\n');
		else
			log_file.write(util.format(d) + '\n');
	}

	log_stdout.write((DBdebugLog ? "DB: " : "") + util.format(d) + '\n');
};

console.error = function(d, supress=false) 
{
	if (supress)
		return;
	
	log_file.write('---------------------------------\n');
	log_file.write('Caught Exception:\n');
	log_file.write(util.format(d) + '\n');
	log_file.write('---------------------------------\n');
	if (!uignoreErrors)
		log_stdout.write(util.format(d) + '\n');
};

console.log("Starting up on " + global.starttime);
	
const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js')); //get all .js files in the commands folder

function makeBot()
{
	var bot = new Client({ intents: 
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
		GatewayIntentBits.AutoModerationExecution,
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

	return bot;
}

function botOn(bot)
{
	var fjson1 = fs.readFileSync(babadata.datalocation + "fridayCounter.json");
	var fjson2 = fs.readFileSync(babadata.datalocation + "fridaymessages.json");

	// if fjason1 is empty, set it to an empty object {} and save
	if (fjson1 == "")
	{
		fs.writeFileSync(babadata.datalocation + "fridayCounter.json", "{}");
	}

	// if fjason2 is empty, set it to an empty object [] and save
	if (fjson2 == "")
	{
		fs.writeFileSync(babadata.datalocation + "fridaymessages.json", "[]");
	}

	bot.login(global.toke); //login

	bot.on('ready', function (evt) 
	{
		global.Bot = bot;
		console.log('Connected');
	
		var fridayJson = fs.readFileSync(babadata.datalocation + "fridayCounter.json");
		var fridayData = JSON.parse(fridayJson);
		
		if (fridayData.friday === undefined)
			global.fridayCounter = {};
		else
			global.fridayCounter = fridayData
		
		dailyCallStart(bot, __dirname);
	});
	
	bot.commands = new Collection();
	
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
			voiceChannelChange(newMember, oldMember);
		}
	});
	
	// v14 works
	bot.on('guildScheduledEventCreate', async event => {EventDB(event, "create")});
	bot.on('guildScheduledEventUpdate', async (eold, enew) => {EventDB(enew, "update")});
	bot.on('guildScheduledEventDelete', async event => {EventDB(event, "delete")});
	 
	// v14 works
	bot.on('guildScheduledEventUserAdd', async (event, user) => {EventDB(event, "useradd", user)});
	bot.on('guildScheduledEventUserRemove', async (event, user) => {EventDB(event, "userremove", user)});
	
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
}

global.MakeBot = makeBot;
global.BotOn = botOn;

// Initialize Discord Bot
var bot = makeBot();
botOn(bot);

//not shure what this does also but it was in jeremy's code so
var cleanupFn = function cleanup() 
{	
	DMMePlease("https://media.discordapp.net/attachments/979881683790733333/1344098978438053969/Bear_hugs__eskimo_kisses..png?ex=67bfad38&is=67be5bb8&hm=6825f9faae0e9e3e300c7f0e2cc1e6b320f8076449e21d1d31512814f236b3f6&=&format=webp&quality=lossless&width=1400&height=993");

	console.log("Logging off");
	if (global.Bot != null)
	{
		global.Bot.destroy();
		console.log("Bot destroyed");
	}
	console.log("");
}

global.KillBotCleanup = cleanupFn;

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
	if (uignoreErrors)
		return;
	console.log("---------------------------------");
	console.log("Uncaught Exception:");
	console.log("Incrementing DailyErrors to " + global.DailyErrors);
	console.log(err);
	console.log("---------------------------------");

	if (global.DailyErrors > 50)
	{
		console.log("Too many errors, shutting down");
		global.CleanupEverything();
		throw new Error("Too many errors, shutting down");
	}
});