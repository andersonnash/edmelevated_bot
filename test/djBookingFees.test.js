const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateDjBookingFee } = require("../services/djs");

test("keeps a new DJ at the base booking fee", () => {
  assert.equal(
    calculateDjBookingFee({ base_fee: 100, dj_reputation: 0, bookings: 0 }),
    100,
  );
});

test("keeps a ten-gig DJ in the mid-career fee range", () => {
  assert.equal(
    calculateDjBookingFee({ base_fee: 100, dj_reputation: 65, bookings: 10 }),
    510,
  );
  assert.equal(
    calculateDjBookingFee({ base_fee: 100, dj_reputation: 100, bookings: 10 }),
    650,
  );
});

test("reserves four-figure fees for established DJs", () => {
  assert.equal(
    calculateDjBookingFee({ base_fee: 100, dj_reputation: 175, bookings: 20 }),
    1100,
  );
});
