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

function generateInitialWalkins(venue, random = Math.random) {
  const capacity = venueCapacity(venue);
  const attendanceMultiplier = 1 + venueAttendanceBonus(venue);
  const minimumProjected = Math.max(1, Math.ceil(capacity * 0.3));
  const maximumProjected = Math.max(
    minimumProjected,
    Math.floor(capacity * 0.6),
  );

  const minimumBase = Math.max(
    1,
    Math.ceil(minimumProjected / attendanceMultiplier),
  );
  const maximumBase = Math.max(
    minimumBase,
    Math.floor(maximumProjected / attendanceMultiplier),
  );

  return (
    minimumBase +
    Math.floor(random() * (maximumBase - minimumBase + 1))
  );
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
  generateInitialWalkins,
  isProjectedSoldOut,
};
