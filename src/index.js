import {createBoard, movePiece} from './stickyboard/stickyboard.js'

const initializeBoard = async (boardX, boardY) => {
  console.log("REINITIALIZED__________________________")

  const {frame, chess} = await createBoard(boardX, boardY);

  miro.board.ui.on('experimental:items:update', async (evt) => {
    if(evt.items.length == 1 && frame.childrenIds.includes(evt.items[0].id)) {
      movePiece({frame, chess}, evt.items[0])
    }
  });
}

export async function init() {
  miro.board.ui.on('icon:click', async () => {
    await miro.board.ui.openPanel({url: 'app.html'});
  });

  miro.board.ui.on('drop', async (evt) => {
    console.log("index.js", evt)
    initializeBoard(evt.x, evt.y)
  });
}

init();
