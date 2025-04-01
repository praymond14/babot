const { babaGoodberrys } = require('../Functions/commandFunctions.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('goodberrys')
		.setDescription('Gets the Goodberrys flavor of the day!')
		.addStringOption(option => option.setName('flavor')
			.setDescription('Search for a flavor of the day in the next month-ish'))
		.addIntegerOption(option => option.setName('day')
			.setDescription('Search for a flavor of the day on a specific day in the next month-ish')),
	async execute(interaction, bot) {
		await interaction.deferReply();

		babaGoodberrys(function(val)
		{
			var flavor = interaction.options.getString('flavor');
			var day = interaction.options.getInteger('day');

			var evnts = val.events;
			
			if (flavor != null)
				evnts = evnts.filter(v => v.summary.toLowerCase().includes(flavor.toLowerCase()));
			if (day != null)
				evnts = evnts.filter(v => v.start.getDate() == day);
			
			// sort events by date
			evnts.sort(function(a, b)
			{
				return a.start - b.start;
			});

			var resp = "";
			for (var i = 0; i < evnts.length; i++)
			{
				var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
				
				resp += evnts[i].summary + " on " + evnts[i].start.toLocaleDateString("en-US", options) + "\n";
			}

			if (resp == "")
				resp = "No events found";

			interaction.editReply(resp);
		});
	},
};