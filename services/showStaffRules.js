const { SHOW_STAFF_ROLES } = require("../constants");

const ASSIGNMENT_KEYS = Object.keys(SHOW_STAFF_ROLES).filter(
  (key) => key !== "staff",
);

function selectShowStaffAssignment(random = Math.random) {
  const index = Math.floor(random() * ASSIGNMENT_KEYS.length);
  return ASSIGNMENT_KEYS[Math.min(index, ASSIGNMENT_KEYS.length - 1)];
}

function showStaffRole(roleKey) {
  return SHOW_STAFF_ROLES[roleKey] || SHOW_STAFF_ROLES.staff;
}

module.exports = {
  ASSIGNMENT_KEYS,
  selectShowStaffAssignment,
  showStaffRole,
};
