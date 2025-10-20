const jwt = require("jsonwebtoken");
const cfg = require("../config/env");
const logger = require("../../logger");

const cookieOptions = {
  httpOnly: true,
  sameSite: cfg.cookie.sameSite,
  secure: cfg.cookie.secure,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function signToken(payload) {
  try {
    const token = jwt.sign(payload, cfg.jwt.secret, {
      expiresIn: cfg.jwt.expiresIn,
      algorithm: "HS256",
    });
    logger.info(
      { hasSub: !!payload?.sub, role: payload?.role },
      "auth.token_signed",
    );
    return token;
  } catch (err) {
    logger.error({ err }, "auth.token_sign_failed");
    throw err;
  }
}

function setAuthCookie(res, token) {
  res.cookie(cfg.cookie.name, token, cookieOptions);
  logger.info(
    {
      cookie: cfg.cookie.name,
      sameSite: cookieOptions.sameSite,
      secure: cookieOptions.secure,
    },
    "auth.cookie_set",
  );
}

function clearAuthCookie(res) {
  res.clearCookie(cfg.cookie.name, { path: cookieOptions.path });
  logger.info({ cookie: cfg.cookie.name }, "auth.cookie_cleared");
}

function requireAdmin(req, res, next) {
  const raw = req.cookies?.[cfg.cookie.name];
  if (!raw) {
    logger.warn({ method: req.method, path: req.path }, "auth.missing_cookie");
    return res.status(401).json({ error: "unauthorized" });
  }

  let decoded;
  try {
    decoded = jwt.verify(raw, cfg.jwt.secret, { algorithms: ["HS256"] });
  } catch (err) {
    logger.warn({ err: err.name, path: req.path }, "auth.invalid_token");
    return res.status(401).json({ error: "unauthorized" });
  }

  if (decoded.role !== "admin") {
    logger.warn(
      { userId: decoded.sub, role: decoded.role, path: req.path },
      "auth.forbidden",
    );
    return res.status(403).json({ error: "forbidden" });
  }

  req.admin = decoded;
  logger.info({ userId: decoded.sub, path: req.path }, "auth.admin_ok");
  next();
}

module.exports = { signToken, setAuthCookie, clearAuthCookie, requireAdmin };
