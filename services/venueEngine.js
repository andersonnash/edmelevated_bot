const db = require("../db");
const {
  VENUE_TYPES,
  EQUIPMENT_TYPES,
  VENUE_DEPARTMENTS,
  VENUE_STAFF_ROLES,
} = require("../constants");

function venueReputation(venue) {
  return Object.values(VENUE_DEPARTMENTS).reduce((sum, department) => {
    const level = venue[department.column] || 0;
    return sum + level * department.reputationPerLevel;
  }, 0);
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
    SELECT role FROM venue_staff 
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

  const barLevel = venue.bar_level || 0;
  const barMultiplier = 1 + barLevel * 0.15;

  return Math.floor(
    baseIncome * barMultiplier * staffMultiplier * eventMultiplier,
  );
}

function venueCapacity(venue) {
  const baseCapacity = venue.base_capacity || 0;
  const securityLevel = venue.security_level || 0;

  const securityBonus = 1 + securityLevel * 0.2;

  return Math.floor(baseCapacity * securityBonus);
}

function venueAttendanceBonus(venue) {
  const productionLevel = Number(venue?.production_level || 0);
  const productionDepartment = VENUE_DEPARTMENTS.production;

  return productionLevel * (productionDepartment.benefitPerLevel / 100);
}

function equipmentHourlyIncome(item) {
  const equipmentType = EQUIPMENT_TYPES[item.equipment_type];
  return (equipmentType?.passiveIncome || 0) * (item.quantity || 1);
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

  const hourlyRate = (typeData.passiveIncome || 0) * (item.quantity || 1);
  const hours = hoursSince(item.last_collected_at);
  const rawIncome = hours * hourlyRate;

  return Math.floor(rawIncome);
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
  let hourly = 0;
  let total = 0;

  venues.forEach((venue) => {
    const baseIncome = VENUE_TYPES[venue.type]?.passiveIncome || 0;

    baseHourly += baseIncome;
    hourly += venueHourlyIncome(venue);
    total += venuePendingIncome(venue);
  });

  return {
    venues,
    total: Math.floor(total),
    hourly,
    baseHourly,
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
  equipmentHourlyIncome,
  venuePendingIncome,
  equipmentPendingIncome,
  venueReputation,
  venueCapacity,
  venueAttendanceBonus,
  getVenueIncome,
  getEquipmentIncome,
  resetVenueCollection,
  resetEquipmentCollection,
  equipmentMinuteIncome,
  nowString,
};
