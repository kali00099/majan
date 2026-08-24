const logins = [];
const MAX_ENTRIES = 200;
let totalLogins = 0;

function addLogin(entry) {
  totalLogins += 1;
  logins.unshift({
    id: entry.id,
    username: entry.username,
    avatarHash: entry.avatarHash || null,
    at: new Date().toISOString()
  });
  if (logins.length > MAX_ENTRIES) logins.length = MAX_ENTRIES;
}

function getStats() {
  const uniqueIds = new Set(logins.map((l) => l.id));
  return {
    totalLogins,
    uniqueUsers: uniqueIds.size,
    recent: logins
  };
}

function avatarFor(entry) {
  if (!entry) return null;
  if (entry.avatarHash) {
    const ext = entry.avatarHash.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${entry.id}/${entry.avatarHash}.${ext}?size=64`;
  }
  const index = (BigInt(entry.id) >> 22n) % 6n;
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

module.exports = { addLogin, getStats, avatarFor };
