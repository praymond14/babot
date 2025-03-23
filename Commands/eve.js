const { SlashCommandBuilder } = require('@discordjs/builders');
const { babaUntilHolidays } = require('../commandFunctions');
const { FrogButtons } = require("../HelperFunctions/basicHelpers.js");
const { functionPostFunnyDOW } = require("../HelperFunctions/slashFridayHelpers.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eve')
		.setDescription('Gives the date in eves until or since!')
		.addStringOption(opt => 
			opt.setName("event")
			.setDescription("The event that will get used.")
			.setRequired(true)),
	async execute(interaction, bot) {
		await interaction.deferReply();
        var event = interaction.options.getString("event");
        var message = await interaction.fetchReply();
        
        var texts = await babaUntilHolidays(`${event} eves`, interaction.user, "04");

        if (texts.length > 1)
        {
            FrogButtons(texts, interaction, message);
            await interaction.editReply(texts[0]);
        }
        else 
        {
            if (texts[0].files == null)
            {
                var text = texts[0].content;

                if (text == "FUNNYDOW")
                    await functionPostFunnyDOW("interaction", interaction, 3);
                else
                    await interaction.editReply(text);
            }
            else 
            {
                await interaction.editReply(texts[0]);
            }
        }
	},
};