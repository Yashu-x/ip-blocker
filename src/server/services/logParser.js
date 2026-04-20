const { normalizeIp } = require("./ipUtils");

const logPattern =
  /^(?<ip>\S+)\s+\S+\s+\S+\s+\[(?<timestamp>[^\]]+)\]\s+"(?<method>[A-Z]+)\s+(?<endpoint>\S+)\s+\S+"\s+(?<status>\d{3})\s+\S+/;

const monthIndex = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11
};

function parseNginxTimestamp(value) {
  const match = value.match(
    /^(?<day>\d{2})\/(?<month>[A-Za-z]{3})\/(?<year>\d{4}):(?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2}) (?<offset>[+-]\d{4})$/
  );

  if (!match || !match.groups) {
    return null;
  }

  const month = monthIndex[match.groups.month];

  if (month === undefined) {
    return null;
  }

  const offsetHours = Number.parseInt(match.groups.offset.slice(0, 3), 10);
  const offsetMinutes = Number.parseInt(match.groups.offset.slice(0, 1) + match.groups.offset.slice(3), 10);
  const utcTime = Date.UTC(
    Number.parseInt(match.groups.year, 10),
    month,
    Number.parseInt(match.groups.day, 10),
    Number.parseInt(match.groups.hour, 10),
    Number.parseInt(match.groups.minute, 10),
    Number.parseInt(match.groups.second, 10)
  );

  return new Date(utcTime - (offsetHours * 60 + offsetMinutes) * 60 * 1000);
}

function parseNginxLogLine(line) {
  const match = line.match(logPattern);

  if (!match || !match.groups) {
    return null;
  }

  const requestedAt = parseNginxTimestamp(match.groups.timestamp);

  if (!requestedAt || Number.isNaN(requestedAt.getTime())) {
    return null;
  }

  return {
    ip: normalizeIp(match.groups.ip),
    method: match.groups.method,
    endpoint: match.groups.endpoint,
    status: Number.parseInt(match.groups.status, 10),
    requestedAt
  };
}

module.exports = { parseNginxLogLine };
