const email = require("../services/email.service");
const adminSvc = require("../services/admin.service");
const { secondsToHMS } = require("../utils/time");
const logger = require("../../logger");

function startEmailNotifier() {
  const recipients = (process.env.NOTIFY_RECIPIENTS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!email.isConfigured || recipients.length === 0) {
    logger.info(
      { recipients: recipients.length },
      "jobs.emailNotifier.disabled",
    );
    return;
  }

  setInterval(async () => {
    try {
      const events = await adminSvc.unnotifiedInactive(); // includes inactive + absent
      for (const e of events) {
        const type = e.event_type === "absent" ? "ABSENT" : "INACTIVE";
        const subject = `[IdleTracker] ${e.username} ${type}`;
        const streak =
          e.active_duration_seconds != null
            ? ` (active streak: ${secondsToHMS(e.active_duration_seconds)}).`
            : ".";
        const body =
          `${e.name} (@${e.username}, ${e.email}, ${e.department}) ` +
          `is ${type} at ${e.occurred_at}${streak}`;

        try {
          await email.send(recipients, subject, body);
        } catch (err) {
          logger.warn({ err, eventId: e.id }, "jobs.emailNotifier.send_failed");
        }
        await adminSvc.markEventNotified(e.id);
      }
    } catch (err) {
      logger.error({ err }, "jobs.emailNotifier.loop_failed");
    }
  }, 3000);

  logger.info(
    { everyMs: 3000, recipients: recipients.length },
    "jobs.emailNotifier.started",
  );
}

module.exports = { startEmailNotifier };
