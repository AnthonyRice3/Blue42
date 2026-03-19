const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

// Load configuration
const config = JSON.parse(fs.readFileSync('./setup-config.json', 'utf8'));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

// Current date for footers
const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

// ===== WELCOME CHANNEL =====
const welcomeEmbed = new EmbedBuilder()
  .setColor(0x0EA5E9)
  .setTitle('👋 Welcome to Blue42 - Premium Automation Solutions!')
  .setDescription('**The ultimate community for bot automation and checkout solutions**\n\nJoin hundreds of successful bot users securing limited products and maximizing efficiency!')
  .addFields(
    {
      name: '🤖 What We Do',
      value: 'Blue42 develops premium automation software for e-commerce, trading, and beyond. Our bots use cutting-edge technology to give you the competitive edge in securing high-demand products.',
      inline: false
    },
    {
      name: '🚀 Available Bots - $42.00 + $20.00/month',
      value: '**🎯 Target Lightning Bot**\nLightning-fast Target checkout with millisecond speeds\n\n**🛒 Costco Checkout Bot**\nAutomated Costco Pokemon & member deals\n\n**⚡ Pokemon Center Pro**\nSpecialized Pokemon Center automation with queue bypass\n\n**📈 Eth PnL Trading Bot**\nProfessional crypto trading with auto profit/loss management\n\n**🏪 Sams Club Elite**\nAdvanced Sams Club automation\n\n**💛 Best Buy Sniper**\nElectronics & GPU drops\n\n**🎮 GameStop Pro**\nGaming console & collectibles\n\n*...and more!*',
      inline: false
    },
    {
      name: '🎯 Getting Started',
      value: '1️⃣ Read <#rules> and verify with ✅ reaction\n2️⃣ Visit **blue42bots.com** to purchase your first bot\n3️⃣ Check <#setup-guides> for detailed setup instructions\n4️⃣ Get support in bot-specific channels\n5️⃣ Join <#general-chat> to connect with the community',
      inline: false
    },
    {
      name: '💎 Premium Membership Tiers',
      value: '**VIP** - $9.99/month\n• Priority support (4-8 hour response)\n• Early access to new bots\n• Exclusive tips and strategies\n• VIP-only channels\n\n**Elite** - $19.99/month\n• Everything in VIP\n• 1-on-1 setup assistance via screen share\n• Custom bot configurations\n• Advanced automation strategies\n• Direct discord access to team\n\n**Pro** - $49.99/month\n• Everything in Elite\n• Direct developer access\n• Beta test new bots before release\n• Reseller opportunities & wholesale pricing\n• Custom development requests\n• Priority feature requests',
      inline: false
    },
    {
      name: '🔗 Quick Links',
      value: '🌐 Website: **blue42bots.com**\n📚 How-To Guides: **blue42bots.com/how-to**\n📊 Dashboard: **blue42bots.com/dashboard**\n💰 Affiliate Program: **blue42bots.com/affiliate**\n🎟️ Support: Open a ticket in <#support>',
      inline: false
    }
  )
  .setFooter({ text: `React below to verify and gain access to all channels ✅ • ${currentDate}` })
  .setTimestamp();

