const { babaWednesday } = require("../commandFunctions.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
    .setName('day_of_week')
    .setDescription('The day of week for the specified event!')
    .addStringOption(opt => 
        opt.setName("event")
        .setDescription("The event that will get used.")
        .setRequired(true)),
	async execute(interaction, bot) {
		await interaction.deferReply();
        var event = interaction.options.getString("event");
        
        babaWednesday(`${event} day of week`, function(texts) 
        {
            interaction.editReply(texts[0]);
        });
	},
};