const { babaWednesday } = require("../commandFunctions.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { FrogButtons } = require("../HelperFunctions/basicHelpers.js");
const { splitStringInto2000CharChunksonNewLine } = require("../HelperFunctions/slashFridayHelpers.js");

module.exports = {
	data: new SlashCommandBuilder()
    .setName('when')
    .setDescription('Frog!')
    .addSubcommand(subcommand =>
        subcommand
            .setName('is')
            .setDescription('When is the specified event!')
            .addStringOption(opt => 
                opt.setName("event")
                .setDescription("The event that will get used.")
                .setRequired(true))),
	async execute(interaction, bot) {
		await interaction.deferReply();
        var event = interaction.options.getString("event");
        var message = await interaction.fetchReply();
        
        var texts = await babaWednesday(`${event} when is`, interaction.user);
        
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
    
                var chunks = splitStringInto2000CharChunksonNewLine(text);
    
                await interaction.editReply(chunks[0]);
    
                var msg = await interaction.fetchReply();
                // send the rest of the chunks as replys to each other
                for (var i = 1; i < chunks.length; i++)
                {
                    msg = await msg.reply(chunks[i]);
                }	
            }
            else 
            {
                await interaction.editReply(texts[0]);
            }
        }
	},
};