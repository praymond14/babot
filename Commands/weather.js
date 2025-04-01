const { SlashCommandBuilder } = require('@discordjs/builders');
const { babaWeather } = require('../Functions/commandFunctions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('weather')
		.setDescription('Gives weather for the selected location, defaults to Apex, NC!')
		.addStringOption(option =>
			option.setName('mode')
				.setDescription('The mode of the weather data!')
				.setRequired(true)
				.addChoices(
					{ name: "Three Day Forcast", value: "four" },
					{ name: "Temperature Graph", value: "deets" }            
				))
        .addStringOption(option => option.setName('city').setDescription('The city to get the weather for!')),
	async execute(interaction, bot) {
		await interaction.deferReply();
        var city = interaction.options.getString('city');
		var mode = interaction.options.getString('mode');
        if (city == null)
            city = "Apex";
            
		babaWeather(mode, city, function(val)
		{
			interaction.editReply(val);
		});
	},
};