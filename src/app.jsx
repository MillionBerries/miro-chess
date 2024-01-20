import * as React from 'react';
import {createRoot} from 'react-dom/client';

import '../src/assets/style.css';
import congratulationsImg from './assets/congratulations.png'
import { deleteAllBoards } from './functions/deleteAllBoards';

const App = () => {
  React.useEffect(() => {
    // If you don't listen for this event in app.js, drag&drop doesn't work (or I was doing something wrong)
    miro.board.ui.on('drop', async (evt) => {
      console.log("app.jsx", evt)
    });
  }, []);

  return (
    <div >
      <div className="">
        <img src={congratulationsImg} alt="" />
      </div>
      <hr></hr>
      <div className="buttons-container">
        <button
          className="button button-primary"
          onClick={() => deleteAllBoards()}
        >
          Delete all boards
        </button>
      </div>
      <hr></hr>
      <div className="miro-draggable draggable-container">
        <div className='chessboard'></div>
        <div className='p-large'> Drag me to create a board </div>
        </div>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
