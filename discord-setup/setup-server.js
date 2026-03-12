const { Client, GatewayIntentBits, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');

// Load configuration
const config = JSON.parse(fs.readFileSync('./setup-config.json', 'utf8'));

if (config.botToken === 'YOUR_BOT_TOKEN_HERE' || config.serverId === 'YOUR_SERVER_ID_HERE') {
  console.error('❌ Error: Please update setup-config.json with your bot token and server ID');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ]
});

// Role definitions with colors and permissions
const roles = [
  // Admin roles
  { name: '🔴 Owner', color: 0xDC2626, permissions: [PermissionFlagsBits.Administrator], position: 15 },
  { name: '🟠 Admin', color: 0xEA580C, permissions: [PermissionFlagsBits.ManageGuild, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles, PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers], position: 14 },
  { name: '🟡 Moderator', color: 0xFACC15, permissions: [PermissionFlagsBits.KickMembers, PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ManageMessages], position: 13 },
  
  // Premium roles
  { name: '💰 Blue42 Pro', color: 0xA855F7, permissions: [], position: 12 },
  { name: '👑 Blue42 Elite', color: 0xF59E0B, permissions: [], position: 11 },
  { name: '💎 Blue42 VIP', color: 0x0EA5E9, permissions: [], position: 10 },
  
  // Member roles
  { name: '✅ Verified', color: 0x10B981, permissions: [], position: 9 },
  { name: '🤖 Bot Owner', color: 0x3B82F6, permissions: [], position: 8 },
  { name: '🎯 Costco Bot User', color: 0x6366F1, permissions: [], position: 7 },
  { name: '⚡ Target Bot User', color: 0xEC4899, permissions: [], position: 6 },
  { name: '📊 Eth Bot User', color: 0x8B5CF6, permissions: [], position: 5 },
  
  // Activity roles
  { name: '🆕 New Member', color: 0x94A3B8, permissions: [], position: 4 },
  { name: '💬 Active Member', color: 0x22D3EE, permissions: [], position: 3 },
  { name: '🏆 Success Story', color: 0xFBBF24, permissions: [], position: 2 },
  { name: '🎓 Helper', color: 0x34D399, permissions: [], position: 1 },
];

// Channel structure
const categories = [
  {
    name: '🏠 WELCOME & INFO',
    channels: [
      { name: 'welcome', type: ChannelType.GuildText, topic: 'Welcome to Blue42! Read the rules and get verified.' },
      { name: 'announcements', type: ChannelType.GuildAnnouncement, topic: 'Official announcements, updates, and new bot releases' },
      { name: 'rules', type: ChannelType.GuildText, topic: 'Server rules and guidelines - please read!' },
      { name: 'faq', type: ChannelType.GuildText, topic: 'Frequently asked questions about bots and the server' },
      { name: 'roadmap', type: ChannelType.GuildText, topic: 'Upcoming features and bot releases' },
    ]
  },
  {
    name: '💬 GENERAL',
    channels: [
      { name: 'general-chat', type: ChannelType.GuildText, topic: 'General discussion about bots and Pokemon TCG' },
      { name: 'bot-showcase', type: ChannelType.GuildText, topic: 'Share your successful checkouts and wins! 🎉' },
      { name: 'release-alerts', type: ChannelType.GuildText, topic: 'Pokemon/TCG release dates and alerts' },
      { name: 'off-topic', type: ChannelType.GuildText, topic: 'Non-bot related chat and memes' },
    ]
  },
  {
    name: '🤖 BOT SUPPORT',
    channels: [
      { name: 'costco-bot-support', type: ChannelType.GuildText, topic: 'Costco Checkout Bot help and questions' },
      { name: 'target-bot-support', type: ChannelType.GuildText, topic: 'Target Lightning Bot help and questions' },
      { name: 'eth-bot-support', type: ChannelType.GuildText, topic: 'Eth PnL Trading Bot help and questions' },
      { name: 'general-bot-support', type: ChannelType.GuildText, topic: 'General bot questions and technical support' },
    ]
  },
  {
    name: '👑 VIP SUPPORT',
    vipOnly: true,
    channels: [
      { name: 'vip-support', type: ChannelType.GuildText, topic: 'Priority support for VIP, Elite, and Pro members' },
      { name: 'vip-bot-updates', type: ChannelType.GuildText, topic: 'Early access to bot updates and beta features' },
      { name: 'vip-strategies', type: ChannelType.GuildText, topic: 'Advanced tips, strategies, and optimization techniques' },
      { name: 'vip-lounge', type: ChannelType.GuildText, topic: 'Exclusive chat for VIP members' },
    ]
  },
  {
    name: '📊 ANALYTICS & UPDATES',
    channels: [
      { name: 'success-stories', type: ChannelType.GuildText, topic: 'Share your success stories and big wins!' },
      { name: 'bot-status', type: ChannelType.GuildText, topic: 'Bot uptime and status updates' },
      { name: 'maintenance', type: ChannelType.GuildText, topic: 'Scheduled maintenance notifications' },
    ]
  },
  {
    name: '💰 AFFILIATE PROGRAM',
    channels: [
      { name: 'affiliate-info', type: ChannelType.GuildText, topic: '📢 Earn 20-35% commission promoting Blue42! Apply at blue42bots.com/affiliate' },
      { name: 'affiliate-applications', type: ChannelType.GuildText, topic: 'Submit your affiliate application and get approved' },
      { name: 'affiliate-resources', type: ChannelType.GuildText, topic: 'Marketing materials, banners, and promotional content' },
      { name: 'affiliate-lounge', type: ChannelType.GuildText, topic: 'Chat and collaboration space for approved affiliates' },
    ]
  },
  {
    name: '🎓 TUTORIALS',
    channels: [
      { name: 'setup-guides', type: ChannelType.GuildText, topic: 'Step-by-step bot setup guides' },
      { name: 'video-tutorials', type: ChannelType.GuildText, topic: 'Video tutorial links and walkthroughs' },
      { name: 'tips-and-tricks', type: ChannelType.GuildText, topic: 'Pro tips for better results' },
    ]
  },
  {
    name: '🎮 COMMUNITY',
    channels: [
      { name: 'partnerships', type: ChannelType.GuildText, topic: 'Partnership opportunities and collaborations' },
      { name: 'feedback', type: ChannelType.GuildText, topic: 'Feature requests and feedback' },
      { name: 'memes', type: ChannelType.GuildText, topic: 'Memes and fun - keep it clean!' },
    ]
  },
  {
    name: '🔊 VOICE',
    channels: [
      { name: 'General Voice', type: ChannelType.GuildVoice },
      { name: 'Support Session', type: ChannelType.GuildVoice },
      { name: 'VIP Voice', type: ChannelType.GuildVoice, vipOnly: true },
    ]
  },
];

