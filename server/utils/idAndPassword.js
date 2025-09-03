// utils/idAndPassword.js
const Counter = require('../models/Counter');

/**
 * Atomically increments and returns the next sequence number
 * for a given counter key.
 */
async function nextSeq(key) {
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return doc.seq; // integer
}

/**
 * Build UID string using prefix + 3/4-digit padded sequence.
 * Example: FAC -> FAC001, batch MCA23 -> MCA23001 (or add '-' if you prefer)
 */
function buildUid(prefix, seq, pad = 3, separator = '') {
  const num = String(seq).padStart(pad, '0');
  return `${prefix}${separator}${num}`;
}

/**
 * Generate a strong random password (meets typical rules).
 */
function generatePassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '@#$%&*!?';
  const all = upper + lower + digits + special;

  function pick(str, n = 1) {
    return Array.from({ length: n }, () => str[Math.floor(Math.random()*str.length)]).join('');
  }

  // Ensure at least one of each class
  let pwd = pick(upper) + pick(lower) + pick(digits) + pick(special);
  // Fill remaining to length 10–12
  const remaining = 8 + Math.floor(Math.random()*3); // total length 10–12
  for (let i = 0; i < remaining; i++) pwd += pick(all);

  // Shuffle
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
}

module.exports = { nextSeq, buildUid, generatePassword };
