const { SlashCommandBuilder } = require('@discordjs/builders');
const { babaMorshu } = require('../HelperFunctions/slashFridayHelpers');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('morshu')
		.setDescription('Gives the date in eves until or since (defaults to audio)!')
        .addStringOption(opt => 
            opt.setName("text")
            .setDescription("The text for morshu to transcribe.")
            .setRequired(true))
		.addStringOption(option =>
			option.setName('mode')
				.setDescription('The mode of the morshu transcription!')
				.addChoices(
					{ name: "Audio", value: "audio" },
					{ name: "Video", value: "video" }            
				)),
	async execute(interaction, bot) {
		await interaction.deferReply();
		var mode = interaction.options.getString('mode');
        var text = interaction.options.getString('text');

        if (mode == null)
            mode = "audio";

        var morshuFile = await babaMorshu(mode, text);
        if (morshuFile.file == null)
            await interaction.editReply("Morshu couldn't transcribe the text, it may have been too long or there was an error!");
        else
        {
            var objectSend = {
                content: "Morshu has spoken!\n```" + text + "```",
                files: [morshuFile.file]
            };
            await interaction.editReply(objectSend);
        }

	},
};