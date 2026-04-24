/**
 * post-drop-alerts.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Posts Pokemon TCG drop alerts to Blue42's #release-alerts Discord channel.
 *
 * Usage:
 *   node post-drop-alerts.js
 *
 * Configuration (environment variables — do NOT put secrets in this file):
 *   DISCORD_BOT_TOKEN   - Blue42 bot token
 *   DISCORD_SERVER_ID   - Blue42 server (guild) ID
 *   DISCORD_CHANNEL_ID  - ID of the #release-alerts channel (override auto-find)
 *
 * To run on a schedule (Windows Task Scheduler or cron):
 *   Daily at 8am:  0 8 * * * node /path/to/post-drop-alerts.js
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW TO RELAY ALERTS FROM ANOTHER DISCORD (e.g. TCGDrops):
 *
 * If TCGDrops (or your source server) has ANNOUNCEMENT channels:
 *   1. Join the source server as a regular member.
 *   2. Right-click the announcement channel → "Follow Channel".
 *   3. Point it at Blue42's #release-alerts.
 *   NO CODE REQUIRED — Discord forwards messages automatically.
 *
 * If the source server does NOT have announcement channels, you need a bot
 * added to BOTH servers. Contact the source server admins for bot access,
 * then uncomment and configure the RELAY section below.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

// ── Config — read from .env, never hardcode tokens ───────────────────────────

const BOT_TOKEN = process.env.BOT_TOKEN;
const SERVER_ID = process.env.DISCORD_SERVER_ID;
const OVERRIDE_CHANNEL_ID = process.env.BLUE42_ALERT_CHANNEL_ID;

if (!BOT_TOKEN || !SERVER_ID) {
  console.error(
    '❌ Missing required environment variables: DISCORD_BOT_TOKEN and DISCORD_SERVER_ID'
  );
  process.exit(1);
}

// ── Retailer drop schedule data ──────────────────────────────────────────────

const RETAILER_PATTERNS = [
  {
    name: 'Target',
    emoji: '🎯',
    color: 0xcc0000,
    restockDay: 'Thursday – Friday',
    restockTime: 'Store open (8am – 10am local)',
    tip: 'Visit the TCG aisle or monitor target.com product pages with the **Target Lightning Bot**.',
    botName: 'Target Lightning Bot',
  },
  {
    name: 'Costco',
    emoji: '🏪',
    color: 0x0050a0,
    restockDay: 'Seasonal / warehouse events',
    restockTime: 'Warehouse open (10am local)',
    tip: 'Costco drops are pallet-based around Q4 & holidays. Sell out in hours — use the **Costco Checkout Bot**.',
    botName: 'Costco Checkout Bot',
  },
  {
    name: "Sam's Club",
    emoji: '🛒',
    color: 0x007dc6,
    restockDay: 'Seasonal / irregular',
    restockTime: 'Varies',
    tip: "Similar to Costco. Members report drops in #release-alerts first.",
    botName: "Sam's Club Bot",
  },
  {
    name: 'Walmart',
    emoji: '🏬',
    color: 0xffc220,
    restockDay: 'Tuesday – Wednesday (overnight)',
    restockTime: '8am EST online',
    tip: 'Online drops go live at 8am EST and disappear in minutes. In-store mid-week overnight.',
    botName: null,
  },
];

// ── Fetch upcoming TCG sets from PokemonTCG.io ───────────────────────────────

async function fetchUpcomingSets() {
  try {
    const res = await fetch(
      'https://api.pokemontcg.io/v2/sets?orderBy=releaseDate&pageSize=20'
    );
    if (!res.ok) return [];
    const data = await res.json();
    const today = new Date();
    const sixMonths = new Date(today);
    sixMonths.setMonth(sixMonths.getMonth() + 6);

    return (data.data ?? []).filter((s) => {
      const d = new Date(s.releaseDate.replace(/\//g, '-'));
      return d >= today && d <= sixMonths;
    });
  } catch (err) {
    console.error('Failed to fetch TCG sets:', err.message);
    return [];
  }
}

function formatDate(raw) {
  return new Date(raw.replace(/\//g, '-')).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// ── Build Discord embeds ─────────────────────────────────────────────────────

function buildWeeklyScheduleEmbed() {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('🃏 Weekly TCG Drop Schedule — Retailer Restock Windows')
    .setDescription(
      'Here are the known restock patterns for Pokemon TCG at major retailers this week.\n' +
      'Pair these windows with your **Blue42 checkout bot** to auto-checkout the moment stock lands.\n\u200B'
    )
    .setTimestamp()
    .setFooter({ text: 'Blue42 Drop Intelligence • blue42bots.com/drops' });

  RETAILER_PATTERNS.forEach((r) => {
    embed.addFields({
      name: `${r.emoji} ${r.name}`,
      value:
        `**Restock Window:** ${r.restockDay}\n` +
        `**Time:** ${r.restockTime}\n` +
        `${r.tip}`,
      inline: false,
    });
  });

  embed.addFields({
    name: '\u200B',
    value:
      '📣 **Drop spotted? Post it here!** The earlier the community knows, the better everyone does.\n' +
      '🤖 [Get a checkout bot →](https://blue42bots.com/bots)\n' +
      '📅 [Full drop calendar →](https://blue42bots.com/drops)',
    inline: false,
  });

  return embed;
}

async function buildUpcomingSetsEmbed(sets) {
  if (sets.length === 0) return null;

  const embed = new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle('📅 Upcoming Pokemon TCG Set Releases')
    .setDescription(
      'Official release dates for upcoming sets. Retailers typically receive stock **1–2 weeks** after the release date.\n\u200B'
    )
    .setTimestamp()
    .setFooter({ text: 'Data: pokemontcg.io • Blue42 Drop Intelligence' });

  sets.slice(0, 8).forEach((s) => {
    embed.addFields({
      name: `${s.name} (${s.series})`,
      value: `🗓 **Release:** ${formatDate(s.releaseDate)}\nWatch #release-alerts for retailer stock confirmations.`,
      inline: true,
    });
  });

  embed.addFields({
    name: '\u200B',
    value: '[View full drop calendar →](https://blue42bots.com/drops)',
    inline: false,
  });

  return embed;
}

// ── Main ─────────────────────────────────────────────────────────────────────

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  try {
    const guild = await client.guilds.fetch(SERVER_ID);

    // Find #release-alerts channel
    const channels = await guild.channels.fetch();
    const alertChannel =
      OVERRIDE_CHANNEL_ID
        ? channels.get(OVERRIDE_CHANNEL_ID)
        : channels.find(
            (c) =>
              c.isTextBased() &&
              (c.name === 'release-alerts' || c.name === 'drop-alerts')
          );

    if (!alertChannel) {
      console.error('❌ Could not find #release-alerts channel. Set DISCORD_CHANNEL_ID env var.');
      process.exit(1);
    }

    console.log(`📢 Posting to #${alertChannel.name} (${alertChannel.id})`);

    // 1. Post weekly retailer schedule
    const scheduleEmbed = buildWeeklyScheduleEmbed();
    await alertChannel.send({ embeds: [scheduleEmbed] });
    console.log('✅ Posted retailer schedule embed');

    // 2. Post upcoming TCG sets
    const upcomingSets = await fetchUpcomingSets();
    const setsEmbed = await buildUpcomingSetsEmbed(upcomingSets);
    if (setsEmbed) {
      await alertChannel.send({ embeds: [setsEmbed] });
      console.log(`✅ Posted ${upcomingSets.length} upcoming sets`);
    } else {
      console.log('ℹ️  No upcoming sets in the next 6 months — skipping sets embed');
    }
  } catch (err) {
    console.error('❌ Error posting alerts:', err.message);
  } finally {
    await client.destroy();
    process.exit(0);
  }
});

client.login(BOT_TOKEN);
