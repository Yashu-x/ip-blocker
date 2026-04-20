function publishRequest(io, request) {
  io.emit("request:created", request);
}

function publishBlock(io, blockRecord) {
  io.emit("ip:blocked", blockRecord);
}

module.exports = { publishRequest, publishBlock };
