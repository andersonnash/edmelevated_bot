const test = require("node:test");
const assert = require("node:assert/strict");
const {
  numberOwnedVenues,
  venueOwnerNumber,
} = require("../services/venueDisplayRules");

test("numbers venues within one owner's collection instead of globally", () => {
  const venues = [
    { id: 8, name: "Granary Warehouse" },
    { id: 3, name: "Garage Party" },
  ];

  assert.deepEqual(
    numberOwnedVenues(venues).map(({ id, ownerVenueNumber }) => ({
      id,
      ownerVenueNumber,
    })),
    [
      { id: 3, ownerVenueNumber: 1 },
      { id: 8, ownerVenueNumber: 2 },
    ],
  );
  assert.equal(venueOwnerNumber(venues, 3), 1);
  assert.equal(venueOwnerNumber(venues, 8), 2);
});

test("returns no player-facing number for an unrelated venue", () => {
  assert.equal(venueOwnerNumber([{ id: 3 }], 99), null);
});
