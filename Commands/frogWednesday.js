const { babaWednesday } = require("../commandFunctions.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js'); //discord module for interation with discord api
const { FrogButtons } = require("../helperFunc.js");

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
        var message = await interaction.fetchReply();
        
        babaWednesday(`${event} wednesday`, interaction.user, function(texts) 
        {
            setTimeout(function()
            {
                if (texts.length > 1)
                {
                    FrogButtons(texts, interaction, message);
                    interaction.editReply(texts[0]);
                }
                else interaction.editReply(texts[0]);
            }, 1000);
        });
	},
};