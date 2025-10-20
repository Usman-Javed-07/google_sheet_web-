const logger = require("../../logger"); // update path if needed

function notFound(req, res, next) {
  logger.warn({ method: req.method, path: req.path }, "not_found");
  res.status(404).json({ error: "not_found" });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = err.statusCode || err.status || 500;
  const isServer = status >= 500;
  const level = isServer ? "error" : "warn";
  logger[level](
    {
      err: isServer ? err : undefined,
      status,
      method: req.method,
      path: req.path,
    },
    "request_error",
  );
  res.status(status).json({ error: isServer ? "internal" : err.message });
}

module.exports = { notFound, errorHandler };
