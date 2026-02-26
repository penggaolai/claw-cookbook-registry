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
      
      if (draft && draft.status === 'pending') {
        console.log("\n--- 📝 PENDING DRAFT ---");
        console.log(draft.content);
        console.log("------------------------");
        
        const action = await rl.question("\nOptions: [e] Edit Take | [a] Approve & Post | [s] Skip: ");
        
        if (action.toLowerCase() === 'e') {
          const newTake = await rl.question("Enter your expert take: ");
          const updatedContent = draft.content.replace("[Your expert take here]", newTake);
          console.log("\n✅ Updated Draft:");
          console.log(updatedContent);
          
          const confirm = await rl.question("\nPost now? [y/n]: ");
          if (confirm.toLowerCase() === 'y') {
            console.log("🚀 Posting to X...");
            // Here we would call the actual Twitter post logic
            console.log("✅ Posted successfully! (Simulated)");
          }
        } else if (action.toLowerCase() === 'a') {
          console.log("🚀 Posting original draft to X...");
          console.log("✅ Posted successfully! (Simulated)");
        } else {
          console.log("⏭️ Draft skipped.");
        }
      }
    } catch (err) {
      console.error("❌ Error in agent run:", err.message);
    }
    
    promptAction();
  };

  const promptAction = async () => {
    const choice = await rl.question("\nAction [r/q]: ");
    if (choice.toLowerCase() === 'r') {
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
