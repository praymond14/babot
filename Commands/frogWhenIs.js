const { babaWednesday } = require("../commandFunctions.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { FrogButtons } = require("../HelperFunctions/basicHelpers.js");

module.exports = {
	data: new SlashCommandBuilder()
    .setName('when')
    .setDescription('Frog!')
    .addSubcommand(subcommand =>
        subcommand
            .setName('is')
            .setDescription('When is the specified event!')
            .addStringOption(opt => 
                opt.setName("event")
                .setDescription("The event that will get used.")
                .setRequired(true))),
	async execute(interaction, bot) {
		await interaction.deferReply();
        var event = interaction.options.getString("event");
        var message = await interaction.fetchReply();
        
        await babaWednesday(`${event} when is`, interaction.user, function(texts) 
        {
            if (texts.length > 1)
            {
                FrogButtons(texts, interaction, message);
                interaction.editReply(texts[0]);
            }
            else interaction.editReply(texts[0]);
        });
	},
};