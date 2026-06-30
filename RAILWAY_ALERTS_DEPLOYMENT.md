# TCG Drop Alerts System - Railway Deployment Guide

## Overview

The TCG Drop Alerts system has been updated to **save alerts to your MongoDB database** in addition to posting them to Discord. This allows your website's `/drops` page to display real-time alerts without relying on Discord.

---

## 🎯 What Was Added

### 1. **Alert Database Model** (`client/src/lib/db/models/Alert.ts`)
- Stores drop alerts from Reddit, PokeBeach, Target, Walmart
- Fields: source, title, description, URL, retailer, price, stock status, timestamps
- Auto-expires after 7 days (TTL index)
- Prevents duplicates via `sourceId` unique index

### 2. **Alerts API Endpoint** (`client/app/api/alerts/route.ts`)
- `GET /api/alerts` - Fetch recent alerts
- Query params: `limit`, `retailer`, `source`, `inStock`
- Returns formatted JSON response

### 3. **Live Alerts Component** (`client/src/components/LiveAlertsSection.tsx`)
- Client-side React component
- Auto-refreshes every 2 minutes
- Filter by retailer (Target, Walmart, Costco, Sam's Club)
- Displays: title, description, image, price, time ago, source

### 4. **Updated Drops Page** (`client/app/drops/page.tsx`)
- Added `<LiveAlertsSection />` between retailer schedules and upcoming sets
- Shows live feed of TCG restocks

### 5. **Enhanced Scraper Bot** (`discord-setup/scrape-drop-alerts.js`)
- Now uses **Mongoose** to connect to MongoDB
- Saves every alert to database when posting to Discord
- Extracts metadata: retailer, product name, price, stock status
- Graceful fallback if MongoDB is unavailable

---

## 🚀 Railway Deployment Steps

### Step 1: Update Discord Setup Repository on Railway

If you haven't already:

```bash
cd discord-setup
git add .
git commit -m "Add MongoDB alert storage to scraper bot"
git push
```

### Step 2: Install Mongoose on Railway

Railway will auto-install from `package.json` when you deploy, but you can also manually trigger:

1. Go to your Railway project
2. Click on the **scrape-drop-alerts** service
3. Go to **Deployments** tab
4. Click **Redeploy** (it will install mongoose automatically)

### Step 3: Add MongoDB URI Environment Variable

**CRITICAL:** The scraper needs your MongoDB connection string.

1. In Railway, go to your **scrape-drop-alerts** service
2. Click **Variables** tab
3. Add new variable:
   ```
   Name:  MONGODB_URI
   Value: mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```
   *(Use the same MongoDB URI as your Next.js app)*

4. Click **Add** → Railway will redeploy automatically

### Step 4: Verify It's Working

**Check Railway Logs:**

1. Go to Railway → **scrape-drop-alerts** service → **Deployments**
2. Click latest deployment → **View Logs**
3. You should see:
   ```
   ✓ Connected to MongoDB for alert storage
   ✅ Scraper bot online as Blue42Bot#1234
   ✅ Connected to server: Blue42
   📢 Posting to #release-alerts (123456789)
   ```

**When an alert is posted, you'll see:**
```
[Reddit r/PokemonTCG] Target has Prismatic Evolutions in stock
  💾 Saved to database: reddit:abc123xyz
```

**Check Your Database:**

1. Open MongoDB Atlas
2. Go to **Collections** → Your database → **alerts** collection
3. You should see alert documents with fields like:
   - `source: "reddit"`
   - `title: "Target has Prismatic Evolutions in stock"`
   - `retailer: "target"`
   - `postedAt: 2026-06-30T10:30:00.000Z`

---

## 🧪 Testing the Alerts Feed

### Test API Endpoint:

```bash
# Fetch all alerts
curl https://yourdomain.com/api/alerts

# Fetch only Target alerts
curl https://yourdomain.com/api/alerts?retailer=target

# Fetch last 10 alerts
curl https://yourdomain.com/api/alerts?limit=10
```

**Expected Response:**
```json
{
  "success": true,
  "count": 5,
  "alerts": [
    {
      "id": "507f1f77bcf86cd799439011",
      "source": "reddit",
      "title": "Target Restock - Prismatic Evolutions ETB",
      "description": "Just found 10+ ETBs at my local Target...",
      "url": "https://reddit.com/r/PokemonTCG/comments/abc123",
      "retailer": "target",
      "inStock": true,
      "postedAt": "2026-06-30T10:30:00.000Z",
      "createdAt": "2026-06-30T10:30:00.000Z"
    }
  ]
}
```

### Test Website Feed:

1. Open `https://yourdomain.com/drops`
2. Scroll to **🔴 Live Drop Alerts** section
3. You should see recent alerts with:
   - Source badge (Reddit, Target Monitor, etc.)
   - Retailer icon and color coding
   - "IN STOCK" badge if available
   - Time ago (e.g., "5m ago", "2h ago")
   - Filter buttons for each retailer
   - Auto-refresh every 2 minutes

---

## 📊 How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        Railway (Cloud)                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  scrape-drop-alerts.js (PM2 Process)                     │  │
│  │  ────────────────────────────────────────────────────    │  │
│  │  Every 5-10 minutes:                                      │  │
│  │  1. Poll Reddit → Find TCG posts                          │  │
│  │  2. Poll Target API → Check product stock                 │  │
│  │  3. Poll Walmart API → Check product stock                │  │
│  │  4. Poll PokeBeach RSS → New set announcements            │  │
│  │                                                            │  │
│  │  For each alert:                                           │  │
│  │  ✅ Post to Discord #release-alerts                       │  │
│  │  ✅ Save to MongoDB (NEW!)                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MongoDB Atlas (Cloud)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  alerts collection                                        │  │
│  │  ────────────────────────────────────────────────────    │  │
│  │  { source: "reddit", title: "...", retailer: "target" }  │  │
│  │  { source: "target", inStock: true, price: 59.99 }       │  │
│  │  { source: "walmart", expiresAt: "2026-07-07" }          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Next.js App (Vercel/Your Host)                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  GET /api/alerts → Fetch from MongoDB                     │  │
│  │  /drops page → Display <LiveAlertsSection />              │  │
│  │  User sees: 🔴 Live Drop Alerts (auto-refresh 2min)      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### No Alerts Showing on Website

**Check 1: Is MongoDB connected?**
```bash
# Railway logs should show:
✓ Connected to MongoDB for alert storage
```
If not, verify `MONGODB_URI` environment variable is set correctly.

**Check 2: Are alerts being saved?**
```bash
# Railway logs should show after each alert:
💾 Saved to database: reddit:abc123
```

**Check 3: Check MongoDB directly**
- Open MongoDB Atlas → Collections
- Look for `alerts` collection
- Should have documents

**Check 4: Test API endpoint**
```bash
curl https://yourdomain.com/api/alerts
```
Should return `{ "success": true, "count": X, "alerts": [...] }`

### Scraper Bot Not Saving to DB

**Error:** "MONGODB_URI not set"
- Add `MONGODB_URI` environment variable in Railway

**Error:** "MongoDB connection failed"
- Check connection string is correct
- Verify MongoDB Atlas allows Railway IP (allow all: 0.0.0.0/0)
- Check MongoDB user has read/write permissions

**Error:** "Duplicate key error (code 11000)"
- This is normal! It means the alert already exists (de-duplication working)

### Old Alerts Not Disappearing

**Check TTL Index:**
- Alerts auto-expire after 7 days via `expiresAt` field
- MongoDB's TTL monitor runs every 60 seconds
- You can manually adjust expiry in Alert model

---

## 🎨 Customization

### Change Alert Expiry Time

Edit `client/src/lib/db/models/Alert.ts`:
```typescript
AlertSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    // Change 7 days to whatever you want
    this.expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
  }
  next();
});
```

### Change Refresh Interval

Edit `client/src/components/LiveAlertsSection.tsx`:
```typescript
// Refresh every 2 minutes (change to whatever)
const interval = setInterval(fetchAlerts, 120000); // 120000ms = 2min
```

### Add More Retailers

Edit `discord-setup/scrape-drop-alerts.js`:
```javascript
// Add to postAlert metadata:
if (lowerCombined.includes('amazon')) retailer = 'amazon';
```

Then add to `LiveAlertsSection.tsx`:
```typescript
const RETAILER_ICONS: Record<string, string> = {
  // ... existing
  amazon: '📦',
};
```

### Filter by Stock Status

Website can filter to only show in-stock items:
```typescript
// In LiveAlertsSection.tsx
const inStockAlerts = alerts.filter(a => a.inStock);
```

---

## 📝 Environment Variables Summary

| Variable | Required | Location | Example |
|----------|----------|----------|---------|
| `MONGODB_URI` | ✅ Yes | Railway scraper service | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `BOT_TOKEN` | ✅ Yes | Railway scraper service | `MTIzNDU2Nzg5MDEyMzQ1Njc4OQ.AbCdEf...` |
| `DISCORD_SERVER_ID` | ✅ Yes | Railway scraper service | `1234567890123456789` |
| `BLUE42_ALERT_CHANNEL_ID` | ⚪ Optional | Railway scraper service | `9876543210987654321` |

---

## ✅ Deployment Checklist

- [ ] `discord-setup/package.json` has `mongoose: "^8.0.0"`
- [ ] `discord-setup/scrape-drop-alerts.js` updated with MongoDB code
- [ ] Railway environment variable `MONGODB_URI` added
- [ ] Railway redeployed successfully
- [ ] Railway logs show "Connected to MongoDB"
- [ ] MongoDB Atlas has `alerts` collection with documents
- [ ] API endpoint `/api/alerts` returns data
- [ ] Website `/drops` page shows Live Alerts section
- [ ] Alerts auto-refresh every 2 minutes
- [ ] Filter buttons work (Target, Walmart, etc.)

---

## 🎉 You're Done!

Your TCG drop alerts system is now fully integrated with Railway and your website! Alerts will:

1. ✅ Post to Discord #release-alerts (instant notifications for users)
2. ✅ Save to MongoDB database (persistent storage)
3. ✅ Display on your website `/drops` page (public visibility)
4. ✅ Auto-refresh every 2 minutes (real-time updates)
5. ✅ Filter by retailer (easy navigation)
6. ✅ Auto-expire after 7 days (clean database)

Users get the best of both worlds: instant Discord notifications + browseable web feed!
