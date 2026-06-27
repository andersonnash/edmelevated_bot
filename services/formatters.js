function money(amount) {
  return `$${Number(amount || 0).toLocaleString()}`;
}

module.exports = {
  money,
};
