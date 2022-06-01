const { babaWhomst } = require('../commandFunctions.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whomst')
        .setDescription('Translate between users and names')
        .addUserOption(option =>
            option.setName('discord_user')
            .setDescription('user to look up')),
    async execute(interaction, bot) {
        await interaction.deferReply();
        var user = interaction.options.getUser('discord_user');

        babaWhomst(
            user,
            function(val)
            {
                interaction.editReply(val);
            }
        )
    }
}