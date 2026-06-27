const { venueAttendanceBonus, venueCapacity } = require("./venueEngine");

function calculateProjectedWalkins({ baseWalkins, venue }) {
  const bonus = venueAttendanceBonus(venue);

  const boostedWalkins = Math.floor(baseWalkins * (1 + bonus));

  return Math.min(boostedWalkins, venueCapacity(venue));
}

function attendanceBonusPercent(venue) {
  return Math.floor(venueAttendanceBonus(venue) * 100);
}

module.exports = {
  calculateProjectedWalkins,
  attendanceBonusPercent,
};
