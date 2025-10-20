const pino = require("pino");

const isProd = process.env.NODE_ENV === "production";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: {
    paths: [
      "req.headers.authorization",
      "headers.authorization",
      "*.password",
      "*.token",
      "cookie",
    ],
    censor: "[REDACTED]",
  },
  transport: isProd
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          singleLine: true,
          translateTime: "HH:MM:ss.l",
        },
      },
});

const errorHandler = (err, req, res, next) => {
  logger.error({ err, method: req.method, path: req.path }, "unhandled error");
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: status === 500 ? "internal" : err.message });
};

module.exports = logger;
module.exports.errorHandler = errorHandler;
