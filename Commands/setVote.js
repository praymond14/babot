const { setVote } = require("../helperFunc.js");
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
                    chan.messages.fetch(msgID).then(message => {
                        fnd = true;
                        setVote(message);
                        interaction.editReply({ content: "Vote Added to Message: `" + message.content + "`", ephemeral: true });
                    }).catch(console.error); //try to get the message, if it exists call setVote, otherwise catch the error
                }
            });
        });
	},
};