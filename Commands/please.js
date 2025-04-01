const { babaPlease } = require('../Functions/commandFunctions.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('please')
		.setDescription('>:('),
	async execute(interaction, bot) {
		var admin = "BABA IS ADMIN\n";
		await interaction.reply(admin + babaPlease().content);
	},
};