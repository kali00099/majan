# MAJAN — Community Website + Discord OAuth2 Login

موقع مجتمع **MAJAN** (FiveM Roleplay) مع تسجيل دخول حقيقي عبر **Discord OAuth2**.

## التشغيل السريع

```bash
npm install
npm start
```

ثم افتح: <http://localhost:3000>

## هيكل المشروع

```text
majan-site-discord/
├── src/
│   ├── app.js          # إعداد Express + Session + Static + 404
│   └── server.js       # تشغيل السيرفر
├── routes/
│   ├── auth.js         # Discord OAuth2 (login / callback / logout)
│   └── pages.js        # الصفحات (/ , /account , /login/failed , /api/me)
├── views/              # قوالب EJS (partials + الصفحات)
├── public/
│   ├── css/style.css   # التصميم الكامل + Responsive
│   ├── js/main.js      # القائمة، الأنيميشن، العدادات، نسخ ID
│   └── assets/
├── legacy/             # نسخة الواجهة الأولى (مرجع فقط)
├── .env                # الإعدادات الحقيقية (غير مرفوع إلى Git)
├── .env.example
├── package.json
└── README.md
```

## إعدادات `.env`

انسخ `.env.example` إلى `.env` واملأ القيم:

| المتغير | الشرح |
|---|---|
| `PORT` | منفذ السيرفر (الافتراضي 3000) |
| `DISCORD_CLIENT_ID` | Client ID من Discord Developer Portal |
| `DISCORD_CLIENT_SECRET` | Client Secret — لا تشاركه أبدًا ولا ترفعه إلى GitHub |
| `DISCORD_REDIRECT_URI` | يجب أن يطابق تمامًا `http://localhost:3000/auth/discord/callback` |
| `DISCORD_INVITE_URL` | رابط دعوة سيرفر Majan |
| `SESSION_SECRET` | سلسلة عشوائية طويلة لتوقيع كوكيز الجلسة |

## إعدادات Discord Developer Portal

1. افتح <https://discord.com/developers/applications> واختر تطبيقك.
2. من تبويب **OAuth2 → General**:
   - أضف Redirect:
     ```
     http://localhost:3000/auth/discord/callback
     ```
3. لا حاجة لأي Bot Token أو صلاحيات سيرفر. تسجيل الدخول يستخدم scope واحد فقط: `identify`، ويعمل مع أي مستخدم Discord حتى لو لم يكن عضوًا في السيرفر أو بدون أي صلاحيات إدارية.

## المسارات

| المسار | الوصف |
|---|---|
| `/` | الصفحة الرئيسية |
| `/auth/discord` | بدء تسجيل الدخول عبر Discord (مع حماية CSRF عبر state) |
| `/auth/discord/callback` | رجوع OAuth وإنشاء الجلسة |
| `/account` | صفحة حساب المستخدم (Username / Avatar / ID) |
| `/logout` | تسجيل الخروج وتدمير الجلسة |
| `/login/failed` | صفحة "Login Failed" الجميلة مع زر Try Again |
| `/api/me` | JSON لبيانات المستخدم الحالي |

## النشر على Render (رابط دائم 24/7)

1. ارفع المشروع إلى مستودع GitHub.
2. سجّل دخول على <https://render.com> بحساب GitHub.
3. **New → Web Service** → اختر المستودع.
4. الإعدادات:
   - Runtime: **Node**
   - Build Command: `npm install`
   - Start Command: `npm start`
5. من **Environment** أضف المتغيرات:
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `DISCORD_REDIRECT_URI=https://YOUR-APP.onrender.com/auth/discord/callback`
   - `DISCORD_INVITE_URL`
   - `SESSION_SECRET` (سلسلة عشوائية طويلة)
   - `NODE_ENV=production`
6. Deploy، ثم من Discord Developer Portal أضف Redirect:
   `https://YOUR-APP.onrender.com/auth/discord/callback`

## الأمان

- الـ Client Secret يعيش في `.env` على السيرفر فقط.
- الجلسات موقّعة بـ `SESSION_SECRET` وكوكي `httpOnly`.
- فشل الدخول يعرض صفحة ودّية للمستخدم ويطبع الخطأ الحقيقي في Console المطور فقط.
