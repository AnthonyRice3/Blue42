# Railway Deployment Guide

## Quick Setup

### 1. Install Railway CLI (optional, for local testing)
```bash
npm install -g @railway/cli
railway login
```

### 2. Push to GitHub
```bash
git init
git add .
git commit -m "Prepare Discord bots for Railway deployment"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 3. Deploy on Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `discord-setup` repository
4. Railway will auto-detect Node.js and run `npm start`

### 4. Set Environment Variables

In Railway project settings → **Variables**, add:

```
BOT_TOKEN=<your-discord-bot-token>
DISCORD_SERVER_ID=1438958192536326304
NODE_ENV=production
```

### 5. Verify Deployment

Railway will automatically:
- Install dependencies (`npm install`)
- Run `npm start` → starts pm2 with all 3 bots
- Keep all bots running 24/7
- Auto-restart on crash

Check the **Logs** tab in Railway to confirm:
```
✅ Blue42 Bot online as Blue42#9889
✅ [Scraper] polling every Xmin
✅ Relay bot online as Blue42#9889
```

---

## What's Running

| Bot | Script | Purpose |
|-----|--------|---------|
| **Verification Bot** | `discord-bot.js` | Handles ✅ verification reactions in #rules and 🎟️ support ticket button clicks |
| **Drop Scraper** | `scrape-drop-alerts.js` | Polls Target, Costco, Walmart, Sam's Club for TCG drops and posts to #release-alerts |
| **Rattle Relay** | `relay-rattle-pokemon.js` | Relays Pokemon drop alerts from Rattle Pokemon server to Blue42 #release-alerts |

---

## Cost

Railway charges ~$5/mo for this workload. Free trial credits should last a few weeks.

---

## Local Testing

Test all bots locally before deploying:

```bash
npm install
npm start
```

View logs:
```bash
pm2 logs
```

Stop all:
```bash
pm2 stop all
pm2 delete all
```

---

## Troubleshooting

**Bots not starting?**
- Check Railway logs for errors
- Verify `BOT_TOKEN` and `DISCORD_SERVER_ID` are set in Variables
- Ensure bot has required Discord intents enabled (SERVER MEMBERS, MESSAGE CONTENT)

**Want to restart a specific bot?**
Railway UI → **Deployments** → **Restart**

---

## Alternative: One-Time Scripts (Run Locally)

These scripts are for setup only, don't need to run 24/7:
- `setup-server.js` — initial server setup (roles, channels)
- `post-messages.js` — post welcome/rules embeds
- `post-drop-alerts.js` — post drop schedules
- `announce-drops-feature.js` — announce new features
- `update-channels.js` — update channel configs

Run them locally with:
```bash
node <script-name>.js
```
