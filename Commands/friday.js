const { babaFriday } = require("../commandFunctions.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

var options = ["I'm not sure if you are a bot or not, but I'm not going to tell you what day it is, because you are not on friday. I'm sorry.", "Its not friday!", "Why you calling this command on the non friday days!", "Why you calling this command on [dow]!", "Friday is in [d] days!", "Today is [dow], not friday!", "There is a chance you are stupid and dont know what the day of the week is, well i will inform you that it is in fact not friday but another day of the week. I could tell you what the day is but I will not, call the command again and you could get the day or not, I dont control you. So how is your [today] going, for me it is [emotion]. I was playing [game] earlier and it was a [emotion2] time. Well i will let you be on your way on this non-friday so have a good day my [person]!", "Fridayn't!", "It's not time to sacrifice people, wait wrong channel!", "ඞ", "Провозајте се бунгле аутобусом, уживаћете!", "Friday was the other day or in a couple of days, maybe even both, i dont control time.", "Time is a social construct!", "It is [dow], my dudes!", "Bikus wouldn't approve of you using the command on the wrong day of the week and Bikus is dead how dou you feel.", "[todaylong]", "69", "I was gonna tell you the day but i wont!", "||ﬞ||", "No Friday silly!", "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA, Rong dahy!"];
var emotions = ["splendid", "exciting", "sad", "boring", "fun", "exquisite", "happy", "pretty eventful", "slow to start but it picked up later in the day", "not so good", "very good", "legal", "spungungulsumplus", "fish"];
var persontype = ["friend", "enemy", "brother", "BROTHERRRRRR", "bungle bus", "uncle", "second cousin twice removed", "uncles dogs sisters boyfriends moms second cousins cat", "leg"];
var game = ["TF2", "Ultimate Admiral: Dreadnoughts", "Fishing Simulator", "Sea of Thieves", "Factorio", "Forza Horizon 5", "nothing", "Fallout: New Vegas"];
var emotion2 = ["fun", "exciting", "monotonous", "speed run", "pretty eventful", "frog", "emotional"];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('friday')
		.setDescription('Friday :)'),
	async execute(interaction, bot) {
		await interaction.deferReply();
		var tod = new Date();
		if (tod.getDay() != 5)
		{
			if (Math.random() < .1)
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
				var text = options[Math.floor(Math.random() * options.length)];
				var num = ((5 - tod.getDay()) + 7) % 7;

				var dow = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

				text = text.replace("[dow]", dow[tod.getDay()]);
				text = text.replace("[d]", num);
				text = text.replace("[today]", tod.getMonth());
				text = text.replace("[todaylong]", tod.toDateString());
				text = text.replace("[emotion]", emotions[Math.floor(Math.random() * emotions.length)]);
				text = text.replace("[game]", game[Math.floor(Math.random() * game.length)]);
				text = text.replace("[emotion2]", emotion2[Math.floor(Math.random() * emotion2.length)]);
				text = text.replace("[person]", persontype[Math.floor(Math.random() * persontype.length)]);

				interaction.editReply(text);
			}
		}
		else
		{
			await interaction.editReply(babaFriday());
		}
		
	},
};