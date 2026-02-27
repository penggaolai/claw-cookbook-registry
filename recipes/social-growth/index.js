import { runAgent } from './src/agent-main.js';
import { postTweet } from './src/adapters/twitter.js';
import dotenv from 'dotenv';
import config from './config/default.js';
import readline from 'node:readline/promises';
import process from 'node:process';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ensure config is loaded
if (!config.twitter.appKey || !config.twitter.appSecret) {
  console.warn("⚠️ Twitter API keys missing! Please check .env file.");
}

async function mainLoop() {
  console.log("\n🦞 Claw Social Agent Starting...");
  console.log("----------------------------------");

  const startLoop = async () => {
    try {
      const draft = await runAgent();
      
      if (!draft) {
        console.log("👋 Chef is leaving the kitchen. Goodbye!");
        rl.close();
        process.exit(0);
      }

      await handleDiscovery(draft);
    } catch (err) {
      console.error("❌ Error in agent run:", err.message);
      await promptAction();
    }
  };

  const handleDiscovery = async (draft) => {
    const hasPlaceholder = draft.content.includes("[Your expert take here]");
    const newsTitle = draft.content.split('\n')[0].replace('🤖 AI Update: ', '');
    const newsLink = draft.content.match(/🔗 (https?:\/\/[^\s]+)/)?.[1] || "";

    console.log("\n--- 📰 TOP STORY DISCOVERED ---");
    console.log(`Title:  ${newsTitle}`);
    console.log(`Link:   ${newsLink}`);
    console.log(`Source: Google News AI Scout`);
    console.log("-------------------------------");
    
    let action;
    if (hasPlaceholder) {
      action = await rl.question("\nOptions: [v] View Draft | [a] Add Insight | [n] Next Story | [q] Quit: ");
    } else {
      action = await rl.question("\nOptions: [p] Post to X | [v] View Draft | [a] Edit Insight | [n] Next Story | [q] Quit: ");
    }

    action = action.toLowerCase();

    if (action === 'v') {
      console.log("\n--- 📝 CURRENT DRAFT ---");
      console.log(draft.content);
      console.log("------------------------");
      return handleDiscovery(draft);
    } else if (action === 'a') {
      const fullTitle = draft.content.split('\n')[0];
      const linkMatch = draft.content.match(/🔗 (https?:\/\/[^\s]+)/);
      const newsLinkFull = linkMatch ? linkMatch[0] : "";
      const tags = draft.content.split('\n').pop();
      
      const fixedPartsLength = fullTitle.length + 12 + 2 + 23 + 1 + tags.length; 
      const maxInsightLength = 280 - fixedPartsLength;

      console.log(`\nNote: To stay under X's limit, your insight should be under ${maxInsightLength} characters.`);
      const newInsight = await rl.question(`Enter your expert insight (max ${maxInsightLength}): `);
      
      const updatedContent = draft.content.replace("[Your expert take here]", newInsight);
      
      const urlRegex = /https?:\/\/[^\s]+/g;
      const links = updatedContent.match(urlRegex) || [];
      let calculatedLength = updatedContent.replace(urlRegex, '').length + (links.length * 23);
      
      console.log(`\n--- 🧐 FINAL REVIEW (${calculatedLength}/280 chars) ---`);
      console.log(updatedContent);
      console.log("-----------------------");
      
      if (calculatedLength > 280) {
        console.log(`⚠️  Tweet is too long by ${calculatedLength - 280} characters!`);
        console.log("Please shorten your insight and try again.");
        return handleDiscovery(draft);
      }
      
      const confirm = await rl.question("\nEverything looks good and ready to be posted to X? [y/n]: ");
      if (confirm.toLowerCase() === 'y') {
        await postTweet(updatedContent);
        return startLoop();
      } else {
        console.log("⏭️ Post cancelled.");
        return handleDiscovery(draft);
      }
    } else if (action === 'p') {
      if (hasPlaceholder) {
        console.log("\n⚠️ Cannot post: Please add your expert insight first [a].");
        return handleDiscovery(draft);
      } else {
        await postTweet(draft.content);
        return startLoop();
      }
    } else if (action === 'q') {
      console.log("👋 Chef is leaving the kitchen. Goodbye!");
      rl.close();
      process.exit(0);
    } else if (action === 'n') {
      console.log("⏭️ Skipping to next story...");
      return startLoop();
    } else {
      console.log("⚠️ Invalid input. Please try again.");
      return handleDiscovery(draft);
    }
  };

  const promptAction = async () => {
    const choice = await rl.question("\nMenu: [n] Next Story | [q] Quit: ");
    if (choice.toLowerCase() === 'n') {
      await startLoop();
    } else if (choice.toLowerCase() === 'q') {
      console.log("👋 Chef is leaving the kitchen. Goodbye!");
      rl.close();
      process.exit(0);
    } else {
      console.log("⚠️ Invalid input.");
      await promptAction();
    }
  };

  await startLoop();
}

mainLoop().catch(console.error);
