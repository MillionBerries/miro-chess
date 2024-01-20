import * as React from 'react';
import {createRoot} from 'react-dom/client';

import '../src/assets/style.css';
import congratulationsImg from './assets/congratulations.png'

const App = () => {
  React.useEffect(() => {
    // If you don't listen for this event in app.js, drag&drop doesn't work (or I was doing something wrong)
    miro.board.ui.on('drop', async (evt) => {
      console.log("app.jsx", evt)
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
