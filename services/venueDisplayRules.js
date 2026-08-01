function numberOwnedVenues(venues) {
  return [...venues]
    .sort((left, right) => Number(left.id) - Number(right.id))
    .map((venue, index) => ({
      ...venue,
      ownerVenueNumber: index + 1,
    }));
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
};
