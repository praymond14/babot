const { SlashCommandBuilder } = require('@discordjs/builders');
const { babaProgress } = require('../Functions/commandFunctions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('progress')
		.setDescription('Baba will give you the percentage of time it is throughout the year.')
		.addIntegerOption(option => option.setName('length').setDescription('How long the progress bar is.')), 
	async execute(interaction, bot) {
		var length = interaction.options.getInteger('length');
		if (length == null) length = 20;
		if (length > 1900) length = 1900;
		await interaction.deferReply();
        await interaction.editReply(babaProgress(length));
	},
};