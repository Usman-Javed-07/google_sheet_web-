const { startAbsenceChecker } = require("./absenceChecker");
const { startEmailNotifier } = require("./emailNotifier");

function startJobs() {
  startAbsenceChecker();
  startEmailNotifier();
}

module.exports = { startJobs };
