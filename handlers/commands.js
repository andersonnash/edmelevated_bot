const users = require("./users");
const venues = require("./venues");
const shows = require("./shows");
const staff = require("./staff");
const lineup = require("./lineup");
const contests = require("./contests");
const kandi = require("./kandi");
const djs = require("./djs");
const help = require("./help");
const games = require("./games");
const equipment = require("./equipment");

const { getUser } = require("../services/roles");

const commandMap = {
  help: help.help,

  crate_dig: games.crateDig,
  street_team: games.streetTeam,
  rave_story: games.raveStory,

  register: users.register,
  profile: users.profile,
  roles: users.roles,
  work: users.work,
  leaderboard: users.leaderboard,
  dj_profile: djs.djProfile,
  top_djs: djs.topDjs,

  buy_venue: venues.buyVenue,
  my_venues: venues.myVenues,
  upgrade_venue: venues.upgradeVenue,

  buy_equipment: equipment.buyEquipment,
  my_equipment: equipment.myEquipment,

  create_show: shows.createShow,
  my_shows: shows.myShows,
  buy_ticket: shows.buyTicket,
  run_show: shows.runShow,
  force_run_show: shows.runShow,
  collect: shows.collect,
  collect_show: shows.collectShow,
  promote_show: shows.promoteShow,
  show_lineup: shows.showLineup,

  hire_staff: staff.hireStaff,
  my_jobs: staff.myJobs,
  hire_venue_staff: staff.hireVenueStaff,

  add_lineup: lineup.addLineup,

  start_contest: contests.startContest,
  enter_contest: contests.enterContest,
  draw_winner: contests.drawWinner,

  create_kandi: kandi.createKandi,
  give_kandi: kandi.giveKandi,
  my_kandi: kandi.myKandi,
};

async function handleCommand(interaction) {
  if (interaction.isButton()) {
    if (interaction.customId === "collect_passive") {
      await interaction.deferReply({ ephemeral: true });
      return shows.collect(interaction);
    }
    if (interaction.customId.startsWith("collect_show_")) {
      const showId = Number(interaction.customId.replace("collect_show_", ""));
      return shows.collectShow(interaction, showId);
    }
    if (
      interaction.customId === "shows_home" ||
      interaction.customId.startsWith("shows_upcoming_") ||
      interaction.customId.startsWith("shows_completed_")
    ) {
      return shows.handleShowPage(interaction);
    }
    if (
      interaction.customId.startsWith("venues_prev_") ||
      interaction.customId.startsWith("venues_next_")
    ) {
      return venues.handleVenuePage(interaction);
    }

    if (interaction.customId.startsWith("rave_story_")) {
      return games.handleRaveStoryChoice(interaction);
    }

    if (interaction.customId.startsWith("help_")) {
      return help.handleHelpButton(interaction);
    }

    if (interaction.customId.startsWith("show_lineup_")) {
      const showId = interaction.customId.replace("show_lineup_", "");

      return shows.showLineup(interaction, showId);
    }

    if (interaction.customId.startsWith("run_show_")) {
      const showId = interaction.customId.replace("run_show_", "");

      await interaction.deferReply({
        ephemeral: true,
      });

      return shows.runShow(interaction, showId);
    }

    if (interaction.customId.startsWith("promote_show_")) {
      return interaction.reply({
        content: "Use `/promote_show` and select this show from the list.",
        ephemeral: true,
      });
    }

    if (interaction.customId.startsWith("hire_show_")) {
      return interaction.reply({
        content: "Use `/hire_staff` and select this show from the list.",
        ephemeral: true,
      });
    }

    return interaction.reply({
      content: "Unknown button.",
      ephemeral: true,
    });
  }

  if (!interaction.isChatInputCommand()) return;

  const handler = commandMap[interaction.commandName];

  console.log("COMMAND:", interaction.commandName);
  console.log("HANDLER EXISTS:", Boolean(handler));

  if (!handler) {
    return interaction.reply({
      content: `Command /${interaction.commandName} is not wired up yet.`,
      ephemeral: true,
    });
  }

  if (interaction.commandName !== "register" && !getUser(interaction.user.id)) {
    return interaction.reply({
      content: "Run `/register` first.",
      ephemeral: true,
    });
  }
  return handler(interaction);
}

module.exports = handleCommand;
