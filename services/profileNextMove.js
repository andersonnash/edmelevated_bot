const { VENUE_DEPARTMENTS } = require("../constants");
const { money } = require("./formatters");
const { venueDepartmentLevelName } = require("./venueDepartmentRules");
const { venueDepartmentUpgradeCost } = require("./venueInvestmentRules");

const STARTER_CONTROLLER_COST = 500;
const FIRST_VENUE_COST = 2_500;

function withCollectionNote(message, readyToCollect) {
  if (readyToCollect < 1) return message;

  return `${message}\n\n💰 **Also ready:** ${money(readyToCollect)} with \`/collect\`.`;
}

function earningCommands() {
  return "Earn cash now with `/work` or `/underground_run`.";
}

function buildProfileNextMove({
  cash = 0,
  journeyComplete = false,
  hasEquipment = false,
  openDecksComplete = false,
  venueCount = 0,
  showCount = 0,
  readyToCollect = 0,
  completedShow = null,
  upcomingShow = null,
  upcomingShows = null,
  firstVenue = null,
}) {
  let message;

  if (!journeyComplete && venueCount === 0) {
    if (!hasEquipment && cash < STARTER_CONTROLLER_COST) {
      message =
        "**Continue your Journey**\n" +
        `You need ${money(STARTER_CONTROLLER_COST - cash)} more for your first controller.\n` +
        `${earningCommands()} Then return to \`/journey\`.`;
    } else if (!hasEquipment) {
      message =
        "**Continue your Journey**\n" +
        `You can afford your first controller (${money(STARTER_CONTROLLER_COST)}). Run \`/journey\` for your current step, then use \`/buy_equipment\`.`;
    } else if (!openDecksComplete) {
      message =
        "**Continue your Journey**\n" +
        "Your gear is ready. Run `/journey` for your current step; `/bookings` is where you can play Open Decks.";
    } else {
      message =
        "**Continue your Journey**\n" +
        "Run `/journey` to see the one action that moves you toward your first showcase.";
    }

    return withCollectionNote(message, readyToCollect);
  }

  if (!hasEquipment) {
    message =
      cash >= STARTER_CONTROLLER_COST
        ? `**Buy your first controller**\nYou can afford the ${money(STARTER_CONTROLLER_COST)} starter controller. Use \`/buy_equipment\`.`
        : `**Save for your first controller**\n${money(cash)} / ${money(STARTER_CONTROLLER_COST)}\n${earningCommands()}`;
    return withCollectionNote(message, readyToCollect);
  }

  if (!openDecksComplete) {
    return withCollectionNote(
      "**Take your first DJ booking**\nUse `/bookings` and choose **Open Decks** to establish your DJ career.",
      readyToCollect,
    );
  }

  if (!venueCount) {
    message =
      cash >= FIRST_VENUE_COST
        ? `**Buy Garage Party**\nYou have ${money(cash)} and can afford your first venue (${money(FIRST_VENUE_COST)}). Use \`/buy_venue\`.`
        : `**Save for Garage Party**\n${money(cash)} / ${money(FIRST_VENUE_COST)}\n${earningCommands()}`;
    return withCollectionNote(message, readyToCollect);
  }

  if (completedShow) {
    return withCollectionNote(
      `**Settle ${completedShow.name}**\nThis show has payouts waiting. Use \`/collect_show\`.`,
      readyToCollect,
    );
  }

  if (!showCount) {
    return withCollectionNote(
      "**Create your first owned show**\nYour venue is ready. Use `/create_show` to put your first event on the calendar.",
      readyToCollect,
    );
  }

  const showsToPrepare = upcomingShows || (upcomingShow ? [upcomingShow] : []);
  const showMissingLineup = showsToPrepare.find(
    (show) => show.lineupCount < show.djLimit,
  );
  const showMissingStaff = showsToPrepare.find(
    (show) => show.staffCount < show.staffLimit,
  );
  const showMissingPromotion = showsToPrepare.find(
    (show) =>
      show.promotionNeeded ??
      (show.promotionCount === 0 && !show.projectedFull),
  );

  if (showsToPrepare.length) {
    if (showMissingLineup) {
      return withCollectionNote(
        `**Build the lineup for ${showMissingLineup.name}**\nYour lineup has ${showMissingLineup.lineupCount}/${showMissingLineup.djLimit} DJs. Use \`/my_shows\` and open the show’s **Lineup** controls.`,
        readyToCollect,
      );
    }

    if (showMissingStaff) {
      return withCollectionNote(
        `**Staff ${showMissingStaff.name}**\nYou have ${showMissingStaff.staffCount}/${showMissingStaff.staffLimit} show staff. Use \`/hire_show_staff\`.`,
        readyToCollect,
      );
    }

    if (showMissingPromotion) {
      const promotionCost = Number(showMissingPromotion.promotionCost || 100);
      message =
        cash >= promotionCost
          ? `**Promote ${showMissingPromotion.name}**\nIts one campaign costs ${money(promotionCost)} and you can afford it. Use \`/promote_show\`.`
          : `**Save to promote ${showMissingPromotion.name}**\nYou need ${money(promotionCost - cash)} more for its one campaign. ${earningCommands()}`;
      return withCollectionNote(message, readyToCollect);
    }

    const nextShow = showsToPrepare[0];
    return withCollectionNote(
      `**Keep an eye on ${nextShow.name}**\nIts lineup, staffing, and first promotion are in place. Review it with \`/my_shows\`.`,
      readyToCollect,
    );
  }

  if (firstVenue) {
    const nextBarLevel = Number(firstVenue.bar_level || 0) + 1;
    const upgradeCost = venueDepartmentUpgradeCost(
      firstVenue.type,
      "bar",
      nextBarLevel,
    );
    const upgradeName = venueDepartmentLevelName("bar", nextBarLevel);
    const barEmoji = VENUE_DEPARTMENTS.bar.emoji;

    message =
      cash >= upgradeCost
        ? `**Upgrade ${firstVenue.name}**\nYou can afford **${barEmoji} ${upgradeName}** (${money(upgradeCost)}). Use \`/upgrade_venue\`.`
        : `**Build toward your next venue upgrade**\n**${barEmoji} ${upgradeName}:** ${money(cash)} / ${money(upgradeCost)}\n${earningCommands()}`;
    return withCollectionNote(message, readyToCollect);
  }

  return withCollectionNote(
    "**Keep building the scene**\nUse `/work`, `/underground_run`, or `/my_shows` to choose your next move.",
    readyToCollect,
  );
}

module.exports = { buildProfileNextMove };
