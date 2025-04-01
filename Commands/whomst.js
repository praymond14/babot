const { babaWhomst } = require('../Functions/commandFunctions.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whomst')
        .setDescription('Translate between users and names')
        .addUserOption(option =>
            option.setName('discord_user')
            .setDescription('user to look up').setRequired(true)),
    async execute(interaction, bot) {
        await interaction.deferReply();
        var user = interaction.options.getUser('discord_user');

        var val = await babaWhomst(user);
        await interaction.editReply(val);
    }
}