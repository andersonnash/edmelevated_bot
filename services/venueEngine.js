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
  const multiplier = getVenueIncomeMultiplier(venue.id);

  return Math.floor(baseIncome * multiplier);
}

function venueCapacity(venue) {
  const baseCapacity = venue.base_capacity || 0;
  const securityLevel = venue.security_level || 0;

  const securityBonus = 1 + securityLevel * 0.05;

  return Math.floor(baseCapacity * securityBonus);
}

function venueAttendanceBonus(venue) {
  const productionLevel = venue.production_level || 0;
  const barLevel = venue.bar_level || 0;

  return productionLevel * 0.05 + barLevel * 0.02;
}

function equipmentHourlyIncome(item) {
  const equipmentType = EQUIPMENT_TYPES[item.equipment_type];
  return (equipmentType?.passiveIncome || 0) * (item.quantity || 1);
}

function equipmentMinuteIncome(item) {
  return equipmentHourlyIncome(item) / 60;
}

function venuePendingIncome(venue) {
  const rate = venueHourlyIncome(venue);
  const hours = hoursSince(venue.last_collected_at);

  return Math.floor(hours * rate);
}

function equipmentPendingIncome(item) {
  const typeData = EQUIPMENT_TYPES[item.equipment_type];
  if (!typeData) return 0;

  const hourlyRate = (typeData.passiveIncome || 0) * (item.quantity || 1);
  const hours = hoursSince(item.last_collected_at);
  const rawIncome = hours * hourlyRate;

  return Math.floor(rawIncome);
}

function getVenueIncome(userId) {
  const venues = db
    .prepare("SELECT * FROM venues WHERE owner_id = ?")
    .all(userId);

  let totalBaseIncome = 0;
  let totalStaffBoost = 0;
  let totalPendingIncome = 0;

  venues.forEach((venue) => {
    const baseRate = VENUE_TYPES[venue.type]?.passiveIncome || 0;
    totalBaseIncome += baseRate;

    const staff = db
      .prepare(
        `SELECT role FROM venue_staff WHERE venue_id = ? AND status = 'active'`,
      )
      .all(venue.id);
    let multiplier = 0;
    staff.forEach((member) => {
      const roleData = VENUE_STAFF_ROLES[member.role];
      if (roleData) multiplier += roleData.incomeBoost;
    });
    totalStaffBoost += baseRate * multiplier;

    const effectiveRate = baseRate * (1 + multiplier);
    const hours = hoursSince(venue.last_collected_at);
    totalPendingIncome += Math.floor(hours * effectiveRate);
  });

  const totalHourly = totalBaseIncome + totalStaffBoost;

  return {
    venues,
    total: totalPendingIncome,
    hourly: totalHourly,
    baseHourly: totalBaseIncome,
    staffBoostHourly: totalStaffBoost,
  };
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
};
