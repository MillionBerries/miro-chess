import StickyBoard from './stickyboard/stickyboard.js'

const boardsOwnedByThisScript = new Map();
// TODO: traverse all board items to locate previously create boards
// NOTE: seems impossible for now, unless we explicitly create metadata for each item
// But checking metadata for each item is costly!

console.log("Warning: index script realoded. Lost all refs to previous boards");

const createStickyBoardAtPosition = async (boardX, boardY) => {
  const board = new StickyBoard();
  await board.createBoardAsync(boardX, boardY);

  boardsOwnedByThisScript.set(board.frame.id, board);
  console.log(board);
}

const init = async () => {
  miro.board.ui.on('icon:click', async () => {
    await miro.board.ui.openPanel({url: 'app.html'});
  });

  miro.board.ui.on('drop', async (evt) => {
    await createStickyBoardAtPosition(evt.x, evt.y);
  });

  miro.board.ui.on('experimental:items:update', async (evt) => {
    for (const item of evt.items) {
      let affectsAnything = false;
      for (const [boardId, board] of boardsOwnedByThisScript) {
        // Check if this update affects a board of us..
        if (await board.applyItemUpdateAsync(item)) {
          affectsAnything = true;
          break;
        }
      }

      if (!affectsAnything) {
        // console.log("Update missed. Broadcasting.", item);
        // await miro.board.events.broadcast('milber.chess.update', item.id);
      }
    }
  });

  miro.board.events.on('milber.chess.update', async (itemId) => {
    for (const [boardId, board] of boardsOwnedByThisScript) {
      if (await board.applyItemUpdateByIdAsync(item.id)) {
        break; // Early stopping
      }
    }
  });

  miro.board.ui.on('items:delete', async (evt) => {
    for (const item of evt.items) {
      let affectsAnything = false;
      for (const [boardId, board] of boardsOwnedByThisScript) {
        if (await board.applyItemDeleteAsync(item)) {
          affectsAnything = true;
          break;
        }
      }

      if (!affectsAnything) {
        // console.log("Delete missed. Broadcasting.", item);
        // await miro.board.events.broadcast('milber.chess.delete', item.id);
      }
    }
  });

  miro.board.events.on('milber.chess.delete', async (itemId) => {
    for (const [boardId, board] of boardsOwnedByThisScript) {
      if (await board.applyItemDeleteByIdAsync(item.id)) {
        break; // Early stopping
      }
    }
  });
};

init();