// ===== RULES CHANNEL =====
const rulesEmbed = new EmbedBuilder()
  .setColor(0xDC2626)
  .setTitle('📜 Blue42 Community Rules')
  .setDescription('**Read and follow these rules to maintain access to our community**\n\nViolations may result in warnings, temporary mutes, or permanent bans.')
  .addFields(
    {
      name: '1️⃣ Be Respectful & Professional',
      value: '• Treat all members with respect\n• No harassment, hate speech, or discrimination\n• No personal attacks or insults\n• Keep discussions constructive\n• Respect staff decisions',
      inline: false
    },
    {
      name: '2️⃣ No Spamming or Self-Promotion',
      value: '• Don\'t spam messages, emojis, or @mentions\n• No advertising other Discord servers\n• No promoting competing bot services\n• No unsolicited DMs to members\n• Affiliate links only in designated channels',
      inline: false
    },
    {
      name: '3️⃣ Use Appropriate Channels',
      value: '• Keep discussions in relevant channels\n• Bot-specific questions go in bot support channels\n• General chat for non-bot topics\n• Showcase only for sharing success/wins\n• No off-topic spam in support channels',
      inline: false
    },
    {
      name: '4️⃣ No Illegal Activity or Piracy',
      value: '• No sharing cracked/pirated software\n• Don\'t ask for or share license keys\n• No discussion of illegal activities\n• Don\'t share methods to bypass payment\n• Follow all applicable laws and ToS',
      inline: false
    },
    {
      name: '5️⃣ Protect Your Account Security',
      value: '• Never share your license key publicly\n• Don\'t give login credentials to anyone\n• Staff will NEVER ask for passwords\n• Report suspicious DMs to moderators\n• Enable 2FA on Discord and Blue42 accounts',
      inline: false
    },
    {
      name: '6️⃣ No Reselling Without Permission',
      value: '• Don\'t resell Blue42 bots without authorization\n• Pro members: Contact us for reseller terms\n• Affiliates: Use official affiliate program only\n• No selling accounts or licenses\n• Report unauthorized sellers',
      inline: false
    },
    {
      name: '7️⃣ Keep Personal Info Private',
      value: '• Don\'t share personal information publicly\n• No posting credit card details\n• No sharing others\' private information\n• Use DMs for sensitive account issues\n• Open support tickets for account help',
      inline: false
    },
    {
      name: '8️⃣ English Language Only',
      value: '• All public channels must be in English\n• This helps moderators enforce rules\n• Non-English is fine in private DMs\n• Translation tools are okay for understanding',
      inline: false
    },
    {
      name: '9️⃣ No NSFW or Inappropriate Content',
      value: '• Keep content safe for work (SFW)\n• No explicit images, videos, or links\n• No inappropriate profile pictures\n• No offensive usernames\n• This is a professional community',
      inline: false
    },
    {
      name: '🔟 Listen to Staff & Follow Discord ToS',
      value: '• Follow all moderator instructions\n• Staff has final say in disputes\n• Follow Discord\'s Terms of Service\n• Follow Discord\'s Community Guidelines\n• Report rule violations to staff',
      inline: false
    }
  )
  .setFooter({ text: `Questions? Ask in #support • ${currentDate}` })
  .setTimestamp();

const verificationEmbed = new EmbedBuilder()
  .setColor(0x10B981)
  .setTitle('✅ Verify to Gain Access')
  .setDescription('**React with ✅ below to confirm you\'ve read and agree to follow the rules**')
  .addFields(
    {
      name: 'What Happens After Verification?',
      value: '• Access to all public channels\n• Ability to chat and ask questions\n• View bot showcases and tips\n• Get help in support channels\n• Join the community!',
      inline: false
    },
    {
      name: 'Need Help?',
      value: 'If you don\'t get verified after reacting:\n• Make sure you clicked the ✅ reaction\n• Wait 5-10 seconds for the bot to respond\n• If still stuck, mention @Moderator in <#support>',
      inline: false
    },
    {
      name: '🚀 Quick Start After Verification',
      value: '1. Check <#announcements> for latest updates\n2. Visit **blue42bots.com** to purchase bots\n3. Read <#setup-guides> for installation help\n4. Join <#general-chat> to meet the community\n5. Share your wins in <#bot-showcase>!',
      inline: false
    }
  )
  .setFooter({ text: 'Welcome to Blue42! 🎉' })
  .setTimestamp();

