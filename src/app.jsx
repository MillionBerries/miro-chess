import * as React from 'react';
import {createRoot} from 'react-dom/client';

import '../src/assets/style.css';
import congratulationsImg from './assets/congratulations.png'

import {createBoard, movePiece} from './stickyboard/stickyboard.js'

async function addSticky() {
  const stickyNote = await miro.board.createStickyNote({
    content: 'Hello, World!',
  });

  await miro.board.viewport.zoomTo(stickyNote);
}

const initializeBoard = async () => {
  console.log("REINITIALIZED__________________________")

  const {frame, chess} = await createBoard();

  miro.board.ui.on('experimental:items:update', async (evt) => {
    if(evt.items.length == 1 && frame.childrenIds.includes(evt.items[0].id)) {
      movePiece({frame, chess}, evt.items[0])
    }
  });
}

const App = () => {
  React.useEffect(() => {
    initializeBoard();
  }, []);

  return (
    <div className="grid wrapper">
      <div className="cs1 ce12">
        <img src={congratulationsImg} alt="" />
      </div>
      <div className="cs1 ce12">
        <h1>Congratulations!</h1>
        <p>You've just created your first Miro app!</p>
        <p>
          To explore more and build your own app, see the Miro Developer
          Platform documentation.
        </p>
      </div>
      <div className="cs1 ce12">
        <a
          className="button button-primary"
          target="_blank"
          href="https://developers.miro.com"
        >
          Read the documentation
        </a>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
