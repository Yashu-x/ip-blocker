const geoip = require("geoip-lite");

const { isPrivateIp } = require("./ipUtils");

function getCountryForIp(ip) {
  if (!ip) {
    return "Unknown";
  }

  if (isPrivateIp(ip)) {
    return "Private";
  }

  const match = geoip.lookup(ip);

  return match?.country || "Unknown";
}

module.exports = { getCountryForIp };
