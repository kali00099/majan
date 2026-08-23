const crypto = require("crypto");
const express = require("express");

const router = express.Router();

const DISCORD_AUTHORIZE_URL = "https://discord.com/oauth2/authorize";
const DISCORD_API_BASE = process.env.DISCORD_API_BASE || "https://discord.com/api";

function envReady() {
  return Boolean(
    process.env.DISCORD_CLIENT_ID &&
    process.env.DISCORD_CLIENT_SECRET &&
    !process.env.DISCORD_CLIENT_SECRET.startsWith("PUT_") &&
    process.env.DISCORD_REDIRECT_URI
  );
}

function buildAuthorizeUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: "identify",
    state,
    prompt: "consent"
  });
  return `${DISCORD_AUTHORIZE_URL}?${params}`;
}

router.get("/auth/discord", (req, res) => {
  if (!envReady()) {
    console.error("[discord-oauth] .env غير مكتمل. تأكد من DISCORD_CLIENT_ID و DISCORD_CLIENT_SECRET و DISCORD_REDIRECT_URI");
    return res.redirect("/login/failed");
  }

  const state = crypto.randomBytes(16).toString("hex");
  req.session.oauthState = state;
  res.redirect(buildAuthorizeUrl(state));
});

router.get("/auth/discord/callback", async (req, res) => {
  try {
    const { code, state, error } = req.query;
    const expectedState = req.session.oauthState;
    delete req.session.oauthState;

    if (error || !code || !state || !expectedState || state !== expectedState) {
      console.error("[discord-oauth] رُفضت عملية الدخول:", JSON.stringify({ error, hasCode: Boolean(code), stateValid: state && expectedState && state === expectedState }));
      return res.redirect("/login/failed");
    }

    const tokenResponse = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code: String(code),
        redirect_uri: process.env.DISCORD_REDIRECT_URI
      })
    });

    if (!tokenResponse.ok) {
      const body = await tokenResponse.text();
      console.error(`[discord-oauth] فشل تبديل الـ code بـ token (${tokenResponse.status}):`, body);
      return res.redirect("/login/failed");
    }

    const token = await tokenResponse.json();

    const userResponse = await fetch(`${DISCORD_API_BASE}/users/@me`, {
      headers: { Authorization: `Bearer ${token.access_token}` }
    });

    if (!userResponse.ok) {
      const body = await userResponse.text();
      console.error(`[discord-oauth] فشل جلب بيانات المستخدم (${userResponse.status}):`, body);
      return res.redirect("/login/failed");
    }

    const profile = await userResponse.json();

    req.session.user = {
      id: profile.id,
      username: profile.global_name || profile.username || "Discord User",
      avatarHash: profile.avatar || null
    };

    res.redirect("/account");
  } catch (err) {
    console.error("[discord-oauth] خطأ غير متوقع في callback:", err);
    res.redirect("/login/failed");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

module.exports = router;
