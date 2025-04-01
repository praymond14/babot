const { babaUntilHolidays } = require('../Functions/commandFunctions.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { FrogButtons } = require("../Functions/HelperFunctions/basicHelpers.js");
const { functionPostFunnyDOW } = require("../Functions/HelperFunctions/slashFridayHelpers.js");

module.exports = {
	data: new SlashCommandBuilder()
    .setName('wednesday')
    .setDescription('Generates a frog with how many wednesday until an event!')
    .addStringOption(opt => 
        opt.setName("event")
        .setDescription("The event that will get used.")
        .setRequired(true)),
	async execute(interaction, bot) {
		await interaction.deferReply();
        var event = interaction.options.getString("event");
        var message = await interaction.fetchReply();
        
        var texts = await babaUntilHolidays(`${event} wednesday`, interaction.user, "04");
        
        if (texts.length > 1)
        {
            setTimeout(async function()
            {
                FrogButtons(texts, interaction, message);
                await interaction.editReply(texts[0]);
            }, 1000);
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
                setTimeout(async function()
                {
                    await interaction.editReply(texts[0]);
                }, 1000);
            }
        }
	},
};