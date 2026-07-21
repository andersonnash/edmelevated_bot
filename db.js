const Database = require("better-sqlite3");

const db = new Database("edmelevated.db");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  discord_id TEXT PRIMARY KEY,
  username TEXT,
  cash INTEGER DEFAULT 500,
  reputation INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  lifetime_earned INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  role TEXT
);

CREATE TABLE IF NOT EXISTS venues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id TEXT,
  name TEXT,
  type TEXT,
  level INTEGER DEFAULT 1,
  staff_limit INTEGER DEFAULT 2,
  base_capacity INTEGER DEFAULT 50,
  lights_level INTEGER DEFAULT 0,
  sound_level INTEGER DEFAULT 0,
  dj_equipment_level INTEGER DEFAULT 0,
  dj_limit INTEGER DEFAULT 1,
  stage_level INTEGER DEFAULT 0,
  last_collected_at TEXT DEFAULT CURRENT_TIMESTAMP,
  insurance_tier TEXT DEFAULT 'basic',
  bar_level INTEGER DEFAULT 0,
  security_level INTEGER DEFAULT 0,
  production_level INTEGER DEFAULT 0,
  maintenance_level INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS venue_staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  venue_id INTEGER NOT NULL,
  user_id TEXT, -- Removed NOT NULL constraint
  username TEXT,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  hired_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id TEXT,
  venue_id INTEGER,
  name TEXT,
  show_date TEXT,
  ticket_price INTEGER,
  status TEXT DEFAULT 'upcoming',
  tickets_sold INTEGER DEFAULT 0,
  free_tickets_given INTEGER DEFAULT 0,
  simulated_attendees INTEGER DEFAULT 0,
  attendance_locked INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS show_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  show_id INTEGER,
  user_id TEXT,
  username TEXT,
  price_paid INTEGER,
  ticket_type TEXT
);

CREATE TABLE IF NOT EXISTS show_staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  show_id INTEGER,
  hired_user_id TEXT,
  hired_username TEXT,
  role TEXT,
  pay INTEGER,
  status TEXT DEFAULT 'assigned',
  paid INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS rave_payouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  show_id INTEGER,
  show_name TEXT,
  profit INTEGER,
  collected INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS show_payouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  show_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT,
  role TEXT NOT NULL,
  amount INTEGER NOT NULL,
  paid INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS show_ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  show_id INTEGER NOT NULL UNIQUE,
  owner_id TEXT NOT NULL,
  attendance_score INTEGER NOT NULL,
  profitability_score INTEGER NOT NULL,
  production_score INTEGER NOT NULL,
  lineup_score INTEGER NOT NULL,
  staffing_score INTEGER NOT NULL,
  overall_score INTEGER NOT NULL,
  star_rating REAL NOT NULL,
  reputation_bonus INTEGER NOT NULL DEFAULT 0,
  crowd_reaction TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_show_ratings_owner
ON show_ratings(owner_id, created_at);

CREATE TABLE IF NOT EXISTS ticket_contests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  show_id INTEGER,
  owner_id TEXT,
  name TEXT,
  ticket_count INTEGER,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS contest_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contest_id INTEGER,
  user_id TEXT,
  username TEXT
);

CREATE TABLE IF NOT EXISTS kandi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id TEXT,
  creator_username TEXT,
  phrase TEXT,
  color TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kandi_gifts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kandi_id INTEGER,
  giver_id TEXT,
  giver_username TEXT,
  receiver_id TEXT,
  receiver_username TEXT,
  gifted_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS show_promotions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  show_id INTEGER,
  promoter_id TEXT,
  promoter_username TEXT,
  promo_text TEXT,
  hype_gain INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS show_lineup (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  show_id INTEGER,
  dj_user_id TEXT,
  dj_username TEXT,
  slot_order INTEGER,
  pay INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS dj_profiles (
  user_id TEXT PRIMARY KEY,
  username TEXT,
  dj_reputation INTEGER DEFAULT 0,
  bookings INTEGER DEFAULT 0,
  base_fee INTEGER DEFAULT 100
);

  CREATE TABLE IF NOT EXISTS user_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    booking_key TEXT NOT NULL,
    genre TEXT,
    opener_key TEXT,
    cash_reward INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 0,
    reputation_reward INTEGER DEFAULT 0,
    dj_reputation_reward INTEGER DEFAULT 0,
    completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, booking_key)
  );

  CREATE TABLE IF NOT EXISTS user_equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    equipment_type TEXT NOT NULL,
    name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    hourly_income INTEGER DEFAULT 0,
    last_collected_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_cosmetics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    item_key TEXT NOT NULL,
    item_type TEXT NOT NULL,
    purchased_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, item_key)
  );
`);

function addColumnIfMissing(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  const exists = columns.some((col) => col.name === column);

  if (!exists) {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
  }
}

addColumnIfMissing("venues", "closed_until", "TEXT");
addColumnIfMissing("venues", "closure_reason", "TEXT");
addColumnIfMissing("venues", "boosted_until", "TEXT");
addColumnIfMissing("venues", "income_multiplier", "REAL DEFAULT 1");
addColumnIfMissing("venues", "created_at", "TEXT");
addColumnIfMissing("venues", "closed_at", "TEXT");
addColumnIfMissing("users", "active_cosmetic_title", "TEXT");
addColumnIfMissing("venues", "insurance_expires_at", "TEXT");
addColumnIfMissing("shows", "genre", "TEXT DEFAULT 'mixed'");

module.exports = db;
