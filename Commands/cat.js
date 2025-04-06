const { SlashCommandBuilder } = require('@discordjs/builders');
const { babaCat } = require('../Functions/commandFunctions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cat')
		.setDescription('Gives Cat!'),
	async execute(interaction, bot) {
		var cats = ["😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🐈", "🐱", "CAT!"];
		await interaction.reply(cats[Math.floor(Math.random() * cats.length)]);
		// babaCat(function(val)
		// {
		// 	interaction.editReply("CAT!");
		// });
	},
};