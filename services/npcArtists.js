const { NPC_DJ_ROSTER } = require("../constants");

function artistsForVenue(venueType) {
  return NPC_DJ_ROSTER[venueType] || [];
}

function artistForVenue(venueType, artistKey) {
  return artistsForVenue(venueType).find((artist) => artist.key === artistKey) || null;
}

module.exports = {
  artistsForVenue,
  artistForVenue,
};
