const { babaVibeFlag } = require("../commandFunctions.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vibe-time-flag')
		.setDescription('Gives the Vibe Time Flag for the current vibe time'),
	async execute(interaction, bot) {
		await interaction.deferReply();
        await interaction.editReply(babaVibeFlag());
	},
};