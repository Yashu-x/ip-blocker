const express = require("express");
const net = require("net");
const { z } = require("zod");

const { listRecentRequests } = require("../services/requestLogService");
const { blockIp } = require("../services/blockService");
const { publishBlock } = require("../services/socketPublisher");
const { getSocketServer } = require("../socket");

const blockSchema = z.object({
  ip: z.string().min(1).refine((value) => net.isIP(value) !== 0, "Invalid IP address"),
  reason: z.string().optional()
});

function createApiRouter() {
  const router = express.Router();

  router.get("/requests", async (req, res, next) => {
    try {
      const limit = Number.parseInt(String(req.query.limit || "200"), 10);
      const requests = await listRecentRequests(Number.isNaN(limit) ? 200 : Math.min(limit, 500));
      res.json({ data: requests });
    } catch (error) {
      next(error);
    }
  });

  router.post("/block-ip", async (req, res, next) => {
    try {
      const parsed = blockSchema.parse(req.body);
      const blockRecord = await blockIp(parsed.ip, parsed.reason || "Manual block");
      publishBlock(getSocketServer(), blockRecord);
      res.status(201).json({ data: blockRecord });
    } catch (error) {
      next(error);
    }
  });

  router.use((error, req, res, next) => {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Invalid request body",
        details: error.flatten()
      });
      return;
    }

    res.status(500).json({
      error: error.message || "Internal server error"
    });
  });

  return router;
}

module.exports = { createApiRouter };
