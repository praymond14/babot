const { SlashCommandBuilder } = require('@discordjs/builders');
const { optOut } = require('../Functions/Database/databaseVoiceController.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('optout')
		.setDescription('Opt-out of the baba data analysis!')
        .addStringOption(option =>
            option.setName('choices')
                .setDescription('What to opt out to!')
                .setRequired(true)
                .addChoices({ name: 'Voice Activity', value: 'voice' })),
	async execute(interaction, bot) {
        await interaction.deferReply();
        var opts = interaction.options.getString('choices');
        optOut(interaction.member, opts, function(err)
        {
            if(err)
            {
                interaction.editReply({ content: "Error: " + err, ephemeral: true });
            }
            else
            {
                interaction.editReply({ content: "Opted out of " + opts, ephemeral: true });
            }
        });
	},
};