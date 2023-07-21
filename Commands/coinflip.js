const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js'); //discord module for interation with discord api
var babadata = require('../babotdata.json'); //baba configuration file

module.exports = {
	data: new SlashCommandBuilder()
		.setName('coinflip')
		.setDescription('Flips a coin!'),
	async execute(interaction, bot) {
		await interaction.deferReply();
        var templocal = babadata.datalocation + "Extra/";
        var coinimg = Math.floor(Math.random() * 4);

        var coint = Math.floor(Math.random() * 2);
        
        var newAttch = new Discord.AttachmentBuilder(templocal + `/cf${coinimg}.gif`, 
            { name: 'coin.gif', description : "Its gonna be " + (coint ? "Heads" : "Tails") + "!"}); //makes a new discord attachment

		await interaction.editReply({ content: "Flipping Coin!", files: [newAttch] });

        var message = await interaction.fetchReply();

        setTimeout(function()
        {
            message.channel.send({ content: "The coin flip result is: `" + (coint ? "Heads" : "Tails") + "`"}).then(interaction.deleteReply());
        }, 2000);
	},
};