const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  projectedAttendance,
  saleQuantity,
  selectRandomShow,
  ticketBatchRange,
  ticketSaleOpportunity,
} = require("../services/ticketSales");

function show(overrides = {}) {
  return {
    id: 1,
    base_capacity: 100,
    security_level: 0,
    production_level: 0,
    simulated_attendees: 40,
    player_ticket_count: 0,
    automated_ticket_count: 0,
    ...overrides,
  };
}

test("scales ticket batches with venue capacity", () => {
  assert.deepEqual(ticketBatchRange(25), { minimum: 1, maximum: 3 });
  assert.deepEqual(ticketBatchRange(100), { minimum: 3, maximum: 8 });
  assert.deepEqual(ticketBatchRange(250), { minimum: 6, maximum: 18 });
  assert.deepEqual(ticketBatchRange(600), { minimum: 15, maximum: 40 });
  assert.deepEqual(ticketBatchRange(2500), { minimum: 40, maximum: 120 });
});

test("adds confirmed demand without exceeding capacity", () => {
  const eventShow = show({ simulated_attendees: 95 });
  assert.equal(saleQuantity(eventShow, () => 0.99), 5);

  const after = projectedAttendance({
    ...eventShow,
    automated_ticket_count: 5,
  });
  assert.equal(after.total, 100);
  assert.equal(after.walkins, 95);
});

test("converts projected walk-ins when a show is already at capacity", () => {
  const fullShow = show({ simulated_attendees: 100 });
  assert.deepEqual(ticketSaleOpportunity(fullShow).mode, "conversion");
  assert.equal(saleQuantity(fullShow, () => 0), 3);

  const after = projectedAttendance({
    ...fullShow,
    automated_ticket_count: 3,
  });
  assert.equal(after.walkins, 97);
  assert.equal(after.total, 100);
});

test("stops sales when every attendee is already confirmed", () => {
  assert.equal(
    saleQuantity(
      show({
        simulated_attendees: 100,
        automated_ticket_count: 100,
      }),
    ),
    0,
  );
});

test("selects across all eligible upcoming shows", () => {
  const shows = [show({ id: 1 }), show({ id: 2 }), show({ id: 3 })];
  assert.equal(selectRandomShow(shows, () => 0).id, 1);
  assert.equal(selectRandomShow(shows, () => 0.99).id, 3);
});

test("records one sale batch and enforces the per-show cooldown", () => {
  const temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "edmelevated-ticket-sales-test-"),
  );
  const databaseModule = path.resolve(__dirname, "../db.js");
  const salesModule = path.resolve(__dirname, "../services/ticketSales.js");
  const script = `
    const db = require(${JSON.stringify(databaseModule)});
    const {
      forceTicketSaleForOwner,
      forceTicketSaleForShow,
      runTicketSalesCheck,
    } = require(${JSON.stringify(salesModule)});

    db.prepare("INSERT INTO users (discord_id, username) VALUES ('owner-1', 'Promoter')").run();
    const venue = db.prepare(\`
      INSERT INTO venues (
        owner_id, name, type, base_capacity, security_level, production_level
      ) VALUES ('owner-1', 'Garage Party', 'garage_party', 25, 0, 0)
    \`).run();
    const show = db.prepare(\`
      INSERT INTO shows (
        owner_id, venue_id, name, show_date, ticket_price,
        simulated_attendees, status
      ) VALUES (
        'owner-1', ?, 'Test Night', date('now', '+5 days'), 25, 10, 'upcoming'
      )
    \`).run(venue.lastInsertRowid);

    const first = runTicketSalesCheck(() => 0);
    const second = runTicketSalesCheck(() => 0);
    const forced = forceTicketSaleForOwner('owner-1', () => 0);
    const saved = db.prepare(\`
      SELECT COUNT(*) AS batches, SUM(quantity) AS quantity,
        MAX(price_each) AS price_each
      FROM automated_ticket_sales
      WHERE show_id = ?
    \`).get(show.lastInsertRowid);

    if (first.length !== 1 || first[0].quantity !== 1) {
      throw new Error('Expected one minimum-size Garage Party sale');
    }
    if (first[0].revenueAfter !== 25) {
      throw new Error('Expected $25 confirmed revenue');
    }
    if (second.length !== 0) {
      throw new Error('Cooldown allowed a second immediate sale');
    }
    if (!forced || forced.quantity !== 1) {
      throw new Error('Admin force did not bypass the cooldown');
    }
    if (!saved || saved.batches !== 2 || saved.quantity !== 2 || saved.price_each !== 25) {
      throw new Error('Sale batch was not stored correctly');
    }

    db.prepare("INSERT INTO users (discord_id, username) VALUES ('owner-2', 'Second Promoter')").run();
    const secondVenue = db.prepare(\`
      INSERT INTO venues (
        owner_id, name, type, base_capacity, security_level, production_level
      ) VALUES ('owner-2', 'Second Garage', 'garage_party', 25, 0, 0)
    \`).run();
    const secondShow = db.prepare(\`
      INSERT INTO shows (
        owner_id, venue_id, name, show_date, ticket_price,
        simulated_attendees, status
      ) VALUES (
        'owner-2', ?, 'Second Night', date('now', '+6 days'), 30, 10, 'upcoming'
      )
    \`).run(secondVenue.lastInsertRowid);
    const selected = forceTicketSaleForShow(secondShow.lastInsertRowid, () => 0);
    if (!selected || selected.ownerId !== 'owner-2' || selected.show.name !== 'Second Night') {
      throw new Error('Admin show selection did not target the chosen promoter');
    }

    db.close();
  `;

  try {
    execFileSync(process.execPath, ["-e", script], {
      cwd: temporaryDirectory,
      stdio: "pipe",
    });
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
});
