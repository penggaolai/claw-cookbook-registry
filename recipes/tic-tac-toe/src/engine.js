export class TicTacToe {
  constructor() {
    this.board = Array(9).fill(null);
    this.symbols = { player: '❌', bot: '⭕', empty: '⬛' };
  }

  makeMove(index, symbol) {
    if (index < 0 || index > 8 || this.board[index] !== null) return false;
    this.board[index] = symbol;
    return true;
  }

  checkWinner() {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diags
    ];
    for (const [a, b, c] of lines) {
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        return this.board[a];
      }
    }
    if (!this.board.includes(null)) return 'draw';
    return null;
  }

  renderBoard() {
    let output = "";
    for (let i = 0; i < 9; i += 3) {
      output += this.board.slice(i, i + 3).map(s => s || this.symbols.empty).join(' ') + '\n';
    }
    return output;
  }

  getAvailableMoves() {
    return this.board.map((v, i) => v === null ? i : null).filter(v => v !== null);
  }
}
