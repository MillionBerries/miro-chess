import { Chess } from 'chess.js';

const CellSize = 50;
const CellsInBoard = 8;

const BrightCellColor = '#f7d18b';
const DarkCellColor = '#a77858';

const PieceCharToEmojiMap = new Map([
  ['p', '♟'],
  ['n', '♞'],
  ['b', '♝'],
  ['r', '♜'],
  ['q', '♛'],
  ['k', '♚'],
]);

const frameXY = (frame) => {
  return {
    frameX: frame.x - frame.width / 2,
    frameY: frame.y - frame.height / 2,
  };
};

const coordsForPosition = (frame, row, col) => {
  const { frameX, frameY } = frameXY(frame);

  return {
    x: frameX + col * CellSize + CellSize / 2,
    y: frameY + frame.height - (row * CellSize + CellSize / 2),
  };
};

const notationForPosition = (row, col) => {
  return 'abcdefgh'[col] + (row + 1);
};

const finishTheGame = async (board) => {
  const whoseTurn = board.whoseTurn() === 'w' ? 'White' : 'Black';
  const stickyNoteText = board.isCheckmate()
    ? `Checkmate. ${whoseTurn} lost`
    : board.isDraw()
    ? 'Draw'
    : board.isStalemate()
    ? 'Stalemate'
    : board.isThreefoldRepetition()
    ? 'Threefold Repetition'
    : '';
  await miro.board.createStickyNote({
    content: 'The game is finished 🎉 \n' + stickyNoteText,
    style: {
      fillColor: 'light_pink',
      textAlign: 'center',
      textAlignVertical: 'middle',
    },
    x: board.frame.x,
    y: board.frame.y,
    shape: 'square',
    width: board.frame.width / 2,
  });
};


/* 
  const piece = new Piece('♜', 'w', 3, 4);
  await piece.createOrRestoreShapeAsync(frame);
*/
const Piece = function (type, color, row, col) {
  this.type = type;
  this.color = color;
  this.row = row;
  this.col = col;

  this.shape = null;

  this.deleteShape = async () => {
    if (this.shape === null) {
      return;
    }

    await miro.board.remove(this.shape);
    console.log('miro.board.remove');
  };

  this.createOrRestoreShapeAsync = async (frame) => {
    // Check if there were any changes to the piece.
    // If there are any - delete it and re-create

    if (this.shape !== null) {
      this.shape = await miro.board.getById(this.shape.id);
      console.log('miro.board.getById');
    }

    if (this.shape !== null) {
      if (
        this.shape.content !== this.type ||
        this.shape.parentId !== frame.id ||
        this.shape.x !== this.col * CellSize + CellSize / 2 ||
        this.shape.y !== (7 - this.row) * CellSize + CellSize / 2 ||
        this.shape.style.color !== (this.color == 'w' ? '#eeeeee' : '#111111')
      ) {
        await miro.board.remove(this.shape);
        console.log('miro.board.remove');
        this.shape = null;
      }
    }

    if (this.shape === null) {
      console.log('miro.board.createShape');
      this.shape = await miro.board.createShape({
        shape: 'rectangle',

        content: this.type,

        x: coordsForPosition(frame, this.row, this.col).x,
        y: coordsForPosition(frame, this.row, this.col).y,

        width: CellSize,
        height: CellSize,

        style: {
          borderWidth: 0,
          fillOpacity: 0,
          color: this.color == 'w' ? '#eeeeee' : '#111111',
          fontSize: 40,
        },
      });

      await frame.add(this.shape);
    }

    return this.shape.id;
  };

  this.getCurrentCell = async (frame) => {
    // TODO: return current closest cell that this piece resides on
    return [0, 0];
  };
};

