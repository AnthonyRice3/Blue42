# Discord Channel Update Script

Automatically update Discord channels with the latest information, pricing, and guides.

## What It Does

This script updates multiple Discord channels with fresh, current information:

### Channels Updated:
- ✅ **#welcome** - Latest welcome message with current pricing ($42 + $20/mo)
- ✅ **#announcements** - Recent news, updates, and community milestones
- ✅ **#info** - Server information and quick links
- ✅ **#setup-guides** - Complete setup instructions for all bots
- ✅ **#bot-showcase** - Template for sharing success stories
- ✅ **#tips-and-tricks** - Pro strategies and optimization tips
- ✅ **#video-tutorials** - Placeholder for upcoming video content

### Features:
- 🗑️ **Clears old messages** (last 50 messages in each channel)
- 📝 **Posts fresh embeds** with current information
- 🔗 **Includes links** to blue42bots.com/how-to
- 💰 **Updates pricing** to current rates
- 📅 **Timestamps** everything with current month/year

## Quick Start

### 1. Prerequisites
Make sure you've already set up your Discord bot (see main README.md):
- Bot is created in Discord Developer Portal
- Bot has Administrator permissions in your server
- Bot token is in `setup-config.json`

### 2. Run the Update Script

```bash
npm run update-channels
```

Or manually:
```bash
node update-channels.js
```

### 3. Watch the Output

The script will:
1. Connect to your Discord server
2. Find each channel by name
3. Clear old messages
4. Post new embeds
5. Show success/failure for each channel

Example output:
```
✅ Bot logged in as Blue42 Setup Bot#1234

📝 Updating channels in Blue42...

   ✅ Updated #welcome
   ✅ Updated #announcements
   ⚠️  Channel #info not found - skipping
   ✅ Updated #setup-guides
   ✅ Updated #bot-showcase
   ✅ Updated #tips-and-tricks
   ✅ Updated #video-tutorials

🎉 All channels updated successfully!
```

## When to Run

### Regular Updates
Run this script whenever you need to update Discord information:

- ✅ **Weekly** - Keep announcements fresh
- ✅ **After pricing changes** - Update bot costs
- ✅ **New bot launches** - Add to welcome/setup guides
- ✅ **Major updates** - Reflect latest features
- ✅ **Community milestones** - Update member count

### One-Time Setup
If this is your first time:
1. Run `node setup-server.js` first (creates channels)
2. Then run `node update-channels.js` (populates content)

## Customization

### Edit Content
Open `update-channels.js` and modify the embed objects:

```javascript
const welcomeEmbed = new EmbedBuilder()
  .setColor(0x0EA5E9)
  .setTitle('Your Custom Title')
  .setDescription('Your custom description')
  .addFields({
    name: 'Field Name',
    value: 'Field content',
    inline: false
  });
```

### Add More Channels
To update additional channels, add them to the `updateChannels()` function:

```javascript
// Update your custom channel
await updateChannel('your-channel-name', [yourEmbed], 'Optional extra message');
```

### Change Update Frequency
Create a scheduled task (Windows) or cron job (Mac/Linux) to run automatically:

**Windows Task Scheduler:**
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., Weekly on Monday 9am)
4. Action: Start a Program
5. Program: `node`
6. Arguments: `C:\path\to\discord-setup\update-channels.js`
7. Start in: `C:\path\to\discord-setup`

**Mac/Linux Cron:**
```bash
# Edit crontab
crontab -e

# Add line (runs every Monday at 9am)
0 9 * * 1 cd /path/to/discord-setup && node update-channels.js
```

## Current Content Highlights

### Pricing
- All bots: **$42.00 + $20.00/month**
- VIP membership: **$9.99/month**
- Elite membership: **$19.99/month**
- Pro membership: **$49.99/month**

### Bots Included in Guides
- 🎯 Target Lightning Bot
- 🛒 Costco Checkout Bot
- ⚡ Pokemon Center Pro
- 📈 Eth PnL Trading Bot
- 🏪 Sams Club Elite
- 💛 Best Buy Sniper
- 🎮 GameStop Pro

### External Links
- Website: blue42bots.com
- How-To Guides: blue42bots.com/how-to
- Dashboard: blue42bots.com/dashboard
- Affiliate: blue42bots.com/affiliate

## Troubleshooting

### "Channel not found"
- Make sure channel names match exactly
- Channel might be deleted or renamed
- Script skips missing channels automatically

### "Missing Permissions"
- Bot needs Administrator permission
- Or specific permissions: Manage Messages, Send Messages, Embed Links

### "Cannot bulk delete messages"
- Messages older than 14 days can't be bulk deleted
- Script will skip deletion and post new content
- Manually delete old messages if needed

### "Rate Limited"
- Discord limits API calls
- Script has built-in delays
- If rate limited, wait a few minutes and retry

## Advanced: Selective Updates

If you only want to update specific channels, comment out others:

```javascript
// Update only these channels:
await updateChannel('welcome', [welcomeEmbed]);
await updateChannel('announcements', [announcementsEmbed]);

// Comment out channels you don't want to update:
// await updateChannel('setup-guides', [...]);
// await updateChannel('bot-showcase', [...]);
```

## Support

If you encounter issues:
1. Check `setup-config.json` has valid bot token
2. Verify bot is in your server
3. Confirm bot has necessary permissions
4. Check console output for specific errors

Contact: support@blue42bots.com

---

**Last Updated:** March 2026  
**Version:** 1.0.0
