"use strict";
const nodemailer = require("nodemailer");

const HOST = process.env.SMTP_HOST;
const PORT = Number(process.env.SMTP_PORT || 587);
const USER = process.env.SMTP_USER;
const PASS = process.env.SMTP_PASS;
const FROM = process.env.SMTP_FROM || USER;

function buildTransporter() {
  if (!HOST || !PORT || !USER || !PASS) return null;

  return nodemailer.createTransport({
    host: HOST,
    port: PORT,
    secure: PORT === 465, // SSL on 465
    requireTLS: PORT === 587, // STARTTLS on 587
    auth: { user: USER, pass: PASS },
    tls: { minVersion: "TLSv1.2" },
  });
}

const transporter = buildTransporter();
const isConfigured = Boolean(transporter);

async function send(to, subject, text) {
  if (!isConfigured) return false;
  const toList = Array.isArray(to) ? to : [to];
  await transporter.sendMail({
    from: FROM,
    to: toList.join(","),
    subject,
    text,
  });
  return true;
}

module.exports = { isConfigured, send };
