/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

class Player {
  constructor(color, playerNumber) {
    this.color = color;
    this.num = playerNumber;
  }
}

class Game {
  constructor(height, width) {
    this.height = height;
    this.width = width;
    this.board = [];
    this.over = false;
    this.winner = null; // the player who won the game. null for ongoing games and ties

    this.players = [
      new Player(document.querySelector('#p1Color').value, 1),
      new Player(document.querySelector('#p2Color').value, 2)];
    this.currPlayer = this.players[0]
    
    this.makeBoard();
    this.makeHtmlBoard();
  }
  
  /** makeBoard: create in-JS board structure:
  *   board = array of rows, each row is array of cells  (board[y][x])
  */

  makeBoard() {
    for (let y = 0; y < this.height; y++) {
      this.board.push(Array.from({ length: this.width }));
    }
  }

  /** makeHtmlBoard: make HTML table and row of column tops. */
  makeHtmlBoard() {
    const board = document.getElementById('board');

    // make column tops (clickable area for adding a piece to that column)
    const top = document.createElement('tr');
    top.setAttribute('id', 'column-top');
    top.addEventListener('click', this.handleClick.bind(this));

    for (let x = 0; x < this.width; x++) {
      const headCell = document.createElement('td');
      headCell.setAttribute('id', x);
      top.append(headCell);
    }
    board.append(top);

    // make main part of board
    for (let y = 0; y < this.height; y++) {
      const row = document.createElement('tr');

      for (let x = 0; x < this.width; x++) {
        const cell = document.createElement('td');
        cell.setAttribute('id', `${y}-${x}`);
        row.append(cell);
      }

      board.append(row);
    }
  }

  /** findSpotForCol: given column x, return top empty y (null if filled) */

  findSpotForCol(x) {
    for (let y = this.height - 1; y >= 0; y--) {
      if (!this.board[y][x]) {
        return y;
      }
    }
    return null;
  }

  /** placeInTable: update DOM to place piece into HTML table of board */

  placeInTable(y, x) {
    const piece = document.createElement('div');
    piece.classList.add('piece');
    piece.classList.add(`p${this.currPlayer.num}`);
    piece.style.backgroundColor = this.currPlayer.color;
    piece.style.top = -50 * (y + 2);
  
    const spot = document.getElementById(`${y}-${x}`);
    spot.append(piece);
  }

  /** endGame: announce game end */
  
  endGame(msg) {
    this.over = true;
    alert(msg);
  }

  /** handleClick: handle click of column top to play piece */

  handleClick(evt) {
    // make sure the game isn't over
    if (this.over) {
      const prefix = 'The game is over! ';
      const suffix = ' Click New Game to start a new game.';
      let msgMid = '';
      if (this.winner) {
        msgMid = `Player ${this.winner.num} won.`;
      }
      else {
        msgMid = 'It ended in a draw';
      }
      return alert(prefix + msgMid + suffix);
    }
    // get x from ID of clicked cell
    const x = +evt.target.id;

    // get next spot in column (if none, ignore click)
    const y = this.findSpotForCol(x);
    if (y === null) {
      return;
    }

    // place piece in board and add to HTML table
    this.board[y][x] = this.currPlayer;
    this.placeInTable(y, x);

    // check for win
    if (this.checkForWin()) {
      this.endGame(`Player ${this.currPlayer.num} won!`);
      this.winner = this.currPlayer;
      return;
    }

    // check for tie
    if (this.board.every(row => row.every(cell => cell))) {
      return this.endGame('Tie!');
    }

    // switch players
    const playerIndex = this.players.indexOf(this.currPlayer);
    if (playerIndex+1 < this.players.length) {
      this.currPlayer = this.players[playerIndex+1]
    }
    else {this.currPlayer = this.players[0]}
  }

  /** checkForWin: check board cell-by-cell for "does a win start here?" */

  checkForWin() {
    function _win(cells) {
      // Check four cells to see if they're all color of current player
      //  - cells: list of four (y, x) cells
      //  - returns true if all are legal coordinates & all match currPlayer
      
      return cells.every(
        ([y, x]) =>
          y >= 0 &&
          y < this.height &&
          x >= 0 &&
          x < this.height &&
          this.board[y][x] === this.currPlayer
      );
    }
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // get "check list" of 4 cells (starting here) for each of the different
        // ways to win
        const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
        const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
        const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
        const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

        // find winner (only checking each win-possibility as needed)
        if (_win.call(this, horiz) || _win.call(this, vert) || _win.call(this,diagDR) ||
          _win.call(this,diagDL)) {
          return true;
        }
      }
    }
  }
}

let game;
document.querySelector('#startBtn').addEventListener('click',function(e){
  e.preventDefault();
  const board = document.querySelector('#board')
  while(board.lastChild) {
    board.removeChild(board.lastChild);
  }
  game = new Game(6,7);
})