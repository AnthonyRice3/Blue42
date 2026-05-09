/**
 * Blue42 Discord Bot — Persistent Process
 *
 * Handles:
 *   1. Reaction-based verification in #rules   → grants ✅ Verified role
 *   2. Ticket system in #support               → button opens private ticket channel
 *
 * Requirements (Discord Developer Portal → your app → Bot):
 *   ✅ SERVER MEMBERS INTENT must be enabled (Privileged Gateway Intents)
 *   ✅ MESSAGE CONTENT INTENT must be enabled (Privileged Gateway Intents)
 *
 * Run:
 *   node discord-bot.js
 *
 * Keep alive (recommended):
 *   pm2 start discord-bot.js --name "blue42-bot"
 *   pm2 save
 *   pm2 startup
 */

require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
  Events,
} = require('discord.js');

const BOT_TOKEN = process.env.BOT_TOKEN;
const SERVER_ID = process.env.DISCORD_SERVER_ID;

if (!BOT_TOKEN) {
  console.error('❌ Missing BOT_TOKEN in .env');
  process.exit(1);
}
if (!SERVER_ID) {
  console.error('❌ Missing DISCORD_SERVER_ID in .env');
  process.exit(1);
}

// ─── Config ──────────────────────────────────────────────────────────────────
const VERIFIED_ROLE_NAME = '✅ Verified';
const VERIFY_EMOJI = '✅';
const RULES_CHANNEL_NAME = 'rules';
const SUPPORT_CHANNEL_NAME = 'support';
const TICKET_CATEGORY_NAME = '🎟️ SUPPORT TICKETS';
const STAFF_ROLE_NAMES = ['🔴 Owner', '🟠 Admin', '🟡 Moderator'];

// ID of the verification message in #rules (populated on ready)
let verifyMessageId = null;

// ─── Client ───────────────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,       // Privileged — enable in dev portal
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,     // Privileged — enable in dev portal
  ],
  // Partials allow us to handle reactions on messages that weren't cached
  // (e.g. messages posted before the bot started)
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// ─── Ready ────────────────────────────────────────────────────────────────────
client.once(Events.ClientReady, async () => {
  console.log(`\n✅ Blue42 Bot online as ${client.user.tag}`);
  console.log(`   Server ID: ${SERVER_ID}\n`);

  try {
    const guild = await client.guilds.fetch(SERVER_ID);
    await setupVerification(guild);
    await setupTicketPanel(guild);
  } catch (err) {
    console.error('❌ Startup error:', err.message);
  }
});

// ─── Verification Setup ───────────────────────────────────────────────────────
async function setupVerification(guild) {
  const channels = await guild.channels.fetch();
  const rulesChannel = channels.find(
    (ch) => ch && ch.name === RULES_CHANNEL_NAME && ch.isTextBased()
  );

  if (!rulesChannel) {
    console.log('⚠️  #rules channel not found — skipping verification setup');
    return;
  }

  // Check if we already posted a verify message
  const recent = await rulesChannel.messages.fetch({ limit: 20 });
  const existing = recent.find(
    (m) =>
      m.author.id === client.user.id &&
      m.embeds.length > 0 &&
      m.embeds[0].title?.includes('Verify')
  );

  if (existing) {
    verifyMessageId = existing.id;
    // Make sure the ✅ reaction is still there
    if (!existing.reactions.cache.has(VERIFY_EMOJI)) {
      await existing.react(VERIFY_EMOJI).catch(() => {});
    }
    console.log(`✅ Verification message found in #rules (${verifyMessageId})`);
    return;
  }

  // Post a fresh verification message
  const verifyEmbed = new EmbedBuilder()
    .setColor(0x10b981)
    .setTitle('✅ Verify to Gain Access')
    .setDescription(
      '**React with ✅ below to confirm you\'ve read and agree to follow the rules above.**\n\n' +
      'After verifying you\'ll have access to all channels, support, and the community.'
    )
    .addFields(
      {
        name: '❓ Not working?',
        value:
          '• Click the ✅ reaction directly — do not type it\n' +
          '• Wait 5-10 seconds for the bot to process\n' +
          '• If still stuck, ping a @🟡 Moderator or open a ticket in #support',
        inline: false,
      }
    )
    .setFooter({ text: 'Blue42 — blue42bots.com' })
    .setTimestamp();

  const msg = await rulesChannel.send({ embeds: [verifyEmbed] });
  await msg.react(VERIFY_EMOJI);
  verifyMessageId = msg.id;
  console.log(`✅ Posted verification message to #rules (${verifyMessageId})`);
}

