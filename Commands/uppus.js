const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('uppus')
		.setDescription('How long baba has been awoken to the mortal realm for the rot consumes.'), 
	async execute(interaction, bot) 
        {
                var start = global.starttime;
                var now = new Date();
                var diff = now - start;
                var diffDays = Math.floor(diff / 86400000); // days
                var diffHrs = Math.floor((diff % 86400000) / 3600000); // hours
                var diffMins = Math.floor(((diff % 86400000) % 3600000) / 60000); // minutes
                var diffSecs = Math.floor((((diff % 86400000) % 3600000) % 60000) / 1000); // seconds
                var diffMs = Math.floor((((diff % 86400000) % 3600000) % 60000) % 1000); // milliseconds
                var diffString = diffDays + " days, " + diffHrs + " hours, " + diffMins + " minutes, " + diffSecs + " seconds, " + diffMs + " milliseconds";
                await interaction.reply("`" + diffString + "`");
	},
};