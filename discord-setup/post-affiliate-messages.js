const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
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
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Affiliate program info message
const affiliateInfoEmbed = new EmbedBuilder()
  .setColor(0x6366F1) // Blue color
  .setTitle('💰 Blue42 Affiliate Program')
  .setDescription('Earn passive income by promoting the best automation tools for collectors and resellers!')
  .addFields(
    {
      name: '💵 Commission Structure',
      value: '• **Starter (0-24 sales):** 5% recurring\n• **Bronze (25-74 sales):** 10% recurring\n• **Silver (75-149 sales):** 15% recurring\n• **Gold (150+ sales):** 20% recurring\n\n*Earn commission once per sale, paid monthly!*',
      inline: false
    },
    {
      name: '🎯 Program Benefits',
      value: '• 90-day cookie duration\n• Real-time tracking dashboard\n• Monthly payouts via Stripe (minimum $50)\n• Marketing materials provided\n• Priority affiliate support\n• Custom promo codes\n• Co-marketing opportunities (Gold tier)',
      inline: false
    },
    {
      name: '📈 Who Should Join?',
      value: '• Pokemon/TCG YouTubers & Content Creators\n• Discord Server Owners\n• Reselling/Flipping Influencers\n• Tech Reviewers & Bloggers\n• Automation Enthusiasts\n• Side Hustle Communities',
      inline: false
    },
    {
      name: '🚀 How to Apply',
      value: '1. Visit **blue42bots.com/affiliate**\n2. Fill out the application form\n3. Get approved within 24-48 hours\n4. Receive your unique referral link\n5. Start earning!',
      inline: false
    },
    {
      name: '💡 Earnings Potential',
      value: 'With our premium bots priced at $142+ per sale, earn $7.10-$28.40 per referral. Our top affiliates earn $500-$2,000/month!',
      inline: false
    },
    {
      name: '🔗 Apply Now',
      value: '**https://blue42bots.com/affiliate**\n\nQuestions? Ask in <#affiliate-applications> or DM a staff member.',
      inline: false
    }
  )
  .setFooter({ text: 'Blue42 Affiliate Program • Join hundreds of creators earning passive income' })
  .setTimestamp();

// Marketing resources message
const resourcesEmbed = new EmbedBuilder()
  .setColor(0x8B5CF6) // Purple color
  .setTitle('📦 Affiliate Marketing Resources')
  .setDescription('Everything you need to promote Blue42 effectively')
  .addFields(
    {
      name: '🎨 Visual Assets',
      value: '• High-res logo files (PNG, SVG)\n• Banner ads (all standard sizes)\n• Social media graphics\n• Product screenshots\n• Success story templates',
      inline: false
    },
    {
      name: '✍️ Copy & Content',
      value: '• Pre-written social media posts\n• Email templates\n• Video script outlines\n• Blog post ideas\n• Hashtag lists',
      inline: false
    },
    {
      name: '📊 Tracking & Analytics',
      value: '• Unique referral link\n• Custom promo codes\n• Real-time dashboard access\n• Click & conversion tracking\n• Monthly performance reports',
      inline: false
    },
    {
      name: '🎥 Video Content Ideas',
      value: '• "Blue42 Review: Is It Worth It?"\n• "How I Made $X With Blue42 Bots"\n• Setup tutorials and walkthroughs\n• Success story testimonials\n• Bot comparison videos',
      inline: false
    },
    {
      name: '📱 Social Media Strategy',
      value: '**YouTube:** Tutorial videos, reviews, success stories\n**TikTok:** Quick wins, POV content, reactions\n**Instagram:** Success screenshots, Stories, Reels\n**Twitter/X:** Tips, threads, success tweets\n**Discord:** Server partnerships, exclusive codes',
      inline: false
    },
    {
      name: '💬 Sample Posts',
      value: '**Twitter:** "Just helped 10+ people cop the latest Pokemon drop using @Blue42Bots 🔥 Use code YOURCODE for 10% off!"\n\n**YouTube Title:** "I Made $500 in One Week with THIS Pokemon Bot (Blue42 Review)"\n\n**Discord:** "🚨 Want to automate your checkouts? I use Blue42 - link in bio + 10% discount!"',
      inline: false
    }
  )
  .setFooter({ text: 'Blue42 Affiliate Resources • Updated monthly with new content' });

