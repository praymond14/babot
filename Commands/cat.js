const { SlashCommandBuilder } = require('@discordjs/builders');
const { babaCat } = require('../commandFunctions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cat')
		.setDescription('Gives Cat!'),
	async execute(interaction, bot) {
		await interaction.deferReply();
		babaCat(function(val)
		{
			interaction.editReply(val);
		});
	},
};