// ─── Ticket Panel Setup ───────────────────────────────────────────────────────
async function setupTicketPanel(guild) {
  const channels = await guild.channels.fetch();
  let supportChannel = channels.find(
    (ch) => ch && ch.name === SUPPORT_CHANNEL_NAME && ch.isTextBased()
  );

  if (!supportChannel) {
    // Find the WELCOME & INFO category so #support is visible at the top
    const welcomeCategory = guild.channels.cache.find(
      (ch) => ch.type === ChannelType.GuildCategory && ch.name.toLowerCase().includes('welcome')
    );

    // #support must be visible to everyone (even unverified) so they can open tickets.
    // Only the bot can send messages — members interact via button only.
    supportChannel = await guild.channels.create({
      name: SUPPORT_CHANNEL_NAME,
      type: ChannelType.GuildText,
      topic: 'Click the button below to open a private support ticket with staff.',
      parent: welcomeCategory?.id ?? null,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
          deny: [PermissionFlagsBits.SendMessages],
        },
      ],
      reason: 'Blue42 Bot — ticket system setup',
    });
    console.log('✅ Created #support channel');
  } else {
    // Fix permissions on an existing channel that may have been created without them
    await supportChannel.permissionOverwrites.edit(guild.roles.everyone, {
      ViewChannel: true,
      ReadMessageHistory: true,
      SendMessages: false,
    });
    console.log('✅ Updated #support channel permissions');
  }

  // Don't double-post the ticket panel
  const recentSupport = await supportChannel.messages.fetch({ limit: 10 });
  const existingPanel = recentSupport.find(
    (m) => m.author.id === client.user.id && m.components.length > 0
  );

  if (existingPanel) {
    console.log('✅ Ticket panel already exists in #support');
    return;
  }

  const ticketEmbed = new EmbedBuilder()
    .setColor(0x0ea5e9)
    .setTitle('🎟️ Blue42 Support Tickets')
    .setDescription(
      'Need help with setup, your license, billing, or anything else?\n\n' +
      'Click **Open Ticket** below to start a private conversation with staff.'
    )
    .addFields(
      {
        name: '⚡ Response Times',
        value:
          '• Free members — 24-48 hours\n' +
          '• 💎 VIP — 4-8 hours\n' +
          '• 👑 Elite — 1-2 hours\n' +
          '• 💰 Pro — <1 hour (priority)',
        inline: false,
      },
      {
        name: '📋 Before Opening a Ticket',
        value:
          '• Check <#faq> for common answers\n' +
          '• Check <#setup-guides> for setup help\n' +
          '• Open **one ticket only** — duplicate tickets slow response times',
        inline: false,
      }
    )
    .setFooter({ text: 'Blue42 Support — blue42bots.com' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('open_ticket')
      .setLabel('🎟️ Open Support Ticket')
      .setStyle(ButtonStyle.Primary)
  );

  await supportChannel.send({ embeds: [ticketEmbed], components: [row] });
  console.log('✅ Posted ticket panel to #support');
}

// ─── Reaction Add → Verification ─────────────────────────────────────────────
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot) return;

  // Fetch partial objects (reactions on old/uncached messages)
  if (reaction.partial) {
    try { await reaction.fetch(); } catch { return; }
  }
  if (reaction.message.partial) {
    try { await reaction.message.fetch(); } catch { return; }
  }

  // Only act on the specific verification message
  if (reaction.message.id !== verifyMessageId) return;
  if (reaction.emoji.name !== VERIFY_EMOJI) return;

  try {
    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id);

    const verifiedRole = guild.roles.cache.find((r) => r.name === VERIFIED_ROLE_NAME);
    if (!verifiedRole) {
      console.log('⚠️  Could not find the Verified role — make sure it exists in the server');
      return;
    }

    if (member.roles.cache.has(verifiedRole.id)) {
      console.log(`ℹ️  ${user.tag} already has Verified role`);
      return;
    }

    await member.roles.add(verifiedRole);
    console.log(`✅ Verified: ${user.tag}`);

    // DM confirmation (silently ignore if user has DMs disabled)
    await user
      .send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x10b981)
            .setTitle('✅ You\'re Verified!')
            .setDescription(
              'Welcome to **Blue42**! You now have full access to the server. 🎉\n\n' +
              'Here\'s how to get started:'
            )
            .addFields({
              name: '🚀 Quick Start',
              value:
                '1. Browse bots at **blue42bots.com**\n' +
                '2. Check #setup-guides for setup instructions\n' +
                '3. Chat in #general-chat\n' +
                '4. Open a ticket in #support if you need help',
            })
            .setFooter({ text: 'Blue42 — blue42bots.com' }),
        ],
      })
      .catch(() => {});
  } catch (err) {
    console.error('❌ Verification error:', err.message);
  }
});

// ─── Interactions → Tickets ───────────────────────────────────────────────────
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'open_ticket') {
    await handleOpenTicket(interaction);
  } else if (interaction.customId === 'close_ticket') {
    await handleCloseTicket(interaction);
  }
});

