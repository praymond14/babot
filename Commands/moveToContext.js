const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { ApplicationCommandType } = require('discord-api-types/v9');

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('Move To')
        .setType(ApplicationCommandType.Message)
        .setDefaultPermission(false)
};