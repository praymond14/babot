const { movetoChannel } = require("../helperFunc.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
var babadata = require('../babotdata.json'); //baba configuration file

module.exports = {
	data: new SlashCommandBuilder()
		.setName('political')
		.setDescription('Moves a message to the political channel')
        .setDefaultPermission(false)
        .addStringOption(option => option.setName('messageid').setDescription('the message id to move').setRequired(true)),
	async execute(interaction, bot) 
    {
		await interaction.deferReply({ ephemeral: true });
        var msgID = interaction.options.getString('messageid');
        var fnd = false;
        var chanMap = interaction.guild.channels.fetch().then(channels => {
            channels.each(chan => { //iterate through all the channels
                if (!fnd && chan.type == "GUILD_TEXT") //make sure the channel is a text channel
                {
                    chan.messages.fetch(msgID).then(message => {
                        fnd = true;
                        movetoChannel(message, chan, babadata.politicschan);
                    }).catch(console.error); //try to get the message, if it exists call setVote, otherwise catch the error
                }
            });
        });

        await interaction.editReply({ content: "Message Moved", ephemeral: true });
	},
};