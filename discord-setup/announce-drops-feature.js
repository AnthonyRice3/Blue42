/**
 * announce-drops-feature.js
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time script to announce the new TCG Drop Intelligence feature
 * in Blue42's #announcements and #release-alerts channels.
 *
 * Usage (from discord-setup folder):
 *   node announce-drops-feature.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const BOT_TOKEN = process.env.BOT_TOKEN;
const SERVER_ID = process.env.DISCORD_SERVER_ID;

if (!BOT_TOKEN || !SERVER_ID) {
  console.error('❌ BOT_TOKEN and DISCORD_SERVER_ID must be set in the .env file.');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// ── Announcement embed (goes to #announcements) ───────────────────────────────

const announcementEmbed = new EmbedBuilder()
  .setColor(0x10b981)
  .setTitle('🃏 NEW FEATURE: TCG Drop Intelligence is LIVE!')
  .setDescription(
    '**We just launched the most requested feature — real-time TCG drop tracking for Target, Costco, Sam\'s Club, and Walmart.**\n\n' +
    'No more refreshing pages. No more missing drops because you didn\'t know when the truck arrived.\n\u200B'
  )
  .addFields(
    {
      name: '📅 What\'s new',
      value:
        '• **Drop calendar** at **[blue42bots.com/drops](https://blue42bots.com/drops)** — see upcoming Pokemon TCG set releases + retailer restock windows\n' +
        '• **#release-alerts** — community alerts channel for same-day restock sightings\n' +
        '• **Weekly schedule posts** every Monday so you know exactly when to watch each retailer',
      inline: false,
    },
    {
      name: '🎯 Target',
      value: 'Restocks **Thursday–Friday** at store open. Pair with the **Target Lightning Bot** to auto-checkout the moment it lands.',
      inline: true,
    },
    {
      name: '🏪 Costco',
      value: 'Seasonal / warehouse events. Stock sells in **hours**. The **Costco Checkout Bot** catches it before manual shoppers can.',
      inline: true,
    },
    {
      name: '\u200B',
      value: '\u200B',
      inline: false,
    },
    {
      name: '🔔 How to get drop alerts',
      value:
        '1. **Right-click #release-alerts** → Notification Settings → All Messages\n' +
        '2. You\'ll be pinged the moment a community member spots a drop\n' +
        '3. With your Blue42 bot already running, checkout happens automatically',
      inline: false,
    },
    {
      name: '📣 You can help too!',
      value:
        'If you spot TCG stock at any retailer, **post it in #release-alerts** with:\n' +
        '> `📍 Store | 🏪 Location | 🃏 Product | ⏰ Time`\n' +
        'Example: `📍 Target | 🏪 Miami FL | 🃏 Prismatic Evolutions ETBs | ⏰ 8:30am`',
      inline: false,
    }
  )
  .setFooter({ text: 'Blue42 — Pokemon Checkout Bots & TCG Drop Intelligence • blue42bots.com' })
  .setTimestamp();

// ── Release-alerts embed (goes to #release-alerts) ────────────────────────────

const releaseAlertsEmbed = new EmbedBuilder()
  .setColor(0x5865f2)
  .setTitle('👋 Welcome to #release-alerts — Your TCG Drop Intelligence Feed')
  .setDescription(
    'This channel is your early warning system for Pokemon TCG drops at **Target, Costco, Sam\'s Club, and Walmart**.\n\u200B'
  )
  .addFields(
    {
      name: '📌 How this channel works',
      value:
        '• **Weekly restock schedules** are posted every Monday\n' +
        '• **Community members post** when they spot stock in-store or online\n' +
        '• **Set release alerts** are posted ahead of major TCG launches\n' +
        '• The earlier you know → the faster your bot can act',
      inline: false,
    },
    {
      name: '🗓️ Known restock windows',
      value:
        '🎯 **Target** — Thu/Fri at store open (8–10am local)\n' +
        '🏪 **Costco** — Seasonal, warehouse events, Q4\n' +
        '🛒 **Sam\'s Club** — Seasonal, similar to Costco\n' +
        '🏬 **Walmart** — Tue/Wed overnight, online at 8am EST',
      inline: false,
    },
    {
      name: '📣 Posting a drop? Use this format',
      value:
        '```\n📍 RETAILER | 🏪 City, State | 🃏 Product | ⏰ Time spotted\n```\n' +
        'Example: `📍 Target | 🏪 Austin TX | 🃏 Surging Sparks booster bundles | ⏰ 9:15am`',
      inline: false,
    },
    {
      name: '🔗 Useful links',
      value:
        '📅 [Full drop calendar](https://blue42bots.com/drops)\n' +
        '🤖 [Get a checkout bot](https://blue42bots.com/bots)\n' +
        '📖 [Setup guides](https://blue42bots.com/how-to)',
      inline: false,
    }
  )
  .setFooter({ text: 'Blue42 Drop Intelligence • blue42bots.com/drops' })
  .setTimestamp();

// ── Main ─────────────────────────────────────────────────────────────────────

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  try {
    const guild = await client.guilds.fetch(SERVER_ID);
    const channels = await guild.channels.fetch();

    // Find channels by name
    const announcementsChannel = channels.find(
      (c) => c.isTextBased() && c.name === 'announcements'
    );
    const releaseAlertsChannel = channels.find(
      (c) => c.isTextBased() && (c.name === 'release-alerts' || c.name === 'drop-alerts')
    );

    if (announcementsChannel) {
      await announcementsChannel.send({ embeds: [announcementEmbed] });
      console.log('✅ Posted announcement to #announcements');
    } else {
      console.warn('⚠️  #announcements channel not found — skipping');
    }

    if (releaseAlertsChannel) {
      await releaseAlertsChannel.send({ embeds: [releaseAlertsEmbed] });
      console.log('✅ Posted welcome embed to #release-alerts');
    } else {
      console.warn('⚠️  #release-alerts channel not found — skipping');
    }

    console.log('\n🎉 Done! Feature announcement complete.');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.destroy();
    process.exit(0);
  }
});

client.login(BOT_TOKEN);