// ===== ANNOUNCEMENTS CHANNEL =====
const announcementsEmbed = new EmbedBuilder()
  .setColor(0xF59E0B)
  .setTitle('📢 Latest Announcements - March 2026')
  .setDescription('Stay up to date with the latest news, updates, and important information from Blue42!')
  .addFields(
    {
      name: '🎉 New Pricing - More Affordable!',
      value: '**All Bots Now: $42.00 one-time + $20.00/month**\n\nWe\'ve standardized our pricing to make it easier to get started with automation! All retail and trading bots now have the same affordable pricing structure.\n\n✨ Better value\n✨ Simpler to understand\n✨ Same premium quality',
      inline: false
    },
    {
      name: '📚 New How-To Guides Page!',
      value: 'We\'ve launched comprehensive step-by-step guides for every bot!\n\n**Visit: blue42bots.com/how-to**\n\n• Detailed setup instructions for each bot\n• Configuration examples with screenshots\n• Pro tips and best practices\n• Troubleshooting guides\n• Advanced features explained\n\nCheck <#setup-guides> for Discord shortcuts!',
      inline: false
    },
    {
      name: '🚀 Growing Community - 500+ Members!',
      value: 'Thank you for making Blue42 one of the fastest-growing automation communities! \n\n• New members joining daily\n• Hundreds of successful checkouts weekly\n• Active support channels with fast responses\n• Community sharing tips and wins\n\nKeep sharing your success in <#bot-showcase>!',
      inline: false
    },
    {
      name: '🔧 Recent Bot Updates',
      value: '**Target Lightning Bot v1.3**\n• Improved checkout speed by 40%\n• Better anti-bot detection handling\n• New proxy rotation system\n\n**Costco Checkout Bot v1.1**\n• Enhanced Pokemon product detection\n• Warehouse pickup optimization\n• Better session management\n\n**Eth PnL Bot v1.1**\n• New trailing stop-loss feature\n• Gas optimization\n• Multi-wallet support',
      inline: false
    },
    {
      name: '⭐ What\'s Coming Next',
      value: '• Mac/Linux support (Beta testing soon)\n• Mobile app for monitoring bots\n• Advanced analytics dashboard\n• Amazon & Walmart bot updates\n• Discord bot for remote control\n\nPro members get early access! Check <#roadmap> for details.',
      inline: false
    },
    {
      name: '💰 Affiliate Program Update',
      value: 'Earn 5-20% recurring commission on every sale!\n\n• Easy signup at blue42bots.com/affiliate\n• Custom tracking links\n• Monthly payouts via Stripe\n• Top affiliates earning $500-$2000/month\n\nJoin <#affiliate-program> to learn more!',
      inline: false
    }
  )
  .setFooter({ text: `Last updated: ${currentDate} • Check this channel weekly for updates!` })
  .setTimestamp();

// ===== SETUP GUIDES CHANNEL =====
const setupMainEmbed = new EmbedBuilder()
  .setColor(0x8B5CF6)
  .setTitle('🛠️ Complete Bot Setup Guide')
  .setDescription('**Everything you need to get started with Blue42 bots**\n\nFollow these steps for a smooth setup experience!')
  .addFields(
    {
      name: '📖 Comprehensive Guides Available',
      value: '**Visit: blue42bots.com/how-to for full guides**\n\nOur new How-To page includes:\n• Step-by-step instructions with screenshots\n• Configuration examples\n• Video tutorials (coming soon)\n• Troubleshooting FAQs\n• Advanced tips and tricks',
      inline: false
    },
    {
      name: '🎯 Quick Start (All Bots)',
      value: '**1. Prerequisites**\n• Windows 10/11 (Mac/Linux coming soon)\n• Node.js 18+ installed\n• Active license from blue42bots.com\n• Stable internet (50+ Mbps recommended)\n\n**2. Download & Extract**\n• Log into your dashboard\n• Find your bot in "Your Licenses"\n• Click "Download Bot"\n• Extract ZIP to a folder\n\n**3. Install Dependencies**\n```\ncd path/to/bot-folder\nnpm install\n```\n\n**4. Configure**\n• Open config.json\n• Add your license key\n• Configure bot-specific settings\n• Save file\n\n**5. Launch**\n• Windows: Double-click Launch-Bot.bat\n• Or run: `npm start`\n• GUI opens in browser',
      inline: false
    }
  )
  .setFooter({ text: `Need help? Ask in bot-specific support channels • ${currentDate}` })
  .setTimestamp();

const targetSetupEmbed = new EmbedBuilder()
  .setColor(0xCC0000)
  .setTitle('🎯 Target Lightning Bot Setup')
  .setDescription('Fast checkout automation for Target.com')
  .addFields(
    {
      name: '⚙️ Configuration',
      value: '```json\n{\n  "licenseKey": "YOUR-KEY",\n  "target": {\n    "email": "your@email.com",\n    "password": "your-password",\n    "productUrl": "https://target.com/p/...",\n    "autoCheckout": true,\n    "maxPrice": 299.99,\n    "checkInterval": 5000\n  }\n}\n```',
      inline: false
    },
    {
      name: '💡 Pro Tips',
      value: '• Pre-save payment method in Target account\n• Use 5-second check interval (5000ms)\n• Enable 2FA on account for security\n• Check drops 3-6 AM EST for best results\n• Use proxies for multiple accounts',
      inline: false
    },
    {
      name: '📚 Full Guide',
      value: '**blue42bots.com/how-to** → Select "Target Lightning"',
      inline: false
    }
  )
  .setTimestamp();

