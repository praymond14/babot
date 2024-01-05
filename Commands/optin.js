const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js'); //discord module for interation with discord api
const { optIn } = require('../databaseandvoice.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('optin')
		.setDescription('Opt-into the baba data analysis!')
        .addStringOption(option =>
            option.setName('choices')
                .setDescription('What to opt in to!')
                .setRequired(true)
                .addChoices({ name: 'Voice Activity', value: 'voice' })),
	async execute(interaction, bot) {
        await interaction.deferReply();
        var opts = interaction.options.getString('choices');
        optIn(interaction.member, opts, function(err)
        {
            if(err)
            {
                interaction.editReply({ content: "Error: " + err, ephemeral: true });
            }
            else
            {
                interaction.editReply({ content: "Opted in to " + opts, ephemeral: true });
            }
        });
	},
};