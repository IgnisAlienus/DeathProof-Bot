const { Events, EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    // Add Unverified role to the member
    const role = interaction.guild.roles.cache.get(
      process.env.UNVERIFIED_ROLE_ID
    );

    if (role) {
      await member.roles.add(role);
    } else {
      console.error(`Role not found: ${process.env.UNVERIFIED_ROLE_ID}`);
    }
    return;
  },
};