const costcoSetupEmbed = new EmbedBuilder()
  .setColor(0x0051BA)
  .setTitle('🛒 Costco Checkout Bot Setup')
  .setDescription('Automated Costco checkout for Pokemon & exclusive deals')
  .addFields(
    {
      name: '⚠️ Requirements',
      value: '• Active Costco membership (required)\n• Saved payment method on Costco.com\n• Verified shipping address',
      inline: false
    },
    {
      name: '⚙️ Configuration',
      value: '```json\n{\n  "licenseKey": "YOUR-KEY",\n  "costco": {\n    "membershipNumber": "123456789012",\n    "email": "your@email.com",\n    "password": "your-password",\n    "productKeywords": ["pokemon", "charizard"],\n    "warehousePreference": "ship"\n  }\n}\n```',
      inline: false
    },
    {
      name: '💡 Pro Tips',
      value: '• Drops happen 9-11 AM PST on weekdays\n• Use warehouse pickup for better availability\n• Keywords: charizard, pikachu, booster box, elite trainer\n• Limit is 1-2 per membership for Pokemon',
      inline: false
    },
    {
      name: '📚 Full Guide',
      value: '**blue42bots.com/how-to** → Select "Costco Checkout"',
      inline: false
    }
  )
  .setTimestamp();

const ethSetupEmbed = new EmbedBuilder()
  .setColor(0x627EEA)
  .setTitle('📈 Eth PnL Trading Bot Setup')
  .setDescription('Automated Ethereum trading with profit/loss management')
  .addFields(
    {
      name: '⚠️ Important - High Risk',
      value: '**Never trade more than you can afford to lose!**\n\n• Test in SIMULATE mode first\n• Start with small amounts\n• Always use stop-loss\n• Monitor regularly',
      inline: false
    },
    {
      name: '⚙️ Configuration',
      value: '```json\n{\n  "licenseKey": "YOUR-KEY",\n  "ethereum": {\n    "mode": "simulate",\n    "walletPrivateKey": "YOUR_KEY",\n    "rpcEndpoint": "infura-or-alchemy-url"\n  },\n  "trading": {\n    "tradeAmount": "100",\n    "takeProfitPercent": 15,\n    "stopLossPercent": 5\n  }\n}\n```',
      inline: false
    },
    {
      name: '💡 Trading Modes',
      value: '**Simulate** - Test strategy, no real trades\n**Paper** - Real data, no execution\n**Live** - Real trading (use after testing!)',
      inline: false
    },
    {
      name: '📚 Full Guide',
      value: '**blue42bots.com/how-to** → Select "Eth PnL Trading"',
      inline: false
    }
  )
  .setTimestamp();

const troubleshootingEmbed = new EmbedBuilder()
  .setColor(0xEF4444)
  .setTitle('🔧 Common Issues & Solutions')
  .setDescription('Quick fixes for the most common problems')
  .addFields(
    {
      name: '❌ "License Invalid" Error',
      value: '**Solution:**\n• Copy license key from dashboard (no spaces)\n• Ensure license is active (check subscription)\n• Verify you\'re using the correct bot\n• Try re-downloading from dashboard',
      inline: false
    },
    {
      name: '❌ "npm install" Fails',
      value: '**Solution:**\n• Ensure Node.js 18+ is installed\n• Run `node --version` to check\n• Run Command Prompt as Administrator\n• Delete node_modules folder and try again',
      inline: false
    },
    {
      name: '❌ Bot Won\'t Start',
      value: '**Solution:**\n• Check config.json for syntax errors\n• Ensure all required fields are filled\n• Look for error messages in terminal\n• Try running `npm install` again',
      inline: false
    },
    {
      name: '❌ Login Keeps Failing',
      value: '**Solution:**\n• Disable 2FA temporarily (retail bots)\n• Verify credentials are correct\n• Try logging in manually on website first\n• Check if account is locked',
      inline: false
    },
    {
      name: '❌ Checkout Too Slow',
      value: '**Solution:**\n• Use wired ethernet connection\n• Enable proxy support\n• Reduce check interval (be careful with rate limits)\n• Close other bandwidth-heavy programs\n• Upgrade internet speed',
      inline: false
    },
    {
      name: '🆘 Still Need Help?',
      value: 'Use the appropriate support channel:\n• <#target-bot-support> for Target issues\n• <#costco-bot-support> for Costco issues\n• <#eth-bot-support> for Eth PnL issues\n• <#general-bot-support> for other questions\n\nOr open a support ticket for 1-on-1 help!',
      inline: false
    }
  )
  .setFooter({ text: `Check blue42bots.com/how-to for detailed troubleshooting • ${currentDate}` })
  .setTimestamp();

