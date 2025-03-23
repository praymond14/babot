const { babaDayNextWed, babaUntilHolidays } = require("../commandFunctions.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { FrogButtons } = require("../HelperFunctions/basicHelpers.js");
const { functionPostFunnyDOW } = require("../HelperFunctions/slashFridayHelpers.js");

module.exports = {
	data: new SlashCommandBuilder()
    .setName('days')
    .setDescription('Frog!')
    .addSubcommand(subcommand =>
        subcommand
            .setName('until')
            .setDescription('Days until the specified event!')
            .addStringOption(opt => 
                opt.setName("event")
                .setDescription("The event that will get used.")
                .setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('since')
            .setDescription('Days since the specified event!')
            .addStringOption(opt => 
                opt.setName("event")
                .setDescription("The event that will get used.")
                .setRequired(true))),
	async execute(interaction, bot) {
		await interaction.deferReply();
        var event = interaction.options.getString("event");
        var message = await interaction.fetchReply();

        var subCommand = interaction.options.getSubcommand();

        var nxt = "next";
        if (subCommand === "since") nxt = "last";
        var til = "until";
        if (subCommand === "since") til = "since";

        if (`${event}`.toLowerCase() === nxt + " wednesday") 
        {
            await interaction.editReply(babaDayNextWed(subCommand === "since" ? -1 : 1));
        } 
        else 
        {
            var texts = await babaUntilHolidays(`${event} days ${til}`, interaction.user, "04");
            
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
        }
	},
};