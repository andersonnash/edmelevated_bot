const {
  VENUE_TYPES,
  VENUE_DEPARTMENTS,
  VENUE_STAFF_ROLES,
  VENUE_INSURANCE,
} = require("../constants");

function getVenueType(venueType) {
  const type = VENUE_TYPES[venueType];

  if (!type) {
    throw new Error(`Unknown venue type: ${venueType}`);
  }

  return type;
}

function venueInvestmentMultiplier(venueType) {
  return getVenueType(venueType).investmentMultiplier || 1;
}

function venueInsuranceCost(venueType) {
  return getVenueType(venueType).insuranceCost;
}

function venueDepartmentUpgradeCost(venueType, departmentKey, nextLevel) {
  const department = VENUE_DEPARTMENTS[departmentKey];

  if (!department) {
    throw new Error(`Unknown venue department: ${departmentKey}`);
  }

  return Math.round(
    department.baseCost *
      nextLevel *
      venueInvestmentMultiplier(venueType),
  );
}

function venueStaffHiringCost(venueType, roleKey) {
  const role = VENUE_STAFF_ROLES[roleKey];

  if (!role) {
    throw new Error(`Unknown venue staff role: ${roleKey}`);
  }

  return Math.round(role.cost * venueInvestmentMultiplier(venueType));
}

module.exports = {
  VENUE_INSURANCE,
  venueInvestmentMultiplier,
  venueInsuranceCost,
  venueDepartmentUpgradeCost,
  venueStaffHiringCost,
};
