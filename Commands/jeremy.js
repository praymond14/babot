const { babaJeremy } = require("../commandFunctions.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('jeremy')
		.setDescription('Creates a username in the Jeremy way!'),
	async execute(interaction, bot) {
		await interaction.reply(babaJeremy());
	},
};