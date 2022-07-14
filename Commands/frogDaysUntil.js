const { babaWednesday, babaDayNextWed } = require("../commandFunctions.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { FrogButtons } = require("../helperFunc.js");

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
        var message = await interaction.fetchReply();

        if (`${event}`.toLowerCase() === "next wednesday") 
        {
            await interaction.editReply(babaDayNextWed());
        } 
        else 
        {
            babaWednesday(`${event} days until`, function(texts) 
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