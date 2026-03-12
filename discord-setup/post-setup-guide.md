# Post-Setup Guide: Configure Your Blue42 Discord Server

The automated setup is complete! Now let's configure the content and features.

## Step 1: Upload Server Branding

### Server Icon
1. Go to **Server Settings** → **Overview**
2. Click on the server icon
3. Upload `blue42logo.png` (recommended size: 512x512px)
4. Save changes

### Server Banner (Optional - Requires Level 2 Boost)
1. Create a banner image (960x540px)
2. Include: Blue42 logo + "Premium Checkout Bots"
3. Upload in **Server Settings** → **Overview**

## Step 2: Set Up Welcome Screen

1. Go to **Server Settings** → **Community** → **Welcome Screen**
2. Enable Welcome Screen
3. Add welcome channels:
   - `#rules` - "Read our rules"
   - `#faq` - "Common questions"
   - `#general-chat` - "Start chatting"
   - `#costco-bot-support` - "Get bot support"
4. Server description:
```
Premium Pokemon & TCG checkout automation. Fast support, expert community, exclusive tips. Get your bots at blue42bots.com
```

## Step 3: Create Welcome Message

Go to `#welcome` and post:

```
👋 **Welcome to Blue42 - Premium Checkout Bots!**

We provide premium Pokemon & TCG checkout automation software for collectors and resellers.

**🚀 Getting Started**

1️⃣ Read the <#RULES_CHANNEL_ID> and verify
2️⃣ Check <#FAQ_CHANNEL_ID> for common questions  
3️⃣ Visit https://blue42bots.com to purchase bots
4️⃣ Get support in <#BOT_SUPPORT_CHANNELS>

**🤖 Our Bots**

• **Costco Checkout Bot** - $42.00 + $20.00/mo
  Automated Costco Pokemon product checkout
  
• **Target Lightning Bot** - $99.90 + $9.99/mo  
  Lightning-fast Target checkout automation
  
• **Eth PnL Trading Bot** - $199.90 + $19.99/mo
  Professional crypto trading automation

**💎 Premium Membership**

Get priority support and exclusive perks:
• **VIP** - $9.99/month - Priority support, early updates
• **Elite** - $19.99/month - 1-on-1 setup, custom configs
• **Pro** - $49.99/month - Direct dev access, beta testing

**Need help?** Open a ticket or ask in support channels!
```

*Note: Replace `<#CHANNEL_ID>` with actual channel mentions*

## Step 4: Add Server Rules

Go to `#rules` and post:

```
📜 **Blue42 Server Rules**

**1️⃣ Be Respectful**
• Treat everyone with respect and professionalism
• No harassment, hate speech, or discrimination
• Keep discussions friendly and constructive

**2️⃣ No Spam or Advertising**
• Don't spam messages, emojis, or mentions
• No advertising other bots/services without permission
• No excessive self-promotion

**3️⃣ Use Appropriate Channels**
• Post in the correct channels for your topic
• Bot support questions go in support channels
• Off-topic chat belongs in <#off-topic>

**4️⃣ No Sharing or Reselling**
• Don't share bot files, license keys, or account credentials
• Reselling requires Blue42 Pro membership
• **Violations result in permanent ban**

**5️⃣ Support Etiquette**
• Be patient with support staff and volunteers
• Provide necessary details when requesting help
• Don't DM staff unless they specifically ask
• One ticket at a time

**6️⃣ No Account Sharing**
• One Discord account per person
• Don't share your bot licenses with others
• Each license is for individual use only

**7️⃣ Follow Discord TOS**
• You must be 13+ years old
• Follow Discord Community Guidelines
• No illegal activity discussion

**⚠️ Violation Consequences**
• 1st offense: Warning
• 2nd offense: 24-hour timeout
• 3rd offense: Permanent ban

**Questions?** Contact a <@MODERATOR_ROLE> or open a ticket.

✅ **React below to verify you've read and agree to these rules**
```

## Step 5: Create FAQ Content

Go to `#faq` and post:

```
❓ **Frequently Asked Questions**

**Q: How do I purchase a bot?**
A: Visit https://blue42bots.com, create an account, and purchase your bot. You'll receive download instructions via email.

**Q: Do the bots work on Mac/Windows/Linux?**
A: Currently Windows only. Mac and Linux support coming soon.

**Q: How do I install a bot?**
A: After purchase, download the bot package and run `Launch-Bot.bat`. See <#setup-guides> for detailed instructions.

**Q: Can I use multiple bots at once?**
A: Yes! Each bot runs independently. You can run all three simultaneously.

**Q: What's the refund policy?**
A: We offer a 48-hour money-back guarantee if the bot doesn't work as described.

**Q: How do I cancel my subscription?**
A: Go to your dashboard at blue42bots.com and click "Cancel Subscription" on your bot.

**Q: Can I resell the bots?**
A: Only Blue42 Pro members can resell. Contact us for reseller terms.

**Q: How fast is support?**
A: Free support: 24-48 hours. VIP: 4-8 hours. Elite/Pro: 1-2 hours.

**Q: Do I need proxies?**
A: Recommended but not required. Residential proxies work best for Costco and Target.

**Q: What payment methods do you accept?**
A: Credit/debit cards via Stripe. Cryptocurrency coming soon.

**More questions?** Ask in <#general-bot-support> or open a ticket!
```

