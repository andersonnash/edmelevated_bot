const assert = require("node:assert/strict");

const {
  calculateProjectedWalkins,
  isProjectedSoldOut,
} = require("../services/showForecast");

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

test("applies the production bonus exactly once", () => {
  const venue = { base_capacity: 100, production_level: 2 };
  assert.equal(
    calculateProjectedWalkins({ baseWalkins: 50, venue }),
    65,
  );
});

test("ticket holders reserve capacity before walk-ins", () => {
  const venue = { base_capacity: 100, production_level: 2 };
  assert.equal(
    calculateProjectedWalkins({ baseWalkins: 80, venue, ticketCount: 30 }),
    70,
  );
});

test("walk-ins never exceed remaining capacity or fall below zero", () => {
  const venue = { base_capacity: 25, production_level: 5 };
  assert.equal(
    calculateProjectedWalkins({ baseWalkins: 500, venue, ticketCount: 10 }),
    15,
  );
  assert.equal(
    calculateProjectedWalkins({ baseWalkins: -20, venue, ticketCount: 0 }),
    0,
  );
});

test("detects when tickets and projected walk-ins fill the venue", () => {
  const venue = { base_capacity: 25, production_level: 0 };

  assert.equal(
    isProjectedSoldOut({ baseWalkins: 24, venue, ticketCount: 1 }),
    true,
  );
  assert.equal(
    isProjectedSoldOut({ baseWalkins: 23, venue, ticketCount: 1 }),
    false,
  );
});
