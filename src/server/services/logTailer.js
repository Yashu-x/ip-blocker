const { spawn } = require("child_process");
const readline = require("readline");

const { env } = require("../config/env");
const { logger } = require("../utils/logger");

function startLogTailer(onLine) {
  const args = env.TAIL_FROM_START
    ? ["-n", "+1", "-F", env.ACCESS_LOG_PATH]
    : ["-n", "0", "-F", env.ACCESS_LOG_PATH];

  const child = spawn(env.TAIL_COMMAND, args, {
    stdio: ["ignore", "pipe", "pipe"]
  });

  const reader = readline.createInterface({
    input: child.stdout,
    crlfDelay: Infinity
  });

  reader.on("line", onLine);

  child.stderr.on("data", (chunk) => {
    logger.warn("Log tailer stderr", { output: chunk.toString() });
  });

  child.on("error", (error) => {
    logger.error("Log tailer failed to start", error);
  });

  child.on("close", (code) => {
    logger.warn("Log tailer exited", { code });
  });

  return child;
}

module.exports = { startLogTailer };
