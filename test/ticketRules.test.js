const test = require("node:test");
const assert = require("node:assert/strict");
const { canListTicketShow } = require("../services/ticketRules");
const { venueCapacity } = require("../services/showMath");

const availableShow = {
  owner_id: "promoter-1",
  status: "upcoming",
  ticket_count: 24,
  has_ticket: 0,
};

test("lists another promoter's available upcoming show", () => {
  assert.equal(canListTicketShow(availableShow, "buyer-1", 25), true);
});

test("lists a show using capacity selected with its venue data", () => {
  const showWithVenue = {
    ...availableShow,
    base_capacity: 25,
    security_level: 1,
  };

  assert.equal(
    canListTicketShow(
      showWithVenue,
      "buyer-1",
      venueCapacity(showWithVenue),
    ),
    true,
  );
  assert.equal(venueCapacity(showWithVenue), 30);
});

test("does not list the buyer's own show", () => {
  assert.equal(
    canListTicketShow(
      { ...availableShow, owner_id: "buyer-1" },
      "buyer-1",
      25,
    ),
    false,
  );
});

test("does not list completed, previously purchased, or sold-out shows", () => {
  assert.equal(
    canListTicketShow({ ...availableShow, status: "completed" }, "buyer-1", 25),
    false,
  );
  assert.equal(
    canListTicketShow({ ...availableShow, has_ticket: 1 }, "buyer-1", 25),
    false,
  );
  assert.equal(
    canListTicketShow({ ...availableShow, ticket_count: 25 }, "buyer-1", 25),
    false,
  );
});