// ===== BOT SHOWCASE CHANNEL =====
const showcaseEmbed = new EmbedBuilder()
  .setColor(0x10B981)
  .setTitle('🏆 Bot Success Stories')
  .setDescription('Share your wins and see what the community is achieving!')
  .addFields(
    {
      name: '💰 Why Share Your Success?',
      value: '• Help others see what\'s possible\n• Get recognized with the 🏆 Success Story role\n• Inspire the community\n• Build credibility if you\'re an affiliate\n• Contribute to improving strategies',
      inline: false
    },
    {
      name: '📸 What to Share',
      value: '**Great posts include:**\n• Screenshot of successful checkout\n• Which bot you used\n• Settings/strategies that worked\n• Time of day / drop details\n• Any tips for others\n\n**Please blur out:**\n• Personal information\n• Full addresses\n• Payment details\n• Order numbers',
      inline: false
    },
    {
      name: '✅ Example Post Format',
      value: '```\n🎯 Target Lightning Bot Success!\n\nManaged to secure [Product Name]!\n\nSetup:\n- Check interval: 5 seconds\n- Using residential proxy\n- Drop time: 6:30 AM EST\n\nTip: Pre-saved payment method is crucial for speed!\n```',
      inline: false
    },
    {
      name: '🎉 Biggest Wins This Month',
      value: 'Check pinned messages to see the most impressive checkouts and strategies from our community!',
      inline: false
    }
  )
  .setFooter({ text: `Share your wins and help others succeed! • ${currentDate}` })
  .setTimestamp();

// ===== TIPS & TRICKS CHANNEL =====
const tipsEmbed = new EmbedBuilder()
  .setColor(0xF59E0B)
  .setTitle('💡 Pro Tips & Strategies')
  .setDescription('Expert advice to maximize your bot success rate')
  .addFields(
    {
      name: '🎯 General Automation Tips',
      value: '**1. Timing is Everything**\n• Most drops: 3-6 AM EST, 9-11 AM PST\n• Weekend mornings often have restocks\n• Monitor <#restock-alerts> for live updates\n\n**2. Network Optimization**\n• Use wired ethernet (not WiFi)\n• 100+ Mbps recommended\n• Close streaming/downloads while botting\n• Consider business-tier internet\n\n**3. Proxy Strategy**\n• Residential proxies > Datacenter\n• Rotate proxies between runs\n• One proxy per account\n• Test proxies before drops',
      inline: false
    },
    {
      name: '🎯 Target Bot Tips',
      value: '• Save payment method ahead of time\n• Use 3-5 second check intervals\n• Target Circle rewards apply automatically\n• RedCard gets priority on some drops\n• Multi-account requires separate profiles',
      inline: false
    },
    {
      name: '🛒 Costco Bot Tips',
      value: '• Executive membership gets 2% cash back\n• Warehouse pickup > Shipping for Pokemon\n• Search keywords: charizard, pikachu, elite trainer, booster\n• Limit is usually 1-2 per membership\n• Business accounts have different limits',
      inline: false
    },
    {
      name: '📈 Eth PnL Bot Tips',
      value: '• ALWAYS test in simulate mode first\n• Start with 1-5% of your capital\n• Never disable stop-loss\n• High gas fees eat profits - set max gas\n• Only trade tokens with $100k+ liquidity\n• Use trailing stop-loss to lock profits',
      inline: false
    },
    {
      name: '💎 Advanced Strategies',
      value: '**Multi-Instance Running**\n• Run 2-3 bot instances for better odds\n• Each needs separate config\n• Stagger check intervals slightly\n\n**Success Rate Tracking**\n• Keep notes on what works\n• Track drop times and success\n• Adjust strategy based on data\n\n**Community Coordination**\n• Share drop intel in real-time\n• Coordinate group buys (Elite+)\n• Learn from others\' strategies',
      inline: false
    }
  )
  .setFooter({ text: `Elite & Pro members: ask in your exclusive channels for advanced strategies • ${currentDate}` })
  .setTimestamp();

