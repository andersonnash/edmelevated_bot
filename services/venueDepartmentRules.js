const { VENUE_DEPARTMENTS } = require("../constants");

function venueDepartmentLevel(departmentKey, level) {
  const department = VENUE_DEPARTMENTS[departmentKey];

  if (!department) {
    throw new Error(`Unknown venue department: ${departmentKey}`);
  }

  const safeLevel = Math.max(0, Number(level) || 0);
  return Math.min(safeLevel, department.maxLevel ?? Infinity);
}

function venueDepartmentLevelName(departmentKey, level) {
  const department = VENUE_DEPARTMENTS[departmentKey];

  if (!department) {
    throw new Error(`Unknown venue department: ${departmentKey}`);
  }

  const safeLevel = venueDepartmentLevel(departmentKey, level);
  const names = department.levelNames;

  if (!names?.length) {
    return `${department.name} Level ${safeLevel}`;
  }

  return names[Math.min(safeLevel, names.length - 1)];
}

function venueDepartmentBenefitLabel(departmentKey, level) {
  const department = VENUE_DEPARTMENTS[departmentKey];

  if (!department) {
    throw new Error(`Unknown venue department: ${departmentKey}`);
  }

  const totalBenefit =
    department.benefitPerLevel * venueDepartmentLevel(departmentKey, level);

  if (departmentKey === "bar") {
    return `+${totalBenefit}% venue income`;
  }

  if (departmentKey === "security") {
    return `+${totalBenefit}% venue capacity`;
  }

  return `+${totalBenefit}% show attendance`;
}

module.exports = {
  venueDepartmentLevel,
  venueDepartmentLevelName,
  venueDepartmentBenefitLabel,
};
