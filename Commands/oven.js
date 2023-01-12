const { SlashCommandBuilder } = require('@discordjs/builders');
const { babaCat } = require('../commandFunctions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('oven')
		.setDescription('Oven the food!'),
	async execute(interaction, bot) {
		await interaction.reply('https://media.discordapp.net/attachments/561209488724459531/1062888125073989742/091.png');
	},
};