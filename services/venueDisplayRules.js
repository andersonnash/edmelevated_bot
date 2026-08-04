function numberOwnedVenues(venues) {
  const typeCounts = new Map();

  return [...venues]
    .sort((left, right) => Number(left.id) - Number(right.id))
    .map((venue, index) => {
      const typeKey = venue.type || venue.name || "venue";
      const ownerVenueTypeNumber = (typeCounts.get(typeKey) || 0) + 1;
      typeCounts.set(typeKey, ownerVenueTypeNumber);

      return {
        ...venue,
        ownerVenueNumber: index + 1,
        ownerVenueTypeNumber,
      };
    });
}

function venueOwnerTypeNumber(venues, venueId) {
  return (
    numberOwnedVenues(venues).find(
      (venue) => String(venue.id) === String(venueId),
    )?.ownerVenueTypeNumber || null
  );
}

function ownedVenueLabel(venues, venueId) {
  const venue = numberOwnedVenues(venues).find(
    (candidate) => String(candidate.id) === String(venueId),
  );

  if (!venue) return "Unknown Venue";
  return `${venue.name} #${venue.ownerVenueTypeNumber}`;
}

function venueOwnerNumber(venues, venueId) {
  return (
    numberOwnedVenues(venues).find(
      (venue) => String(venue.id) === String(venueId),
    )?.ownerVenueNumber || null
  );
}

module.exports = {
  numberOwnedVenues,
  venueOwnerNumber,
  venueOwnerTypeNumber,
  ownedVenueLabel,
};
