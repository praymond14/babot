const { SlashCommandBuilder } = require('@discordjs/builders');
const { getUserReminder, handleButtonsEmbedReminders } = require('../Functions/HelperFunctions/remindersByBaba');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('viewreminders')
		.setDescription('View all reminders set by you!'),
	async execute(interaction, bot) 
    {
        await interaction.deferReply();

        var message = await interaction.fetchReply();

        var reminderList = getUserReminder(interaction.user.id, 0);
        var finalComps = reminderList.finalComponents;
        if (finalComps != null)
            delete reminderList.finalComponents;
        
        await interaction.editReply(reminderList);
        if (reminderList.components != null && reminderList.components[0].components.length > 2)
        {
            handleButtonsEmbedReminders(interaction.channel, message, interaction.user.id, finalComps);
        }
 
        // TODO: get files working

        // await interaction.editReply({ content: "Milkers", ephemeral: true });
	},
};