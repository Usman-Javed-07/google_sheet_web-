const mysql = require("mysql2/promise");
const cfg = require("../config/env");

const pool = mysql.createPool({
  host: cfg.db.host,
  port: cfg.db.port,
  user: cfg.db.user,
  password: cfg.db.password,
  database: cfg.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
  namedPlaceholders: false,
});

async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function execute(sql, params = []) {
  const [res] = await pool.execute(sql, params);
  return res;
}

module.exports = { pool, query, execute };