// Success tips message
const tipsEmbed = new EmbedBuilder()
  .setColor(0x10B981) // Green color
  .setTitle('🏆 Affiliate Success Tips')
  .setDescription('Strategies from our top-earning affiliates')
  .addFields(
    {
      name: '1️⃣ Be Authentic',
      value: 'Share your genuine experience with Blue42. Authenticity builds trust and converts better than hard selling. Show real results!',
      inline: false
    },
    {
      name: '2️⃣ Provide Value First',
      value: 'Create helpful content (tutorials, guides, tips) before promoting. Your audience should benefit whether they buy or not.',
      inline: false
    },
    {
      name: '3️⃣ Show Results',
      value: 'Screenshots, videos, and data prove the bots work. Success stories convert 3x better than feature lists.',
      inline: false
    },
    {
      name: '4️⃣ Leverage Multiple Platforms',
      value: 'Don\'t rely on one channel. Cross-promote on YouTube, TikTok, Instagram, Twitter, Discord, and your email list.',
      inline: false
    },
    {
      name: '5️⃣ Create Urgency',
      value: 'Mention limited-time offers, Black Friday sales, or limited licenses to encourage immediate action.',
      inline: false
    },
    {
      name: '6️⃣ Build a Community',
      value: 'Create a Discord server or group for your audience. Help them succeed with Blue42 - they\'ll recommend you to others.',
      inline: false
    },
    {
      name: '7️⃣ Track What Works',
      value: 'Use your dashboard to see which content drives clicks and conversions. Double down on what works.',
      inline: false
    },
    {
      name: '8️⃣ Stay Updated',
      value: 'Promote new bot launches, features, and sales. Fresh content keeps your audience engaged and converts better.',
      inline: false
    },
    {
      name: '💎 Pro Tip from Gold Affiliates',
      value: 'Create a comparison video of Blue42 vs competitors, highlighting our superior speed, features, and support. These videos convert at 15%+!',
      inline: false
    }
  )
  .setFooter({ text: 'Blue42 Affiliate Success • Questions? Ask our top affiliates in this channel!' });

async function postAffiliateMessages() {
  try {
    console.log('✅ Bot logged in as ' + client.user.tag + '\n');
    console.log('📝 Posting affiliate program messages...\n');

    const guild = client.guilds.cache.first();
    if (!guild) {
      console.error('❌ No guild found. Make sure the bot is in a server.');
      process.exit(1);
    }

    console.log(`📌 Posting to: ${guild.name}\n`);

    // Post to affiliate-info
    const infoChannel = guild.channels.cache.find(ch => ch.name === 'affiliate-info');
    if (infoChannel) {
      await infoChannel.send({ embeds: [affiliateInfoEmbed] });
      console.log('   ✅ Posted program info to #affiliate-info');
    }

    // Post to affiliate-resources
    const resourcesChannel = guild.channels.cache.find(ch => ch.name === 'affiliate-resources');
    if (resourcesChannel) {
      await resourcesChannel.send({ embeds: [resourcesEmbed] });
      await resourcesChannel.send({ embeds: [tipsEmbed] });
      console.log('   ✅ Posted resources and tips to #affiliate-resources');
    }

    // Application instructions for affiliate-applications
    const applicationsChannel = guild.channels.cache.find(ch => ch.name === 'affiliate-applications');
    if (applicationsChannel) {
      const applicationEmbed = new EmbedBuilder()
        .setColor(0xF59E0B) // Orange
        .setTitle('📝 How to Apply for the Affiliate Program')
        .setDescription('Ready to start earning? Follow these steps:')
        .addFields(
          {
            name: '1. Visit Our Affiliate Page',
            value: '**https://blue42bots.com/affiliate**',
            inline: false
          },
          {
            name: '2. Fill Out the Application',
            value: 'Provide your platform info, audience size, and how you plan to promote Blue42.',
            inline: false
          },
          {
            name: '3. Wait for Approval',
            value: 'We review all applications within 24-48 hours. You\'ll receive an email once approved.',
            inline: false
          },
          {
            name: '4. Get Your Links',
            value: 'Once approved, you\'ll get access to your dashboard with your unique referral link and promo code.',
            inline: false
          },
          {
            name: '5. Start Promoting!',
            value: 'Use the resources in <#affiliate-resources> to create content and start earning commissions.',
            inline: false
          },
          {
            name: '❓ Questions?',
            value: 'Ask in this channel or DM a staff member. We\'re here to help you succeed!',
            inline: false
          }
        )
        .setFooter({ text: 'Blue42 Affiliate Applications • Apply now at blue42bots.com/affiliate' });

      await applicationsChannel.send({ embeds: [applicationEmbed] });
      console.log('   ✅ Posted application guide to #affiliate-applications');
    }

    console.log('\n🎉 All affiliate messages posted successfully!\n');
    console.log('Next steps:');
    console.log('1. Monitor affiliate applications');
    console.log('2. Approve qualified applicants');
    console.log('3. Provide approved affiliates with resources');
    console.log('4. Track affiliate performance and payouts\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error posting messages:', error);
    process.exit(1);
  }
}

client.on('ready', postAffiliateMessages);

client.login(config.botToken);
