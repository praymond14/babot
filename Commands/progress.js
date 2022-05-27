const { SlashCommandBuilder } = require('@discordjs/builders');
const { babaProgress } = require('../commandFunctions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('progress')
		.setDescription('Baba will give you the percentage of time it is throughout the year.'), 
	async execute(interaction, bot) {
		await interaction.deferReply();
        await interaction.editReply(babaProgress());
	},
};