var babadata = require('./babotdata.json'); //baba configuration file
const {  MessageActionRow, Modal, TextInputComponent  } = require('discord.js');

const { movetoChannel } = require("./helperFunc");

function contextInfo(interaction, bot)
{
    var commandName = interaction.commandName;

    if (commandName === "Delete")
    {
        var fnd = false;
        var msgID = interaction.targetId;
        var channelId = interaction.channelId;
        var chanMap = interaction.guild.channels.fetch(channelId).then(channel => {
            if (!fnd && channel.type == "GUILD_TEXT") //make sure the channel is a text channel
            {
                console.log("Checking: " + channel.name);
                channel.messages.fetch(msgID).then(message => 
                {
                    fnd = true;
                    movetoChannel(message, channel, babadata.logchan);
                }).catch(function (err) {}); //try to get the message, if it exists call setVote, otherwise catch the error
            };
        });

        interaction.reply({ content: "Message Moved", ephemeral: true });
    }
    else if (commandName === "Move To")
    {
        var fnd = false;
        var msgID = interaction.targetId;
        var channelId = interaction.channelId;

        const modal = new Modal()
            .setCustomId('movetoModal')
            .setTitle('Move Message');

        const messageIDShow = new TextInputComponent()
			.setCustomId('msgID')
			.setLabel("The ID of the Message to Move - Autofilled")
			.setStyle('SHORT')
            .setRequired(true)
            .setPlaceholder(msgID)
            .setValue(msgID);
        
        const channelIDShow = new TextInputComponent()
            .setCustomId('chanID')
            .setLabel("The ID of the Message's Channel - Autofilled")
            .setStyle('SHORT')
            .setRequired(true)
            .setPlaceholder(channelId)
            .setValue(channelId);
        
        const channelIDInput = new TextInputComponent()
            .setCustomId('chanIDInput')
            .setLabel("The ID of the Channel to Move to")
            .setStyle('SHORT')
            .setRequired(true)
            .setPlaceholder("Channel ID");

		// An action row only holds one text input,
		// so you need one action row per text input.
		const firstActionRow = new MessageActionRow().addComponents(messageIDShow);
		const secondActionRow = new MessageActionRow().addComponents(channelIDShow);
		const thtrdActionRow = new MessageActionRow().addComponents(channelIDInput);
		// Add inputs to the modal
		modal.addComponents(firstActionRow, secondActionRow, thtrdActionRow);

        interaction.showModal(modal);
    }
}

function modalInfo(interaction, bot)
{
    var cid = interaction.customId;
    if (cid === "movetoModal")
    {
        var msgID = interaction.fields.getTextInputValue("msgID");
        var channelId = interaction.fields.getTextInputValue("chanID");
        var chansend = interaction.fields.getTextInputValue("chanIDInput");

        var fnd = false;
        var chanMap = interaction.guild.channels.fetch(channelId).then(channel => {
            if (!fnd && channel.type == "GUILD_TEXT") //make sure the channel is a text channel
            {
                console.log("Checking: " + channel.name);
                channel.messages.fetch(msgID).then(message => {
                    fnd = true;
                    movetoChannel(message, channel, chansend);
                }).catch(function (err) {}); //try to get the message, if it exists call setVote, otherwise catch the error
            };
        });

        interaction.reply({ content: "Message Moved", ephemeral: true });
    }
}

module.exports = {
	contextInfo,
    modalInfo
}