let createdRoles = {};

async function setupServer() {
  try {
    const guild = await client.guilds.fetch(config.serverId);
    console.log(`\n🚀 Setting up server: ${guild.name}\n`);

    // Step 1: Create roles
    console.log('📝 Creating roles...');
    for (const roleData of roles) {
      try {
        const role = await guild.roles.create({
          name: roleData.name,
          color: roleData.color,
          permissions: roleData.permissions,
          reason: 'Blue42 automated server setup',
        });
        createdRoles[roleData.name] = role;
        console.log(`   ✅ Created role: ${roleData.name}`);
      } catch (error) {
        console.log(`   ⚠️  Role may already exist: ${roleData.name}`);
      }
    }

    console.log(`\n✅ Created ${Object.keys(createdRoles).length} roles\n`);

    // Step 2: Create categories and channels
    console.log('📂 Creating categories and channels...\n');
    
    for (const category of categories) {
      try {
        // Create category
        const categoryChannel = await guild.channels.create({
          name: category.name,
          type: ChannelType.GuildCategory,
          reason: 'Blue42 automated server setup',
        });

        console.log(`   📁 Created category: ${category.name}`);

        // Set up VIP permissions if needed
        if (category.vipOnly) {
          await categoryChannel.permissionOverwrites.edit(guild.roles.everyone, {
            ViewChannel: false,
          });
          
          // Allow VIP, Elite, Pro, Admin, Mod
          const vipRoles = ['💎 Blue42 VIP', '👑 Blue42 Elite', '💰 Blue42 Pro', '🟠 Admin', '🟡 Moderator'];
          for (const roleName of vipRoles) {
            if (createdRoles[roleName]) {
              await categoryChannel.permissionOverwrites.edit(createdRoles[roleName], {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
              });
            }
          }
        } else {
          // Public categories - require Verified role
          await categoryChannel.permissionOverwrites.edit(guild.roles.everyone, {
            ViewChannel: false,
          });
          
          if (createdRoles['✅ Verified']) {
            await categoryChannel.permissionOverwrites.edit(createdRoles['✅ Verified'], {
              ViewChannel: true,
              SendMessages: true,
              ReadMessageHistory: true,
            });
          }
        }

        // Create channels in category
        for (const channelData of category.channels) {
          try {
            const channel = await guild.channels.create({
              name: channelData.name,
              type: channelData.type,
              parent: categoryChannel.id,
              topic: channelData.topic || undefined,
              reason: 'Blue42 automated server setup',
            });

            // Special permissions for certain channels
            if (channelData.name === 'welcome' || channelData.name === 'rules' || channelData.name === 'announcements') {
              // Read-only for everyone
              await channel.permissionOverwrites.edit(guild.roles.everyone, {
                ViewChannel: true,
                SendMessages: false,
                ReadMessageHistory: true,
              });
              
              if (createdRoles['🟠 Admin']) {
                await channel.permissionOverwrites.edit(createdRoles['🟠 Admin'], {
                  SendMessages: true,
                });
              }
            }

            // VIP-only voice channel
            if (channelData.vipOnly && channelData.type === ChannelType.GuildVoice) {
              await channel.permissionOverwrites.edit(guild.roles.everyone, {
                ViewChannel: false,
              });
              
              const vipRoles = ['💎 Blue42 VIP', '👑 Blue42 Elite', '💰 Blue42 Pro', '🟠 Admin', '🟡 Moderator'];
              for (const roleName of vipRoles) {
                if (createdRoles[roleName]) {
                  await channel.permissionOverwrites.edit(createdRoles[roleName], {
                    ViewChannel: true,
                    Connect: true,
                    Speak: true,
                  });
                }
              }
            }

            console.log(`      ✅ Created channel: #${channelData.name}`);
          } catch (error) {
            console.log(`      ⚠️  Channel may already exist: ${channelData.name}`);
          }
        }

        console.log('');
      } catch (error) {
        console.log(`   ⚠️  Category may already exist: ${category.name}\n`);
      }
    }

    console.log('\n🎉 Server setup complete!\n');
    console.log('Next steps:');
    console.log('1. Upload server icon (Blue42 logo)');
    console.log('2. Set up welcome message in #welcome');
    console.log('3. Add server rules in #rules');
    console.log('4. Configure verification system');
    console.log('5. Add additional bots (MEE6, Carl-bot, etc.)');
    console.log('\nSee post-setup-guide.md for detailed next steps.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up server:', error);
    process.exit(1);
  }
}

client.once('ready', () => {
  console.log(`\n✅ Bot logged in as ${client.user.tag}\n`);
  setupServer();
});

client.login(config.botToken);
