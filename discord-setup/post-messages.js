const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

// Load configuration
const config = JSON.parse(fs.readFileSync('./setup-config.json', 'utf8'));

const BOT_TOKEN = process.env.BOT_TOKEN || config.botToken;
const SERVER_ID = process.env.DISCORD_SERVER_ID || config.serverId;

if (!BOT_TOKEN) {
  console.error('❌ Error: BOT_TOKEN not set. Add it to the .env file.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ]
});

// Welcome message content
const welcomeEmbed = new EmbedBuilder()
  .setColor(0x0EA5E9)
  .setTitle('👋 Welcome to Blue42 - Premium Automation Solutions!')
  .setDescription('**The ultimate community for bot automation and checkout solutions**')
  .addFields(
    {
      name: '🤖 What We Do',
      value: 'Blue42 develops premium automation software for e-commerce, trading, and beyond. We started with Pokemon & TCG checkout bots and are expanding into all areas where automation creates value.',
      inline: false
    },
    {
      name: '🚀 Current Products',
      value: '• **Costco Checkout Bot** - $42.00 + $20.00/mo\n  Automated Costco Pokemon product checkout\n\n• **Target Lightning Bot** - $42.00 + $20.00/mo\n  Lightning-fast Target checkout automation\n\n• **Eth PnL Trading Bot** - $42.00 + $20.00/mo\n  Professional crypto trading automation\n\n*More automation solutions coming soon!*',
      inline: false
    },
    {
      name: '🎯 Getting Started',
      value: '1️⃣ Read <#rules> and verify\n2️⃣ Check <#faq> for common questions\n3️⃣ Visit **blue42bots.com** to browse our automation tools\n4️⃣ Get support in our dedicated bot channels\n5️⃣ Join <#general-chat> to connect with the community',
      inline: false
    },
    {
      name: '💎 Premium Membership Tiers',
      value: '**VIP** - $9.99/month\n• Priority support (4-8 hour response)\n• Early access to new bots\n• Exclusive tips and strategies\n\n**Elite** - $19.99/month\n• Everything in VIP +\n• 1-on-1 setup assistance\n• Custom bot configurations\n• Advanced automation strategies\n\n**Pro** - $49.99/month\n• Everything in Elite +\n• Direct developer access\n• Beta testing new automation tools\n• Reseller opportunities\n• Custom development requests',
      inline: false
    },
    {
      name: '💬 Community Guidelines',
      value: 'Be respectful, help others succeed, and share your wins in <#bot-showcase>!',
      inline: false
    },
    {
      name: '🆘 Need Help?',
      value: 'Visit our bot-specific support channels or open a support ticket. Our team is here to help you succeed!',
      inline: false
    }
  )
  .setFooter({ text: 'React below to verify and gain access to all channels ✅' })
  .setTimestamp();

// Rules embed
const rulesEmbed = new EmbedBuilder()
  .setColor(0xF59E0B)
  .setTitle('📜 Blue42 Server Rules')
  .setDescription('Please read and follow these rules to maintain a positive, productive community.')
  .addFields(
    {
      name: '1️⃣ Be Respectful & Professional',
      value: '• Treat all members, staff, and developers with respect\n• No harassment, hate speech, discrimination, or personal attacks\n• Keep discussions constructive and helpful\n• Disagree respectfully - focus on ideas, not individuals',
      inline: false
    },
    {
      name: '2️⃣ No Spam or Unwanted Advertising',
      value: '• Don\'t spam messages, emojis, mentions, or commands\n• No advertising competing bots, services, or Discord servers\n• No excessive self-promotion without permission\n• Partnerships must be approved by admins in <#partnerships>',
      inline: false
    },
    {
      name: '3️⃣ Use Appropriate Channels',
      value: '• Post in the correct channel for your topic\n• Bot-specific support goes in dedicated support channels\n• General discussion in <#general-chat>\n• Off-topic conversations in <#off-topic>\n• Success stories and wins in <#bot-showcase>',
      inline: false
    },
    {
      name: '4️⃣ No Sharing, Cracking, or Unauthorized Distribution',
      value: '• **DO NOT share bot files, license keys, or account credentials**\n• **DO NOT attempt to crack, reverse engineer, or redistribute our software**\n• Reselling is only permitted for Blue42 Pro members with approval\n• Each license is for individual use only\n• **Violations result in immediate permanent ban and potential legal action**',
      inline: false
    },
    {
      name: '5️⃣ Support Etiquette',
      value: '• Be patient - support staff are here to help but need time\n• Provide detailed information when requesting help\n• One support ticket at a time - don\'t spam multiple channels\n• Don\'t DM staff unless they specifically request it\n• Search <#faq> before asking common questions',
      inline: false
    },
    {
      name: '6️⃣ Account & License Integrity',
      value: '• One Discord account per person\n• Don\'t share your bot licenses or subscription access\n• Don\'t create alternate accounts to bypass bans or restrictions\n• Keep your account secure - you\'re responsible for all activity',
      inline: false
    },
    {
      name: '7️⃣ No Illegal or Unethical Activity',
      value: '• Our bots are for legitimate personal or business use only\n• No discussion of illegal activities, fraud, or ToS violations\n• Follow all platform terms of service (Costco, Target, etc.)\n• No discussion of exploits, hacks, or unauthorized access\n• Use automation responsibly and ethically',
      inline: false
    },
    {
      name: '8️⃣ Follow Discord Terms of Service',
      value: '• You must be 13+ years old (18+ recommended)\n• Follow Discord Community Guidelines and ToS\n• No NSFW content outside designated channels (if any)\n• Report violations to moderators',
      inline: false
    },
    {
      name: '⚠️ Enforcement & Consequences',
      value: '**1st Violation:** Warning from moderators\n**2nd Violation:** 24-hour timeout/mute\n**3rd Violation:** 7-day timeout\n**Severe Violations:** Immediate permanent ban\n\n*Sharing/cracking software, scamming, or illegal activity = instant permanent ban*',
      inline: false
    },
    {
      name: '📞 Questions or Appeals',
      value: 'Contact a moderator or admin via support ticket. Ban appeals can be submitted to **support@blue42bots.com**',
      inline: false
    }
  )
  .setFooter({ text: 'By verifying, you agree to follow these rules. Last updated: November 2025' })
  .setTimestamp();

