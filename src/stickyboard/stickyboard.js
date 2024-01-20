const cellSize = 50;
const cellsInBoard = 8;

const frameXY = (frame) => {
  return {
    frameX: frame.x - frame.width / 2,
    frameY: frame.y - frame.height / 2,
  }
}

const coordsForPosition = (frame, row, col) => {
  const {frameX, frameY} = frameXY(frame);
  
  return {
    x: frameX + col * cellSize + cellSize / 2,
    y: frameY + row * cellSize + cellSize / 2,
  };
}

const positionForCoords = (frame, x, y) => {
  const {frameX, frameY} = frameXY(frame);

  return {
    row: Math.round((y - frameY - cellSize / 2) / cellSize),
    col: Math.round((x - frameX - cellSize / 2) / cellSize),
  }
}

const placePiece = async (frame, type='♚', color='w', row, col) => {
  const {frameX, frameY} = frameXY(frame);

  const shape = await miro.board.createShape({
    shape: 'rectangle',
    content: type,

    width: cellSize,
    height: cellSize,
    x: coordsForPosition(frame, row, col).x,
    y: coordsForPosition(frame, row, col).y,

    style: {
      borderWidth: 0,
      fillOpacity: 0,
      color: color == 'w' ? '#eee' : '#111',
      fontSize: 40,
    },
    });

  await frame.add(shape);
}

const placeStartingPieces = async (frame) => {
  const pieces = ['♜','♞','♝','♛','♚','♝','♞','♜']

  pieces.forEach( async (p, i) => {
    await placePiece(frame, p, 'w', 0, i)
    await placePiece(frame, '♟', 'w', 1, i)
    await placePiece(frame, '♟', 'b', 6, i)
    await placePiece(frame, p, 'b', 7, i)
  });
}

export const createBoard = async (boardX=0, boardY=0) => {
  const frame = await miro.board.createFrame({
    title: 'Chess board',
    style: {
    fillColor: '#ffffff',
    },
    x: boardX + cellsInBoard * cellSize / 2,
    y: boardY + cellsInBoard * cellSize / 2,
    width: cellsInBoard * cellSize,
    height: cellsInBoard * cellSize,
    origin: 'center', // the only supported
  });

  for (let row = 0; row < cellsInBoard; row++) {
    for (let col = 0; col < cellsInBoard; col++) {
      const shape = await miro.board.createShape({
      shape: 'rectangle',
   
      relativeTo: 'parent_top_left',
      width: cellSize,
      height: cellSize,
      x: coordsForPosition(frame, row, col).x,
      y: coordsForPosition(frame, row, col).y,
   
      style: {
        fillColor: (row + col) % 2 == 0 ? '#a77858' : '#f7d18b',
      },
      });
   
      await frame.add(shape);
    }
  }

  //await placePiece(frame, '♚', 'w', 0, 0)
  await placeStartingPieces(frame);

  return frame
}

export const movePiece = async (frame, piece) => {
  console.log(frame);
  console.log(piece);

  const {row, col} = positionForCoords(frame, piece.x, piece.y)
  const {x, y} = coordsForPosition(frame, row, col);

  console.log(row, col)

  piece.x = x
  piece.y = y

  await piece.sync();
}