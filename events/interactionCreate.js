const { Events } = require('discord.js');
const {
  verifyButton,
  verifyApproveButton,
  verifyDenyButton,
} = require('../eventActions/verifyButtonAction.js');
const { verifyModal } = require('../eventActions/verifyModalAction');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}`);
        console.error(error);
      }
    } else if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.error(error);
      }
    } else if (interaction.isButton()) {
      const buttonActions = {
        verifyButton: verifyButton,
        verifyApproveButton: verifyApproveButton,
        verifyDenyButton: verifyDenyButton,
      };

      if (buttonActions[interaction.customId]) {
        return buttonActions[interaction.customId](interaction);
      } else {
        const [action, memberId] = interaction.customId.split(':');
        if (buttonActions[action]) {
          return buttonActions[action](interaction, memberId);
        }
      }
      console.log(`No action matching ${interaction.customId} was found.`);
    } else if (interaction.isStringSelectMenu()) {
      // Respond to select menus
      const selectMenuActions = {};

      if (selectMenuActions[interaction.customId]) {
        return selectMenuActions[interaction.customId](interaction);
      } else {
        const [action, memberId] = interaction.customId.split(':');
        if (selectMenuActions[action]) {
          return selectMenuActions[action](interaction, memberId);
        }
      }
    } else if (interaction.isModalSubmit()) {
      // Respond to modals
      const modalActions = {
        verifyModal: verifyModal,
      };

      if (modalActions[interaction.customId]) {
        return modalActions[interaction.customId](interaction);
      } else {
        const [action, memberId] = interaction.customId.split(':');
        if (modalActions[action]) {
          return modalActions[action](interaction, memberId);
        }
      }
    }
  },
};
