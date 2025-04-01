const { SlashCommandBuilder } = require('@discordjs/builders');
const { babaHurricane } = require('../Functions/commandFunctions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hurricane')
		.setDescription('Displays the latest hurricane info from the National Hurricane Center')
        .addStringOption(option => option.setName('name').setDescription('name of the hurricane to track, blank for whole atlantic')),
	async execute(interaction, bot) {
		await interaction.deferReply();
		var name = interaction.options.getString('name');
		babaHurricane(name, function(val)
		{
			interaction.editReply(val);
		});
	},
};