const net = require("net");
const { spawn } = require("child_process");

const { env } = require("../config/env");
const { BlockedIp } = require("../models/BlockedIp");
const { normalizeIp } = require("./ipUtils");

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
        return;
      }

      resolve({ stdout, stderr });
    });
  });
}

async function blockIp(ip, reason = "Manual block", source = "dashboard") {
  const normalizedIp = normalizeIp(ip);

  if (!normalizedIp || net.isIP(normalizedIp) === 0) {
    throw new Error("IP address is required");
  }

  const existing = await BlockedIp.findOne({ ip: normalizedIp }).lean();

  if (existing) {
    return existing;
  }

  await runCommand(env.IPTABLES_COMMAND, [
    "-A",
    env.BLOCK_CHAIN,
    "-s",
    normalizedIp,
    "-j",
    env.BLOCK_TARGET
  ]);

  return BlockedIp.create({
    ip: normalizedIp,
    reason,
    source,
    blockedAt: new Date()
  });
}

module.exports = { blockIp };
