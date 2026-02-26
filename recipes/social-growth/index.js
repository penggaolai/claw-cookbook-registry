import { runAgent } from './src/agent-main.js';
import dotenv from 'dotenv';
import config from './config/default.js';

dotenv.config();

// Ensure config is loaded
if (!config.twitter.appKey || !config.twitter.appSecret) {
  console.warn("⚠️ Twitter API keys missing! Please check .env file.");
}

// Start Agent Loop
console.log("🦞 Claw Social Backend Starting...");
console.log("---");

// Simple loop: check news every 30 mins
const INTERVAL_MS = 30 * 60 * 1000;

// Run once immediately
runAgent().catch(console.error);

// Then loop
setInterval(() => {
  runAgent().catch(console.error);
}, INTERVAL_MS);
