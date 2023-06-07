var babadata = require('./babotdata.json'); //baba configuration file
const {  MessageActionRow, Modal, TextInputComponent  } = require('discord.js');

const { movetoChannel } = require('./HelperFunctions/adminHelpers.js');

async function contextInfo(interaction, bot)
{
    var commandName = interaction.commandName;

    if (commandName === "Delete")
    {
		await interaction.deferReply({ ephemeral: true });
        var fnd = false;
        var msgID = interaction.targetId;

        var chanMap = interaction.guild.channels.fetch().then(channels => {
            channels.each(chan => { //iterate through all the channels
                if (!fnd && chan.type == "GUILD_TEXT") //make sure the channel is a text channel
                {
                    chan.threads.fetch().then(thread => 
                        thread.threads.each(thr =>
                        {
                            thr.messages.fetch(msgID).then(message => 
                            {
                                fnd = true;
                                movetoChannel(message, thr, babadata.logchan);
                                interaction.editReply({ content: "Message Moved", ephemeral: true });
                            }).catch(function (err) {});
                        })
                    ).catch(function (err) {});

                    chan.messages.fetch(msgID).then(message => 
                    {
                        fnd = true;
                        movetoChannel(message, chan, babadata.logchan);
                        interaction.editReply({ content: "Message Moved", ephemeral: true });
                    }).catch(function (err) {}); //try to get the message, if it exists call setVote, otherwise catch the error
                }
            });
        });
        await interaction.editReply({ content: "Searching for Message", ephemeral: true });
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
        
        const channelIDInput = new TextInputComponent()
            .setCustomId('chanIDInput')
            .setLabel("The ID of the Channel to Move to")
            .setStyle('SHORT')
            .setRequired(true)
            .setPlaceholder("Channel ID");

		// An action row only holds one text input,
		// so you need one action row per text input.
		const firstActionRow = new MessageActionRow().addComponents(messageIDShow);
		const thtrdActionRow = new MessageActionRow().addComponents(channelIDInput);
		// Add inputs to the modal
		modal.addComponents(firstActionRow, thtrdActionRow);

        interaction.showModal(modal);
    }
}

async function modalInfo(interaction, bot)
{
    await interaction.deferReply({ ephemeral: true });
    var cid = interaction.customId;
    if (cid === "movetoModal")
    {
        var msgID = interaction.fields.getTextInputValue("msgID");
        var chansend = interaction.fields.getTextInputValue("chanIDInput");

        var fnd = false;

        var chanMap = interaction.guild.channels.fetch().then(channels => {
            channels.each(chan => { //iterate through all the channels
                if (!fnd && chan.type == "GUILD_TEXT") //make sure the channel is a text channel
                {
                    chan.threads.fetch().then(thread => 
                        thread.threads.each(thr =>
                        {
                            thr.messages.fetch(msgID).then(message => 
                            {
                                fnd = true;
                                movetoChannel(message, thr, chansend)
                                interaction.editReply({ content: "Message Moved", ephemeral: true });
                            }).catch(function (err) {});
                        })
                    ).catch(function (err) {});

                    chan.messages.fetch(msgID).then(message => 
                    {
                        fnd = true;
                        movetoChannel(message, chan, chansend)
                        interaction.editReply({ content: "Message Moved", ephemeral: true });
                    }).catch(function (err) {}); //try to get the message, if it exists call setVote, otherwise catch the error
                }
            });
        });
        await interaction.editReply({ content: "Searching for Message", ephemeral: true });
    }
}

module.exports = {
	contextInfo,
    modalInfo
}