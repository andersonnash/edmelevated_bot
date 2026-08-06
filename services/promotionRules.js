const { VENUE_TYPES } = require("../constants");

const PROMOTION_COST_RATE = 0.04;
const PROMOTION_DEMAND_RATE = 0.3;

function promotionCampaign(venue) {
  const venueType = VENUE_TYPES[venue?.type];
  if (!venueType) {
    throw new Error(`Unknown venue type: ${venue?.type}`);
  }

  return {
    cost: Math.round(venueType.cost * PROMOTION_COST_RATE),
    demand: Math.round(venueType.baseCapacity * PROMOTION_DEMAND_RATE),
  };
}

module.exports = {
  PROMOTION_COST_RATE,
  PROMOTION_DEMAND_RATE,
  promotionCampaign,
};
