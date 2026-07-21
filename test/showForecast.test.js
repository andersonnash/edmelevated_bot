const assert = require("node:assert/strict");

const {
  calculateProjectedWalkins,
  generateInitialWalkins,
  ticketPriceDemandModifier,
  ticketPriceDemandLabel,
  applyTicketPriceDemand,
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

test("maps every ticket-price boundary to the intended demand tier", () => {
  assert.equal(ticketPriceDemandModifier(10), 1.2);
  assert.equal(ticketPriceDemandModifier(20), 1.2);
  assert.equal(ticketPriceDemandModifier(21), 1.1);
  assert.equal(ticketPriceDemandModifier(30), 1.1);
  assert.equal(ticketPriceDemandModifier(31), 1);
  assert.equal(ticketPriceDemandModifier(40), 1);
  assert.equal(ticketPriceDemandModifier(41), 0.85);
  assert.equal(ticketPriceDemandModifier(50), 0.85);
  assert.equal(ticketPriceDemandModifier(51), 0.7);
  assert.equal(ticketPriceDemandModifier(75), 0.7);
});

test("applies and labels ticket-price demand effects", () => {
  assert.equal(applyTicketPriceDemand(20, 20), 24);
  assert.equal(applyTicketPriceDemand(20, 40), 20);
  assert.equal(applyTicketPriceDemand(20, 75), 14);
  assert.equal(ticketPriceDemandLabel(20), "+20% demand");
  assert.equal(ticketPriceDemandLabel(40), "No change");
  assert.equal(ticketPriceDemandLabel(75), "-30% demand");
});

test("combines low pricing and production without exceeding capacity", () => {
  const venue = { base_capacity: 30, production_level: 2 };
  const initialWalkins = generateInitialWalkins(venue, () => 0.999999);
  const pricedWalkins = applyTicketPriceDemand(initialWalkins, 10);
  const projectedWalkins = calculateProjectedWalkins({
    baseWalkins: pricedWalkins,
    venue,
  });

  assert.equal(projectedWalkins, 19);
  assert.ok(projectedWalkins <= 30);
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

test("starts a new show between 30 and 60 percent of venue capacity", () => {
  const venue = { base_capacity: 30, production_level: 0 };

  assert.equal(generateInitialWalkins(venue, () => 0), 9);
  assert.equal(generateInitialWalkins(venue, () => 0.999999), 18);
});

test("accounts for production when generating initial demand", () => {
  const venue = { base_capacity: 100, production_level: 2 };
  const baseWalkins = generateInitialWalkins(venue, () => 0.999999);

  assert.equal(
    calculateProjectedWalkins({ baseWalkins, venue }),
    59,
  );
  assert.equal(
    isProjectedSoldOut({ baseWalkins, venue }),
    false,
  );
});
