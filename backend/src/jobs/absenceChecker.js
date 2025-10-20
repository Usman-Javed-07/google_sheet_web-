const adminSvc = require("../services/admin.service");
const logger = require("../../logger");

function startAbsenceChecker() {
  const grace = Number(process.env.ABSENCE_GRACE_MINUTES || 20);
  setInterval(() => {
    adminSvc
      .markAbsentees(grace)
      .catch((err) =>
        logger.error({ err }, "jobs.absenceChecker.markAbsentees_failed"),
      );
  }, 60_000);
  logger.info({ everyMs: 60_000, grace }, "jobs.absenceChecker.started");
}

module.exports = { startAbsenceChecker };
