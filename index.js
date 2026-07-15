require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");

const { registerCommands } = require("./commands");

const handleAutocomplete = require("./handlers/autocomplete");

const handleCommand = require("./handlers/commands");

const { startShowScheduler } = require("./services/showScheduler");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("clientReady", () => {
  startShowScheduler(client);
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isAutocomplete()) {
    return handleAutocomplete(interaction).catch((error) => {
      if (error?.code === 10062) {
        console.warn("Autocomplete interaction expired before response.");
        return;
      }

      console.error("Autocomplete failed:", error);
    });
  }

  if (interaction.isChatInputCommand()) {
    return handleCommand(interaction);
  }

  if (interaction.isButton()) {
    return handleCommand(interaction);
  }

  if (interaction.isUserSelectMenu()) {
    return handleCommand(interaction);
  }
});

registerCommands().then(() => {
  client.login(process.env.DISCORD_TOKEN);
});
