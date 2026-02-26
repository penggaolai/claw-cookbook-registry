import config from '../../config/default.js';
import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

export const initClient = () => {
  if (!process.env.X_API_KEY || !process.env.X_API_SECRET) {
    console.error("❌ Missing Twitter API keys in .env!");
    process.exit(1);
  }

  return new TwitterApi({
    appKey: process.env.X_API_KEY,
    appSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_TOKEN_SECRET,
  });
};

export const postTweet = async (text) => {
  console.log("🚀 Posting to X...");
  try {
    const client = initClient();
    await client.v2.tweet(text);
    console.log("✅ Posted successfully!");
  } catch (err) {
    console.error("❌ Failed to post to X:", err.message);
  }
};

export const createDraft = async (type, content) => {
  const timestamp = new Date().toISOString();
  const draft = {
    type,
    content,
    targetId: null,
    timestamp,
    status: "pending"
  };
  
  await fs.writeFile(`.draft_${type}.json`, JSON.stringify(draft, null, 2));
  console.log(`📝 Draft created: ${content.substring(0, 50)}...`);
  return draft;
};
