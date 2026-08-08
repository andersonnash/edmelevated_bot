const test = require("node:test");
const assert = require("node:assert/strict");
const {
  equipmentLoadoutSummary,
  installedEquipmentEffects,
  storedQuantity,
} = require("../services/equipmentRules");

test("combines installed income and show effects by quantity", () => {
  assert.deepEqual(
    installedEquipmentEffects([
      { equipment_type: "flx4", quantity: 2 },
      { equipment_type: "sound_system", quantity: 1 },
    ]),
    { income: 690, attendanceBonus: 0.12, productionBonus: 14 },
  );
});

test("stored quantity cannot become negative", () => {
  assert.equal(storedQuantity(3, 1), 2);
  assert.equal(storedQuantity(1, 3), 0);
});

test("describes an empty venue equipment loadout", () => {
  assert.equal(equipmentLoadoutSummary([]), "No equipment installed");
});

test("describes every installed equipment type and quantity", () => {
  assert.equal(
    equipmentLoadoutSummary([
      { equipment_type: "flx4", quantity: 1 },
      { equipment_type: "sound_system", quantity: 2 },
    ]),
    "Pioneer DDJ-FLX4 ×1 • Sound System ×2",
  );
});
