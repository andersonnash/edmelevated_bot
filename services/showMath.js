const { VENUE_DEPARTMENTS } = require("../constants");
const { venueDepartmentLevel } = require("./venueDepartmentRules");

function venueCapacity(venue) {
  const baseCapacity = Number(venue?.base_capacity || 0);
  const securityLevel = venueDepartmentLevel("security", venue?.security_level);
  return Math.floor(baseCapacity * (1 + securityLevel * 0.2));
}

function venueAttendanceBonus(venue) {
  const productionLevel = venueDepartmentLevel(
    "production",
    venue?.production_level,
  );
  return (
    productionLevel *
      (VENUE_DEPARTMENTS.production.benefitPerLevel / 100) +
    Number(venue?.installed_equipment_attendance_bonus || 0)
  );
}

module.exports = { venueCapacity, venueAttendanceBonus };
