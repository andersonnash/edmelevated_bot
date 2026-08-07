const users = require("./users");
const venues = require("./venues");
const shows = require("./shows");
const staff = require("./staff");
const lineup = require("./lineup");
const kandi = require("./kandi");
const djs = require("./djs");
const help = require("./help");
const games = require("./games");
const equipment = require("./equipment");
const shop = require("./shop");
const bookings = require("./bookings");
const journey = require("./journey");
const undergroundRun = require("./undergroundRun");
const ticketSales = require("./ticketSales");

const { getUser } = require("../services/roles");

const commandMap = {
  help: help.help,
  journey: journey.journey,
  underground_run: undergroundRun.undergroundRun,

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

  bookings: bookings.bookings,

  buy_venue: venues.buyVenue,
  my_venues: venues.myVenues,
  upgrade_venue: venues.upgradeVenue,
  venue_insurance: venues.venueInsurance,

  buy_equipment: equipment.buyEquipment,
  my_equipment: equipment.myEquipment,

  create_show: shows.createShow,
  my_shows: shows.myShows,
  force_run_show: shows.runShow,
  collect: shows.collect,
  collect_show: shows.collectShow,
  promote_show: shows.promoteShow,
  show_lineup: shows.showLineup,

  hire_show_staff: staff.hireStaff,
  my_jobs: staff.myJobs,
  hire_venue_staff: staff.hireVenueStaff,

  add_lineup: lineup.addLineup,


  create_kandi: kandi.createKandi,
  give_kandi: kandi.giveKandi,
  my_kandi: kandi.myKandi,

  test_venue_event: venues.testVenueEvent,
  run_venue_events: venues.runVenueEvents,
  test_ticket_sale: ticketSales.testTicketSale,

  shop: shop.shop,
  equip_title: shop.equipTitle,
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

    if (interaction.customId.startsWith("journey_showcase:")) {
      return journey.handleJourneyButton(interaction);
    }

    if (interaction.customId.startsWith("underground_run:")) {
      return undergroundRun.handleUndergroundRunButton(interaction);
    }

    if (interaction.customId.startsWith("help_")) {
      return help.handleHelpButton(interaction);
    }

    if (interaction.customId.startsWith("show_lineup_")) {
      const showId = interaction.customId.replace("show_lineup_", "");

      return shows.showLineup(interaction, showId);
    }

    if (interaction.customId.startsWith("promote_show_")) {
      const showId = interaction.customId.replace("promote_show_", "");
      return shows.promoteShowById(interaction, showId);
    }

    if (interaction.customId.startsWith("hire_show_")) {
      return staff.handleHireStaffButton(interaction);
    }

    if (interaction.customId.startsWith("shop_")) {
      return shop.handleShopButton(interaction);
    }

    if (interaction.customId.startsWith("bookings_")) {
      return bookings.handleBookingButton(interaction);
    }

    if (interaction.customId === "equipment_manage") {
      return equipment.handleManageButton(interaction);
    }

    if (interaction.customId.startsWith("equipment_install:")) {
      return equipment.handleInstallVenueButton(interaction);
    }

    return interaction.reply({
      content: "Unknown button.",
      ephemeral: true,
    });
  }

  if (interaction.isUserSelectMenu()) {
    if (interaction.customId.startsWith("hire_staff_user:")) {
      return staff.handleHireStaffUserSelect(interaction);
    }

    return interaction.reply({
      content: "Unknown selection menu.",
      ephemeral: true,
    });
  }

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "equipment_type") {
      return equipment.handleEquipmentTypeSelect(interaction);
    }
    if (interaction.customId.startsWith("equipment_venue:")) {
      return equipment.handleVenueSelect(interaction);
    }
    if (interaction.customId.startsWith("equipment_return_venue:")) {
      return equipment.handleReturnSelect(interaction);
    }
    return interaction.reply({ content: "Unknown selection menu.", ephemeral: true });
  }

  if (!interaction.isChatInputCommand()) return;

  const handler = commandMap[interaction.commandName];

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
