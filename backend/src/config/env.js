const path = require('path');
require('dotenv').config();

const bool = (v, d=false) => {
  if (v === undefined) return d;
  return ['1','true','yes','on'].includes(String(v).toLowerCase());
};

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 8080),
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'idle_tracker_db',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change_me_super_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cookie: {
    name: process.env.COOKIE_NAME || 'admin_token',
    sameSite: process.env.COOKIE_SAMESITE || 'Lax', // Lax or None
    secure: bool(process.env.COOKIE_SECURE, false),
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  media: {
    root: path.resolve(process.env.MEDIA_ROOT || './media'),
    baseUrl: process.env.MEDIA_BASE_URL || 'http://localhost:8080/media',
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
    max: Number(process.env.RATE_LIMIT_MAX || 100),
  },
  timezone: process.env.TIMEZONE || 'Asia/Karachi',
  notifyRecipients: (process.env.NOTIFY_RECIPIENTS || '').split(',').map(s=>s.trim()).filter(Boolean),
};