const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const cfg = require("./config/env");
const adminRoutes = require("./routes/admin.routes");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();
app.use(helmet());
app.use(compression());
app.use(cors({ origin: cfg.corsOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(
  "/api/admin/auth",
  rateLimit({ windowMs: cfg.rateLimit.windowMs, max: cfg.rateLimit.max }),
);
app.use(
  "/media",
  express.static(cfg.media.root, {
    fallthrough: true,
    index: false,
    setHeaders: (res) =>
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"),
  }),
);
app.use("/api/admin", adminRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
