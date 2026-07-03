const cooldowns = new Map();

function getKey(userId, game) {
  return `${userId}_${game}`;
}

function formatRemaining(ms) {
  const totalMinutes = Math.ceil(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }

  return `${mins}m`;
}

function checkCooldown(userId, game, minutes) {
  const key = getKey(userId, game);
  const now = Date.now();
  const cooldownMs = minutes * 60 * 1000;
  const last = cooldowns.get(key);

  if (last) {
    const remaining = cooldownMs - (now - last);

    if (remaining > 0) {
      return formatRemaining(remaining);
    }
  }

  cooldowns.set(key, now);
  return null;
}

module.exports = {
  checkCooldown,
};
