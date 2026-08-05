const { VENUE_DEPARTMENTS } = require("../constants");

function venueCapacity(venue) {
  const baseCapacity = Number(venue?.base_capacity || 0);
  const securityLevel = Number(venue?.security_level || 0);
  return Math.floor(baseCapacity * (1 + securityLevel * 0.2));
}

function venueAttendanceBonus(venue) {
  const productionLevel = Number(venue?.production_level || 0);
  return (
    productionLevel *
      (VENUE_DEPARTMENTS.production.benefitPerLevel / 100) +
    Number(venue?.installed_equipment_attendance_bonus || 0)
  );
}

module.exports = { venueCapacity, venueAttendanceBonus };
