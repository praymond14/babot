const { SlashCommandBuilder } = require('@discordjs/builders');
const { babaRepost } = require('../Functions/commandFunctions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('repost')
		.setDescription('Manual repost detection while Jeremy is working on the AI update.'), 
	async execute(interaction, bot) {
		await interaction.deferReply();
        await interaction.editReply(babaRepost());
	},
};