## Step 6: Set Up Verification System

### Option A: Manual Verification
1. Ask users to react to rules message with ✅
2. Manually assign `✅ Verified` role

### Option B: Automated (Recommended)
1. Install Carl-bot: https://carl.gg
2. Invite to your server
3. Use Carl-bot dashboard to create reaction role:
   - Channel: `#welcome`
   - Emoji: ✅
   - Role: `✅ Verified`
   - Mode: Normal (toggle on/off)

## Step 7: Add Essential Bots

### MEE6 (Moderation & Leveling)
1. Visit: https://mee6.xyz
2. Invite to server
3. Enable:
   - Moderation (auto-mod, warnings)
   - Leveling (reward active members)
   - Welcome messages

### Carl-bot (Reaction Roles & Moderation)
1. Visit: https://carl.gg
2. Invite to server
3. Set up reaction roles for verification
4. Configure auto-moderation

### Ticket Tool (Support Tickets)
1. Visit: https://tickettool.xyz
2. Invite to server
3. Create ticket panel in `#general-bot-support`:
```
🎫 **Need Support?**

Click the button below to open a private support ticket.

Our team will respond within:
• Free members: 24-48 hours
• VIP: 4-8 hours  
• Elite/Pro: 1-2 hours
```

## Step 8: Configure Server Settings

### Verification Level
**Server Settings** → **Safety Setup** → **Verification Level: Medium**
(Members must have verified email)

### Explicit Content Filter
**Safety Setup** → **Explicit Content Filter: Keep me safe**

### Default Notification Settings
**Server Settings** → **Notifications: Only @mentions**
(Prevents spam for new members)

### System Messages Channel
**Server Settings** → **System Messages Channel: #general-chat**

## Step 9: Create Invite Link

1. Click server name → **Invite People**
2. Click **Edit invite link**
3. Settings:
   - Expire after: **Never**
   - Max number of uses: **No limit**
   - Grant temporary membership: **Off**
4. Copy link
5. Save this as your permanent invite URL

## Step 10: Add Discord Link to Website

Add the invite link to:
- Website header
- Website footer
- Bot purchase confirmation email
- Bot README files
- All marketing materials

## Step 11: Create Premium Tier Products

Choose your monetization method:

### Option A: Stripe Integration (Recommended)
1. Create products in Stripe Dashboard:
   - Blue42 VIP - $9.99/month
   - Blue42 Elite - $19.99/month
   - Blue42 Pro - $49.99/month
2. Add to blue42bots.com pricing page
3. Set up webhook to auto-assign Discord roles (see integration guide)

### Option B: Discord Server Subscriptions
*Requires 1000+ members*
1. **Server Settings** → **Enable Monetization**
2. Create subscription tiers
3. Discord handles payments (10% fee)

### Option C: Patreon
1. Create Patreon page
2. Set up tiers matching Discord roles
3. Use Patreon bot to sync roles

## Step 12: Launch Announcement

### Email to Existing Customers
```
Subject: Join the Blue42 Discord Community! 🎉

We've launched the official Blue42 Discord server!

Get:
✅ Fast bot support
✅ Community tips and strategies  
✅ Release alerts for Pokemon drops
✅ Success story sharing
✅ Direct updates from the dev team

Join now: [DISCORD_INVITE_LINK]

See you there!
- Blue42 Team
```

### Social Media Posts
```
🎉 The Blue42 Discord is LIVE!

Join 100+ bot users getting faster checkouts with:
• Priority support
• Exclusive tips
• Community strategies
• Early access to updates

Join: [DISCORD_INVITE_LINK]

#Pokemon #TCG #CheckoutBot
```

## Next Steps Checklist

- [ ] Upload server icon and banner
- [ ] Set up welcome screen
- [ ] Post welcome message in #welcome
- [ ] Post rules in #rules
- [ ] Post FAQ in #faq
- [ ] Set up verification system
- [ ] Add bots (MEE6, Carl-bot, Ticket Tool)
- [ ] Configure server settings
- [ ] Create permanent invite link
- [ ] Add Discord link to website
- [ ] Create premium tier products
- [ ] Announce to existing customers
- [ ] Post on social media
- [ ] Host launch event/giveaway

## Tips for Growth

1. **Content Strategy**
   - Post daily in #release-alerts
   - Share weekly tips in #tips-and-tricks
   - Highlight member success in #success-stories

2. **Engagement**
   - Host weekly Q&A sessions
   - Run monthly giveaways (free bot licenses)
   - Create challenges and competitions

3. **Promotion**
   - Include invite in every bot download
   - Mention in email confirmations
   - Add to social media bios
   - Collaborate with Pokemon influencers

4. **Retention**
   - Respond to support quickly
   - Recognize active members
   - Implement rewards for invites
   - Regular events and updates

Need help? Reference the main `DISCORD_SETUP.md` guide or ask for assistance!
