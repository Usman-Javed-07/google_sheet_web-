function clamp(a, lo, hi) {
  return Math.max(lo, Math.min(hi, a));
}

function toDateTs(d) {
  return `${d} 00:00:00`;
}
function toEndTs(d) {
  return `${d} 23:59:59`;
}

function asTimeDT(hms) {
  const [h, m, s] = String(hms || "00:00:00")
    .split(":")
    .map((n) => parseInt(n, 10) || 0);
  return new Date(2000, 0, 1, h, m, s);
}

function shiftDurationSeconds(startHMS = "09:00:00", endHMS = "18:00:00") {
  const s = asTimeDT(startHMS);
  let e = asTimeDT(endHMS);
  if (e <= s) e = new Date(e.getTime() + 24 * 3600 * 1000);
  return Math.floor((e - s) / 1000);
}

function overlapSeconds(segStart, segEnd, rangeStart, rangeEnd) {
  const s = new Date(segStart).getTime();
  const e = new Date(segEnd).getTime();
  const rs = new Date(rangeStart).getTime();
  const re = new Date(rangeEnd).getTime();
  if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return 0;
  const lo = clamp(s, rs, re);
  const hi = clamp(e, rs, re);
  return Math.max(0, Math.floor((hi - lo) / 1000));
}

function secondsToHMS(sec = 0) {
  const s = Math.max(0, Number(sec) || 0);
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60),
    ss = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function capLimit(value, def, max) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n <= 0) return def;
  return clamp(n, 1, max);
}

module.exports = {
  clamp,
  toDateTs,
  toEndTs,
  asTimeDT,
  shiftDurationSeconds,
  overlapSeconds,
  secondsToHMS,
  capLimit,
};
