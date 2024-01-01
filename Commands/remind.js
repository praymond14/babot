const { SlashCommandBuilder } = require('@discordjs/builders');
const { babaRemind } = require('../commandFunctions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remind')
		.setDescription('Reminds a user of something at a specific time')
        .addStringOption(option => option.setName('message').setDescription('The message to me reminded of!').setRequired(true))
        .addStringOption(option => option.setName('time').setDescription('The time to be reminded at!').setRequired(true))
        .addStringOption(option => option.setName('date').setDescription('The date of the reminder, optional defaults within next 24 hours!')),
	async execute(interaction, bot) 
    {
        await interaction.deferReply({ ephemeral: true });
        
        var message = interaction.options.getString('message');
        var time = interaction.options.getString('time');
        var date = interaction.options.getString('date');

        var actualtime = await babaRemind(message, time, date, interaction);
        var milisec = actualtime.getTime() / 1000;
        // add timezone offset
        milisec += actualtime.getTimezoneOffset() * 60;

        await interaction.editReply({ content: "Reminder Set: <t:" + milisec + ":R> which is <t:" + milisec + ":F>, if baba crashes, tough luck no reminder!", ephemeral: true });
	},
};