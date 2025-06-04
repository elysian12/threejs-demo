import React from 'react';
import { Play, RotateCcw, ArrowUp, Camera } from 'lucide-react';
import { useGameContext } from '../context/GameContext';

interface UIProps {
  onToggleCamera: () => void;
  cameraMode: 'character' | 'world';
}

const UI: React.FC<UIProps> = ({ onToggleCamera, cameraMode }) => {
  const { gameState, startGame, resetGame, movePlayer, stopPlayer } = useGameContext();
  
  return (
    <div className="ui-overlay flex flex-col items-center justify-between p-6">
      {/* Camera Toggle Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={onToggleCamera}
          className="btn bg-white bg-opacity-80 hover:bg-opacity-100 text-black font-bold py-2 px-4 rounded shadow"
        >
          <Camera className="inline-block mr-2" size={20} />
          {cameraMode === 'character' ? 'World View' : 'Character View'}
        </button>
      </div>
      
      {/* Title */}
      <div className="w-full flex justify-center">
        <h1 className="game-title text-4xl md:text-5xl text-white mb-4">
          Red Light, Green Light
        </h1>
      </div>
      
      {/* Game Instructions (show only before starting) */}
      {!gameState.isPlaying && !gameState.isGameOver && (
        <div className="instructions max-w-md p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">How to Play</h2>
          <p className="mb-4">
            Move forward when the doll's back is turned (Green Light).
            Stop immediately when she turns around (Red Light).
            Reach the finish line without being caught moving during Red Light.
          </p>
          <p className="mb-6">
            <span className="font-bold">Controls:</span> Press W or Up Arrow to move forward.
            Release to stop.
          </p>
          <button
            onClick={startGame}
            className="btn flex items-center justify-center mx-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            <Play className="mr-2" size={20} />
            Start Game
          </button>
        </div>
      )}
      
      {/* Game controls (show when playing) */}
      {gameState.isPlaying && !gameState.isGameOver && (
        <div className="mobile-controls flex-col items-center fixed bottom-8 left-0 right-0 mx-auto">
          <button
            onTouchStart={() => movePlayer('forward')}
            onTouchEnd={stopPlayer}
            onMouseDown={() => movePlayer('forward')}
            onMouseUp={stopPlayer}
            className="control-btn w-16 h-16 flex items-center justify-center rounded-full"
          >
            <ArrowUp size={32} />
          </button>
        </div>
      )}
      
      {/* Game Over Screen */}
      {gameState.isGameOver && (
        <div className="game-over fixed inset-0 flex items-center justify-center">
          <div className="text-center p-8 rounded-lg">
            <h2 className="text-4xl font-bold mb-4">
              {gameState.hasWon ? 'You Won!' : 'Game Over'}
            </h2>
            <p className="text-xl mb-6">
              {gameState.hasWon 
                ? 'You successfully reached the finish line!' 
                : 'You were caught moving during Red Light!'}
            </p>
            <button
              onClick={resetGame}
              className="btn flex items-center justify-center mx-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
            >
              <RotateCcw className="mr-2" size={20} />
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UI;