async function handleOpenTicket(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const guild = interaction.guild;
  const member = interaction.member;
  const username = member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Block if user already has an open ticket
  const channels = await guild.channels.fetch();
  const existingTicket = channels.find(
    (ch) =>
      ch &&
      ch.type === ChannelType.GuildText &&
      ch.name.startsWith(`ticket-${username}-`) &&
      ch.parentId
  );

  if (existingTicket) {
    return interaction.editReply({
      content:
        `❌ You already have an open ticket: <#${existingTicket.id}>\n` +
        'Please resolve or close your current ticket before opening a new one.',
    });
  }

  // Ensure the ticket category exists
  let ticketCategory = guild.channels.cache.find(
    (ch) => ch.type === ChannelType.GuildCategory && ch.name === TICKET_CATEGORY_NAME
  );

  if (!ticketCategory) {
    ticketCategory = await guild.channels.create({
      name: TICKET_CATEGORY_NAME,
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: [PermissionFlagsBits.ViewChannel],
        },
      ],
      reason: 'Blue42 Bot — support ticket category',
    });
    console.log('✅ Created ticket category');
  }

  // Build permission overwrites: staff + the user only
  const permissionOverwrites = [
    { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
    {
      id: member.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
      ],
    },
  ];

  // Add each staff role
  for (const roleName of STAFF_ROLE_NAMES) {
    const staffRole = guild.roles.cache.find((r) => r.name === roleName);
    if (staffRole) {
      permissionOverwrites.push({
        id: staffRole.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.ManageMessages,
        ],
      });
    }
  }

  // Create the ticket channel
  const ticketName = `ticket-${username}-${Date.now().toString().slice(-5)}`;
  let ticketChannel;

  try {
    ticketChannel = await guild.channels.create({
      name: ticketName,
      type: ChannelType.GuildText,
      parent: ticketCategory.id,
      permissionOverwrites,
      reason: `Support ticket for ${member.user.tag}`,
    });
  } catch (err) {
    console.error('❌ Could not create ticket channel:', err.message);
    return interaction.editReply({
      content: '❌ Failed to create your ticket channel. Please ping a @🟡 Moderator directly.',
    });
  }

  // Post the welcome message inside the ticket channel
  const openEmbed = new EmbedBuilder()
    .setColor(0x0ea5e9)
    .setTitle('🎟️ Support Ticket Opened')
    .setDescription(
      `Hello <@${member.user.id}>! A staff member will assist you as soon as possible.\n\n` +
      '**Please describe your issue in detail:**\n' +
      '• Which bot are you using?\n' +
      '• What is the problem?\n' +
      '• What have you already tried?'
    )
    .addFields({
      name: '📋 Ticket Info',
      value: `Opened by <@${member.user.id}> • ${new Date().toUTCString()}`,
    })
    .setFooter({ text: 'Blue42 Support — click Close Ticket when resolved' })
    .setTimestamp();

  const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('🔒 Close Ticket')
      .setStyle(ButtonStyle.Danger)
  );

  await ticketChannel.send({
    content: `<@${member.user.id}> — ticket created. Staff will respond shortly.`,
    embeds: [openEmbed],
    components: [closeRow],
  });

  await interaction.editReply({
    content: `✅ Ticket created: <#${ticketChannel.id}>`,
  });

  console.log(`🎟️  Ticket opened by ${member.user.tag} → #${ticketName}`);
}

async function handleCloseTicket(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const channel = interaction.channel;

  if (!channel.name.startsWith('ticket-')) {
    return interaction.editReply({
      content: '❌ This button only works inside a ticket channel.',
    });
  }

  const closedEmbed = new EmbedBuilder()
    .setColor(0xef4444)
    .setTitle('🔒 Ticket Closed')
    .setDescription(
      `Closed by <@${interaction.user.id}>.\n\n` +
      'Thank you for contacting Blue42 support! If you need further help, open a new ticket in <#support>.'
    )
    .setTimestamp();

  await channel.send({ embeds: [closedEmbed] });

  // Wait 5 seconds so the user can read the message, then delete the channel
  setTimeout(async () => {
    await channel.delete(`Ticket closed by ${interaction.user.tag}`).catch(() => {});
  }, 5000);

  await interaction.editReply({ content: '✅ Ticket closed — this channel will be removed in 5 seconds.' });
  console.log(`🔒 Ticket closed by ${interaction.user.tag} → #${channel.name}`);
}

// ─── Login ────────────────────────────────────────────────────────────────────
client.login(BOT_TOKEN).catch((err) => {
  console.error('❌ Login failed:', err.message);
  console.error('   Check BOT_TOKEN in .env and that the bot is invited to the server.');
  process.exit(1);
});
