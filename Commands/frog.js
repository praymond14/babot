const { SlashCommandBuilder } = require('@discordjs/builders');
const { funnyFrogText } = require("../HelperFunctions/slashFridayHelpers.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('frog')
		.setDescription('FROG!'),
	async execute(interaction, bot) {
		await interaction.deferReply();
        var text = funnyFrogText(interaction.user.id);
		await interaction.editReply(text);
	},
};