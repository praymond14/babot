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
	async execute(interaction) {
		await interaction.deferReply();
        var event = interaction.options.getString("event");
        var texts = babaWednesday(`${event} day of week`);

        await interaction.editReply(texts[0]);
	},
};