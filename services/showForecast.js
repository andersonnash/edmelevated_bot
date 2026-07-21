const { venueAttendanceBonus, venueCapacity } = require("./showMath");

function calculateProjectedWalkins({ baseWalkins, venue, ticketCount = 0 }) {
  const bonus = venueAttendanceBonus(venue);
  const boostedWalkins = Math.floor(baseWalkins * (1 + bonus));

  // Ticket holders reserve space first. Walk-ins can only fill what remains.
  const remainingCapacity = Math.max(0, venueCapacity(venue) - ticketCount);

  return Math.min(Math.max(0, boostedWalkins), remainingCapacity);
}

function attendanceBonusPercent(venue) {
  return Math.floor(venueAttendanceBonus(venue) * 100);
}

function isProjectedSoldOut({ baseWalkins, venue, ticketCount = 0 }) {
  const projectedWalkins = calculateProjectedWalkins({
    baseWalkins,
    venue,
    ticketCount,
  });

  return ticketCount + projectedWalkins >= venueCapacity(venue);
}

module.exports = {
  calculateProjectedWalkins,
  attendanceBonusPercent,
  isProjectedSoldOut,
};
