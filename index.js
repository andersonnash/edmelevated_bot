require("dotenv").config();

const { Client, GatewayIntentBits, MessageFlags } = require("discord.js");

const { registerCommands } = require("./commands");

const handleAutocomplete = require("./handlers/autocomplete");

const handleCommand = require("./handlers/commands");

const { startShowScheduler } = require("./services/showScheduler");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const allowedChannelIds = new Set(
  (process.env.ALLOWED_CHANNEL_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean),
);

function isAllowedChannel(interaction) {
  if (!allowedChannelIds.size) return true;

  return allowedChannelIds.has(interaction.channelId);
}

async function blockDisallowedChannel(interaction) {
  if (interaction.isAutocomplete()) {
    return interaction.respond([]).catch(() => {});
  }

  return interaction
    .reply({
      content: "This demo bot is only available in the tester channels.",
      flags: MessageFlags.Ephemeral,
    })
    .catch(() => {});
}

async function handleCommandSafely(interaction) {
  try {
    return await handleCommand(interaction);
  } catch (error) {
    console.error(
      `Interaction failed: ${interaction.commandName || interaction.customId || "unknown"}`,
      error,
    );

    const content =
      "Something went wrong while processing that action. Please try again.";

    if (interaction.deferred || interaction.replied) {
      return interaction.editReply({ content }).catch(() => {});
    }

    return interaction
      .reply({ content, flags: MessageFlags.Ephemeral })
      .catch(() => {});
  }
}

client.once("clientReady", () => {
  startShowScheduler(client);
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!isAllowedChannel(interaction)) {
    return blockDisallowedChannel(interaction);
  }

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
    return handleCommandSafely(interaction);
  }

  if (interaction.isButton()) {
    return handleCommandSafely(interaction);
  }

  if (interaction.isUserSelectMenu()) {
    return handleCommandSafely(interaction);
  }

  if (interaction.isStringSelectMenu()) {
    return handleCommandSafely(interaction);
  }
});

registerCommands()
  .then(() => client.login(process.env.DISCORD_TOKEN))
  .catch((error) => {
    console.error("Bot startup failed:", error);
    process.exitCode = 1;
  });
