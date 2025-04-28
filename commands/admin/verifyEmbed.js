const { verify } = require('crypto');
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('postverifyembed')
    .setDescription('Posts the verify embed in the verify channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'admin',
  async execute(interaction) {
    const logoImage = new AttachmentBuilder('./resources/logo.png', {
      name: 'logo.png',
    });
    const verifyEmbed = new EmbedBuilder()
      .setColor(0x2f3136)
      .setTitle(`Verify now!`)
      .setDescription(
        `Use the Button below to verify yourself and gain access to the server!`
      )
      .setThumbnail('attachment://logo.png')
      .setFooter({
        text: `${interaction.client.user.tag}`,
        iconURL: `${interaction.client.user.displayAvatarURL()}`,
      });

    const verifyButton = new ButtonBuilder()
      .setCustomId('verifyButton')
      .setEmoji('✅')
      .setLabel('Verify Now')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(false);

    const firstRow = new ActionRowBuilder().addComponents(verifyButton);

    interaction.reply({
      content: `Received`,
      ephemeral: true,
    });
    const channel = interaction.client.channels.cache.get(
      process.env.VERIFY_CHANNEL_ID
    );
    return channel.send({
      embeds: [verifyEmbed],
      files: [logoImage],
      components: [firstRow],
    });
  },
};
