const { env } = require("../config/env");
const { logger } = require("../utils/logger");

async function sendTelegramAlert(message) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    logger.warn("Telegram alert skipped because credentials are not configured");
    return false;
  }

  const endpoint = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text: message
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram API failed: ${response.status} ${errorText}`);
  }

  return true;
}

module.exports = { sendTelegramAlert };
