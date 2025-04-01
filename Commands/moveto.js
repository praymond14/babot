const { movetoChannel } = require('../Functions/HelperFunctions/adminHelpers.js');
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
                if (!fnd && chan.type == 0) //make sure the channel is a text channel
                {
                    chan.threads.fetch().then(thread => 
                        thread.threads.each(thr =>
                        {
                            thr.messages.fetch(msgID).then(message => 
                            {
                                fnd = true;
                                movetoChannel(message, thr, channel.id)
                                interaction.editReply({ content: "Message Moved", ephemeral: true });
                            }).catch(function (err) {});
                        })
                    ).catch(function (err) {});

                    chan.messages.fetch(msgID).then(message => 
                    {
                        fnd = true;
                        movetoChannel(message, chan, channel.id)
                        interaction.editReply({ content: "Message Moved", ephemeral: true });
                    }).catch(function (err) {}); //try to get the message, if it exists call setVote, otherwise catch the error
                }
            });
        });
        await interaction.editReply({ content: "Searching for Message", ephemeral: true });
	},
};