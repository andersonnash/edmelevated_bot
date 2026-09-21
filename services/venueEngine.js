const db = require("../db");
const {
  VENUE_TYPES,
  EQUIPMENT_TYPES,
  VENUE_STAFF_ROLES,
} = require("../constants");
const {
  venueCapacity,
  venueAttendanceBonus,
} = require("./showMath");
const { installedEquipmentEffects, storedQuantity } = require("./equipmentRules");
const { venueDepartmentLevel } = require("./venueDepartmentRules");

function getInstalledEquipment(venueId) {
  return db
    .prepare(
      `SELECT equipment_type, quantity FROM venue_equipment WHERE venue_id = ?`,
    )
    .all(venueId);
}

function getInstalledEquipmentEffects(venueId) {
  return installedEquipmentEffects(getInstalledEquipment(venueId));
}

function isActiveUntil(timestamp) {
  if (!timestamp) return false;

  const utcString = timestamp.replace(" ", "T") + "Z";
  return new Date(utcString) > new Date();
}

function hoursSince(timestamp) {
  if (!timestamp) return 0;

  const utcString = timestamp.replace(" ", "T") + "Z";
  const last = new Date(utcString);
  const now = new Date();
  const diffMs = now - last;
  const diffHours = diffMs / 3600000;

  if (diffMs < 0) return 0;
  return diffHours;
}

function hoursBetween(start, end) {
  if (!start || !end) return 0;

  const startTime = new Date(start.replace(" ", "T") + "Z");
  const endTime = new Date(end.replace(" ", "T") + "Z");

  return Math.max(0, (endTime - startTime) / 3600000);
}

function nowString() {
  return new Date().toISOString().replace("T", " ").split(".")[0];
}

function getVenueIncomeMultiplier(venueId) {
  const staff = db
    .prepare(
      `
    SELECT DISTINCT role FROM venue_staff
    WHERE venue_id = ? AND status = 'active'
  `,
    )
    .all(venueId);

  let totalBoost = 0;
  staff.forEach((member) => {
    const role = VENUE_STAFF_ROLES[member.role];
    if (role) {
      totalBoost += role.incomeBoost;
    }
  });

  return 1 + totalBoost;
}

function venueHourlyIncome(venue) {
  const baseIncome = VENUE_TYPES[venue.type]?.passiveIncome || 0;

  if (isActiveUntil(venue.closed_until)) {
    return 0;
  }

  const staffMultiplier = getVenueIncomeMultiplier(venue.id);

  const eventMultiplier = isActiveUntil(venue.boosted_until)
    ? venue.income_multiplier || 1
    : 1;

  const barLevel = venueDepartmentLevel("bar", venue.bar_level);
  const barMultiplier = 1 + barLevel * 0.15;

  const operatingIncome = Math.floor(
    baseIncome *
      barMultiplier *
      staffMultiplier *
      eventMultiplier,
  );
  return operatingIncome;
}

function calculateVenueIncomeBreakdown({
  baseIncome,
  barLevel = 0,
  staffMultiplier = 1,
  eventMultiplier = 1,
  closed = false,
}) {
  if (closed) {
    return {
      baseHourly: 0,
      barBoostHourly: 0,
      permanentStaffBoostHourly: 0,
      eventBoostHourly: 0,
      hourly: 0,
    };
  }

  const cappedBarLevel = venueDepartmentLevel("bar", barLevel);
  const barMultiplier = 1 + cappedBarLevel * 0.15;

  const baseStage = Math.floor(baseIncome);
  const barStage = Math.floor(baseIncome * barMultiplier);
  const staffStage = Math.floor(baseIncome * barMultiplier * staffMultiplier);
  const eventStage = Math.floor(
    baseIncome *
      barMultiplier *
      staffMultiplier *
      eventMultiplier,
  );

  return {
    baseHourly: baseStage,
    barBoostHourly: barStage - baseStage,
    permanentStaffBoostHourly: staffStage - barStage,
    eventBoostHourly: eventStage - staffStage,
    hourly: eventStage,
  };
}

function venueIncomeBreakdown(venue) {
  const breakdown = calculateVenueIncomeBreakdown({
    baseIncome: VENUE_TYPES[venue.type]?.passiveIncome || 0,
    barLevel: venue.bar_level || 0,
    staffMultiplier: getVenueIncomeMultiplier(venue.id),
    eventMultiplier: isActiveUntil(venue.boosted_until)
      ? venue.income_multiplier || 1
      : 1,
    closed: isActiveUntil(venue.closed_until),
  });
  return {
    ...breakdown,
    hourly: breakdown.hourly,
  };
}

