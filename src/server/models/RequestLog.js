const mongoose = require("mongoose");

const requestLogSchema = new mongoose.Schema(
  {
    ip: { type: String, required: true, index: true },
    endpoint: { type: String, required: true, index: true },
    status: { type: Number, required: true, index: true },
    method: { type: String, required: true },
    country: { type: String, required: true, index: true },
    rawLine: { type: String, required: true },
    requestedAt: { type: Date, required: true, index: true }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

requestLogSchema.index({ ip: 1, requestedAt: -1 });

const RequestLog = mongoose.models.RequestLog || mongoose.model("RequestLog", requestLogSchema);

module.exports = { RequestLog };
