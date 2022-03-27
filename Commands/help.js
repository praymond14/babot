const { babaHelp } = require("../commandFunctions.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Shows text command help'),
	async execute(interaction) {
		await interaction.reply(babaHelp());
	},
};