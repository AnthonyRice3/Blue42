# Blue42 Discord Server Setup

This folder contains scripts to automatically set up your Blue42 Discord server with all channels, roles, and permissions.

## Quick Start

### Step 1: Create the Discord Server Manually
1. Open Discord
2. Click the **+** button in the left sidebar
3. Select **"Create My Own"**
4. Choose **"For a club or community"**
5. Server Name: `Blue42 - Premium Checkout Bots`
6. Click **"Create"**

### Step 2: Enable Community Features
1. Go to **Server Settings** → **Enable Community**
2. Accept the terms
3. Set up Safety Setup (default settings are fine)
4. Click **"Get Started"** → **"Finish Setup"**

### Step 3: Create a Discord Bot
1. Go to https://discord.com/developers/applications
2. Click **"New Application"**
3. Name it: `Blue42 Setup Bot`
4. Go to **"Bot"** tab → Click **"Add Bot"**
5. Under **"Privileged Gateway Intents"**, enable:
   - ✅ Server Members Intent
   - ✅ Message Content Intent
6. Click **"Reset Token"** → Copy the token
7. Save it for the next step

### Step 4: Get Your Server ID
1. In Discord, go to **User Settings** → **Advanced**
2. Enable **"Developer Mode"**
3. Right-click your server icon → **"Copy Server ID"**
4. Save this ID

### Step 5: Invite the Bot to Your Server
1. In Discord Developer Portal, go to **"OAuth2"** → **"URL Generator"**
2. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select bot permissions:
   - ✅ Administrator (for easy setup)
4. Copy the generated URL
5. Open it in your browser
6. Select your Blue42 server → **"Authorize"**

### Step 6: Run the Setup Script
1. Open `setup-config.json`
2. Add your bot token and server ID:
```json
{
  "botToken": "YOUR_BOT_TOKEN_HERE",
  "serverId": "YOUR_SERVER_ID_HERE"
}
```
3. Run:
```bash
npm install
node setup-server.js
```

The script will automatically create:
- ✅ 7 channel categories
- ✅ 30+ channels
- ✅ 15+ roles with proper permissions
- ✅ Role hierarchy
- ✅ Channel permissions

**Total setup time: ~2 minutes**

## What Gets Created

### Roles (15)
- 🔴 Owner (Admin)
- 🟠 Admin
- 🟡 Moderator
- 💎 Blue42 VIP ($9.99/mo)
- 👑 Blue42 Elite ($19.99/mo)
- 💰 Blue42 Pro ($49.99/mo)
- ✅ Verified
- 🤖 Bot Owner
- 🎯 Costco Bot User
- ⚡ Target Bot User
- 📊 Eth Bot User
- 🆕 New Member
- 💬 Active Member
- 🏆 Success Story
- 🎓 Helper

### Categories & Channels (30+)
1. **WELCOME & INFO** (5 channels)
2. **GENERAL** (4 channels)
3. **BOT SUPPORT** (4 channels)
4. **VIP SUPPORT** (4 channels)
5. **ANALYTICS & UPDATES** (3 channels)
6. **TUTORIALS** (3 channels)
7. **COMMUNITY** (3 channels)
8. **VOICE CHANNELS** (3 channels)

## After Setup

1. Upload server icon (Blue42 logo)
2. Create server banner
3. Set up welcome screen
4. Configure verification message
5. Add additional bots (MEE6, Carl-bot, etc.)

See `post-setup-guide.md` for next steps.
