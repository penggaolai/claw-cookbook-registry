import { TicTacToe } from './src/engine.js';
import { parseMove, replyWithBoard } from './src/social-handler.js';
import readline from 'node:readline/promises';
import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const isSocialMode = process.env.X_MODE === 'SOCIAL';

async function main() {
  if (isSocialMode) {
    console.log("\n🎮 'The Grandmaster' is starting in SOCIAL MODE.");
    console.log("----------------------------------------------");
    console.log("Instructions: The agent will post a board to X.");
    console.log("When a user replies with a move, it will counter and reply back.");
    
    // For the "Chef-in-the-loop" experience, let's start a game
    const game = new TicTacToe();
    console.log("\nStarting a fresh community match...");
    console.log(game.renderBoard());
    
    const confirm = await rl.question("\nPost initial challenge to X? [y/n]: ");
    if (confirm.toLowerCase() === 'y') {
       console.log("🚀 Posting initial board to X... (Simulated until next loop)");
       // In a full implementation, this triggers the background listener
    }
  } else {
    // Local Terminal Loop (Existing)
    await runLocalGame();
  }
}

async function runLocalGame() {
  const game = new TicTacToe();
  console.log("\n🎮 Welcome to 'The Grandmaster' Tic-Tac-Toe!");
  console.log("------------------------------------------");
  console.log("Commands: [0-8] to move | [q] Quit\n");

  const boardMap = `
    0 | 1 | 2
    ---------
    3 | 4 | 5
    ---------
    6 | 7 | 8
  `;

  console.log("Board Layout Guide:");
  console.log(boardMap);

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
