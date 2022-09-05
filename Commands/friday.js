const { babaFriday } = require("../commandFunctions.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { funnyDOWText } = require("../helperFunc.js");



module.exports = {
	data: new SlashCommandBuilder()
		.setName('friday')
		.setDescription('Friday :)'),
	async execute(interaction, bot) {
		await interaction.deferReply();
		var tod = new Date();
		if (tod.getDay() != 5)
		{
			if (Math.random() < .05)
			{
				await interaction.editReply(babaFriday());
				var message = await interaction.fetchReply();

				setTimeout(function()
				{
					message.channel.send({ content: "Haha, it's not Friday! Gottem!"}).then(msg => 
					{
						interaction.deleteReply();
						setTimeout(function()
						{
							msg.delete();
						}, 5000);
					});
				}, 17000);
			}
			else
			{
				var text = funnyDOWText(5);

				interaction.editReply(text);
			}
		}
		else
		{
			await interaction.editReply(babaFriday());
		}
		
	},
};