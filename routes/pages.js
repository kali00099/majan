const express = require("express");
const { getStats, avatarFor } = require("../src/login-log");

const router = express.Router();

function avatarUrl(user) {
  if (!user) return null;
  if (user.avatarHash) {
    const ext = user.avatarHash.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatarHash}.${ext}?size=256`;
  }
  const index = (BigInt(user.id) >> 22n) % 6n;
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

router.use((req, res, next) => {
  res.locals.avatarUrl = () => avatarUrl(res.locals.user);
  next();
});

router.get("/", (req, res) => {
  res.render("index", { title: "TERMINAL CITY | سيرفر FiveM Roleplay" });
});

router.get("/account", (req, res) => {
  if (!req.session.user) return res.redirect("/auth/discord");
  res.render("account", { title: "حسابي | TERMINAL CITY" });
});

router.get("/login/failed", (req, res) => {
  res.render("login-failed", { title: "Login Failed | TERMINAL CITY" });
});

router.get("/admin", (req, res) => {
  const expected = process.env.ADMIN_KEY || process.env.SESSION_SECRET || "";
  const key = String(req.query.key || "");
  if (!expected || key !== expected) {
    return res.status(401).render("admin-denied", { title: "Access Denied | TERMINAL CITY" });
  }
  const stats = getStats();
  res.render("admin", {
    title: "سجل الدخول | TERMINAL CITY",
    stats,
    avatarFor,
    fmt: (iso) => new Date(iso).toLocaleString("ar", { dateStyle: "medium", timeStyle: "short", hour12: true })
  });
});

router.get("/api/me", (req, res) => {
  if (!req.session.user) return res.status(401).json({ authenticated: false });
  const user = req.session.user;
  res.json({ authenticated: true, id: user.id, username: user.username, avatarUrl: avatarUrl(user) });
});

module.exports = router;
