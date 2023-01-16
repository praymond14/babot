const { movetoChannel } = require("../helperFunc.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
var babadata = require('../babotdata.json'); //baba configuration file

module.exports = {
	data: new SlashCommandBuilder()
		.setName('moveto')
		.setDescription('Moves a message to the specified channel!')
        .setDefaultPermission(false)
        .addStringOption(option => option.setName('messageid').setDescription('the message id to move').setRequired(true))
        .addChannelOption(option => option.setName('channel').setDescription('the channel to move to').setRequired(true)),
	async execute(interaction, bot) 
    {
		await interaction.deferReply({ ephemeral: true });
        var fnd = false;
        var msgID = interaction.options.getString('messageid');
        var channel = interaction.options.getChannel('channel');
        var chanMap = interaction.guild.channels.fetch().then(channels => {
            channels.each(chan => { //iterate through all the channels
                if (!fnd && chan.type == "GUILD_TEXT") //make sure the channel is a text channel
                {
                    chan.messages.fetch(msgID).then(message => 
                    {
                        fnd = true;
                        movetoChannel(message, chan, channel.id)
                    }).catch(function (err) {

                    }); //try to get the message, if it exists call setVote, otherwise catch the error
                }
            });
        });

        await interaction.editReply({ content: "Message Moved", ephemeral: true });
	},
};