// FAQ embed
const faqEmbed = new EmbedBuilder()
  .setColor(0x8B5CF6)
  .setTitle('❓ Frequently Asked Questions')
  .setDescription('Quick answers to common questions about Blue42 automation tools')
  .addFields(
    {
      name: '🛒 General Questions',
      value: '**Q: What does Blue42 do?**\nA: We create premium automation software for e-commerce checkouts, trading, and other valuable use cases. Our specialty is making complex tasks simple and fast.\n\n**Q: How do I purchase a bot?**\nA: Visit **blue42bots.com**, create an account, choose your bot, and complete checkout. You\'ll receive download instructions via email.\n\n**Q: What payment methods do you accept?**\nA: We accept all major credit/debit cards via Stripe. Cryptocurrency payments coming soon.',
      inline: false
    },
    {
      name: '💻 Technical Questions',
      value: '**Q: What operating systems are supported?**\nA: Currently **Windows only**. Mac and Linux support is in development.\n\n**Q: Do I need technical knowledge?**\nA: No! Our bots have simple GUIs. Just download, configure, and run. Setup guides available in <#setup-guides>.\n\n**Q: Can I run multiple bots at the same time?**\nA: Yes! Each bot runs independently. You can use all your bots simultaneously.',
      inline: false
    },
    {
      name: '📦 Product-Specific Questions',
      value: '**Q: Do I need proxies?**\nA: Recommended but not required. Residential proxies work best for Costco and Target bots.\n\n**Q: How fast are the checkout bots?**\nA: Sub-second checkout speeds with proper setup. Target bot is optimized for lightning-fast drops.\n\n**Q: Can I use these for business/reselling?**\nA: Yes! Many members use our bots for reselling. Pro membership includes reseller benefits.',
      inline: false
    },
    {
      name: '💰 Billing & Subscriptions',
      value: '**Q: Why is there a monthly subscription?**\nA: Monthly fees cover ongoing updates, maintenance, server costs, and support. Bots are constantly updated for site changes.\n\n**Q: Can I cancel anytime?**\nA: Yes! Cancel your subscription anytime from your dashboard at blue42bots.com. No cancellation fees.\n\n**Q: What\'s the refund policy?**\nA: 48-hour money-back guarantee if the bot doesn\'t work as described. See our refund policy on the website.',
      inline: false
    },
    {
      name: '🆘 Support Questions',
      value: '**Q: How fast is support?**\nA: Free members: 24-48 hours | VIP: 4-8 hours | Elite/Pro: 1-2 hours\n\n**Q: How do I get help with setup?**\nA: Check <#setup-guides> first, then ask in the appropriate support channel or open a ticket.\n\n**Q: Can I get 1-on-1 help?**\nA: Yes! Elite and Pro members get personal setup assistance via screen share.',
      inline: false
    },
    {
      name: '🚀 Future Development',
      value: '**Q: What new bots are coming?**\nA: Check <#roadmap> for upcoming releases. We\'re always developing new automation solutions based on community feedback.\n\n**Q: Can I suggest features or new bots?**\nA: Absolutely! Share ideas in <#feedback>. Pro members get priority on feature requests.',
      inline: false
    },
    {
      name: '👑 Premium Membership',
      value: '**Q: What\'s the difference between VIP, Elite, and Pro?**\nA: VIP = faster support + early access. Elite = VIP + personal help + custom configs. Pro = Elite + direct dev access + beta testing + reseller perks.\n\n**Q: Can I upgrade my membership tier?**\nA: Yes! Upgrade anytime from your dashboard. Price difference is prorated.',
      inline: false
    }
  )
  .setFooter({ text: 'Still have questions? Ask in #general-bot-support or open a ticket!' })
  .setTimestamp();

