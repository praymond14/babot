const { babaWednesday } = require("../commandFunctions.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
    .setName('wednesday')
    .setDescription('Generates a frog with how many wednesday until an event!')
    .addStringOption(opt => 
        opt.setName("event")
        .setDescription("The event that will get used.")
        .setRequired(true)),
	async execute(interaction, bot) {
		await interaction.deferReply();
        var event = interaction.options.getString("event");
        
        babaWednesday(`${event} wednesday`, function(texts) 
        {
            setTimeout(function()
            {
                interaction.editReply(texts[0]);
            }, 1000);
        });
	},
};