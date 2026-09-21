const { EQUIPMENT_TYPES } = require("../constants");

function installedEquipmentEffects(rows = []) {
  return rows.reduce(
    (total, row) => {
      const equipment = EQUIPMENT_TYPES[row.equipment_type];
      // One copy of each equipment type can be installed. Clamp legacy rows
      // so old stacked gear cannot keep multiplying show bonuses.
      const quantity = Math.min(1, Number(row.quantity || 0));
      if (!equipment || quantity <= 0) return total;

      total.attendanceBonus +=
        Number(equipment.attendanceBonus || 0) * quantity;
      total.productionBonus +=
        Number(equipment.productionBonus || 0) * quantity;
      return total;
    },
    { attendanceBonus: 0, productionBonus: 0 },
  );
}

function storedQuantity(ownedQuantity, installedQuantity) {
  return Math.max(
    0,
    Number(ownedQuantity || 0) - Number(installedQuantity || 0),
  );
}

function equipmentLoadoutSummary(rows = []) {
  const equipment = rows
    .filter((row) => Number(row.quantity || 0) > 0)
    .map((row) => {
      const type = EQUIPMENT_TYPES[row.equipment_type];
      return `${type?.name || row.equipment_type} ×${Number(row.quantity)}`;
    });

  return equipment.length
    ? equipment.join(" • ")
    : "No equipment installed";
}

module.exports = {
  installedEquipmentEffects,
  storedQuantity,
  equipmentLoadoutSummary,
};
