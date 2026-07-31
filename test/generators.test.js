const assert = require("node:assert/strict");
const test = require("node:test");

const { randomShowData } = require("../services/generators");

function localDateDaysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

test("schedules shows between 3 and 14 days ahead", () => {
  const originalRandom = Math.random;

  try {
    Math.random = () => 0;
    assert.equal(randomShowData().date, localDateDaysFromNow(3));

    Math.random = () => 0.999999;
    assert.equal(randomShowData().date, localDateDaysFromNow(14));
  } finally {
    Math.random = originalRandom;
  }
});