function equipmentHourlyIncome(item) {
  const equipmentType = EQUIPMENT_TYPES[item.equipment_type];
  const installed = db
    .prepare(
      `SELECT COALESCE(SUM(quantity), 0) AS quantity
       FROM venue_equipment WHERE user_id = ? AND equipment_type = ?`,
    )
    .get(item.user_id, item.equipment_type).quantity;
  return (
    (equipmentType?.passiveIncome || 0) *
    storedQuantity(item.quantity, installed)
  );
}

function equipmentMinuteIncome(item) {
  return equipmentHourlyIncome(item) / 60;
}

function venuePendingIncome(venue) {
  const rate = venueHourlyIncome({
    ...venue,
    closed_until: null,
  });

  if (venue.closed_at && venue.closed_until) {
    const lastCollected = new Date(
      venue.last_collected_at.replace(" ", "T") + "Z",
    );
    const closedUntil = new Date(venue.closed_until.replace(" ", "T") + "Z");
    const now = new Date();

    if (lastCollected >= closedUntil) {
      return Math.floor(hoursSince(venue.last_collected_at) * rate);
    }

    const beforeClosureHours = hoursBetween(
      venue.last_collected_at,
      venue.closed_at,
    );

    const afterReopenHours =
      now > closedUntil ? hoursBetween(venue.closed_until, nowString()) : 0;

    return Math.floor((beforeClosureHours + afterReopenHours) * rate);
  }

  return Math.floor(hoursSince(venue.last_collected_at) * rate);
}

function equipmentPendingIncome(item) {
  const typeData = EQUIPMENT_TYPES[item.equipment_type];
  if (!typeData) return 0;

  const hourlyRate = equipmentHourlyIncome(item);
  const hours = hoursSince(item.last_collected_at);
  const rawIncome = hours * hourlyRate;

  return Math.floor(rawIncome) + Number(item.accrued_income || 0);
}

function getEquipmentIncome(userId) {
  const equipment = db
    .prepare(`SELECT * FROM user_equipment WHERE user_id = ?`)
    .all(userId);

  if (equipment.length === 0) {
    return { equipment: [], total: 0, hourly: 0 };
  }

  const total = equipment.reduce((sum, item) => {
    const income = equipmentPendingIncome(item);
    return sum + (income || 0);
  }, 0);

  const hourly = equipment.reduce((sum, item) => {
    const income = equipmentHourlyIncome(item) || 0;
    return sum + income;
  }, 0);

  return { equipment, total: Math.floor(total), hourly };
}

function getVenueIncome(userId) {
  const venues = db
    .prepare(
      `
      SELECT *
      FROM venues
      WHERE owner_id = ?
      `,
    )
    .all(userId);

  let baseHourly = 0;
  let barBoostHourly = 0;
  let permanentStaffBoostHourly = 0;
  let eventBoostHourly = 0;
  let hourly = 0;
  let total = 0;

  venues.forEach((venue) => {
    const breakdown = venueIncomeBreakdown(venue);

    baseHourly += breakdown.baseHourly;
    barBoostHourly += breakdown.barBoostHourly;
    permanentStaffBoostHourly += breakdown.permanentStaffBoostHourly;
    eventBoostHourly += breakdown.eventBoostHourly;
    hourly += breakdown.hourly;
    total += venuePendingIncome(venue);
  });

  return {
    venues,
    total: Math.floor(total),
    hourly,
    baseHourly,
    barBoostHourly,
    permanentStaffBoostHourly,
    eventBoostHourly,
    staffBoostHourly: Math.max(0, hourly - baseHourly),
  };
}

function resetVenueCollection(userId) {
  db.prepare(
    `
    UPDATE venues
    SET last_collected_at = CURRENT_TIMESTAMP
    WHERE owner_id = ?
  `,
  ).run(userId);
}

function resetEquipmentCollection(userId) {
  db.prepare(
    `
    UPDATE user_equipment
    SET last_collected_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `,
  ).run(userId);
}

module.exports = {
  hoursSince,
  hoursBetween,
  venueHourlyIncome,
  calculateVenueIncomeBreakdown,
  venueIncomeBreakdown,
  equipmentHourlyIncome,
  venuePendingIncome,
  equipmentPendingIncome,
  venueCapacity,
  venueAttendanceBonus,
  getVenueIncome,
  getEquipmentIncome,
  resetVenueCollection,
  resetEquipmentCollection,
  getInstalledEquipment,
  getInstalledEquipmentEffects,
  equipmentMinuteIncome,
  nowString,
};