const StickyBoard = function () {
  this.chess = new Chess();

  this.gameEndingConditionsShown = false;
  this.frame = null;
  this.darkCellIds = null;
  this.placedPieces = null;

  this.createBoardAsync = async (boardX, boardY) => {
    console.log('miro.board.createFrame');
    const frame = await miro.board.createFrame({
      title: 'Chess board',

      x: boardX + (CellsInBoard * CellSize) / 2,
      y: boardY + (CellsInBoard * CellSize) / 2,

      width: CellsInBoard * CellSize,
      height: CellsInBoard * CellSize,

      style: {
        fillColor: BrightCellColor,
      },
    });

    const darkCellIds = new Array();

    for (let row = 0; row < CellsInBoard; row++) {
      for (let col = 0; col < CellsInBoard; col++) {
        if ((row + col) % 2 == 1) {
          continue;
        }

        console.log('miro.board.createShape');
        const shape = await miro.board.createShape({
          shape: 'rectangle',

          x: coordsForPosition(frame, row, col).x,
          y: coordsForPosition(frame, row, col).y,

          width: CellSize,
          height: CellSize,

          style: {
            fillColor: DarkCellColor,
            borderWidth: 0,
          },
        });

        await frame.add(shape);
        darkCellIds.push(shape.id);
      }
    }

    const pieces = ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'].flatMap((p, i) => {
      return [
        new Piece(p, 'w', 0, i),
        new Piece('♟', 'w', 1, i),
        new Piece('♟', 'b', 6, i),
        new Piece(p, 'b', 7, i),
      ];
    });

    const pieceIds = await Promise.all(
      pieces.map((p) => p.createOrRestoreShapeAsync(frame)),
    );
    const placedPieces = new Map(pieceIds.map((pieceId, i) => [pieceId, pieces[i]]));

    this.frame = frame;
    this.darkCellIds = darkCellIds;
    this.placedPieces = placedPieces;
  };

  this.handlePieceMovement = async (piece, item) => {
    if (item.parentId === null || item.parentId !== piece.shape.parentId) {
      // The piece was moved outside the board (or lost parent somehow)
      return;
    }

    if (item.relativeTo !== 'parent_top_left') {
      throw Exception('assert: item has parent, but is not relative to the top left?');
    }

    const [cellX, cellY] = [Math.floor(item.x / CellSize), Math.floor(item.y / CellSize)];
    if (cellX < 0 || cellX > 7 || cellY < 0 || cellY > 7) {
      return;
    }

    const [row, col] = [7 - cellY, cellX];
    if (row === piece.row && col === piece.col) {
      return;
    }

    let move = null;
    try {
      move = this.chess.move({
        from: notationForPosition(piece.row, piece.col),
        to: notationForPosition(row, col),
      });
    } catch (e) {
      if (e.message.startsWith('Invalid move')) {
        return;
      }

      throw e;
    }
  };

  this.applyItemUpdateAsync = async (item) => {
    const piece = this.placedPieces.get(item.id);
    if (piece !== undefined) {
      await this.handlePieceMovement(piece, item);

      const grid = new Array(CellsInBoard * CellsInBoard).fill(null);
      for (const [_, placedPiece] of this.placedPieces) {
        grid[placedPiece.row * CellsInBoard + placedPiece.col] = placedPiece;
      }

      const dirty = new Array(CellsInBoard * CellsInBoard).fill(true);
      this.placedPieces = new Map();
      for (let row = 0; row < CellsInBoard; row++) {
        for (let col = 0; col < CellsInBoard; col++) {
          const pos = notationForPosition(row, col);
          const reality = this.chess.get(pos);
          if (!reality && grid[row * CellsInBoard + col] !== null) {
            await grid[row * CellsInBoard + col].deleteShape();
            grid[row * CellsInBoard + col] = null;
          } else if (!!reality && grid[row * CellsInBoard + col] === null) {
            grid[row * CellsInBoard + col] = new Piece(
              PieceCharToEmojiMap.get(reality.type),
              reality.color,
              row,
              col,
            );
          } else if (!!reality && grid[row * CellsInBoard + col] !== null) {
            // Check fields are correct
            const tmp = grid[row * CellsInBoard + col];
            if (
              tmp.row === row &&
              tmp.col === col &&
              tmp.type === PieceCharToEmojiMap.get(reality.type) &&
              tmp.color == reality.color
            ) {
              dirty[row * CellsInBoard + col] = false;
            } else {
              grid[row * CellsInBoard + col].row = row;
              grid[row * CellsInBoard + col].col = col;
              grid[row * CellsInBoard + col].type = PieceCharToEmojiMap.get(reality.type);
              grid[row * CellsInBoard + col].color = reality.color;
            }
          } else {
            dirty[row * CellsInBoard + col] = false;
          }

          if (grid[row * CellsInBoard + col] !== null) {
            if (
              grid[row * CellsInBoard + col] === piece ||
              dirty[row * CellsInBoard + col]
            ) {
              console.log('Dirty', row, col);
              const newId = await grid[
                row * CellsInBoard + col
              ].createOrRestoreShapeAsync(this.frame);
              this.placedPieces.set(newId, grid[row * CellsInBoard + col]);
            } else {
              this.placedPieces.set(
                grid[row * CellsInBoard + col].shape.id,
                grid[row * CellsInBoard + col],
              );
            }
          }
        }
      }

      if (this.isGameFinished() && !this.gameEndingConditionsShown) {
        this.gameEndingConditionsShown = true;

        console.log('GAME FINISHED: ', this.isGameFinished());
        console.log('CHECKMATE: ', this.isCheckmate());
        console.log('TURN: ', this.whoseTurn());
        await finishTheGame(this);
      }

      return true;
    }

    return false;
  };

  this.applyItemUpdateByIdAsync = async (itemId) => {
    const piece = this.placedPieces.get(itemId);
    if (piece !== undefined) {
      const item = await miro.board.getById(itemId);
      this.applyItemUpdateAsync(item);
    }

    return false;
  };

  this.applyItemDeleteAsync = async (item) => {
    return await this.applyItemDeleteByIdAsync(item.id);
  };

  this.applyItemDeleteByIdAsync = async (itemId) => {
    console.log('Checking delete by id not implemented');

    return false;
  };

  this.isGameFinished = () => {
    return this.chess.isGameOver();
  };

  this.isCheckmate = () => {
    return this.chess.isCheckmate();
  };

  this.isDraw = () => {
    return this.chess.isDraw();
  };

  this.isStalemate = () => {
    return this.chess.isStalemate();
  };

  this.isThreefoldRepetition = () => {
    return this.chess.isThreefoldRepetition();
  };

  this.whoseTurn = () => {
    return this.chess.turn();
  };
};

export default StickyBoard;
