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
            .addChoices(
                { name: 'Playing', value: '0' },
                { name: 'Watching', value: '3' },
                { name: 'Competing', value: '5' },
                { name: 'Listening', value: '2' },
                { name: 'Streaming', value: '1' }                
            )),
	async execute(interaction, bot) 
    {
		await interaction.deferReply({ ephemeral: true });
        var game = interaction.options.getString('game');
        var mode = interaction.options.getString('mode');

        if (mode == null)
            mode = '0';
        
        //convert to int
        var help = { type: parseInt(mode) };

        console.log(help);
        if (mode == "1")
            help.url = "https://www.twitch.tv/directory/game/Baba%20is%20You";

        mode = mode.replace("0", "Playing");
        mode = mode.replace("1", "Streaming");
        mode = mode.replace("2", "Listening to");
        mode = mode.replace("3", "Watching");
        mode = mode.replace("5", "Competing in");

        bot.user.setActivity(game, help);
        await interaction.editReply({ content: `Baba is now ${mode} ${game}`, ephemeral: true });
	},
};