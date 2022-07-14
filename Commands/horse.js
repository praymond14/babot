const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('horse')
		.setDescription('IDK, it does something!'),
	async execute(interaction, bot) {
		await interaction.reply(babaHonse(bot));
	},
};

function babaHonse(bot)
{
    var hid = data.horseids[Math.floor(Math.random() * data.horseids.length)];
    const emoji = bot.emojis.cache.get(hid)
    return { content: `${emoji}` };
}