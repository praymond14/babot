const { babaFriday } = require("../commandFunctions.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('friday')
		.setDescription('Friday :)'),
	async execute(interaction, bot) {
		await interaction.deferReply();
        await interaction.editReply(babaFriday());
	},
};