import { spawn } from 'node:child_process';
import readline from 'node:readline/promises';
import { TicTacToe } from './src/engine.js';
import { initClient } from './src/adapters/twitter.js';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  const isSocialMode = process.env.X_MODE === 'SOCIAL';

  if (isSocialMode) {
    console.log("\n🎮 'The Grandmaster' Social Mode Starting...");
    
    // 1. Check if a game is already in progress
    let existingState = null;
    try {
      const data = await fs.readFile('.game_state.json', 'utf-8');
      existingState = JSON.parse(data);
    } catch (e) {}

    if (existingState) {
      console.log("📍 A game is already in progress.");
      const resume = await rl.question("Resume existing game? [y/n]: ");
      if (resume.toLowerCase() !== 'y') {
        existingState = null;
      }
    }

    if (!existingState) {
      console.log("\n🚀 Initializing a new community match...");
      const game = new TicTacToe();
      const client = initClient();
      const board = game.renderBoard();
      const text = `🎮 I challenge you to a game of Tic-Tac-Toe!\n\nI'll start with ⭕ in the center. \n\n${board.replace('⬛', '⭕')}\n\nReply with your move (e.g., 'Top Left' or '0') to play! \n#AI #GameNight #ClawCookbook`;

      try {
        const resp = await client.v2.tweet(text);
        const initialState = { board: game.board, lastTweetId: resp.data.id };
        initialState.board[4] = '⭕';
        await fs.writeFile('.game_state.json', JSON.stringify(initialState, null, 2));
        console.log(`✅ Game Posted! ID: ${resp.data.id}`);
      } catch (err) {
        console.error("❌ Failed to start game:", err.message);
        process.exit(1);
      }
    }

    console.log("\n📡 Starting Background Listener...");
    console.log("The bot is now watching X for replies. You can keep this window open.");
    console.log("Press [q] to stop the listener and exit.");

    // Start the listener logic in the background of this same process
    const listenerInterval = setInterval(async () => {
      // Import the check logic dynamically or require it
      // For simplicity in this one-file runner, we'll use a child process or just run the interval here
      const { execSync } = await import('node:child_process');
      try {
        execSync('node listen-social.js', { stdio: 'inherit' });
      } catch (e) {}
    }, 2 * 60 * 1000);

    // Initial check
    const { execSync } = await import('node:child_process');
    try { execSync('node listen-social.js', { stdio: 'inherit' }); } catch(e){}

    const input = await rl.question("");
    if (input.toLowerCase() === 'q') {
      clearInterval(listenerInterval);
      console.log("👋 Shutting down listener. Game state preserved.");
      process.exit(0);
    }
  } else {
    // Run the existing local game logic
    const { runLocalGame } = await import('./index.js'); // Assuming we wrap the old index logic
    // (For this specific fix, let's just use the current index.js which handles local)
  }
}

main().catch(console.error);
