/**
 * announce-dashboard-update.js
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time script to announce the new Member Dashboard sidebar update
 * in Blue42's #announcements channel.
 *
 * Usage (from discord-setup folder):
 *   node announce-dashboard-update.js
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

const announcementEmbed = new EmbedBuilder()
  .setColor(0x6366f1)
  .setTitle('🚀 Member Dashboard — Major Update Live!')
  .setDescription(
    '**Your Blue42 dashboard just got a big upgrade.**\n\n' +
    'We completely redesigned the member dashboard at **[blue42bots.com/dashboard](https://blue42bots.com/dashboard)** ' +
    'with a new sidebar navigation and dedicated sections for everything you need.\n\u200B'
  )
  .addFields(
    {
      name: '🗂️ What\'s new',
      value:
        '**Sidebar navigation** with 6 dedicated tabs — no more hunting around for features:\n\u200B',
      inline: false,
    },
    {
      name: '🔑 Licenses',
      value:
        'View all your bot licenses, copy license keys, track downloads, and download your bots — all in one place.',
      inline: true,
    },
    {
      name: '📊 Analytics',
      value:
        'Per-bot download usage, license health overview (active / exhausted / inactive), and recent purchase timeline.',
      inline: true,
    },
    {
      name: '\u200B',
      value: '\u200B',
      inline: false,
    },
    {
      name: '🔔 Alerts & Drops',
      value:
        'Quick access to the TCG drop feed, Discord alert channels, and a setup checklist to make sure you never miss a restock.',
      inline: true,
    },
    {
      name: '🤝 Affiliates',
      value:
        'Your referral link, QR code, earnings stats, tier progress, and full referral history — all in one tab.',
      inline: true,
    },
    {
      name: '\u200B',
      value: '\u200B',
      inline: false,
    },
    {
      name: '🆘 Support',
      value:
        'Quick links to Discord, setup guides, and FAQ. Also includes access to your **billing portal** to manage payment details and invoices.',
      inline: true,
    },
    {
      name: '⚙️ Settings',
      value:
        'Your profile, account security, and notification preferences — all linked from one clean settings tab.',
      inline: true,
    },
    {
      name: '\u200B',
      value: '\u200B',
      inline: false,
    },
    {
      name: '👉 Check it out',
      value:
        '**[Open your dashboard →](https://blue42bots.com/dashboard)**\n\n' +
        'If you haven\'t purchased a bot yet, head to **[blue42bots.com/bots](https://blue42bots.com/bots)** to get started.',
      inline: false,
    }
  )
  .setFooter({ text: 'Blue42 — Premium Automation Solutions • blue42bots.com' })
  .setTimestamp();

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  try {
    const guild = await client.guilds.fetch(SERVER_ID);
    const channels = await guild.channels.fetch();

    const announcementsChannel = channels.find(
      (c) => c.isTextBased() && c.name === 'announcements'
    );

    if (announcementsChannel) {
      await announcementsChannel.send({ embeds: [announcementEmbed] });
      console.log('✅ Posted dashboard update announcement to #announcements');
    } else {
      console.warn('⚠️  #announcements channel not found — skipping');
    }

    console.log('\n🎉 Done!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.destroy();
    process.exit(0);
  }
});

client.login(BOT_TOKEN);
