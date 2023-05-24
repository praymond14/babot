const { babaWednesday, babaDayNextWed } = require("../commandFunctions.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { FrogButtons } = require("../HelperFunctions/genericHelpers.js");

module.exports = {
	data: new SlashCommandBuilder()
    .setName('days')
    .setDescription('Frog!')
    .addSubcommand(subcommand =>
        subcommand
            .setName('until')
            .setDescription('Days until the specified event!')
            .addStringOption(opt => 
                opt.setName("event")
                .setDescription("The event that will get used.")
                .setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('since')
            .setDescription('Days since the specified event!')
            .addStringOption(opt => 
                opt.setName("event")
                .setDescription("The event that will get used.")
                .setRequired(true))),
	async execute(interaction, bot) {
		await interaction.deferReply();
        var event = interaction.options.getString("event");
        var message = await interaction.fetchReply();

        var subCommand = interaction.options.getSubcommand();

        var nxt = "next";
        if (subCommand === "since") nxt = "last";
        var til = "until";
        if (subCommand === "since") til = "since";

        if (`${event}`.toLowerCase() === nxt + " wednesday") 
        {
            await interaction.editReply(babaDayNextWed(subCommand === "since" ? -1 : 1));
        } 
        else 
        {
            babaWednesday(`${event} days ${til}`, interaction.user, function(texts) 
            {
                if (texts.length > 1)
                {
                    FrogButtons(texts, interaction, message);
                    interaction.editReply(texts[0]);
                }
                else interaction.editReply(texts[0]);
            });
        }

	},
};