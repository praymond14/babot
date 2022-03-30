const { babaYugo } = require("../commandFunctions.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('make-yugo')
		.setDescription('Makes you a Yugo'),
	async execute(interaction, bot) {
		await interaction.reply(babaYugo());
	},
};