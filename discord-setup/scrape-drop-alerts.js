/**
 * scrape-drop-alerts.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Polls multiple FREE public sources for Pokemon TCG drop/restock alerts and
 * posts them to Blue42's #release-alerts Discord channel.
 *
 * No API keys required. No Discord server access required.
 * Runs continuously — polls each source on its own interval.
 *
 * SOURCES:
 *   1. Reddit r/PokemonTCG        — new posts (free JSON API, no auth)
 *   2. Reddit r/pokemoncardcollectors — new posts
 *   3. PokeBeach news RSS          — official set/news feed
 *   4. Target product availability — polls known Pokemon TCG product IDs
 *   5. Walmart product search API  — monitors Walmart TCG listings
 *
 * USAGE (from discord-setup folder):
 *   node scrape-drop-alerts.js
 *
 * KEEP ALIVE 24/7 (Windows — run once):
 *   npm install -g pm2
 *   pm2 start scrape-drop-alerts.js --name "tcg-scraper"
 *   pm2 startup    ← follow the printed command
 *   pm2 save
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs   = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────────────────────────

const BOT_TOKEN        = process.env.BOT_TOKEN;
const SERVER_ID        = process.env.DISCORD_SERVER_ID;
const ALERT_CHANNEL_ID = process.env.BLUE42_ALERT_CHANNEL_ID; // optional override

if (!BOT_TOKEN || !SERVER_ID) {
  console.error('❌ BOT_TOKEN and DISCORD_SERVER_ID must be set in .env');
  process.exit(1);
}

// Poll intervals (ms)
const INTERVALS = {
  reddit:  5  * 60 * 1000,  // every 5 min  (Reddit rate limit friendly)
  pokebeach: 30 * 60 * 1000, // every 30 min
  target:  10 * 60 * 1000,  // every 10 min
  walmart: 10 * 60 * 1000,  // every 10 min
};

// ── Seen-ID persistence ───────────────────────────────────────────────────────
// Tracks IDs/URLs we've already posted so duplicates are never sent.

const SEEN_FILE = path.join(__dirname, '.seen-alerts.json');

function loadSeen() {
  try {
    return new Set(JSON.parse(fs.readFileSync(SEEN_FILE, 'utf8')));
  } catch {
    return new Set();
  }
}

function saveSeen(set) {
  // Keep only the newest 2000 IDs to avoid unbounded growth
  const arr = [...set];
  const trimmed = arr.slice(-2000);
  fs.writeFileSync(SEEN_FILE, JSON.stringify(trimmed), 'utf8');
}

const seen = loadSeen();

function markSeen(id) {
  seen.add(id);
  saveSeen(seen);
}

// ── Drop keyword filter ───────────────────────────────────────────────────────

const RETAILER_WORDS = [
  'target', 'costco', 'walmart', "sam's club", 'sams club',
  'gamestop', 'best buy', 'pokemon center',
];

const DROP_WORDS = [
  'restock', 'in stock', 'back in stock', 'found', 'spotted', 'drop',
  'available', 'pallet', 'hit shelves', 'shelf', 'release', 'ship',
];

const PRODUCT_WORDS = [
  'pokemon', 'tcg', 'booster', 'etb', 'elite trainer', 'tin', 'pack',
  'box', 'collection', 'lorcana', 'one piece tcg', 'prismatic', 'surging sparks',
  'stellar crown', 'shrouded fable', 'twilight masquerade',
];

function isRelevant(text) {
  const t = text.toLowerCase();
  const hasRetailer = RETAILER_WORDS.some((w) => t.includes(w));
  const hasDrop     = DROP_WORDS.some((w) => t.includes(w));
  const hasProduct  = PRODUCT_WORDS.some((w) => t.includes(w));
  // need retailer + (drop or product mention) OR drop + product
  return (hasRetailer && (hasDrop || hasProduct)) || (hasDrop && hasProduct);
}

// ── Discord client ────────────────────────────────────────────────────────────

const discord = new Client({ intents: [GatewayIntentBits.Guilds] });
let alertChannel = null;

async function findAlertChannel() {
  const guild = await discord.guilds.fetch(SERVER_ID);
  const channels = await guild.channels.fetch();
  if (ALERT_CHANNEL_ID) return channels.get(ALERT_CHANNEL_ID) || null;
  return channels.find(
    (c) => c.isTextBased() && (c.name === 'release-alerts' || c.name === 'drop-alerts')
  ) || null;
}

async function postAlert(embed) {
  if (!alertChannel) return;
  try {
    await alertChannel.send({ embeds: [embed] });
  } catch (err) {
    console.error('❌ Failed to post embed:', err.message);
  }
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function fetchJSON(url, headers = {}) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Blue42Bot/1.0 (blue42bots.com; drop-alert-scraper)',
      ...headers,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Blue42Bot/1.0 (blue42bots.com; drop-alert-scraper)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.text();
}

// ── Source 1: Reddit ──────────────────────────────────────────────────────────

const REDDIT_SUBS = [
  'PokemonTCG',
  'pokemoncardcollectors',
  'pokemontrades',
  'PokemonCardValue',
];

async function pollReddit() {
  for (const sub of REDDIT_SUBS) {
    try {
      const data = await fetchJSON(
        `https://www.reddit.com/r/${sub}/new.json?limit=25&t=hour`
      );
      const posts = data?.data?.children ?? [];

      for (const { data: post } of posts) {
        const id = `reddit:${post.id}`;
        if (seen.has(id)) continue;

        const title = post.title || '';
        const body  = post.selftext || '';
        const combined = `${title} ${body}`;

        if (!isRelevant(combined)) { markSeen(id); continue; }

        markSeen(id);
        console.log(`[Reddit r/${sub}] ${title.substring(0, 80)}`);

        const embed = new EmbedBuilder()
          .setColor(0xff4500) // Reddit orange
          .setAuthor({ name: `r/${sub} — TCG Drop Alert` })
          .setTitle(title.length > 200 ? title.substring(0, 197) + '...' : title)
          .setURL(`https://reddit.com${post.permalink}`)
          .setTimestamp(post.created_utc * 1000)
          .setFooter({ text: `u/${post.author} • blue42bots.com/drops` });

        // Add body excerpt if it's a text post
        if (body && body.trim().length > 10) {
          const excerpt = body.substring(0, 400).trim();
          embed.setDescription(excerpt.length < body.trim().length ? excerpt + '…' : excerpt);
        }

        // Attach image if it's a direct image post
        if (post.url && /\.(jpg|jpeg|png|gif|webp)$/i.test(post.url)) {
          embed.setImage(post.url);
        } else if (post.thumbnail && post.thumbnail.startsWith('http')) {
          embed.setThumbnail(post.thumbnail);
        }

        await postAlert(embed);
        await sleep(500); // small delay between posts
      }
    } catch (err) {
      console.error(`[Reddit r/${sub}] Error: ${err.message}`);
    }
    await sleep(1000); // between subreddits
  }
}

// ── Source 2: PokeBeach RSS ───────────────────────────────────────────────────

async function pollPokeBeach() {
  try {
    const xml = await fetchText('https://www.pokebeach.com/feed');
    // Simple regex RSS parser — no external XML library needed
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

    for (const [, itemXml] of items) {
      const title   = (itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || [])[1] || '';
      const link    = (itemXml.match(/<link>(.*?)<\/link>/) || [])[1] || '';
      const pubDate = (itemXml.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || '';
      const desc    = (itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || [])[1] || '';

      if (!link) continue;
      const id = `pokebeach:${link}`;
      if (seen.has(id)) continue;

      const combined = `${title} ${desc}`;
      if (!isRelevant(combined) && !title.toLowerCase().includes('release')) {
        markSeen(id);
        continue;
      }

      markSeen(id);
      console.log(`[PokeBeach] ${title.substring(0, 80)}`);

      // Strip HTML from description
      const cleanDesc = desc
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 300);

      const embed = new EmbedBuilder()
        .setColor(0x0070bb) // PokeBeach blue
        .setAuthor({ name: 'PokeBeach News' })
        .setTitle(title)
        .setURL(link)
        .setDescription(cleanDesc || null)
        .setTimestamp(pubDate ? new Date(pubDate) : new Date())
        .setFooter({ text: 'pokebeach.com • blue42bots.com/drops' });

      await postAlert(embed);
      await sleep(500);
    }
  } catch (err) {
    console.error(`[PokeBeach] Error: ${err.message}`);
  }
}

// ── Source 3: Target product availability ─────────────────────────────────────
// Known Pokemon TCG TCINs at Target. Add/update these as new products launch.
// To find a TCIN: search Target.com, copy the number from the product URL.

const TARGET_TCINS = [
  '89765522', // Pokemon TCG booster bundle
  '89765523', // Pokemon ETB (varies by set)
  '85878006', // Pokemon cards general
  '82364849', // Booster packs
  '14145480', // Pokemon trading card game packs
  '89116090', // Prismatic Evolutions ETB
  '88853282', // Surging Sparks ETB
  '89765530', // Stellar Crown
];

const TARGET_STORE_IDS = [
  '3991', // Miami, FL (example — add your city's store ID)
  '1234', // Add more store IDs from: https://www.target.com/store-locator/find-stores
];

async function pollTarget() {
  for (const tcin of TARGET_TCINS) {
    try {
      // Target's public product info API — no key needed for basic calls
      const url = `https://redsky.target.com/redsky_aggregations/v1/web/pdp_client_v1?key=9f36aeafbe60771e321a7cc95a78140772ab3e96&tcin=${tcin}&is_bot=false&store_id=${TARGET_STORE_IDS[0]}&zip=33101&state=FL&latitude=25.76&longitude=-80.19&country=USA&channel=WEB&platform=desktop`;

      const data = await fetchJSON(url);
      const product = data?.data?.product;
      if (!product) continue;

      const title    = product.item?.product_description?.title || '';
      const isInStock = product.children?.[0]?.fulfillment?.is_in_store_only === false &&
                         product.children?.[0]?.fulfillment?.shipping_options?.availability_status === 'IN_STOCK';
      const inStore  = product.children?.some(
        (c) => c.fulfillment?.store_options?.[0]?.location_available_to_promise_quantity > 0
      );

      const id = `target:${tcin}:${isInStock || inStore ? 'in' : 'out'}`;
      if (seen.has(id)) continue;

      // Only alert when going IN stock
      if (!isInStock && !inStore) { continue; }

      markSeen(id);
      console.log(`[Target] IN STOCK: ${title}`);

      const embed = new EmbedBuilder()
        .setColor(0xcc0000) // Target red
        .setAuthor({ name: '🎯 Target — In Stock Alert' })
        .setTitle(`${title} is IN STOCK on Target!`)
        .setURL(`https://www.target.com/p/-/A-${tcin}`)
        .setDescription(
          `**Get it now before it sells out!**\n` +
          `Online: ${isInStock ? '✅ Available' : '❌ Not available'}\n` +
          `In-Store: ${inStore ? '✅ Available' : '❌ Not available'}\n\n` +
          `🤖 [Use Target Lightning Bot to auto-checkout →](https://blue42bots.com/bots)`
        )
        .setTimestamp()
        .setFooter({ text: 'Target Stock Monitor • blue42bots.com/drops' });

      // Attach product image if available
      const imgUrl = product.item?.enrichment?.images?.primary_image_url;
      if (imgUrl) embed.setThumbnail(imgUrl);

      await postAlert(embed);
      await sleep(500);

    } catch (err) {
      // Silently skip — Target API can 403 or change keys
      if (!err.message.includes('403') && !err.message.includes('401')) {
        console.error(`[Target TCIN ${tcin}] Error: ${err.message}`);
      }
    }
    await sleep(1500); // be polite between product requests
  }
}

// ── Source 4: Walmart product search ─────────────────────────────────────────
// Walmart has a public search API endpoint.

async function pollWalmart() {
  try {
    const searches = ['pokemon tcg booster box', 'pokemon elite trainer box'];

    for (const query of searches) {
      const encoded = encodeURIComponent(query);
      const url = `https://www.walmart.com/search?q=${encoded}&facet=retailer_type%3AWarehouse&affinityOverride=default&page=1&offset=0`;

      // Walmart's internal search API
      const apiUrl = `https://www.walmart.com/search/api/pex/search?query=${encoded}&catId=0&prg=desktop&facet=true&page=1`;
      const data = await fetchJSON(apiUrl, {
        'Accept': 'application/json',
        'Referer': 'https://www.walmart.com',
      });

      const items = data?.payload?.products ?? data?.items ?? [];

      for (const item of items.slice(0, 10)) {
        const name        = item.name || item.title || '';
        const itemId      = item.itemId || item.usItemId || '';
        const available   = item.availabilityStatus === 'IN_STOCK' || item.stock === 'IN_STOCK';
        const price       = item.priceInfo?.currentPrice?.price ?? item.salePrice ?? '';

        if (!itemId || !isRelevant(name)) continue;

        const id = `walmart:${itemId}:in`;
        if (seen.has(id) || !available) continue;

        markSeen(id);
        console.log(`[Walmart] IN STOCK: ${name}`);

        const embed = new EmbedBuilder()
          .setColor(0x0071ce) // Walmart blue
          .setAuthor({ name: '🏬 Walmart — In Stock Alert' })
          .setTitle(`${name} is available on Walmart!`)
          .setURL(`https://www.walmart.com/ip/${itemId}`)
          .setDescription(
            `${price ? `**Price:** $${price}\n` : ''}` +
            `**Status:** ✅ In Stock Online\n\n` +
            `Walmart online drops go live at ~8am EST and sell out in minutes.`
          )
          .setTimestamp()
          .setFooter({ text: 'Walmart Stock Monitor • blue42bots.com/drops' });

        if (item.imageUrl) embed.setThumbnail(item.imageUrl);

        await postAlert(embed);
        await sleep(500);
      }
      await sleep(2000);
    }
  } catch (err) {
    if (!err.message.includes('403')) {
      console.error(`[Walmart] Error: ${err.message}`);
    }
  }
}

// ── Utility ───────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function startPolling(label, fn, intervalMs) {
  // Run immediately, then on interval
  fn().catch((err) => console.error(`[${label}] Uncaught:`, err.message));
  setInterval(() => {
    fn().catch((err) => console.error(`[${label}] Uncaught:`, err.message));
  }, intervalMs);
  console.log(`✅ [${label}] polling every ${intervalMs / 60000}min`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

discord.once('ready', async () => {
  console.log(`\n✅ Scraper bot online as ${discord.user.tag}`);

  try {
    alertChannel = await findAlertChannel();
    if (!alertChannel) {
      console.error('❌ Could not find #release-alerts in Blue42 server.');
      console.error('   Set BLUE42_ALERT_CHANNEL_ID in .env to override.');
      process.exit(1);
    }
    console.log(`📢 Posting to #${alertChannel.name} (${alertChannel.id})\n`);
  } catch (err) {
    console.error('❌ Startup error:', err.message);
    process.exit(1);
  }

  // Start all pollers
  startPolling('Reddit',    pollReddit,    INTERVALS.reddit);
  startPolling('PokeBeach', pollPokeBeach, INTERVALS.pokebeach);
  startPolling('Target',    pollTarget,    INTERVALS.target);
  startPolling('Walmart',   pollWalmart,   INTERVALS.walmart);

  console.log('\n🔍 Scraper running. Press Ctrl+C to stop.\n');
});

discord.login(BOT_TOKEN).catch((err) => {
  console.error('❌ Discord login failed:', err.message);
  process.exit(1);
});
