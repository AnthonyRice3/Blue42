# Fixing Railway Scraper Bot Blocking Issues

## The Problem

Railway uses **datacenter IP addresses** which are flagged by anti-bot systems. You're seeing these errors:

```
[Reddit] Error: HTTP 403 - Forbidden
[PokeBeach] Error: HTTP 403 - Forbidden  
[Walmart] Error: HTTP 444 - No Response (blocking)
```

These sites actively block requests from cloud hosting providers like Railway, AWS, Vercel, etc.

---

## Solution 1: Target Only (✅ IMPLEMENTED)

**Status:** Ready to deploy  
**Cost:** Free  
**Reliability:** High

I've disabled the blocked sources. The scraper now only monitors **Target's product API**, which is more permissive.

### What Works:
- ✅ Target in-stock monitoring (reliable)
- ✅ Discord posting
- ✅ MongoDB storage
- ✅ Real-time website feed

### What's Disabled:
- ❌ Reddit community posts
- ❌ PokeBeach news
- ❌ Walmart stock checks

### Deploy:
```bash
cd c:\Users\rnari\Dev\Blue42
git add discord-setup/scrape-drop-alerts.js
git commit -m "Disable blocked sources, use Target only on Railway"
git push
```

Railway will redeploy and errors will stop.

---

## Solution 2: Use Reddit API (Proper)

**Cost:** Free  
**Setup Time:** 15 minutes  
**Reliability:** High

### Steps:

1. **Register Reddit App:**
   - Go to https://www.reddit.com/prefs/apps
   - Click "create app" or "create another app"
   - Select "script"
   - Name: "Blue42 TCG Alert Bot"
   - Redirect URI: `http://localhost:8080`
   - Click "create app"
   - Save: `client_id` and `client_secret`

2. **Install Reddit API Library:**
```bash
cd discord-setup
npm install snoowrap
```

3. **Update scraper** to use OAuth instead of JSON endpoint:
```javascript
const Snoowrap = require('snoowrap');

const reddit = new Snoowrap({
  userAgent: 'Blue42TCGBot/1.0 by /u/YourUsername',
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD
});

async function pollReddit() {
  const posts = await reddit.getSubreddit('PokemonTCG').getNew({ limit: 25 });
  // ... rest of logic
}
```

4. **Add to Railway Variables:**
```
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_secret
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password
```

**Pros:** Official API, won't get blocked  
**Cons:** Need Reddit account credentials

---

## Solution 3: Residential Proxy Service

**Cost:** $5-50/month  
**Reliability:** Very High

Use a proxy service to route requests through residential IPs:

### Recommended Services:
- **Bright Data** - $5/month starter
- **Oxylabs** - $10/month
- **Smartproxy** - $8/month

### Setup:
```javascript
// Add to scrape-drop-alerts.js
const PROXY = process.env.PROXY_URL; // 'http://user:pass@proxy.com:8080'

async function fetchJSON(url, headers = {}) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ...headers,
    },
    agent: new HttpsProxyAgent(PROXY) // Use residential proxy
  });
  // ...
}
```

**Pros:** All sources work  
**Cons:** Monthly cost

---

## Solution 4: Manual/Community Sourced

**Cost:** Free  
**Reliability:** Medium

### Option A: Discord Webhook from Community
Set up a webhook where community members can submit alerts:

```javascript
// New endpoint in your Next.js app
// POST /api/alerts/submit
export async function POST(req: NextRequest) {
  const { title, url, retailer } = await req.json();
  
  // Verify Discord user (require verified role)
  // Save to database
  // Post to Discord
}
```

### Option B: Twitter/X Monitor
Monitor @PokemonTCGNews and similar accounts (easier than scraping):
- Use Twitter API (free tier)
- Many TCG accounts post drops

---

## Solution 5: Hybrid Approach (Recommended)

Combine multiple free sources:

```javascript
// Target API - Works on Railway ✅
startPolling('Target', pollTarget, INTERVALS.target);

// Reddit via API - Requires auth but free ✅
startPolling('Reddit', pollRedditAPI, INTERVALS.reddit);

// Twitter via API - Free tier available ✅
startPolling('Twitter', pollTwitter, INTERVALS.twitter);

// Community webhook - Free ✅
// Users submit alerts via Discord bot command
```

---

## Quick Decision Matrix

| Source | Works on Railway? | Free? | Requires Account? | Recommended? |
|--------|-------------------|-------|-------------------|--------------|
| Target API | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| Reddit JSON | ❌ Blocked | ✅ Yes | ❌ No | ❌ No |
| Reddit API | ✅ Yes | ✅ Yes | ✅ Yes (Reddit) | ✅ Yes |
| PokeBeach RSS | ❌ Blocked | ✅ Yes | ❌ No | ❌ No |
| Walmart API | ❌ Blocked | ✅ Yes | ❌ No | ❌ No |
| Proxy Service | ✅ Yes | ❌ No ($5-50/mo) | ✅ Yes (proxy) | ⚪ Maybe |
| Twitter API | ✅ Yes | ✅ Yes (free tier) | ✅ Yes (Twitter) | ✅ Yes |
| Community Webhooks | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |

---

## Immediate Action

**Option 1: Deploy Target-Only Now** (1 minute)
```bash
cd c:\Users\rnari\Dev\Blue42
git add discord-setup/scrape-drop-alerts.js
git commit -m "Use Target API only to avoid Railway IP blocks"
git push
```
✅ Errors will stop  
✅ Alerts will start working  
✅ Can add more sources later

**Option 2: Set Up Reddit API** (15 minutes)
- Follow "Solution 2" above
- Get official Reddit API access
- Re-enable Reddit polling

**Option 3: Do Both**
- Deploy Target now (stop errors)
- Set up Reddit API this week
- Add Twitter API next week
- Build comprehensive multi-source system

---

## What I Recommend

**Phase 1 (Now):** Deploy Target-only version  
**Phase 2 (This Week):** Add Reddit API  
**Phase 3 (Optional):** Add Twitter monitoring  
**Phase 4 (Optional):** Community submission webhook

This gives you immediate working alerts, then expands coverage over time without paying for proxies.

---

## Testing After Deploy

1. **Check Railway Logs** - Should see:
```
✅ Scraper bot online
📢 Posting to #release-alerts
[Target] Checking TCIN 89765522...
```

2. **No more 403 errors**

3. **Wait for Target to detect in-stock item** (could take hours)

4. **Check Discord** - Should get alert when item is in stock

5. **Check Website** - `/drops` page should show alert

---

Need help setting up Reddit API or want to add more sources? Let me know which solution you prefer!
