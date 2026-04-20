const { createRequestLog } = require("./requestLogService");
const { getCountryForIp } = require("./geoipService");
const { rateDetector } = require("./rateDetector");
const { sendTelegramAlert } = require("./telegramService");
const { publishRequest } = require("./socketPublisher");
const { logger } = require("../utils/logger");

async function ingestParsedLog({ parsed, rawLine, io }) {
  const enriched = {
    ...parsed,
    country: getCountryForIp(parsed.ip),
    rawLine
  };

  const saved = await createRequestLog(enriched);
  publishRequest(io, saved);

  const detection = rateDetector.consume(saved);

  if (detection.shouldAlert) {
    const message =
      `High request rate detected\n` +
      `IP: ${saved.ip}\n` +
      `Country: ${saved.country}\n` +
      `Requests in last minute: ${detection.requestCount}\n` +
      `Latest endpoint: ${saved.endpoint}\n` +
      `Status: ${saved.status}`;

    try {
      await sendTelegramAlert(message);
    } catch (error) {
      logger.error("Failed to send Telegram alert", error);
    }
  }

  return saved;
}

module.exports = { ingestParsedLog };
