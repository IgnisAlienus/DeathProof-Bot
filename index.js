const fs = require('fs');
const path = require('path');
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} = require('discord.js');
require('dotenv').config();
const { deployCommands } = require('./deploy-commands.js');

async function main() {
  // Check if ./data folder exists, if not, create it
  const dataPath = path.join(__dirname, 'data');
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath);
  }

  await deployCommands();

  const client = new Client({
    partials: [
      Partials.Reaction,
      Partials.Message,
      Partials.Channel,
      Partials.User,
      Partials.GuildMember,
    ],
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildInvites,
    ],
  });

  client.commands = new Collection();
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
        client.commands.set(command.data.name, command);
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }

  const eventsPath = path.join(__dirname, 'events');
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }

  client.login(process.env.BOT_TOKEN);
}

main();
