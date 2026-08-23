require("dotenv").config();

const path = require("path");
const crypto = require("crypto");
const express = require("express");
const session = require("express-session");

const authRoutes = require("../routes/auth");
const pageRoutes = require("../routes/pages");

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";

app.set("trust proxy", 1);

const REQUIRED_ENV = ["DISCORD_CLIENT_ID", "DISCORD_CLIENT_SECRET", "DISCORD_REDIRECT_URI", "DISCORD_INVITE_URL"];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key] || process.env[key].startsWith("PUT_"));
if (missingEnv.length) {
  console.warn(`[majan] تحذير: قيم ناقصة في .env → ${missingEnv.join(", ")} (تسجيل الدخول عبر Discord سيعرض صفحة Login Failed)`);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
    name: "majan.sid",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  })
);

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.inviteUrl = process.env.DISCORD_INVITE_URL || "#";
  next();
});

app.use(express.static(path.join(__dirname, "..", "public"), { index: false }));

app.use(authRoutes);
app.use(pageRoutes);

app.use((req, res) => {
  res.status(404).render("404");
});

module.exports = { app, PORT };
