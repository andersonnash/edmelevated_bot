const { VENUE_DEPARTMENTS } = require("../constants");

function venueDepartmentLevelName(departmentKey, level) {
  const department = VENUE_DEPARTMENTS[departmentKey];

  if (!department) {
    throw new Error(`Unknown venue department: ${departmentKey}`);
  }

  const safeLevel = Math.max(0, Number(level) || 0);
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

  const totalBenefit = department.benefitPerLevel * Math.max(0, level);

  if (departmentKey === "bar") {
    return `+${totalBenefit}% venue income`;
  }

  if (departmentKey === "security") {
    return `+${totalBenefit}% venue capacity`;
  }

  return `+${totalBenefit}% show attendance`;
}

module.exports = {
  venueDepartmentLevelName,
  venueDepartmentBenefitLabel,
};
