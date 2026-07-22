function achievementNames({ level = 1, sceneReputation = 0, activities = {} }) {
  const unlocked = [];
  if ((activities.crate_digs || 0) >= 10) unlocked.push("Crate Digger");
  if ((activities.street_team_runs || 0) >= 5) unlocked.push("Street Team");
  if ((activities.rave_stories || 0) >= 5) unlocked.push("Story Chaser");
  if (sceneReputation >= 100) unlocked.push("Scene Icon");
  if (level >= 25) unlocked.push("City Legend");
  return unlocked;
}

module.exports = { achievementNames };
