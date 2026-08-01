function canListTicketShow(show, buyerId, capacity) {
  return (
    show.status === "upcoming" &&
    show.owner_id !== buyerId &&
    !Boolean(show.has_ticket) &&
    Number(show.ticket_count) < capacity
  );
}

module.exports = {
  canListTicketShow,
};
