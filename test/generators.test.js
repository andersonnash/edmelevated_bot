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

test("avoids dates already booked at the selected venue", () => {
  const now = new Date(2026, 7, 1);
  const event = randomShowData({
    now,
    unavailableDates: [
      "2026-08-04",
      "2026-08-05",
      "2026-08-06",
      "2026-08-07",
      "2026-08-08",
      "2026-08-09",
      "2026-08-10",
      "2026-08-11",
      "2026-08-12",
      "2026-08-13",
      "2026-08-14",
    ],
    random: () => 0,
  });

  assert.equal(event.date, "2026-08-15");
});

test("returns no show when every available date is already booked", () => {
  const now = new Date(2026, 7, 1);
  const unavailableDates = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() + index + 3);
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  });

  assert.equal(randomShowData({ now, unavailableDates }), null);
});
