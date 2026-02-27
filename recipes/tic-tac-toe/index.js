import { TicTacToe } from './src/engine.js';
import { parseMove, replyWithBoard } from './src/social-handler.js';
import { initClient } from './index.js'; // Note: circular import check
import readline from 'node:readline/promises';
import process from 'node:process';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const STATE_FILE = '.game_state.json';

// Shared Client Init
export const initClient = () => {
  const appKey = (process.env.X_API_KEY || "").trim();
  const appSecret = (process.env.X_API_SECRET || "").trim();
  const accessToken = (process.env.X_ACCESS_TOKEN || "").trim();
  const accessSecret = (process.env.X_ACCESS_TOKEN_SECRET || "").trim();

  if (!appKey || !appSecret || !accessToken || !accessSecret) {
    console.error("❌ Missing Twitter API keys in .env!");
    process.exit(1);
  }

  return new TwitterApi({ appKey, appSecret, accessToken, accessSecret });
};

async function main() {
  const isSocialMode = process.env.X_MODE === 'SOCIAL';

  if (isSocialMode) {
    await runSocialGame();
  } else {
    await runLocalGame();
  }
}

async function loadGameState() {
  try {
    const data = await fs.readFile(STATE_FILE, 'utf-8');
    const state = JSON.parse(data);
    const game = new TicTacToe();
    game.board = state.board;
    return { game, lastTweetId: state.lastTweetId };
  } catch (e) {
    return null;
  }
}

async function saveGameState(board, lastTweetId) {
  await fs.writeFile(STATE_FILE, JSON.stringify({ board, lastTweetId }, null, 2));
}

async function checkAndReply(state, stopCallback) {
  const { game, lastTweetId } = state;
  const client = initClient();

  console.log(`\n📡 [${new Date().toLocaleTimeString()}] Checking for replies to: ${lastTweetId}...`);

  try {
    // 1. Verify the parent tweet still exists
    try {
      await client.v2.singleTweet(lastTweetId);
    } catch (e) {
      if (e.code === 404 || (e.data && e.data.errors?.some(err => err.title === 'Not Found Error'))) {
        console.log("\n⚠️ The current match tweet has been deleted or is inaccessible.");
        stopCallback();
        return;
      }
    }

    // 2. Search for replies
    const replies = await client.v2.search(`to:penggaolai`, {
      'tweet.fields': ['referenced_tweets', 'author_id', 'text'],
      'expansions': ['author_id']
    });

    const tweets = (replies.data && Array.isArray(replies.data)) ? replies.data : [];
    const mention = tweets.find(t => 
      t.referenced_tweets?.some(ref => ref.type === 'replied_to' && ref.id === lastTweetId)
    );

    if (mention) {
      console.log(`🎯 Found move: "${mention.text}"`);
      const userMove = parseMove(mention.text);
      
      if (userMove !== null && game.makeMove(userMove, '❌')) {
        const available = game.getAvailableMoves();
        if (available.length > 0) {
          const botMove = available[Math.floor(Math.random() * available.length)];
          game.makeMove(botMove, '⭕');
        }

        const user = replies.includes.users.find(u => u.id === mention.author_id);
        const newTweetId = await replyWithBoard(mention.id, user.username, game);
        
        if (newTweetId) {
          state.lastTweetId = newTweetId;
          await saveGameState(game.board, newTweetId);
          console.log(`✅ Game Progressed! New Tweet: ${newTweetId}`);
        }
      } else {
        console.log("⚠️ Invalid move or position taken.");
      }
    } else {
      console.log("💤 No new valid moves yet.");
    }
  } catch (err) {
    console.error("❌ Listener error:", err.message);
  }
}

async function runSocialGame() {
  console.log("\n🎮 'The Grandmaster' Social Mode Active");
  console.log("---------------------------------------");

  let state = await loadGameState();
  
  if (state) {
    console.log("📍 Found an active game.");
    let validResume = false;
    while (!validResume) {
      const resume = await rl.question("Resume existing match? [y/n]: ");
      if (resume.toLowerCase() === 'y') {
        validResume = true;
      } else if (resume.toLowerCase() === 'n') {
        state = null;
        validResume = true;
      } else {
        console.log("⚠️ Invalid input. Please enter 'y' for yes or 'n' for no.");
      }
    }
  }

  if (!state) {
    console.log("\n🚀 Serving a new community challenge to X...");
    const game = new TicTacToe();
    const client = initClient();
    const board = game.renderBoard();
    const text = `🎮 I challenge you to a game of Tic-Tac-Toe!\n\nI'll start with ⭕ in the center. \n\n${board.replace('⬛', '⭕')}\n\nReply with your move (e.g., 'Top Left' or '0') to play! \n#AI #GameNight #ClawCookbook`;

    try {
      const resp = await client.v2.tweet(text);
      state = { game, lastTweetId: resp.data.id };
      state.game.board[4] = '⭕';
      await saveGameState(state.game.board, state.lastTweetId);
      console.log(`✅ Match Posted! Tweet ID: ${state.lastTweetId}`);
    } catch (err) {
      console.error("❌ Failed to post game:", err.message);
      process.exit(1);
    }
  }

  console.log("\n📡 Background listener started.");
  console.log("Type [q] to quit at any time (game state will be saved).");

  const stopListener = () => {
    clearInterval(poll);
    console.log("\nPress [Enter] to return to the main menu...");
  };

  const poll = setInterval(() => checkAndReply(state, stopListener), 2 * 60 * 1000);
  checkAndReply(state, stopListener); 

  const input = await rl.question("");
  if (input.toLowerCase() === 'q') {
    clearInterval(poll);
    console.log("👋 Shutting down. State preserved.");
    process.exit(0);
  } else if (!poll._idleTimeout) {
     // Listener was stopped by checkAndReply
     await runSocialGame(); // Recursively restart
  }
}

async function runLocalGame() {
  const game = new TicTacToe();
  console.log("\n🎮 Welcome to 'The Grandmaster' Tic-Tac-Toe!");
  console.log("------------------------------------------");
  console.log("Board Layout Guide:");
  console.log(`
    0 | 1 | 2
    ---------
    3 | 4 | 5
    ---------
    6 | 7 | 8
  `);

  while (true) {
    console.log("\nCurrent Board:");
    console.log(game.renderBoard());

    const winner = game.checkWinner();
    if (winner) {
      if (winner === 'draw') console.log("🤝 It's a draw!");
      else console.log(`${winner === '❌' ? '🎉 You win!' : '🤖 The Grandmaster wins!'}`);
      break;
    }

    const input = await rl.question("Your move [0-8] or [q]: ");
    if (input.toLowerCase() === 'q') break;

    const index = parseInt(input);
    if (isNaN(index) || !game.makeMove(index, '❌')) {
      console.log("⚠️ Invalid move! Try again.");
      continue;
    }

    const available = game.getAvailableMoves();
    if (available.length > 0) {
      const botMove = available[Math.floor(Math.random() * available.length)];
      game.makeMove(botMove, '⭕');
      console.log(`\n🤖 Bot plays at position ${botMove}`);
    }
  }
  console.log("\nThanks for playing! 👋");
  rl.close();
}

main().catch(console.error);
