const fs = require('node:fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token} = require('./babotdata.json');


const commands = [];
const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js')); //get all .js files in the commands folder

for(const file of commandFiles) { //adds all commands in the commands folder to the commands array
    const command = require(`./Commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);

