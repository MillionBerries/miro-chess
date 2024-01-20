import { Chess } from 'chess.js'

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
    y: frameY + frame.height - (row * cellSize + cellSize / 2),
  };
}

const positionForCoords = (frame, x, y) => {
  const {frameX, frameY} = frameXY(frame);

  return {
    row: Math.round((frameY + frame.height - y - cellSize / 2) / cellSize),
    col: Math.round((x - frameX - cellSize / 2) / cellSize),
  }
}

const notationForPosition = (row, col) => {
  return 'abcdefgh'[col] + (row+1);
}

const positionForNotation = (notation) => {
  assert(false, "Not implemented")
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

  await shape.setMetadata('position', {row, col});
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

  const chess = new Chess()
  
  return {frame, chess}
}

const movePieceItem = async (frame, piece, row, col) => {
  const {x, y} = coordsForPosition(frame, row, col);
  piece.x = x
  piece.y = y
  await piece.setMetadata('position', {row, col});
  await piece.sync();
}

export const movePiece = async ({frame, chess}, piece) => {
  console.log(piece);
  console.log(chess.ascii())

  const {row: newRow, col: newCol} = positionForCoords(frame, piece.x, piece.y)
  const {row: oldRow, col: oldCol} = await piece.getMetadata('position')
  let setRow = oldRow;
  let setCol = oldCol;

  if( newRow >= 0 && newRow < cellsInBoard && 
      newCol >= 0 && newCol < cellsInBoard &&
      (newRow != oldRow || newCol != oldCol)
  ) {
    const oldNotation = notationForPosition(oldRow, oldCol);
    const newNotation = notationForPosition(newRow, newCol);

    console.log(oldRow, oldCol);
    console.log(newRow, newCol);
    console.log(oldNotation, newNotation);

    try {
      const move = chess.move({from: oldNotation, to: newNotation})

      console.log(move)

      if(move.flags.includes('c') || move.flags.includes('e')) { //if there was a capture
        /* Captures are kinda hard since we need to find the item
           Seems like we have basically two options: either set piece's square as a tag
           or just iterate through all of the frame's items and find the right one.
           Both suck, since former requires keeping track of the tag handles - yes you cannot get tags by name, nice API
           And also seems like tags are gonna be drawn
           There is also a third option - to keep track of it in a map on our side. But I guess I will try out searching first
        */

        console.log(move.san)

        const children = await frame.getChildren();
        const pieces = children.filter((e) => e.content)
        let capturees = []

        if(move.flags.includes('e')) {
          // En passant
          const epRow = newRow == 2 ? 3 : 4;
          capturees = pieces
            .filter((p) => {
              const {row, col} = positionForCoords(frame, p.x, p.y);
              return row == epRow && col == newCol;
            })
        } else {
          // Standard capture
          capturees = pieces
            .filter((p) => {
              const {row, col} = positionForCoords(frame, p.x, p.y);
              return row == newRow && col == newCol;
            })
            .filter((p) => p.id != piece.id)
        }

        if(capturees.length != 1) {
          console.error("Something is wrong with capture")
        } else {
          await miro.board.remove(capturees[0])
        }
      } else if(move.flags.includes('k') || move.flags.includes('q')) {
        // castling
        const cStartCol = move.flags.includes('q') ? 0 : 7
        const cEndCol = move.flags.includes('q') ? 3 : 5

        const children = await frame.getChildren();
        const pieces = children.filter((e) => e.content)
        const castlees = pieces
          .filter((p) => {
            const {row, col} = positionForCoords(frame, p.x, p.y);
            return row == newRow && col == cStartCol;
          })

        if(castlees.length != 1) {
          console.error("Something is wrong with castling")
        } else {
          await movePieceItem(frame, castlees[0], newRow, cEndCol)
        }
      }

      setRow = newRow
      setCol = newCol
    } catch (error) {
      console.log('Made an invalid move', error)
    }
    
  }

  await movePieceItem(frame, piece, setRow, setCol);
}