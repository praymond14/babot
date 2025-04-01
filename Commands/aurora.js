const { SlashCommandBuilder } = require('@discordjs/builders');
const { babaAurora } = require('../Functions/commandFunctions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('aurora')
		.setDescription('Displays the latest aurora info from the National Oceanic and Atmospheric Administration')
        .addStringOption(option => option.setName('time')
			.setRequired(true)
			.setDescription('Choose the time of the aurora forecast')
			.addChoices(
                {name: 'Today', value: 'tonights'},
				{name: 'Tomorrow', value: 'tomorrow_nights'})),
	async execute(interaction, bot) {
		await interaction.deferReply();
		var time = interaction.options.getString('time');
		babaAurora(time, function(val)
		{
			interaction.editReply(val);
		});
	},
};