const {
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const fs = require('fs');
const path = require('path');

async function verifyButton(interaction) {
  // Check if the user is already in the verifyData.json file
  const dataPath = path.join(__dirname, '../data/verifyData.json');
  let verifyData = [];
  if (fs.existsSync(dataPath)) {
    const data = fs.readFileSync(dataPath, 'utf8');
    verifyData = JSON.parse(data);
  }
  const userId = interaction.user.id;
  const userIndex = verifyData.findIndex((user) => user.userId === userId);
  if (userIndex !== -1 && verifyData[userIndex].status === 'pending') {
    // User is already in the file, show a message and return
    await interaction.reply({
      content: `You have already submitted your verification request. Please wait for approval.`,
      ephemeral: true,
    });
    return;
  } else if (userIndex !== -1 && verifyData[userIndex].status === 'approved') {
    // User is already approved, show a message and return
    await interaction.reply({
      content: `You have already been approved. You can now access the server.`,
      ephemeral: true,
    });
    return;
  } else if (userIndex !== -1 && verifyData[userIndex].status === 'denied') {
    // User is already denied, show a message and return
    await interaction.reply({
      content: `You have already been denied. Please contact an admin for further assistance.`,
      ephemeral: true,
    });
    return;
  }
  // User is not in the file, proceed with verification

  // Show Modal to the user
  const modal = new ModalBuilder()
    .setCustomId('verifyModal')
    .setTitle('Member Verification')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('inGameName')
          .setLabel('In-Game Name')
          .setPlaceholder('Enter your in-game name')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      )
    );

  await interaction.showModal(modal);
}

async function verifyApproveButton(interaction, memberId) {
  // Grant the member role
  const member = await interaction.guild.members.fetch(memberId);
  const role = interaction.guild.roles.cache.get(process.env.MEMBER_ROLE_ID);
  const unverifiedRole = interaction.guild.roles.cache.get(
    process.env.UNVERIFIED_ROLE_ID
  );

  if (role) {
    await member.roles.add(role);
    await member.roles.remove(unverifiedRole);
    await interaction.reply({
      content: `User <@${memberId}> has been approved and granted the member role.`,
      ephemeral: true,
    });

    // Update the verifyData.json file
    const dataPath = path.join(__dirname, '../data/verifyData.json');
    let verifyData = [];
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      verifyData = JSON.parse(data);
    }
    // Find where userId is equal to memberId and set status to approved
    const userIndex = verifyData.findIndex((user) => user.userId === memberId);

    if (userIndex !== -1) {
      verifyData[userIndex].status = 'approved';
    } else {
      console.error(`User ID ${memberId} not found in verifyData.json`);
    }
    fs.writeFileSync(dataPath, JSON.stringify(verifyData, null, 2), 'utf8');

    // Get verifyMsgId from verifyData.json
    const verifyMsgId = verifyData[userIndex].verifyMsgId;

    // Disable the buttons in the verification message
    const verifyLogsChannel = await interaction.client.channels.cache.get(
      process.env.VERIFY_LOGS_CHANNEL_ID
    );
    const verifyMessage = await verifyLogsChannel.messages.fetch(verifyMsgId);
    if (verifyMessage) {
      if (verifyMessage.components && verifyMessage.components.length > 0) {
        const row = verifyMessage.components[0];
        const updatedRow = new ActionRowBuilder().addComponents(
          row.components.map((button) => {
            // Ensure the button is a ButtonBuilder instance
            return ButtonBuilder.from(button).setDisabled(true);
          })
        );
        // Update Embed to add a field with who approved the user
        const embed = verifyMessage.embeds[0];
        const updatedEmbed = new EmbedBuilder(embed)
          .setColor(0x2f3136)
          .setDescription(`Member Verification Request`)
          .addFields({
            name: 'Approved By',
            value: `<@${interaction.user.id}>`,
            inline: false,
          });
        await verifyMessage.edit({
          embeds: [updatedEmbed],
          components: [updatedRow],
        });
      } else {
        console.error(
          `No components found in the verification message with ID ${verifyMsgId}`
        );
      }
    } else {
      console.error(`Verification message not found with ID ${verifyMsgId}`);
    }
    // Update discord nickname to in-game name
    try {
      const inGameName = `[LiFE] ${verifyData[userIndex].inGameName}`;
      if (inGameName) {
        await member.setNickname(
          inGameName,
          'Updated nickname after verification'
        );
      } else {
        console.error(`In-game name not found for user ID ${memberId}`);
      }
    } catch (error) {
      console.log(`Error updating nickname for user ID ${memberId}: ${error}`);
    }

    // Send Member DM
    await member.send({
      content: `Congratulations! You have been approved and granted the member role. Your Discord nickname has been updated to your in-game name.`,
    });
  } else {
    await interaction.reply({
      content: `Role not found.`,
      ephemeral: true,
    });
  }
}

async function verifyDenyButton(interaction, memberId) {
  // Deny the member role
  if (role) {
    await interaction.reply({
      content: `User <@${memberId}> has been denied and removed from the member role.`,
      ephemeral: true,
    });
    // Update the verifyData.json file
    const dataPath = path.join(__dirname, '../data/verifyData.json');
    let verifyData = [];
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      verifyData = JSON.parse(data);
    }
    // Remove user from data
    verifyData = verifyData.filter((user) => user.userId !== memberId);
    /*     // Find where userId is equal to memberId and set status to denied
    const userIndex = verifyData.findIndex((user) => user.userId === memberId);

    if (userIndex !== -1) {
      verifyData[userIndex].status = 'denied';
    } else {
      console.error(`User ID ${memberId} not found in verifyData.json`);
    } */
    // Write the updated data back to
    fs.writeFileSync(dataPath, JSON.stringify(verifyData, null, 2), 'utf8');

    // Get verifyMsgId from verifyData.json
    const verifyMsgId = verifyData[userIndex].verifyMsgId;

    // Disable the buttons in the verification message
    const verifyLogsChannel = await interaction.client.channels.cache.get(
      process.env.VERIFY_LOGS_CHANNEL_ID
    );
    const verifyMessage = await verifyLogsChannel.messages.fetch(verifyMsgId);
    if (verifyMessage) {
      if (verifyMessage.components && verifyMessage.components.length > 0) {
        const row = verifyMessage.components[0];
        const updatedRow = new ActionRowBuilder().addComponents(
          row.components.map((button) => {
            // Ensure the button is a ButtonBuilder instance
            return ButtonBuilder.from(button).setDisabled(true);
          })
        );
        // Update Embed to add a field with who denied the user
        const embed = verifyMessage.embeds[0];
        const updatedEmbed = new EmbedBuilder(embed)
          .setColor(0x2f3136)
          .setDescription(`Member Verification Request`)
          .addFields({
            name: 'Denied By',
            value: `<@${interaction.user.id}>`,
            inline: false,
          });
        await verifyMessage.edit({
          embeds: [updatedEmbed],
          components: [updatedRow],
        });
      } else {
        console.error(
          `No components found in the verification message with ID ${verifyMsgId}`
        );
      }
    } else {
      console.error(`Verification message not found with ID ${verifyMsgId}`);
    }

    // Send Member DM
    const member = await interaction.guild.members.fetch(memberId);
    await member.send({
      content: `Your verification request has been denied.`,
    });
  } else {
    await interaction.reply({
      content: `Role not found.`,
      ephemeral: true,
    });
  }
}

module.exports = { verifyButton, verifyApproveButton, verifyDenyButton };
