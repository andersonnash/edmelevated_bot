const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("View EDM Elevated City commands"),

  new SlashCommandBuilder()
    .setName("buy_equipment")
    .setDescription("Buy gear that generates passive rental income")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Equipment to buy")
        .setRequired(true)
        .addChoices(
          {
            name: "Pioneer DDJ-FLX4 - $500",
            value: "flx4",
          },
          {
            name: "Pioneer XDJ-RX3 - $2,500",
            value: "xdj_rx3",
          },
          {
            name: "CDJ-3000 Pair - $6,000",
            value: "cdj_3000_pair",
          },
          {
            name: "Sound System - $15,000",
            value: "sound_system",
          },
          {
            name: "Laser Rig - $40,000",
            value: "laser_rig",
          },
        ),
    ),

  new SlashCommandBuilder()
    .setName("my_equipment")
    .setDescription("View your owned equipment"),

  new SlashCommandBuilder()
    .setName("rave_story")
    .setDescription("Start a random EDM mini-adventure"),

  new SlashCommandBuilder()
    .setName("street_team")
    .setDescription("Hit the streets and promote the scene"),

  new SlashCommandBuilder()
    .setName("crate_dig")
    .setDescription("Dig for rare tracks"),

  new SlashCommandBuilder()
    .setName("add_lineup")
    .setDescription("Add a Discord user to your show lineup")
    .addStringOption((option) =>
      option
        .setName("show")
        .setDescription("Choose one of your shows")
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addUserOption((option) =>
      option.setName("dj").setDescription("DJ to add").setRequired(true),
    ),

  new SlashCommandBuilder()
    .setName("dj_profile")
    .setDescription("View DJ stats")
    .addUserOption((option) =>
      option.setName("dj").setDescription("Choose DJ").setRequired(true),
    ),

  new SlashCommandBuilder()
    .setName("top_djs")
    .setDescription("Top DJs in the city"),

  new SlashCommandBuilder()
    .setName("create_kandi")
    .setDescription("Create a custom kandi bracelet")
    .addStringOption((option) =>
      option
        .setName("phrase")
        .setDescription("What the kandi says")
        .setRequired(true)
        .setMaxLength(24),
    )
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("Bracelet color/theme")
        .setRequired(true),
    ),

  new SlashCommandBuilder()
    .setName("give_kandi")
    .setDescription("Give one of your kandi bracelets to another user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Who gets the kandi")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("kandi")
        .setDescription("Choose your kandi")
        .setRequired(true)
        .setAutocomplete(true),
    ),

  new SlashCommandBuilder()
    .setName("my_kandi")
    .setDescription("View kandi you created or received"),

  new SlashCommandBuilder()
    .setName("promote_show")
    .setDescription("Promote one of your upcoming shows")
    .addStringOption((option) =>
      option
        .setName("show")
        .setDescription("Choose one of your shows")
        .setRequired(true)
        .setAutocomplete(true),
    ),

  new SlashCommandBuilder()
    .setName("my_jobs")
    .setDescription("View jobs assigned to you"),

  new SlashCommandBuilder()
    .setName("force_run_show")
    .setDescription("DEV: Run a show immediately")
    .addStringOption((option) =>
      option
        .setName("show")
        .setDescription("Choose a show")
        .setRequired(true)
        .setAutocomplete(true),
    ),

  new SlashCommandBuilder()
    .setName("register")
    .setDescription("Join the EDMELEVATED city game"),

  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View your scene profile"),

  new SlashCommandBuilder()
    .setName("roles")
    .setDescription("View your game roles"),

  new SlashCommandBuilder()
    .setName("work")
    .setDescription("Promote shows and earn cash"),

  new SlashCommandBuilder()
    .setName("buy_venue")
    .setDescription("Buy a fictional venue")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Venue type")
        .setRequired(true)
        .addChoices(
          {
            name: "Garage Party - $2,500 - Rep 0",
            value: "garage_party",
          },
          {
            name: "Granary Warehouse - $10,000 - Rep 10",
            value: "warehouse",
          },
          {
            name: "The Sub Room - $30,000 - Rep 25",
            value: "underground_club",
          },
          {
            name: "Neon Rooftop - $75,000 - Rep 50",
            value: "downtown_venue",
          },
          {
            name: "Desert Frequency - $250,000 - Rep 100",
            value: "festival_grounds",
          },
        ),
    ),

  new SlashCommandBuilder()
    .setName("my_venues")
    .setDescription("View your venues"),

  new SlashCommandBuilder()
    .setName("upgrade_venue")
    .setDescription("Upgrade one of your venues")
    .addStringOption((option) =>
      option
        .setName("venue")
        .setDescription("Choose one of your venues")
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addStringOption((option) =>
      option
        .setName("department")
        .setDescription("Department to upgrade")
        .setRequired(true)
        .addChoices(
          {
            name: "🍺 Bar — +10% income/level — starts $1,000",
            value: "bar",
          },
          {
            name: "🚪 Security — +5% capacity/level — starts $2,500",
            value: "security",
          },
          {
            name: "🎛 Production — +5% attendance/level — starts $5,000",
            value: "production",
          },
          {
            name: "🧹 Maintenance — -10% incident impact/level — starts $3,000",
            value: "maintenance",
          },
        ),
    ),

  new SlashCommandBuilder()
    .setName("create_show")
    .setDescription("Generate and schedule a random show at one of your venues")
    .addStringOption((option) =>
      option
        .setName("venue")
        .setDescription("Choose one of your venues")
        .setRequired(true)
        .setAutocomplete(true),
    ),

  new SlashCommandBuilder()
    .setName("show_lineup")
    .setDescription("View lineup and staff for a show")
    .addStringOption((option) =>
      option
        .setName("show")
        .setDescription("Choose show")
        .setRequired(true)
        .setAutocomplete(true),
    ),

  new SlashCommandBuilder()
    .setName("my_shows")
    .setDescription("View your upcoming shows"),

  new SlashCommandBuilder()
    .setName("buy_ticket")
    .setDescription("Buy a ticket to an upcoming show")
    .addStringOption((option) =>
      option
        .setName("show")
        .setDescription("Choose a show")
        .setRequired(true)
        .setAutocomplete(true),
    ),

  new SlashCommandBuilder()
    .setName("hire_staff")
    .setDescription("Hire another user for your show")
    .addStringOption((option) =>
      option
        .setName("show")
        .setDescription("Choose one of your shows")
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addUserOption((option) =>
      option.setName("user").setDescription("User to hire").setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("role")
        .setDescription("Staff role")
        .setRequired(true)
        .addChoices(
          { name: "Bartender", value: "bartender" },
          { name: "Security", value: "security" },
          { name: "VJ", value: "vj" },
          { name: "Promoter", value: "promoter" },
          { name: "General Staff", value: "general_staff" },
        ),
    )
    .addIntegerOption((option) =>
      option.setName("pay").setDescription("Pay amount").setRequired(true),
    ),

  new SlashCommandBuilder()
    .setName("hire_venue_staff")
    .setDescription("Hire a permanent staff member for your venue")
    .addStringOption((option) =>
      option
        .setName("venue")
        .setDescription("Choose one of your venues")
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addStringOption((option) =>
      option
        .setName("role")
        .setDescription("Staff role to hire")
        .setRequired(true)
        .setAutocomplete(true),
    ),

  new SlashCommandBuilder()
    .setName("accept_staff")
    .setDescription("Accept a staff job offer")
    .addStringOption((option) =>
      option
        .setName("show")
        .setDescription("Choose a show")
        .setRequired(true)
        .setAutocomplete(true),
    ),

  new SlashCommandBuilder()
    .setName("start_contest")
    .setDescription("Start a free ticket contest for your show")
    .addStringOption((option) =>
      option
        .setName("show")
        .setDescription("Choose one of your shows")
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("tickets")
        .setDescription("Number of tickets to give away")
        .setRequired(true),
    ),

  new SlashCommandBuilder()
    .setName("enter_contest")
    .setDescription("Enter an active ticket contest")
    .addStringOption((option) =>
      option
        .setName("contest")
        .setDescription("Choose a contest")
        .setRequired(true)
        .setAutocomplete(true),
    ),

  new SlashCommandBuilder()
    .setName("draw_winner")
    .setDescription("Draw a winner for one of your contests")
    .addStringOption((option) =>
      option
        .setName("contest")
        .setDescription("Choose one of your contests")
        .setRequired(true)
        .setAutocomplete(true),
    ),

  new SlashCommandBuilder()
    .setName("run_show")
    .setDescription("Run a show after its date")
    .addStringOption((option) =>
      option
        .setName("show")
        .setDescription("Choose one of your shows")
        .setRequired(true)
        .setAutocomplete(true),
    ),

  new SlashCommandBuilder()
    .setName("collect")
    .setDescription("Collect unclaimed passive income"),

  new SlashCommandBuilder()
    .setName("collect_show")
    .setDescription("Collect payouts from one completed show")
    .addStringOption((option) =>
      option
        .setName("show")
        .setDescription("Completed show to collect")
        .setRequired(true)
        .setAutocomplete(true),
    ),

  new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View top scene members"),
].map((command) => command.toJSON());

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID,
    ),
    { body: commands },
  );

  console.log("Slash commands registered.");
}

module.exports = { registerCommands };
