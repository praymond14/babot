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
	async execute(interaction) {
		await interaction.deferReply();
        var event = interaction.options.getString("event");
        var texts = babaWednesday(`${event} wednesday`);

        await interaction.editReply(texts[0]);
	},
};