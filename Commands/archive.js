const { movetoChannel } = require("../helperFunc.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
var babadata = require('../babotdata.json'); //baba configuration file

module.exports = {
	data: new SlashCommandBuilder()
		.setName('archive')
		.setDescription('Archives a specific message by replacing it with baba saying it!')
        .setDefaultPermission(false)
        .addStringOption(option => option.setName('messageid').setDescription('the message id to move').setRequired(true))
        .addBooleanOption(option => option.setName('display_user').setDescription('set to true if want to show original sender')),
	async execute(interaction, bot) 
    {
		await interaction.deferReply({ ephemeral: true });
        var fnd = false;
        var msgID = interaction.options.getString('messageid');
        var display_user = interaction.options.getBoolean('display_user');
        var chanMap = interaction.guild.channels.fetch().then(channels => {
            channels.each(chan => { //iterate through all the channels
                if (!fnd && chan.type == "GUILD_TEXT") //make sure the channel is a text channel
                {
                    chan.messages.fetch(msgID).then(message => 
                    {
                        fnd = true;
                        movetoChannel(message, chan, chan.id, true + display_user)
                    }).catch(console.error); //try to get the message, if it exists call setVote, otherwise catch the error
                }
            });
        });

        await interaction.editReply({ content: "Message Archived", ephemeral: true });
	},
};