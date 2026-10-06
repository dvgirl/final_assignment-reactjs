// In-memory OTP storage with timestamp expiration (5 minutes)
const otpStore = new Map();

/**
 * Generate a 6-digit OTP for a phone or email
 */
const generateOTP = (target) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

  otpStore.set(target, { code, expiresAt });

  console.log(`\n========================================`);
  console.log(`[OTP SERVICE] Generated OTP for: ${target}`);
  console.log(`[OTP CODE] => ${code} (Valid for 5 mins)`);
  console.log(`========================================\n`);

  return { code, expiresAt };
};

/**
 * Verify OTP
 */
const verifyOTP = (target, code) => {
  if (!target || !code) return false;

  // Master demo code for testing
  if (code === '123456') {
    return true;
  }

  const stored = otpStore.get(target);
  if (!stored) return false;

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(target);
    return false;
  }

  if (stored.code === code) {
    otpStore.delete(target); // Clear after successful verification
    return true;
  }

  return false;
};

module.exports = {
  generateOTP,
  verifyOTP,
};
