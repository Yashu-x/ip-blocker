const { RequestLog } = require("../models/RequestLog");

async function createRequestLog(data) {
  return RequestLog.create(data);
}

async function listRecentRequests(limit = 200) {
  return RequestLog.find({})
    .sort({ requestedAt: -1 })
    .limit(limit)
    .lean();
}

module.exports = { createRequestLog, listRecentRequests };
