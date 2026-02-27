import { initClient } from './adapters/twitter.js';
import { TicTacToe } from './src/engine.js';
import { parseMove, replyWithBoard } from './src/social-handler.js';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

const STATE_FILE = '.game_state.json';

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

async function checkAndReply() {
  const state = await loadGameState();
  if (!state) {
    console.log("Waiting for game to start. Run start-social.js first.");
    return;
  }

  const { game, lastTweetId } = state;
  const client = initClient();

  console.log(`Checking for replies to tweet: ${lastTweetId}...`);

  try {
    // Search for mentions/replies to the last tweet
    const replies = await client.v2.search(`to:penggaolai`, {
      'tweet.fields': ['referenced_tweets', 'author_id', 'text'],
      'expansions': ['author_id']
    });

    const mention = (replies.data || []).find(t => 
      t.referenced_tweets?.some(ref => ref.type === 'replied_to' && ref.id === lastTweetId)
    );

    if (mention) {
      console.log(`Found move from user: ${mention.text}`);
      const userMove = parseMove(mention.text);
      
      if (userMove !== null && game.makeMove(userMove, '❌')) {
        console.log(`Valid move at ${userMove}. Grandmaster countering...`);
        
        const available = game.getAvailableMoves();
        if (available.length > 0) {
          const botMove = available[Math.floor(Math.random() * available.length)];
          game.makeMove(botMove, '⭕');
        }

        const user = replies.includes.users.find(u => u.id === mention.author_id);
        const newTweetId = await replyWithBoard(mention.id, user.username, game);
        
        if (newTweetId) {
          await saveGameState(game.board, newTweetId);
          console.log(`Game progressed. New Tweet ID: ${newTweetId}`);
        }
      } else {
        console.log("Invalid move or position taken.");
      }
    } else {
      console.log("No new valid replies found.");
    }
  } catch (err) {
    console.error("Listener error:", err.message);
  }
}

// Polling Loop
console.log("🎮 The Grandmaster Social Listener is active.");
setInterval(checkAndReply, 2 * 60 * 1000); // Check every 2 mins
checkAndReply();
