const { setVote } = require('../HelperFunctions/adminHelpers.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setvote')
		.setDescription('Adds a 👍 and 👎 reaction to a message')
        .setDefaultPermission(false)
        .addStringOption(option => option.setName('messageid').setDescription('the message id to append the vote to').setRequired(true)),
	async execute(interaction, bot)
    {
		await interaction.deferReply({ ephemeral: true });
        var msgID = interaction.options.getString('messageid');
        var fnd = false;

        var chanMap = interaction.guild.channels.fetch().then(channels => {
            channels.each(chan => { //iterate through all the channels
                if (!fnd && chan.type == "GUILD_TEXT") //make sure the channel is a text channel
                {
                    chan.threads.fetch().then(thread => 
                        thread.threads.each(thr =>
                        {
                            thr.messages.fetch(msgID).then(message => 
                            {
                                fnd = true;
                                setVote(message);
                                interaction.editReply({ content: "Vote Added to Message: `" + message.content + "`", ephemeral: true });
                            }).catch(function (err) {});
                        })
                    ).catch(function (err) {});

                    chan.messages.fetch(msgID).then(message => 
                    {
                        fnd = true;
                        setVote(message);
                        interaction.editReply({ content: "Vote Added to Message: `" + message.content + "`", ephemeral: true });
                    }).catch(function (err) {}); //try to get the message, if it exists call setVote, otherwise catch the error
                }
            });
        });
        await interaction.editReply({ content: "Searching for Message", ephemeral: true });
	},
};