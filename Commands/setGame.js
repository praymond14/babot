const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setgame')
		.setDescription('Sets the game of that baba is interacting with')
        .setDefaultPermission(false)
        .addStringOption(option => 
            option.setName('game')
            .setDescription('the game baba is playing')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('mode')
            .setDescription('how baba is interacting with the game')
            .addChoice('Playing', 'playing')
            .addChoice('Watching', 'watching')
            .addChoice('Competing', 'competing')
            .addChoice('Listening', 'listening')
            .addChoice('Streaming', 'streaming')),
	async execute(interaction, bot) 
    {
		await interaction.deferReply({ ephemeral: true });
        var game = interaction.options.getString('game');
        var mode = interaction.options.getString('mode');

        if (mode == null)
            mode = "playing";
        
        var help = { type: `${mode}`.toUpperCase() };
        if (mode == "streaming")
            help.url = "https://www.twitch.tv/directory/game/Baba%20is%20You";

        bot.user.setActivity(game, help);
        await interaction.editReply({ content: `Baba is now ${mode} ${game}`, ephemeral: true });
	},
};