const { parseNginxLogLine } = require("../services/logParser");
const { ingestParsedLog } = require("../services/logIngestionService");
const { startLogTailer } = require("../services/logTailer");
const { logger } = require("../utils/logger");

async function startLogMonitor({ socketServer }) {
  const child = startLogTailer(async (line) => {
    const parsed = parseNginxLogLine(line);

    if (!parsed) {
      logger.warn("Skipped unparsable log line", { line });
      return;
    }

    try {
      await ingestParsedLog({
        parsed,
        rawLine: line,
        io: socketServer
      });
    } catch (error) {
      logger.error("Failed to ingest log line", error);
    }
  });

  return child;
}

module.exports = { startLogMonitor };
