const { setVBH } = require('../Functions/HelperFunctions/adminHelpers.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('banhammer')
		.setDescription('Adds a banhammer reaction to a message')
        .setDefaultPermission(false)
        .addStringOption(option => option.setName('messageid').setDescription('the message id to append the banhammer to').setRequired(true)),
	async execute(interaction, bot) 
    {
        await interaction.deferReply({ ephemeral: true });
        var fnd = false;
        var msgID = interaction.options.getString('messageid');
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
                                setVBH(message);
                                interaction.editReply({ content: "Ban Hammer added to Message: `" + message.content + "`", ephemeral: true });
                            }).catch(function (err) {});
                        })
                    ).catch(function (err) {});

                    chan.messages.fetch(msgID).then(message => 
                    {
                        fnd = true;
                        setVBH(message);
                        interaction.editReply({ content: "Ban Hammer added to Message: `" + message.content + "`", ephemeral: true });
                    }).catch(function (err) {}); //try to get the message, if it exists call setVote, otherwise catch the error
                }
            });
        });
        await interaction.editReply({ content: "Searching for Message", ephemeral: true });
	},
};