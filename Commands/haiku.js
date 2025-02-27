const { babaHaikuEmbed, babaHaikuLinks } = require("../commandFunctions.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { sqlEscapeStringThingforAdamBecauseHeWillDoanSQLInjectionOtherwise } = require("../HelperFunctions/dbHelpers.js");
const { handleButtonsEmbed } = require("../HelperFunctions/basicHelpers.js");
const Discord = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
    .setName('haiku')
    .setDescription('Baba haiku generation and purity scores!')
    .addStringOption(option =>
        option.setName('mode')
            .setDescription('Select Custom to get the Haiku GUI!')
            .addChoices(
                {name: 'Custom', value: 'custom'})),
    // .addSubcommand(subcommand =>
    //     subcommand
    //         .setName('random')
    //         .setDescription('Random haiku from people on the server!'))
    // .addSubcommand(subcommand =>
    //     subcommand
    //         .setName('by')
    //         .setDescription('Haiku made by a specific user!')
    //         .addStringOption(option => option.setName('person_name').setDescription('the persons name'))
    //         .addUserOption(option => option.setName('discord_user').setDescription('the user')))
    // .addSubcommand(subcommand =>
    //     subcommand
    //         .setName('from')
    //         .setDescription('Haiku made in a specific channel!')
    //         .addChannelOption(option => option.setName('channel').setDescription('the channel name').setRequired(true)))
    // .addSubcommand(subcommand =>
    //     subcommand
    //         .setName('on')
    //         .setDescription('Haiku from the specified date!')
    //         .addStringOption(option => option.setName('date').setDescription('the date').setRequired(true)))
    // .addSubcommand(subcommand =>
    //     subcommand
    //         .setName('keyword')
    //         .setDescription('Haiku with the specified keyword!')
    //         .addStringOption(option => option.setName('keyword').setDescription('the keyword to search for').setRequired(true)))
    // .addSubcommand(subcommand =>
    //     subcommand
    //         .setName('custom')
    //         .setDescription('Haiku based on custom options!')
    //         .addStringOption(option => option.setName('person_name').setDescription('the persons name'))
    //         .addChannelOption(option => option.setName('channel').setDescription('the channel name'))
    //         .addStringOption(option => option.setName('keyword').setDescription('keyword to search for'))
    //         .addStringOption(option => option.setName('start_date').setDescription('start date'))
    //         .addStringOption(option => option.setName('end_date').setDescription('end date')))
    // .addSubcommand(subcommand =>
    //     subcommand
    //         .setName('all')
    //         .setDescription('Gets all haikus based on certain factors!')
    //         .addStringOption(option => option.setName('person_name').setDescription('the persons name'))
    //         .addChannelOption(option => option.setName('channel').setDescription('the channel name'))
    //         .addStringOption(option => option.setName('keyword').setDescription('keyword to search for'))
    //         .addStringOption(option => option.setName('start_date').setDescription('start date'))
    //         .addStringOption(option => option.setName('end_date').setDescription('end date')))
    // .addSubcommand(subcommand =>
    //     subcommand
    //         .setName('purity_score_list')
    //         .setDescription('List of haiku purity scores')
    //         .addStringOption(option =>
    //             option.setName('list_type')
    //                 .setDescription('The type of haiku purity list')
    //                 .setRequired(true).addChoices(
    //                     {name: 'Channels', value: 'chan'},
    //                     {name: 'Date', value: 'd8'},
    //                     {name: 'Users', value: 'userN'})))
    // .addSubcommand(subcommand =>
    //     subcommand
    //         .setName('purity_score_custom')
    //         .setDescription('List of haiku purity scores, in a custom way based on certain factors!')
    //         .addStringOption(option =>
    //             option.setName('list_type')
    //                 .setDescription('The type of haiku purity list')
    //                 .setRequired(true).addChoices(
    //                     {name: 'Channels', value: 'chan'},
    //                     {name: 'Date', value: 'd8'},
    //                     {name: 'Users', value: 'userN'}))
    //         .addStringOption(option => option.setName('person_name').setDescription('the persons name'))
    //         .addChannelOption(option => option.setName('channel').setDescription('the channel name'))
    //         .addStringOption(option => option.setName('keyword').setDescription('keyword to search for'))
    //         .addStringOption(option => option.setName('start_date').setDescription('start date'))
    //         .addStringOption(option => option.setName('end_date').setDescription('end date')))
    // .addSubcommand(subcommand =>
    //     subcommand
    //         .setName('purity_score_user')
    //         .setDescription('Haiku purity score per user')
    //         .addStringOption(option => option.setName('person_name').setDescription('the person name'))
    //         .addUserOption(option => option.setName('discord_user').setDescription('The user')))
    // .addSubcommand(subcommand =>
    //     subcommand
    //         .setName('purity_score_channel')
    //         .setDescription('Haiku purity score per channel')
    //         .addChannelOption(option => option.setName('channel').setDescription('the channel name').setRequired(true)))
    // .addSubcommand(subcommand =>
    //     subcommand
    //         .setName('purity_score_date')
    //         .setDescription('Haiku purity score based on date')
    //         .addStringOption(option => option.setName('date').setDescription('the date').setRequired(true)))
    // .addSubcommand(subcommand =>
    //     subcommand
    //         .setName('cursed')
    //         .setDescription('Create a new haiku from all the haikus!')),
	async execute(interaction, bot) {
        var mohde = interaction.options.getString('mode');
        if (mohde === 'custom')
        {
		    await interaction.deferReply({ ephemeral: true });
        }
        else
		    await interaction.deferReply();

        var purity = false;
        var buy = 0;
        var msgstr = "";

        if (mohde === 'custom')
        {
            // haiku buttons
            var contenenent = {content: "Select a Haiku Mode"};
            var row = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.ButtonBuilder()
                        .setCustomId('haiku')
                        .setLabel('Single Haiku')
                        .setStyle(3)
                        .setEmoji('📜'),
                    new Discord.ButtonBuilder()
                        .setCustomId('haiku_list')
                        .setLabel('Multiple Haikus')
                        .setStyle(3)
                        .setEmoji('📜'),
                    new Discord.ButtonBuilder()
                        .setCustomId('purity')
                        .setLabel('Purity Score')
                        .setStyle(3)
                        .setEmoji('📊'),
                    new Discord.ButtonBuilder()
                        .setCustomId('cursed')
                        .setLabel('Cursed Haiku')
                        .setStyle(3)
                        .setEmoji('👻')
                );
            contenenent.components = [row];

            interaction.editReply(contenenent);
        }
        else
        {
            var message = await interaction.fetchReply();
            var info = {"ipp": 5, "page": 0}

            var cont = babaHaikuEmbed(purity, buy, msgstr, info);
            var deadData = purity ? null : babaHaikuLinks(cont);
            
            interaction.editReply(cont[info.page]);
            if (cont[info.page].components != null)
            {
                handleButtonsEmbed(interaction.channel, message, interaction.user.id, cont, deadData);
            }
        }

        // var subCommand = interaction.options.getSubcommand();

        // if (subCommand === 'random')
        // {
        //     msgstr = "";
        // }
        // else if (subCommand === 'by')
        // {
        //     var person = interaction.options.getString('person_name');
        //     var user = interaction.options.getUser('discord_user');
        //     if (person != null)
        //         person = sqlEscapeStringThingforAdamBecauseHeWillDoanSQLInjectionOtherwise(person);

        //     buy = 1;

        //     if (user == null && person == null)
        //         msgstr = interaction.user.id;
        //     else
        //         msgstr = `${person} ${user}`;
        // } 
        // else if (subCommand === 'on')
        // {
        //     var date = interaction.options.getString('date');

        //     buy = 3;

        //     msgstr = `${date}`;
        // } 
        // else if (subCommand === 'from')
        // {
        //     var chan = interaction.options.getChannel('channel');
        //     buy = 2;

        //     msgstr = `${chan}`;
        // } 
        // else if (subCommand === 'custom' || subCommand === 'all' || subCommand === 'purity_score_custom')
        // {
        //     var sdate = interaction.options.getString('start_date');
        //     var edate = interaction.options.getString('end_date');
        //     var chan = interaction.options.getChannel('channel');
        //     var person = interaction.options.getString('person_name');
        //     var keyword = interaction.options.getString('keyword');

        //     if (person != null)
        //         person = sqlEscapeStringThingforAdamBecauseHeWillDoanSQLInjectionOtherwise(person);
            
        //     if (keyword != null)
        //         keyword = sqlEscapeStringThingforAdamBecauseHeWillDoanSQLInjectionOtherwise(keyword);

        //     buy = 4;

        //     msgstr = [sdate, edate, chan, person, keyword, subCommand];
        //     if (subCommand == "purity_score_custom") 
        //     {
        //         var listType = interaction.options.getString('list_type');
        //         list = true;
        //         purity = true;
        //         if (listType === 'chan')
        //         {
        //             chans = true;
        //         }
        //         else if (listType === 'd8')
        //         {
        //             chans = 2;
        //         }
        //     }
        // } 
        // else if (subCommand === 'keyword')
        // {
        //     var keyword = interaction.options.getString('keyword');
            
        //     if (keyword != null)
        //         keyword = sqlEscapeStringThingforAdamBecauseHeWillDoanSQLInjectionOtherwise(keyword);
                
        //     buy = 5;
        //     msgstr = `${keyword}`;
        // }
        // else if (subCommand === 'purity_score_list')
        // {
        //     var listType = interaction.options.getString('list_type');
        //     list = true;
        //     purity = true;
        //     if (listType === 'chan')
        //     {
        //         chans = true;
        //     }
        //     else if (listType === 'd8')
        //     {
        //         chans = 2;
        //     }
        //     msgstr = "";
        // } 
        // else if (subCommand === 'purity_score_user')
        // {
        //     var person = interaction.options.getString('person_name');
        //     var user = interaction.options.getUser('discord_user');

        //     if (person != null)
        //         person = sqlEscapeStringThingforAdamBecauseHeWillDoanSQLInjectionOtherwise(person);

        //     purity = true;

        //     if (user == null && person == null) mye = interaction.user.id;

        //     msgstr = `${person} ${user}`;
        // }
        // else if (subCommand === 'purity_score_channel')
        // {
        //     var channel = interaction.options.getChannel('channel');
        //     purity = true;
        //     msgstr = `${channel}`;
        // } 
        // else if (subCommand === 'purity_score_date')
        // { 
        //     var date = interaction.options.getString('date');
        //     purity = true;
        //     msgstr = `${date}`;
        // }
        // else if (subCommand === 'cursed')
        // {
        //     msgstr = "";
        //     buy = 6;
        // }
	},
};