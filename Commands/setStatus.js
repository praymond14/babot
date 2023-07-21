const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setstatus')
		.setDescription('Sets baba\'s status')
        .setDefaultPermission(false)
        .addStringOption(option => 
            option.setName('status')
            .setRequired(true)
            .setDescription('baba\'s status')
            .addChoices(
                { name: 'Online', value: 'online' },
                { name: 'Idle', value: 'idle' },
                { name: 'Invisible', value: 'invisible' },
                { name: 'Do Not Disturb', value: 'dnd' }            
            )),
	async execute(interaction, bot) 
    {
		await interaction.deferReply({ ephemeral: true });
        var status = interaction.options.getString('status');

        bot.user.setStatus(status);
        await interaction.editReply({ content: `Baba is now ${status}`, ephemeral: true });
	},
};