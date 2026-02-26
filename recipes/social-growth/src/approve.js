import fs from 'fs/promises';
import readline from 'readline';
import { initClient } from './twitter-utils.js';
import dotenv from 'dotenv';

dotenv.config();

const DRAFT_FILE = '.draft_tweet.json';

const askQuestion = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
};

const main = async () => {
  console.log("🦞 Claw Social - Approval Mode");
  console.log("---");

  // 1. Read Draft
  let draft;
  try {
    const data = await fs.readFile(DRAFT_FILE, 'utf-8');
    draft = JSON.parse(data);
  } catch (e) {
    console.log("❌ No draft found. Run 'npm start' first to generate one.");
    process.exit(0);
  }

  if (draft.status === 'posted') {
    console.log("⚠️ This draft was already posted.");
    process.exit(0);
  }

  // 2. Show Draft
  console.log(`\n📝 DRAFT TWEET (${draft.timestamp}):`);
  console.log("--------------------------------------------------");
  console.log(draft.content);
  console.log("--------------------------------------------------");
  console.log(`Length: ${draft.content.length} chars`);

  // 3. Ask for Approval
  const answer = await askQuestion("\n🚀 Post this tweet? (Y/n/edit): ");

  if (answer.toLowerCase() === 'y' || answer === '') {
    // POST
    console.log("\nPosting to Twitter/X...");
    const client = initClient();
    try {
      const rwClient = client.readWrite;
      const tweet = await rwClient.v2.tweet(draft.content);
      console.log(`✅ Tweet sent! ID: ${tweet.data.id}`);
      
      // Update status
      draft.status = 'posted';
      draft.postedAt = new Date().toISOString();
      draft.tweetId = tweet.data.id;
      await fs.writeFile(DRAFT_FILE, JSON.stringify(draft, null, 2));
      
    } catch (e) {
      console.error("❌ Failed to post:", e);
    }
  } else if (answer.toLowerCase() === 'edit') {
    // Simple edit mode
    const newContent = await askQuestion("\nEnter new content:\n");
    draft.content = newContent;
    await fs.writeFile(DRAFT_FILE, JSON.stringify(draft, null, 2));
    console.log("✅ Draft updated. Run 'npm run approve' again to post.");
  } else {
    console.log("❌ Cancelled.");
  }
};

main().catch(console.error);
