import * as React from 'react';
import {createRoot} from 'react-dom/client';

import '../src/assets/style.css';
import congratulationsImg from './assets/congratulations.png'

const App = () => {
  React.useEffect(() => {
    miro.board.ui.on('drop', async (evt) => {
      // Setting this event handler is required for matching handle in index.js to work.
    });
  }, []);

  return (
    <div className="grid wrapper">
      <div className="cs1 ce12">
        <img src={congratulationsImg} alt="" />
      </div>
      <div className="cs1 ce12">
        <a
          className="button button-primary"
          target="_blank"
          href="https://developers.miro.com"
        >
          Delete all boards
        </a>
      </div>
      <div className="miro-draggable">Drag me to create a board</div>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
