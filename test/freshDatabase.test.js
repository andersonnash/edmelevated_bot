const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

test("initializes a fresh database with required tables and columns", () => {
  const temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "edmelevated-db-test-"),
  );
  const databaseModule = path.resolve(__dirname, "../db.js");

  const script = `
    const db = require(${JSON.stringify(databaseModule)});
    const required = {
      users: ["discord_id", "cash", "reputation", "xp"],
      venues: ["owner_id", "insurance_expires_at", "closed_until"],
      shows: ["owner_id", "genre", "show_date", "status", "promotion_used"],
      show_payouts: ["show_id", "role", "amount", "paid"],
      show_ratings: ["show_id", "overall_score", "star_rating"],
      automated_ticket_sales: ["show_id", "quantity", "price_each", "scenario_key"],
      user_equipment: ["user_id", "equipment_type", "quantity", "accrued_income"],
      venue_equipment: ["user_id", "venue_id", "equipment_type", "quantity"],
    };

    for (const [table, columns] of Object.entries(required)) {
      const actual = new Set(
        db.prepare("PRAGMA table_info(" + table + ")").all().map((column) => column.name),
      );

      for (const column of columns) {
        if (!actual.has(column)) {
          throw new Error("Missing " + table + "." + column);
        }
      }
    }

    db.close();
  `;

  try {
    execFileSync(process.execPath, ["-e", script], {
      cwd: temporaryDirectory,
      stdio: "pipe",
    });

    assert.equal(
      fs.existsSync(path.join(temporaryDirectory, "edmelevated.db")),
      true,
    );
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
});
