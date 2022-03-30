const { babaHaikuEmbed } = require("../commandFunctions.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
    .setName('haiku')
    .setDescription('Baba haiku generation and purity scores!')
    .addSubcommand(subcommand =>
        subcommand
            .setName('random')
            .setDescription('Random haiku from people on the server!'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('by')
            .setDescription('Haiku made by a specific user!')
            .addStringOption(option => option.setName('person_name').setDescription('the persons name'))
            .addUserOption(option => option.setName('discord_user').setDescription('the user')))
    .addSubcommand(subcommand =>
        subcommand
            .setName('purity_score_list')
            .setDescription('List of haiku purity scores')
            .addStringOption(option =>
                option.setName('list_type')
                    .setDescription('The type of haiku purity list')
                    .setRequired(true)
                    .addChoice('Channels', 'chan')
                    .addChoice('Users', 'userN')))
    .addSubcommand(subcommand =>
        subcommand
            .setName('purity_score_user')
            .setDescription('Haiku purity score per user')
            .addStringOption(option => option.setName('person_name').setDescription('the person name'))
            .addUserOption(option => option.setName('discord_user').setDescription('The user')))
    .addSubcommand(subcommand =>
        subcommand
            .setName('purity_score_channel')
            .setDescription('Haiku purity score per channel')
            .addChannelOption(option => option.setName('channel').setDescription('the channel name').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('purity_score_date')
            .setDescription('Haiku purity score based on date')
            .addStringOption(option => option.setName('date').setDescription('the date').setRequired(true))),
	async execute(interaction, bot) {
		await interaction.deferReply();

        var purity = false;
        var list = false;
        var chans = false;
        var mye = 0;
        var buy = false;
        var embed;
        var msgstr = "";

        var subCommand = interaction.options.getSubcommand();

        if (subCommand === 'random')
        {
            msgstr = "";
        }
        else if (subCommand === 'by')
        {
            var person = interaction.options.getString('person_name');
            var user = interaction.options.getUser('discord_user');
            buy = true;

            if (user == null && person == null)
                msgstr = interaction.user.id;
            else
                msgstr = `${person} ${user}`;
        } 
        else if (subCommand === 'purity_score_list')
        {
            var listType = interaction.options.getString('list_type');
            list = true;
            purity = true;
            if (listType === 'chan')
            {
                chans = true;
            }
            msgstr = "";
        } 
        else if (subCommand === 'purity_score_user')
        {
            var person = interaction.options.getString('person_name');
            var user = interaction.options.getUser('discord_user');
            purity = true;
            mye = interaction.user.id;
            msgstr = `${person} ${user}`;
        } 
        else if (subCommand === 'purity_score_channel')
        {
            var channel = interaction.options.getChannel('channel');
            purity = true;
            msgstr = `${channel}`;
        } 
        else if (subCommand === 'purity_score_date')
        { 
            var date = interaction.options.getString('date');
            purity = true;
            msgstr = `${date}`;
        }
        embed = babaHaikuEmbed(purity, list, chans, mye, buy, msgstr);

        await interaction.editReply({ content: "BABA MAKE HAIKU", embeds: [embed] })
	},
};