const { env } = require("../config/env");

class RateDetector {
  constructor({ limitPerMinute, cooldownSeconds }) {
    this.limitPerMinute = limitPerMinute;
    this.cooldownMs = cooldownSeconds * 1000;
    this.ipWindows = new Map();
    this.lastAlertAt = new Map();
  }

  consume(entry) {
    const now = entry.requestedAt.getTime();
    const windowStart = now - 60 * 1000;
    const timestamps = this.ipWindows.get(entry.ip) || [];
    const filtered = timestamps.filter((timestamp) => timestamp >= windowStart);
    filtered.push(now);
    this.ipWindows.set(entry.ip, filtered);

    const shouldAlert = filtered.length > this.limitPerMinute && this.canAlert(entry.ip, now);

    if (shouldAlert) {
      this.lastAlertAt.set(entry.ip, now);
    }

    return {
      shouldAlert,
      requestCount: filtered.length
    };
  }

  canAlert(ip, now) {
    const lastAlertAt = this.lastAlertAt.get(ip) || 0;
    return now - lastAlertAt >= this.cooldownMs;
  }
}

const rateDetector = new RateDetector({
  limitPerMinute: env.RATE_LIMIT_PER_MINUTE,
  cooldownSeconds: env.ALERT_COOLDOWN_SECONDS
});

module.exports = { rateDetector, RateDetector };
