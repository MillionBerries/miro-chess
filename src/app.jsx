import * as React from 'react';
import {createRoot} from 'react-dom/client';

import '../src/assets/style.css';
import congratulationsImg from './assets/congratulations.png'
import { deleteAllBoards } from './functions/deleteAllBoards';

const App = () => {

  React.useEffect(() => {
    miro.board.ui.on('drop', async (evt) => {
      // Setting this event handler is required for matching handle in index.js to work.
    });
  }, []);

  const [blacks, setBlacks] = React.useState(0);
  const [whites, setWhites] = React.useState(0);

  React.useEffect(() => {
    const chessCollection = miro.board.storage.collection('chess');

    console.log("CHESS COLLECTION: ", chessCollection)

    async function fetchData() {
      let whitesInitial = await chessCollection.get('whites');

      if (typeof whitesInitial === 'undefined') {
        await chessCollection.set('whites', 0);
        whitesInitial = 0;
      }
      let blacksInitial = await chessCollection.get('blacks')
      if (typeof blacksInitial === 'undefined') {
        await chessCollection.set('blacks', 0);
        blacksInitial = 0;
      }
      setWhites(whitesInitial);
      setBlacks(blacksInitial);
    }

    fetchData();

    chessCollection.onValue('blacks', (score) => {
      console.log('BLACKS SCORED', score);
      setBlacks((prevBlacks) => prevBlacks + 1);
    });

    chessCollection.onValue('whites', (score) => {
      console.log('WHITES SCORED', score);
      setWhites((prevWhites) => prevWhites + 1);
    });

    console.log('UPDATED COLLECTION: ', chessCollection)

    return () => {
    };

  }, []);


  return (
    <div className="">
      <div className="">
        <img src={congratulationsImg} alt="" />
      </div>
      <div className="scoreboard">
       <div>Current Score: </div>
       <div>WHITES: {whites}</div>
       <div>BLACKS: {blacks}</div>
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
