function summarizeVenueStaff(staff = [], roleDefinitions = {}) {
  const grouped = new Map();

  for (const member of staff) {
    const key = member.role || "unknown";
    const role = roleDefinitions[key];
    const current = grouped.get(key) || {
      key,
      label: role?.label || member.username || key,
      emoji: role?.emoji || "👤",
      quantity: 0,
      incomeBoost: Number(role?.incomeBoost || 0),
    };
    current.quantity += 1;
    grouped.set(key, current);
  }

  const groups = [...grouped.values()].map((group) => ({
    ...group,
    boostPercent: Math.round(
      group.incomeBoost * group.quantity * 100,
    ),
  }));
  const totalBoostPercent = Math.round(
    groups.reduce(
      (sum, group) => sum + group.incomeBoost * group.quantity,
      0,
    ) * 100,
  );

  return { groups, totalBoostPercent, totalStaff: staff.length };
}

module.exports = { summarizeVenueStaff };
