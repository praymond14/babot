const { setGrole } = require("../helperFunc.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('grole')
		.setDescription('Adds a new game role!')
        .setDefaultPermission(false)
        .addStringOption(option => option.setName('messageid').setDescription('the message id to pull reactions from').setRequired(true))
        .addStringOption(option => option.setName('rolename').setDescription('the name of the role').setRequired(true)),
	async execute(interaction, bot) 
    {
		await interaction.deferReply({ ephemeral: true });
        var msgID = interaction.options.getString('messageid');
        var roleName = interaction.options.getString('rolename');
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
                                setGrole(message, roleName);
                                interaction.editReply({ content: "Role created: `" + roleName + "`", ephemeral: true });
                            }).catch(function (err) {});
                        })
                    ).catch(function (err) {});

                    chan.messages.fetch(msgID).then(message => 
                    {
                        fnd = true;
                        setGrole(message, roleName);
                        interaction.editReply({ content: "Role created: `" + roleName + "`", ephemeral: true });
                    }).catch(function (err) {}); //try to get the message, if it exists call setVote, otherwise catch the error
                }
            });
        });
        await interaction.editReply({ content: "Searching for Message", ephemeral: true });
	},
};