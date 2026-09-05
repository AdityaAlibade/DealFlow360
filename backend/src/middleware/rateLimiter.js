// In-memory sliding-window rate limiter for sensitive authentication endpoints
const attempts = new Map();

const passwordResetRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
  const maxAttempts = options.max || 5; // max 5 requests per IP / email per window

  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const email = (req.body?.email || '').trim().toLowerCase();
    const key = `${ip}:${email}`;
    const now = Date.now();

    const record = attempts.get(key) || { count: 0, firstAttempt: now };

    if (now - record.firstAttempt > windowMs) {
      record.count = 1;
      record.firstAttempt = now;
      attempts.set(key, record);
      return next();
    }

    record.count += 1;
    attempts.set(key, record);

    if (record.count > maxAttempts) {
      const remainingSeconds = Math.ceil((windowMs - (now - record.firstAttempt)) / 1000);
      return res.status(429).json({
        success: false,
        message: `Too many password reset attempts. Please try again in ${Math.ceil(remainingSeconds / 60)} minutes.`
      });
    }

    next();
  };
};

module.exports = {
  passwordResetRateLimiter
};
