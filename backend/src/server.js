const app = require("./app");
const logger = require("../logger"); // logger at backend/logger.js
const cfg = require("./config/env");
const { startJobs } = require("./jobs");

app.listen(cfg.port, () => {
  logger.info({ port: cfg.port }, "api.up");
  logger.info({ mediaRoot: cfg.media.root }, "media.serving");
  console.log(`Server is running on port ${cfg.port}`);
  startJobs();
});
