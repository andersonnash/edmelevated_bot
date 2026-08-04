const test = require("node:test");
const assert = require("node:assert/strict");

const {
  isBoostableShow,
  selectRandomBoostableShow,
} = require("../services/showBoostTarget");

function show(id, simulatedAttendees, ticketCount = 0) {
  return {
    id,
    name: `Show ${id}`,
    simulated_attendees: simulatedAttendees,
    ticket_count: ticketCount,
    base_capacity: 25,
    security_level: 0,
    production_level: 0,
  };
}

test("selects across all eligible upcoming shows", () => {
  const shows = [show(1, 10), show(2, 12)];

  assert.equal(selectRandomBoostableShow(shows, () => 0).id, 1);
  assert.equal(selectRandomBoostableShow(shows, () => 0.999999).id, 2);
});

test("excludes a full show when another show has room", () => {
  const full = show(1, 24, 1);
  const available = show(2, 10);

  assert.equal(isBoostableShow(full), false);
  assert.equal(selectRandomBoostableShow([full, available], () => 0).id, 2);
});

test("returns no target when every upcoming show is full", () => {
  const shows = [show(1, 25), show(2, 23, 2)];

  assert.equal(selectRandomBoostableShow(shows), null);
});

test("accounts for venue production and ticket holders", () => {
  const boostedVenueShow = {
    ...show(1, 20, 5),
    base_capacity: 30,
    production_level: 2,
  };

  assert.equal(isBoostableShow(boostedVenueShow), false);
});
