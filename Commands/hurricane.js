const { SlashCommandBuilder } = require('@discordjs/builders');
const { babaHurricane } = require('../commandFunctions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hurricane')
		.setDescription('Displays the latest hurricane info from the National Hurricane Center'),
	async execute(interaction, bot) {
		await interaction.deferReply();
		babaHurricane(function(val)
		{
			interaction.editReply(val);
		});
	},
};