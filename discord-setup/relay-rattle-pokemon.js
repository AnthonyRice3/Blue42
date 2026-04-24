/**
 * relay-rattle-pokemon.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Persistent relay bot: listens to the Rattle Pokemon Discord server for TCG
 * drop alerts and forwards them to Blue42's #release-alerts channel.
 *
 * SETUP (one-time):
 *   1. Enable "Message Content Intent" in Discord Developer Portal:
 *      https://discord.com/developers/applications → Your App → Bot → Privileged Gateway Intents
 *
 *   2. Add the Blue42 bot to the Rattle Pokemon server:
 *      - Ask Rattle Pokemon admins to add it, OR
 *      - If you have Manage Server permission there, use the invite URL from .env.local → DISCORD_URL
 *      - Bot needs READ MESSAGES permission in the drop alert channels
 *
 *   3. Run this script from the discord-setup folder:
 *      node relay-rattle-pokemon.js
 *
 *   4. On first run it will print all Rattle Pokemon channels.
 *      Copy the IDs of the drop alert channels into .env → RATTLE_CHANNEL_IDS
 *      Then restart the script.
 *
 * TO RUN CONTINUOUSLY (Windows):
 *   - Install PM2:  npm install -g pm2
 *   - Start:        pm2 start relay-rattle-pokemon.js --name "drop-relay"
 *   - Auto-start:   pm2 startup  (follow the printed command)
 *   - Save:         pm2 save
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, WebhookClient } = require('discord.js');

// ── Config ────────────────────────────────────────────────────────────────────

const BOT_TOKEN          = process.env.BOT_TOKEN;
const BLUE42_SERVER_ID   = process.env.DISCORD_SERVER_ID;
const RATTLE_SERVER_ID   = process.env.RATTLE_SERVER_ID || '804942363667070986';
const ALERT_CHANNEL_ID   = process.env.BLUE42_ALERT_CHANNEL_ID; // optional override
const RATTLE_CHANNEL_IDS = process.env.RATTLE_CHANNEL_IDS
  ? process.env.RATTLE_CHANNEL_IDS.split(',').map((id) => id.trim()).filter(Boolean)
  : []; // empty = monitor ALL text channels in Rattle server

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN not set in .env');
  process.exit(1);
}
if (!BLUE42_SERVER_ID) {
  console.error('❌ DISCORD_SERVER_ID not set in .env');
  process.exit(1);
}

// ── Drop keyword filter ───────────────────────────────────────────────────────
// A message must match at least one keyword from each group to be relayed.
// Group A: retailer — Group B: product type

const RETAILER_KEYWORDS = [
  'target', 'costco', 'walmart', "sam's club", 'sams club', 'gamestop',
  'best buy', 'pokemon center', 'pcenter',
];

const PRODUCT_KEYWORDS = [
  'pokemon', 'tcg', 'trading card', 'booster', 'etb', 'elite trainer',
  'pack', 'box', 'tin', 'collection box', 'prismatic', 'surging sparks',
  'stellar crown', 'shrouded fable', 'twilight masquerade', 'paldean fates',
  'drop', 'restock', 'in stock', 'hit', 'found', 'spotted', 'pallet',
  'lorcana', 'one piece', 'union arena', 'flesh and blood',
];

function isDropAlert(content) {
  const lower = content.toLowerCase();
  const hasRetailer = RETAILER_KEYWORDS.some((k) => lower.includes(k));
  const hasProduct  = PRODUCT_KEYWORDS.some((k) => lower.includes(k));
  // Also relay if message has common alert emoji combos even without full keyword match
  const hasAlertEmoji = /[🚨🔴🟢🔥⚡🎯🏪📦]/u.test(content);
  return (hasRetailer && hasProduct) || (hasAlertEmoji && (hasRetailer || hasProduct));
}

// ── Client setup ──────────────────────────────────────────────────────────────

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // Requires Privileged Intent to be enabled in Dev Portal
  ],
});

// ── Find Blue42 #release-alerts channel ───────────────────────────────────────

let blue42AlertChannel = null;

async function findAlertChannel(guild) {
  const channels = await guild.channels.fetch();
  if (ALERT_CHANNEL_ID) {
    return channels.get(ALERT_CHANNEL_ID) || null;
  }
  return channels.find(
    (c) => c.isTextBased() && (c.name === 'release-alerts' || c.name === 'drop-alerts')
  ) || null;
}

// ── List Rattle channels on first run ─────────────────────────────────────────

async function listRattleChannels(guild) {
  console.log('\n📋 Channels available in Rattle Pokemon server:');
  console.log('   Copy the IDs of drop alert channels into .env → RATTLE_CHANNEL_IDS\n');
  const channels = await guild.channels.fetch();
  channels
    .filter((c) => c.isTextBased())
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((c) => {
      console.log(`   #${c.name.padEnd(40)} ID: ${c.id}`);
    });
  console.log('\n');
}

// ── Build relay embed ─────────────────────────────────────────────────────────

function buildRelayEmbed(message) {
  const embed = new EmbedBuilder()
    .setColor(0xf59e0b)
    .setAuthor({
      name: `Rattle Pokemon Drop Alert`,
      iconURL: message.author.displayAvatarURL(),
    })
    .setDescription(message.content || '*(no text content)*')
    .setTimestamp(message.createdAt)
    .setFooter({
      text: `#${message.channel.name} • Rattle Pokemon • blue42bots.com/drops`,
    });

  // Forward any images/attachments
  const image = message.attachments.find((a) => a.contentType?.startsWith('image/'));
  if (image) embed.setImage(image.url);

  return embed;
}

// ── Ready ─────────────────────────────────────────────────────────────────────

client.once('ready', async () => {
  console.log(`✅ Relay bot online as ${client.user.tag}`);
  console.log(`📡 Source: Rattle Pokemon (${RATTLE_SERVER_ID})`);
  console.log(`📢 Target: Blue42 #release-alerts (${BLUE42_SERVER_ID})\n`);

  try {
    // Find Blue42 alert channel
    const blue42Guild = await client.guilds.fetch(BLUE42_SERVER_ID);
    blue42AlertChannel = await findAlertChannel(blue42Guild);
    if (!blue42AlertChannel) {
      console.error('❌ Could not find #release-alerts in Blue42 server.');
      console.error('   Set BLUE42_ALERT_CHANNEL_ID in .env to override.');
    } else {
      console.log(`✅ Posting to Blue42 #${blue42AlertChannel.name} (${blue42AlertChannel.id})`);
    }

    // If Rattle server is accessible, list channels
    try {
      const rattleGuild = await client.guilds.fetch(RATTLE_SERVER_ID);
      console.log(`✅ Connected to Rattle Pokemon server: ${rattleGuild.name}`);

      if (RATTLE_CHANNEL_IDS.length === 0) {
        console.warn('⚠️  RATTLE_CHANNEL_IDS not set — monitoring ALL text channels.');
        console.warn('   This may produce noise. Set specific channel IDs in .env.\n');
        await listRattleChannels(rattleGuild);
      } else {
        console.log(`✅ Monitoring ${RATTLE_CHANNEL_IDS.length} channel(s): ${RATTLE_CHANNEL_IDS.join(', ')}\n`);
      }
    } catch {
      console.error('❌ Bot is NOT in the Rattle Pokemon server yet.');
      console.error('   Ask Rattle admins to invite the bot, or use the invite URL from DISCORD_URL in .env.local');
      console.error(`   Rattle server ID: ${RATTLE_SERVER_ID}\n`);
    }
  } catch (err) {
    console.error('❌ Startup error:', err.message);
  }
});

// ── Message handler ───────────────────────────────────────────────────────────

client.on('messageCreate', async (message) => {
  // Only process messages from the Rattle Pokemon server
  if (message.guild?.id !== RATTLE_SERVER_ID) return;

  // Ignore bots (unless it's a webhook — webhooks post real drop alerts)
  if (message.author.bot && !message.webhookId) return;

  // Filter by specific channels if configured
  if (RATTLE_CHANNEL_IDS.length > 0 && !RATTLE_CHANNEL_IDS.includes(message.channel.id)) return;

  // Skip if not a drop alert
  if (!isDropAlert(message.content)) return;

  // Make sure target channel is ready
  if (!blue42AlertChannel) {
    console.warn('⚠️  Alert channel not ready — skipping message');
    return;
  }

  try {
    const embed = buildRelayEmbed(message);
    await blue42AlertChannel.send({ embeds: [embed] });
    console.log(
      `[${new Date().toLocaleTimeString()}] Relayed: "${message.content.substring(0, 80)}..." from #${message.channel.name}`
    );
  } catch (err) {
    console.error('❌ Failed to relay message:', err.message);
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────

client.login(BOT_TOKEN).catch((err) => {
  console.error('❌ Login failed:', err.message);
  console.error('   Check BOT_TOKEN in .env is correct and the bot is not banned.');
  process.exit(1);
});
