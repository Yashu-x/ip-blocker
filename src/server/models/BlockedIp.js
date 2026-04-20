const mongoose = require("mongoose");

const blockedIpSchema = new mongoose.Schema(
  {
    ip: { type: String, required: true, unique: true },
    reason: { type: String, default: "Manual block" },
    blockedAt: { type: Date, required: true, default: Date.now },
    source: { type: String, required: true, default: "dashboard" }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

const BlockedIp = mongoose.models.BlockedIp || mongoose.model("BlockedIp", blockedIpSchema);

module.exports = { BlockedIp };
