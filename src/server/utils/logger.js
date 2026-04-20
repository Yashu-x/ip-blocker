function write(level, message, meta) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message
  };

  if (meta) {
    payload.meta = meta instanceof Error
      ? { name: meta.name, message: meta.message, stack: meta.stack }
      : meta;
  }

  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
    return;
  }

  console.log(line);
}

const logger = {
  info(message, meta) {
    write("info", message, meta);
  },
  warn(message, meta) {
    write("warn", message, meta);
  },
  error(message, meta) {
    write("error", message, meta);
  }
};

module.exports = { logger };
