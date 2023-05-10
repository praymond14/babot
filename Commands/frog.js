const { babaFriday } = require("../commandFunctions.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { funnyFrogText } = require("../helperFunc.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('frog')
		.setDescription('FROG!'),
	async execute(interaction, bot) {
        var text = funnyFrogText(interaction.user.id);

		await interaction.reply(text);
	},
};