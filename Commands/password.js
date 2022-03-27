const { SlashCommandBuilder } = require('@discordjs/builders');
const babadata = require('../babotdata.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('password')
		.setDescription('Gives you the GTL Server Password'),
	async execute(interaction) {
		await interaction.reply(`${babadata.pass}`);
	},
};