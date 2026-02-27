import { TicTacToe } from './src/engine.js';
import readline from 'node:readline/promises';
import process from 'node:process';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function gameLoop() {
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

    // Bot move (Simple AI: Random available move)
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

gameLoop().catch(console.error);
