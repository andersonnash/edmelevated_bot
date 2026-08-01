const test = require("node:test");
const assert = require("node:assert/strict");

const { buildProfileNextMove } = require("../services/profileNextMove");

function move(overrides = {}) {
  return buildProfileNextMove({
    cash: 0,
    journeyComplete: false,
    hasEquipment: false,
    openDecksComplete: false,
    venueCount: 0,
    showCount: 0,
    ...overrides,
  });
}

test("guides a broke new player toward earnings and Journey", () => {
  const result = move({ cash: 200 });
  assert.match(result, /\$300 more/);
  assert.match(result, /`\/work`/);
  assert.match(result, /`\/journey`/);
});

test("tells a purchase-ready new player to buy equipment", () => {
  const result = move({ cash: 500 });
  assert.match(result, /can afford your first controller/);
  assert.match(result, /`\/buy_equipment`/);
});

test("keeps established Journey progress focused on the walkthrough", () => {
  const result = move({
    cash: 900,
    hasEquipment: true,
    openDecksComplete: true,
  });
  assert.match(result, /Continue your Journey/);
  assert.match(result, /`\/journey`/);
});

test("uses cash to distinguish saving from buying the first venue", () => {
  const saving = move({
    cash: 1_900,
    journeyComplete: true,
    hasEquipment: true,
    openDecksComplete: true,
  });
  const ready = move({
    cash: 2_500,
    journeyComplete: true,
    hasEquipment: true,
    openDecksComplete: true,
  });

  assert.match(saving, /\$1,900 \/ \$2,500/);
  assert.match(saving, /`\/underground_run`/);
  assert.match(ready, /`\/buy_venue`/);
});

test("prioritizes unsettled shows", () => {
  const result = move({
    cash: 1_000,
    journeyComplete: true,
    hasEquipment: true,
    openDecksComplete: true,
    venueCount: 1,
    showCount: 2,
    completedShow: { name: "Neon Spectrum" },
  });
  assert.match(result, /Settle Neon Spectrum/);
  assert.match(result, /`\/collect_show`/);
});

test("walks an upcoming show through lineup, staffing, and promotion", () => {
  const base = {
    cash: 500,
    journeyComplete: true,
    hasEquipment: true,
    openDecksComplete: true,
    venueCount: 1,
    showCount: 1,
  };

  const lineupMove = move({
    ...base,
    upcomingShow: {
      name: "Bass Signal",
      lineupCount: 0,
      djLimit: 1,
      staffCount: 0,
      staffLimit: 1,
      promotionCount: 0,
    },
  });
  assert.match(lineupMove, /Build the lineup/);
  assert.match(lineupMove, /`\/my_shows`/);
  assert.match(
    move({
      ...base,
      upcomingShow: {
        name: "Bass Signal",
        lineupCount: 1,
        djLimit: 1,
        staffCount: 0,
        staffLimit: 1,
        promotionCount: 0,
      },
    }),
    /`\/hire_show_staff`/,
  );
  assert.match(
    move({
      ...base,
      upcomingShow: {
        name: "Bass Signal",
        lineupCount: 1,
        djLimit: 1,
        staffCount: 1,
        staffLimit: 1,
        promotionCount: 0,
      },
    }),
    /`\/promote_show`/,
  );
});

test("finds an unprepared show after an earlier prepared show", () => {
  const result = move({
    cash: 500,
    journeyComplete: true,
    hasEquipment: true,
    openDecksComplete: true,
    venueCount: 1,
    showCount: 2,
    upcomingShows: [
      {
        name: "Bass Rush",
        lineupCount: 1,
        djLimit: 1,
        staffCount: 1,
        staffLimit: 1,
        promotionCount: 1,
      },
      {
        name: "Ear Tickler",
        lineupCount: 0,
        djLimit: 1,
        staffCount: 0,
        staffLimit: 1,
        promotionCount: 0,
      },
    ],
  });

  assert.match(result, /Build the lineup for Ear Tickler/);
  assert.doesNotMatch(result, /Keep an eye on Bass Rush/);
});

test("keeps passive collection secondary to progression", () => {
  const result = move({ cash: 200, readyToCollect: 75 });
  assert.match(result, /Continue your Journey/);
  assert.match(result, /Also ready.*\$75.*`\/collect`/s);
});

test("uses current cash for an established player's next upgrade", () => {
  const state = {
    cash: 500,
    journeyComplete: true,
    hasEquipment: true,
    openDecksComplete: true,
    venueCount: 1,
    showCount: 1,
    firstVenue: {
      name: "Garage Party",
      type: "garage_party",
      bar_level: 0,
    },
  };

  assert.match(move(state), /Beer & Wine Service/);
  assert.match(move(state), /`\/upgrade_venue`/);
});
