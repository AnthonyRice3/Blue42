/**
 * PM2 Ecosystem Config for Railway Deployment
 * 
 * Runs three persistent Discord bots:
 * 1. discord-bot.js — Verification + Support Tickets
 * 2. scrape-drop-alerts.js — TCG drop polling (Target, Costco, Walmart, Sam's Club)
 * 3. relay-rattle-pokemon.js — Relay drops from Rattle Pokemon server
 * 
 * Railway will run: npm start → pm2-runtime start ecosystem.config.js
 */

module.exports = {
  apps: [
    {
      name: 'verification-bot',
      script: './discord-bot.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'drop-scraper',
      script: './scrape-drop-alerts.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'rattle-relay',
      script: './relay-rattle-pokemon.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
