const {
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { SHOW_GENRES } = require("./constants");

const commands = [
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("View EDM Elevated City commands"),

  new SlashCommandBuilder()
    .setName("journey")
    .setDescription("Start or continue your guided path through the city"),

  new SlashCommandBuilder()
    .setName("underground_run")
    .setDescription("Take an always-available risk-and-reward run through the city"),

  new SlashCommandBuilder()
    .setName("buy_equipment")
    .setDescription("Buy gear that generates equipment rental income")
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
    .setDescription("View, install, move, or rent out your owned equipment"),

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
    .setDescription("Admin only: force-run a scheduled show")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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
    .setDescription("Work a random scene shift for reliable cash and XP"),

  new SlashCommandBuilder()
    .setName("buy_venue")
    .setDescription("Buy a fictional venue")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Venue type")
        .setRequired(true)
        .setAutocomplete(true),
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
        .setAutocomplete(true),
    ),

  new SlashCommandBuilder()
    .setName("venue_insurance")
    .setDescription("Buy temporary insurance coverage for one of your venues")
    .addStringOption((option) =>
      option
        .setName("venue")
        .setDescription("The venue you want to insure")
        .setRequired(true)
        .setAutocomplete(true),
    ),

  new SlashCommandBuilder()
    .setName("create_show")
    .setDescription("Create and schedule a show at one of your venues")
    .addStringOption((option) =>
      option
        .setName("venue")
        .setDescription("Choose one of your venues")
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addStringOption((option) =>
      option
        .setName("genre")
        .setDescription("Choose the show's genre")
        .setRequired(true)
        .addChoices(
          ...Object.entries(SHOW_GENRES).map(([value, name]) => ({
            name,
            value,
          })),
        ),
    )
    .addIntegerOption((option) =>
      option
        .setName("ticket_price")
        .setDescription("Set the ticket price ($10–$75)")
        .setRequired(true)
        .setMinValue(10)
        .setMaxValue(75),
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Optional custom show name")
        .setRequired(false)
        .setMaxLength(60),
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
    .setDescription("Manage your upcoming and completed shows"),

  new SlashCommandBuilder()
    .setName("hire_show_staff")
    .setDescription("Hire another user as show staff")
    .addStringOption((option) =>
      option
        .setName("show")
        .setDescription("Choose one of your upcoming shows")
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to hire as show staff")
        .setRequired(true),
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
    .setName("collect")
    .setDescription("Collect unclaimed passive income"),

  new SlashCommandBuilder()
    .setName("test_venue_event")
    .setDescription("Admin only: force test venue events")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("The type of venue event to force")
        .setRequired(false)
        .addChoices(
          {
            name: "Random",
            value: "random",
          },
          {
            name: "Incident",
            value: "incident",
          },
          {
            name: "Boost",
            value: "boost",
          },
        ),
    ),

  new SlashCommandBuilder()
    .setName("run_venue_events")
    .setDescription("Admin only: force-run a venue event")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName("collect_show")
    .setDescription("Settle a completed show and distribute payouts")
    .addStringOption((option) =>
      option
        .setName("show")
        .setDescription("Completed show to settle")
        .setRequired(true)
        .setAutocomplete(true),
    ),

  new SlashCommandBuilder()
    .setName("shop")
    .setDescription("View cosmetic Scene Titles and other shop items"),

  new SlashCommandBuilder()
    .setName("equip_title")
    .setDescription("Equip one of your purchased Scene Titles")
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("The Scene Title you want to equip")
        .setRequired(true)
        .setAutocomplete(true),
    ),

  new SlashCommandBuilder()
    .setName("bookings")
    .setDescription("View DJ career booking opportunities"),

  new SlashCommandBuilder()
    .setName("test_ticket_sale")
    .setDescription("Admin only: force an advance ticket-sale event")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("show")
        .setDescription("Optional: choose any eligible upcoming show")
        .setRequired(false)
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
}

module.exports = { registerCommands };
