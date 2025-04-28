const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    // Fetch all members in all guilds to cache them
    client.guilds.cache.forEach((guild) => {
      guild.members.fetch();
    });
  },
};
