const http = require("http");
const express = require("express");
const next = require("next");

const { env } = require("./src/server/config/env");
const { connectToDatabase } = require("./src/server/db/mongoose");
const { createApiRouter } = require("./src/server/routes/api");
const { registerSocketServer } = require("./src/server/socket");
const { startLogMonitor } = require("./src/server/bootstrap/logMonitor");
const { logger } = require("./src/server/utils/logger");

async function bootstrap() {
  const dev = env.NODE_ENV !== "production";
  const app = next({ dev });
  const handle = app.getRequestHandler();

  await app.prepare();
  await connectToDatabase();

  const expressApp = express();
  expressApp.disable("x-powered-by");
  expressApp.use(express.json({ limit: "1mb" }));
  expressApp.set("trust proxy", env.TRUST_PROXY);

  expressApp.use(createApiRouter());
  expressApp.get("*", (req, res) => handle(req, res));

  const server = http.createServer(expressApp);
  const socketServer = registerSocketServer(server);

  const logTailerProcess = await startLogMonitor({ socketServer });

  server.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT}`);
  });

  const shutdown = async (signal) => {
    logger.info(`Received ${signal}, shutting down`);

    if (logTailerProcess) {
      logTailerProcess.kill("SIGTERM");
    }

    socketServer.close();
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

bootstrap().catch((error) => {
  logger.error("Failed to start application", error);
  process.exit(1);
});
