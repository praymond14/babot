const { babaWednesday } = require("../commandFunctions.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

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
	async execute(interaction) {
		await interaction.deferReply();
        var event = interaction.options.getString("event");
        var texts = babaWednesday(`${event} when is`);

        await interaction.editReply(texts[0]);
	},
};