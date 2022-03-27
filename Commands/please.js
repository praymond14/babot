const { babaPlease } = require("../commandFunctions.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('please')
		.setDescription('>:('),
	async execute(interaction) {
		await interaction.reply(babaPlease());
	},
};