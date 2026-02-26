import config from '../config/default.js';
import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

// Helper to load persona
const getPersona = async () => {
  // If user has a custom persona file, read it, otherwise use default
  try {
    const custom = await fs.readFile('config/persona.json', 'utf-8');
    return JSON.parse(custom);
  } catch (e) {
    return config.persona;
  }
};

// Main Twitter Client Wrapper
export const initClient = () => {
  // Check for required env vars
  if (!process.env.X_API_KEY || !process.env.X_API_SECRET) {
    console.error("❌ Missing Twitter API keys in .env!");
    console.error("Please add X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET");
    process.exit(1);
  }

  return new TwitterApi({
    appKey: process.env.X_API_KEY,
    appSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_TOKEN_SECRET,
  });
};

export const createDraft = async (type, content) => {
  const timestamp = new Date().toISOString();
  const draft = {
    type,       // "tweet" or "reply"
    content,    // The text
    targetId: null, // For replies
    timestamp,
    status: "pending" // "approved" or "posted"
  };
  
  await fs.writeFile(`.draft_${type}.json`, JSON.stringify(draft, null, 2));
  console.log(`📝 Draft created: ${content.substring(0, 50)}...`);
  return draft;
};
