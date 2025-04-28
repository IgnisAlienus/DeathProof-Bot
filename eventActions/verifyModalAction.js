const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js');
const fs = require('fs');
const path = require('path');

async function verifyModal(interaction) {
  // Get the input value from the modal
  const inGameName = interaction.fields.getTextInputValue('inGameName');
  const userId = interaction.user.id;

  // Send verification message verify logs
  const verifyEmbed = new EmbedBuilder()
    .setColor(0x2f3136)
    .setTitle(`Member Verification`)
    .setDescription(`Member Requests Verification`)
    .addFields(
      { name: 'In-Game Name', value: `${inGameName}`, inline: false },
      { name: 'User', value: `<@!${userId}>`, inline: false },
      { name: 'User ID', value: `${userId}`, inline: false }
    )
    .setFooter({
      text: `${interaction.client.user.tag}`,
      iconURL: `${interaction.client.user.displayAvatarURL()}`,
    });

  // Add Accept and Deny buttons
  const acceptButton = new ButtonBuilder()
    .setCustomId(`verifyApproveButton:${userId}`)
    .setLabel('Accept')
    .setStyle(ButtonStyle.Success);

  const denyButton = new ButtonBuilder()
    .setCustomId(`verifyDenyButton:${userId}`)
    .setLabel('Deny')
    .setStyle(ButtonStyle.Danger);

  const firstRow = new ActionRowBuilder().addComponents(
    acceptButton,
    denyButton
  );

  const verifyLogsChannel = await interaction.client.channels.cache.get(
    process.env.VERIFY_LOGS_CHANNEL_ID
  );

  if (verifyLogsChannel) {
    const verifyEmbedMessage = await verifyLogsChannel.send({
      embeds: [verifyEmbed],
      components: [firstRow],
    });

    // Store info in /data json file
    const dataPath = path.join(__dirname, '../data/verifyData.json');
    let verifyData = [];
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      verifyData = JSON.parse(data);
    }
    verifyData.push({
      userId: userId,
      inGameName: inGameName,
      status: 'pending',
      verifyMsgId: verifyEmbedMessage.id,
    });

    fs.writeFileSync(dataPath, JSON.stringify(verifyData, null, 2), 'utf8');
    console.log('Verification data saved to file:', verifyData);
  } else {
    console.error('Verify logs channel not found');
  }

  await interaction.reply({
    content: `We have received your verification request. Please wait for an admin to approve or deny your request.`,
    ephemeral: true,
  });
}

module.exports = { verifyModal };
