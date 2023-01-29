const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('oven')
		.setDescription('Oven the food!'),
	async execute(interaction, bot) {
		// to cause adam to deal with this conflict
		var ovenitems = ["https://tenor.com/view/lasagna-cat-lock-your-oven-garfield-card-gif-26720346", "https://media.discordapp.net/attachments/561209488724459531/1062888125073989742/091.png"]
		await interaction.reply(ovenitems[Math.floor(Math.random() * ovenitems.length)]);
	},
};