// Roadmap embed
const roadmapEmbed = new EmbedBuilder()
  .setColor(0x10B981)
  .setTitle('🗺️ Blue42 Roadmap - What\'s Coming')
  .setDescription('Upcoming features, bots, and improvements. Subject to change based on demand and development progress.')
  .addFields(
    {
      name: '🚀 Q4 2025 - In Development',
      value: '• **Amazon Checkout Bot** - Automated Amazon product monitoring and checkout\n• **Walmart Bot v2** - Enhanced Walmart automation with multi-account support\n• **Mac/Linux Support** - Cross-platform compatibility for all bots\n• **Mobile App** - Monitor bots and get alerts from your phone\n• **Proxy Integration** - Built-in proxy rotation and management',
      inline: false
    },
    {
      name: '📅 Q1 2026 - Planned',
      value: '• **Best Buy Bot** - Electronics and collectibles automation\n• **GameStop Bot** - Gaming and collectibles checkout\n• **Shopify AIO** - Universal Shopify store automation\n• **Advanced Analytics Dashboard** - Success rates, speed metrics, profit tracking\n• **Discord Bot** - Manage and control your bots directly from Discord',
      inline: false
    },
    {
      name: '🔮 Q2 2026 - Future Vision',
      value: '• **AI-Powered Auto-Solve** - Advanced captcha solving\n• **Smart Stock Monitoring** - AI predictions for product drops\n• **Group Buy Platform** - Coordinate group purchases within the community\n• **API Access** - Build your own integrations (Pro members)\n• **White Label Program** - Rebrand and resell Blue42 bots',
      inline: false
    },
    {
      name: '💡 Community-Requested Features',
      value: '• Multi-profile management system\n• Success rate analytics and reporting\n• Auto-checkout for Pokemon Center\n• Sneaker bot integrations\n• Auto-restock monitoring with alerts\n\n*Vote on features in <#feedback>! Pro members get 2x voting weight.*',
      inline: false
    },
    {
      name: '🛠️ Continuous Improvements',
      value: '• Regular speed optimizations\n• Site update monitoring and bot maintenance\n• New payment method support\n• Enhanced GUI and user experience\n• 24/7 uptime monitoring\n• Expanded documentation and tutorials',
      inline: false
    }
  )
  .setFooter({ text: 'Want to influence our roadmap? Upgrade to Pro for priority feature requests!' })
  .setTimestamp();

async function postMessages() {
  try {
    const guild = await client.guilds.fetch(config.serverId);
    console.log(`\n📝 Posting welcome messages to ${guild.name}...\n`);

    // Find channels by name
    const channels = await guild.channels.fetch();
    const welcomeChannel = channels.find(ch => ch.name === 'welcome');
    const rulesChannel = channels.find(ch => ch.name === 'rules');
    const faqChannel = channels.find(ch => ch.name === 'faq');
    const roadmapChannel = channels.find(ch => ch.name === 'roadmap');

    // Post welcome message
    if (welcomeChannel) {
      await welcomeChannel.send({ embeds: [welcomeEmbed] });
      // Add verification message
      const verifyMessage = await welcomeChannel.send({
        content: '✅ **React with ✅ below to verify you\'ve read the rules and gain access to all channels!**\n\n*After verification, you\'ll be able to chat, get support, and join our community.*'
      });
      await verifyMessage.react('✅');
      console.log('   ✅ Posted to #welcome');
    }

    // Post rules
    if (rulesChannel) {
      await rulesChannel.send({ embeds: [rulesEmbed] });
      console.log('   ✅ Posted to #rules');
    }

    // Post FAQ
    if (faqChannel) {
      await faqChannel.send({ embeds: [faqEmbed] });
      await faqChannel.send({
        content: '**📚 Additional Resources:**\n\n• Website: https://blue42bots.com\n• Setup Guides: <#setup-guides>\n• Video Tutorials: <#video-tutorials>\n• Community Tips: <#tips-and-tricks>\n\n**Still need help?** Ask in <#general-bot-support> or open a support ticket!'
      });
      console.log('   ✅ Posted to #faq');
    }

    // Post roadmap
    if (roadmapChannel) {
      await roadmapChannel.send({ embeds: [roadmapEmbed] });
      await roadmapChannel.send({
        content: '**🎯 Want to stay updated?**\n\nFollow our progress:\n• New announcements in <#announcements>\n• Feature voting in <#feedback>\n• Early access for VIP+ members in <#vip-bot-updates>\n\nQuestions about the roadmap? Ask in <#general-chat>!'
      });
      console.log('   ✅ Posted to #roadmap');
    }

    console.log('\n🎉 All messages posted successfully!\n');
    console.log('Next steps:');
    console.log('1. Set up Carl-bot for reaction role verification');
    console.log('2. Add support ticket bot (Ticket Tool)');
    console.log('3. Configure MEE6 for moderation');
    console.log('4. Create invite link and add to website');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error posting messages:', error);
    process.exit(1);
  }
}

client.once('ready', () => {
  console.log(`\n✅ Bot logged in as ${client.user.tag}\n`);
  postMessages();
});

client.login(BOT_TOKEN);
