const test = require("node:test");
const assert = require("node:assert/strict");
const Database = require("better-sqlite3");
const { purchasePromotion } = require("../services/promotionPurchase");

function testDatabase(cash = 1000) {
  const db = new Database(":memory:");
  db.exec(`
    CREATE TABLE users (discord_id TEXT PRIMARY KEY, cash INTEGER);
    CREATE TABLE shows (
      id INTEGER PRIMARY KEY,
      owner_id TEXT,
      status TEXT,
      promotion_used INTEGER DEFAULT 0,
      simulated_attendees INTEGER DEFAULT 0
    );
    CREATE TABLE show_promotions (
      show_id INTEGER,
      promoter_id TEXT,
      promoter_username TEXT,
      promo_text TEXT,
      hype_gain INTEGER
    );
  `);
  db.prepare("INSERT INTO users VALUES ('owner', ?)").run(cash);
  db.prepare("INSERT INTO shows VALUES (1, 'owner', 'upcoming', 0, 10)").run();
  return db;
}

test("charges and applies a campaign exactly once", () => {
  const db = testDatabase();
  const remaining = purchasePromotion({
    db,
    showId: 1,
    userId: "owner",
    username: "Promoter",
    cost: 300,
    demand: 30,
  });

  assert.equal(remaining, 700);
  assert.deepEqual(db.prepare("SELECT promotion_used, simulated_attendees FROM shows").get(), {
    promotion_used: 1,
    simulated_attendees: 40,
  });
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM show_promotions").get().count, 1);

  assert.throws(
    () =>
      purchasePromotion({
        db,
        showId: 1,
        userId: "owner",
        username: "Promoter",
        cost: 300,
        demand: 30,
      }),
    /PROMOTION_ALREADY_USED/,
  );
  assert.equal(db.prepare("SELECT cash FROM users").get().cash, 700);
  db.close();
});

test("rolls back the campaign when cash is insufficient", () => {
  const db = testDatabase(50);
  assert.throws(
    () =>
      purchasePromotion({
        db,
        showId: 1,
        userId: "owner",
        username: "Promoter",
        cost: 100,
        demand: 8,
      }),
    /INSUFFICIENT_PROMOTION_CASH/,
  );
  assert.deepEqual(db.prepare("SELECT promotion_used, simulated_attendees FROM shows").get(), {
    promotion_used: 0,
    simulated_attendees: 10,
  });
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM show_promotions").get().count, 0);
  db.close();
});
