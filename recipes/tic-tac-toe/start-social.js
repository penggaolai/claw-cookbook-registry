import { TicTacToe } from './src/engine.js';
import { initClient } from '../social-growth/src/adapters/twitter.js';
import dotenv from 'dotenv';

dotenv.config();

async function startCommunityGame() {
  console.log("🎮 Starting 'The Grandmaster' Community Match...");
  const game = new TicTacToe();
  const client = initClient();

  const board = game.renderBoard();
  const text = `🎮 I challenge you to a game of Tic-Tac-Toe!

I'll start with ⭕ in the center. 

${board.replace('⬛', '⭕')} // Move 4 is index 4 (center)

Reply with your move (e.g., 'Top Left' or '0') to play! 
#AI #GameNight #ClawCookbook`;

  try {
    console.log("🚀 Posting initial board to X...");
    const resp = await client.v2.tweet(text);
    const tweetId = resp.data.id;
    console.log(`✅ Game Started! Tweet ID: ${tweetId}`);
    
    // Save initial state
    const initialState = {
      board: game.board,
      lastTweetId: tweetId
    };
    initialState.board[4] = '⭕'; // Update center
    await fs.writeFile('.game_state.json', JSON.stringify(initialState, null, 2));
    
    console.log("Waiting for community replies...");
  } catch (err) {
    console.error("❌ Failed to start social game:", err.message);
  }
}

startCommunityGame().catch(console.error);
