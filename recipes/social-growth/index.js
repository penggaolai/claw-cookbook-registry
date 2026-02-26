import { runAgent } from './src/agent-main.js';
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
  console.log("\n🦞 Claw Social Backend Starting...");
  console.log("----------------------------------");
  console.log("Commands: [r] Run Now | [q] Quit");

  const startLoop = async () => {
    try {
      // runAgent now returns the draft object so we can handle it interactively
      const draft = await runAgent();
      
      if (!draft) {
        // No more news to draft
        console.log("👋 Chef is leaving the kitchen. Goodbye!");
        rl.close();
        process.exit(0);
      }

      if (draft && draft.status === 'pending') {
        const hasPlaceholder = draft.content.includes("[Your expert take here]");
        
        // Extract basic news info for a cleaner "News First" display
        const newsTitle = draft.content.split('\n')[0].replace('🤖 AI Update: ', '');
        const newsLink = draft.content.match(/🔗 (https?:\/\/[^\s]+)/)?.[1] || "";

        console.log("\n--- 📰 TOP STORY DISCOVERED ---");
        console.log(`Title: ${newsTitle}`);
        console.log(`Link:  ${newsLink}`);
        console.log("-------------------------------");
        
        let action;
        if (hasPlaceholder) {
          action = await rl.question("\nOptions: [v] View Draft | [a] Add Insight | [s] Skip | [q] Quit: ");
        } else {
          action = await rl.question("\nOptions: [p] Post to X | [v] View Draft | [a] Edit Insight | [s] Skip | [q] Quit: ");
        }

        if (action.toLowerCase() === 'v') {
          console.log("\n--- 📝 CURRENT DRAFT ---");
          console.log(draft.content);
          console.log("------------------------");
          // Re-prompt for the next move
          return startLoopAfterDiscovery(draft);
        }
        
        await handleAction(action, draft);
      }
    } catch (err) {
      console.error("❌ Error in agent run:", err.message);
    }
    
    promptAction();
  };

  const startLoopAfterDiscovery = async (draft) => {
    const hasPlaceholder = draft.content.includes("[Your expert take here]");
    const prompt = hasPlaceholder 
      ? "\nOptions: [a] Add Insight | [s] Skip | [q] Quit: "
      : "\nOptions: [p] Post to X | [a] Edit Insight | [s] Skip | [q] Quit: ";
    
    const action = await rl.question(prompt);
    await handleAction(action, draft);
    promptAction();
  };

  const handleAction = async (action, draft) => {
    const hasPlaceholder = draft.content.includes("[Your expert take here]");

    if (action.toLowerCase() === 'a') {
      const newInsight = await rl.question("Enter your expert insight: ");
      const updatedContent = draft.content.replace("[Your expert take here]", newInsight);
      
      console.log("\n--- 🧐 FINAL TWEET REVIEW ---");
      console.log(updatedContent);
      console.log("------------------------------");
      
      const confirm = await rl.question("\nDoes this look correct? Post to X now? [y/n]: ");
      if (confirm.toLowerCase() === 'y') {
        console.log("🚀 Posting to X...");
        console.log("✅ Posted successfully! (Simulated)");
      } else {
        console.log("⏭️ Post cancelled.");
      }
    } else if (action.toLowerCase() === 'p') {
      if (hasPlaceholder) {
        console.log("\n⚠️ Cannot post: Please add your expert insight first [a].");
      } else {
        console.log("🚀 Posting to X...");
        console.log("✅ Posted successfully! (Simulated)");
      }
    } else if (action.toLowerCase() === 'q') {
      console.log("👋 Chef is leaving the kitchen. Goodbye!");
      rl.close();
      process.exit(0);
    } else if (action.toLowerCase() === 's') {
      console.log("⏭️ Draft skipped.");
    }
  };

  const promptAction = async () => {
    const choice = await rl.question("\nMenu: [n] Next (Check for new news) | [q] Quit & Exit: ");
    if (choice.toLowerCase() === 'n') {
      await startLoop();
    } else if (choice.toLowerCase() === 'q') {
      console.log("👋 Chef is leaving the kitchen. Goodbye!");
      rl.close();
      process.exit(0);
    } else {
      promptAction();
    }
  };

  await startLoop();
}

mainLoop().catch(console.error);
