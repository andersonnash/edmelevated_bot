const cooldowns = new Map();

function getKey(userId, game) {
  return `${userId}_${game}`;
}

function checkCooldown(userId, game, minutes) {
  const key = getKey(userId, game);

  const last = cooldowns.get(key);

  if (!last) {
    cooldowns.set(key, Date.now());

    return null;
  }

const remaining = minutes * 60 * 1000 - (Date.now() - last);

const hours = Math.floor(remaining / 3600000);

const mins = Math.ceil((remaining % 3600000) / 60000);

if (hours > 0) {
  return `${hours}h ${mins}m`;
}

return `${mins}m`;

  cooldowns.set(key, Date.now());

  return null;
}

module.exports = {
  checkCooldown,
};
