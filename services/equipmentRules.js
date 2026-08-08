const { EQUIPMENT_TYPES } = require("../constants");

function installedEquipmentEffects(rows = []) {
  return rows.reduce(
    (total, row) => {
      const equipment = EQUIPMENT_TYPES[row.equipment_type];
      const quantity = Number(row.quantity || 0);
      if (!equipment || quantity <= 0) return total;

      total.income += Number(equipment.installedIncome || 0) * quantity;
      total.attendanceBonus +=
        Number(equipment.attendanceBonus || 0) * quantity;
      total.productionBonus +=
        Number(equipment.productionBonus || 0) * quantity;
      return total;
    },
    { income: 0, attendanceBonus: 0, productionBonus: 0 },
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
