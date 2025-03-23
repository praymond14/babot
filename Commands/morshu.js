const { SlashCommandBuilder } = require('@discordjs/builders');
const { babaMorshu } = require('../HelperFunctions/slashFridayHelpers');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('morshu')
		.setDescription('Morshu will speak your text you give him!')
        .addStringOption(opt => 
            opt.setName("text")
            .setDescription("The text for morshu to transcribe.")
            .setRequired(true))
        .addBooleanOption(opt => 
            opt.setName("subtitles")
            .setDescription("Show subtitles for morshus transcription (off by default)."))
		.addStringOption(option =>
			option.setName('mode')
				.setDescription('The mode of the morshu transcription (defaults to audio)!')
				.addChoices(
					{ name: "Audio", value: "audio" },
					{ name: "Video", value: "video" }            
				)),
	async execute(interaction, bot) {
		await interaction.deferReply();
		var mode = interaction.options.getString('mode');
        var text = interaction.options.getString('text');
        var subtitles = interaction.options.getBoolean('subtitles');

        if (mode == null)
            mode = "video";

        var morshuFile = await babaMorshu(mode, text);
        if (morshuFile.file == null)
            await interaction.editReply("Morshu couldn't transcribe the text, it may have been too long or there was an error!");
        else
        {
            var objectSend = {
                content: "Morshu has spoken!",
                files: [morshuFile.file]
            };

            if (subtitles)
                objectSend.content += "\n```" + text + "```";

            await interaction.editReply(objectSend);
        }

	},
};