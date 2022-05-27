const { babaWednesday, babaDayNextWed } = require("../commandFunctions.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

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
                .setRequired(true))),
	async execute(interaction, bot) {
		await interaction.deferReply();
        var event = interaction.options.getString("event");

        if (`${event}`.toLowerCase() === "next wednesday") 
        {
            await interaction.editReply(babaDayNextWed());
        } 
        else 
        {
            babaWednesday(`${event} days until`, function(texts) 
            {
                interaction.editReply(texts[0]);
            });
        }

	},
};