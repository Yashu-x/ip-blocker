const path = require("path");
const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config({
  path: path.join(process.cwd(), ".env")
});

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  ACCESS_LOG_PATH: z.string().min(1, "ACCESS_LOG_PATH is required"),
  TAIL_COMMAND: z.string().min(1).default("tail"),
  TAIL_FROM_START: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(100),
  ALERT_COOLDOWN_SECONDS: z.coerce.number().int().positive().default(300),
  TELEGRAM_BOT_TOKEN: z.string().optional().default(""),
  TELEGRAM_CHAT_ID: z.string().optional().default(""),
  IPTABLES_COMMAND: z.string().min(1).default("iptables"),
  BLOCK_CHAIN: z.string().min(1).default("INPUT"),
  BLOCK_TARGET: z.string().min(1).default("DROP"),
  TRUST_PROXY: z
    .string()
    .optional()
    .transform((value) => value === "true")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment: ${parsed.error.message}`);
}

const env = parsed.data;

module.exports = { env };
