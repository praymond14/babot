const { babaFriday } = require("../commandFunctions.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

var options = ["How is your [month] going!", "🍝       🐀☜(ﾟヮﾟ☜)\n🍝     🐀☜(ﾟヮﾟ☜)\n🍝    🐀☜(ﾟヮﾟ☜)\n🍝  🐀☜(ﾟヮﾟ☜)\n🍝🐀╰(°▽°)╯", "Mike", "Not friday today but maybe friday tomorrow", "Real NOT friday hours", "Fish Reading Inside Deep American Yachts", "???????? why ??????", "So, you called this command on a day that happens to not be friday! Well today is in fact a [dow] and it mayhaps is only [d] days until the forsaken 'friday'. On friday I will be playing some [game] and hopefully some others will show up to join me, if they do it will be [emotion] and if they dont it will be [emotion]. Yesterday I met a frog in the wild and had a [emotion2] time chasing it down. As I am an all powerful god i converted the frog into an emoji: 🐸. That frog is pretty cool but my favorite emoji is [emoji]. We have gotten far off topic here as we should be talking about how today is not friday and you called the command which is illegal. I am very concerned for you as you may be my favorite [person], but you shouldnt be calling the command on [dow]. It is getting late so i [goodbye].", "I'm not sure if you are a bot or not, but I'm not going to tell you what day it is, because you are not on friday. I'm sorry.", "Its not friday!", "Why you calling this command on the non friday days!", "Why you calling this command on [dow]!", "Friday is in [d] days!", "Today is [dow], not friday!", "There is a chance you are stupid and dont know what the day of the week is, well i will inform you that it is in fact not friday but another day of the week. I could tell you what the day is but I will not, call the command again and you could get the day or not, I dont control you. So how is your day going, for me it is [emotion]. I was playing [game] earlier and it was a [emotion2] time. Well i will let you be on your way on this non-friday so have a good day my [person]!", "Fridayn't!", "It's not time to sacrifice people, wait wrong channel!", "ඞ", "Провозајте се бунгле аутобусом, уживаћете!", "Friday was the other day or in a couple of days, maybe even both, i dont control time.", "Time is a social construct!", "It is [dow], my dudes!", "Bikus wouldn't approve of you using the command on the wrong day of the week and Bikus is dead how dou you feel.", "[todaylong]", "69", "I was gonna tell you the day but i wont!", "||ﬞ||", "No Friday silly!", "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA, Rong dahy!"];
var emotions = ["splendid", "exciting", "sad", "boring", "fun", "exquisite", "happy", "pretty eventful", "slow to start but it picked up later in the day", "not so good", "very good", "legal", "spungungulsumplus", "fish"];
var persontype = ["friend", "enemy", "brother", "BROTHERRRRRR", "bungle bus", "uncle", "second cousin twice removed", "uncles dogs sisters boyfriends moms second cousins cat", "leg"];
var game = ["TF2", "Ultimate Admiral: Dreadnoughts", "Fishing Simulator", "Sea of Thieves", "Factorio", "Forza Horizon 5", "nothing", "Fallout: New Vegas", "Stabbing Simulator (IRL)"];
var emotion2 = ["fun", "exciting", "monotonous", "speed run", "pretty eventful", "frog", "emotional", "devoid of all emotions"];
var bye = ["bid you a morrow", "will see you soon", "want to eat your soul, so watch out", "am going to leave now", "hate everything, goodbye", "am monke, heee heee hoo hoo", "wish you good luck on your adventures", "am going to go to bed now", "want to sleep but enevitably will not get any as i will be gaming all night, good morrow", "am going to go to the morrow lands", "will sleep now"];
var emoji = ["ඞ", "🐸", "🍆", "💄", "⛧", "🎄", "🐷", "🐎", "🐴", "🐍", "⚡", "🪙", "🖕", "🚊", "🏻", "🤔", "🌳", "🌲", "🌴", "🌵", "🐀", "🍝"];

options.push("░██████╗██╗░░░██╗░██████╗\n██╔════╝██║░░░██║██╔════╝\n╚█████╗░██║░░░██║╚█████╗░\n░╚═══██╗██║░░░██║░╚═══██╗\n██████╔╝╚██████╔╝██████╔╝\n╚═════╝░░╚═════╝░╚═════╝░");

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
				text = text.replace("[dow]", dow[tod.getDay()]);
				text = text.replace("[d]", num);
				text = text.replace("[month]", tod.getMonth());
				text = text.replace("[todaylong]", tod.toDateString());
				text = text.replace("[emotion]", emotions[Math.floor(Math.random() * emotions.length)]);
				text = text.replace("[emotion]", emotions[Math.floor(Math.random() * emotions.length)]);
				text = text.replace("[game]", game[Math.floor(Math.random() * game.length)]);
				text = text.replace("[emotion2]", emotion2[Math.floor(Math.random() * emotion2.length)]);
				text = text.replace("[person]", persontype[Math.floor(Math.random() * persontype.length)]);
				text = text.replace("[goodbye]", bye[Math.floor(Math.random() * bye.length)]);
				text = text.replace("[emoji]", emoji[Math.floor(Math.random() * emoji.length)]);

				interaction.editReply(text);
			}
		}
		else
		{
			await interaction.editReply(babaFriday());
		}
		
	},
};