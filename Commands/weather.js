const { SlashCommandBuilder } = require('@discordjs/builders');
const { babaWeather } = require('../commandFunctions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('weather')
		.setDescription('Gives weather for the selected location, defaults to Apex, NC!')
        .addStringOption(option => option.setName('city').setDescription('The city to get the weather for!')),
	async execute(interaction, bot) {
		await interaction.deferReply();
        var city = interaction.options.getString('city');
        if (city == null)
            city = "Apex";
            
		babaWeather(city, function(val)
		{
			interaction.editReply(val);
		});
	},
};