// Main function to update all channels
async function updateChannels() {
  try {
    const guild = await client.guilds.fetch(config.serverId);
    console.log(`\n📝 Updating channels in ${guild.name}...\n`);

    const channels = await guild.channels.fetch();
    
    // Helper function to clear and post
    const updateChannel = async (channelName, embeds, extraMessage = null) => {
      const channel = channels.find(ch => ch.name === channelName);
      if (!channel) {
        console.log(`   ⚠️  Channel #${channelName} not found - skipping`);
        return;
      }

      try {
        // Delete old messages (last 50)
        const messages = await channel.messages.fetch({ limit: 50 });
        await channel.bulkDelete(messages, true).catch(() => {
          console.log(`   ⚠️  Couldn't bulk delete in #${channelName} (messages too old)`);
        });

        // Post new content
        for (const embed of embeds) {
          await channel.send({ embeds: [embed] });
        }

        if (extraMessage) {
          if (typeof extraMessage === 'string') {
            await channel.send(extraMessage);
          } else {
            await channel.send(extraMessage);
          }
        }

        console.log(`   ✅ Updated #${channelName}`);
      } catch (error) {
        console.error(`   ❌ Error updating #${channelName}:`, error.message);
      }
    };

    // Update Welcome Channel
    await updateChannel('welcome', [welcomeEmbed], {
      content: '✅ **React with ✅ below to verify you\'ve read the rules and gain access to all channels!**\n\n*After verification, you\'ll be able to chat, get support, and join our community.*'
    });

    // Update Rules Channel
    await updateChannel('rules', [rulesEmbed, verificationEmbed], {
      content: '✅ **React with ✅ below to confirm you\'ve read and agree to all rules**'
    });

    // Update Announcements
    await updateChannel('announcements', [announcementsEmbed]);

    // Update Info Channel (if exists)
    const infoChannel = channels.find(ch => ch.name === 'info' || ch.name === 'server-info');
    if (infoChannel) {
      await updateChannel(infoChannel.name, [welcomeEmbed], 
        '📌 **Quick Links:**\n• Website: https://blue42bots.com\n• How-To Guides: https://blue42bots.com/how-to\n• Dashboard: https://blue42bots.com/dashboard\n• Support: Open a ticket!'
      );
    }

    // Update Setup Guides
    await updateChannel('setup-guides', 
      [setupMainEmbed, targetSetupEmbed, costcoSetupEmbed, ethSetupEmbed, troubleshootingEmbed],
      '📚 **Additional Resources:**\n\n🌐 Full guides: **blue42bots.com/how-to**\n📹 Video tutorials coming soon!\n💬 Need help? Ask in bot-specific support channels!'
    );

    // Update Bot Showcase
    await updateChannel('bot-showcase', [showcaseEmbed]);

    // Update Tips & Tricks
    const tipsChannel = channels.find(ch => ch.name === 'tips-and-tricks' || ch.name === 'tips');
    if (tipsChannel) {
      await updateChannel(tipsChannel.name, [tipsEmbed], 
        '💡 **Got a tip to share?**\n\nPost your strategies and help the community! The best tips get pinned and the 🎓 Helper role!'
      );
    }

    // Update Video Tutorials (placeholder)
    const videoChannel = channels.find(ch => ch.name === 'video-tutorials' || ch.name === 'tutorials');
    if (videoChannel) {
      const videoEmbed = new EmbedBuilder()
        .setColor(0xDC2626)
        .setTitle('📹 Video Tutorials')
        .setDescription('Step-by-step video guides for setting up and using your bots')
        .addFields(
          {
            name: '🎬 Coming Soon!',
            value: 'We\'re creating professional video tutorials for all bots!\n\nTopics will include:\n• Complete setup walkthroughs\n• Configuration best practices\n• Troubleshooting common issues\n• Advanced strategies\n• Live drop demonstrations',
            inline: false
          },
          {
            name: '📚 For Now',
            value: '• Check <#setup-guides> for text guides\n• Visit **blue42bots.com/how-to** for detailed instructions\n• Ask questions in support channels for help',
            inline: false
          }
        )
        .setFooter({ text: `Video tutorials launching soon! • ${currentDate}` })
        .setTimestamp();
      
      await updateChannel(videoChannel.name, [videoEmbed]);
    }

    console.log('\n🎉 All channels updated successfully!\n');
    console.log('📊 Updated Channels:');
    console.log('   • #welcome');
    console.log('   • #rules');
    console.log('   • #announcements');
    console.log('   • #info (if exists)');
    console.log('   • #setup-guides');
    console.log('   • #bot-showcase');
    console.log('   • #tips-and-tricks');
    console.log('   • #video-tutorials');
    console.log('\n💡 Tip: Run this script weekly to keep information current!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating channels:', error);
    process.exit(1);
  }
}

client.once('ready', () => {
  console.log(`\n✅ Bot logged in as ${client.user.tag}\n`);
  updateChannels();
});

client.login(config.botToken);
