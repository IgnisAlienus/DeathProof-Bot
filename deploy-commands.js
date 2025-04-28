const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

async function deployCommands() {
  console.log('Deploying commands!');
  const globalCommands = [];
  const guildCommands = [];
  const foldersPath = path.join(__dirname, 'commands');
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        if (command.global) {
          globalCommands.push(command.data.toJSON());
        } else {
          guildCommands.push(command.data.toJSON());
        }
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }

  const rest = new REST().setToken(process.env.BOT_TOKEN);

  try {
    if (guildCommands.length > 0) {
      console.log(
        `Started refreshing ${guildCommands.length} guild-specific application (/) commands.`
      );
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID,
          process.env.GUILD_ID
        ),
        {
          body: guildCommands,
        }
      );
      console.log(
        `Successfully reloaded guild-specific application (/) commands.`
      );
    }

    if (globalCommands.length > 0) {
      console.log(
        `Started refreshing ${globalCommands.length} global application (/) commands.`
      );
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: globalCommands,
      });
      console.log(`Successfully reloaded global application (/) commands.`);
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = { deployCommands };
