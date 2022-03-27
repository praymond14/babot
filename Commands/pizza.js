const { babaPizza } = require("../commandFunctions.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pizza')
		.setDescription('Orders you pizza ;)'),
	async execute(interaction) {
		await interaction.reply(babaPizza());
	},
};