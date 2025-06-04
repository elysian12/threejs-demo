import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, ArrowUp, Camera, Skull } from 'lucide-react';
import { useGameContext } from '../context/GameContext';

interface UIProps {
  onToggleCamera: () => void;
  cameraMode: 'character' | 'world';
}

const UI: React.FC<UIProps> = ({ onToggleCamera, cameraMode }) => {
  const { gameState, startGame, resetGame, movePlayer, stopPlayer } = useGameContext();
  const [showGameOver, setShowGameOver] = useState(false);
  
  // Delay game over screen to show after death animation
  useEffect(() => {
    if (gameState.isGameOver && !gameState.hasWon) {
      // Show game over screen after 4.5 seconds (after death animation completes)
      const timer = setTimeout(() => {
        setShowGameOver(true);
      }, 4500);
      return () => clearTimeout(timer);
    } else if (gameState.isGameOver && gameState.hasWon) {
      // Show immediately for win condition
      setShowGameOver(true);
    } else {
      // Reset when game resets
      setShowGameOver(false);
    }
  }, [gameState.isGameOver, gameState.hasWon]);
  
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
      
      {/* Enhanced Game Over Screen */}
      {gameState.isGameOver && showGameOver && (
        <div className={`game-over fixed inset-0 flex items-center justify-center ${gameState.hasWon ? 'game-over-win' : 'game-over-death'}`}>
          <div className="text-center p-8 rounded-lg max-w-lg">
            {gameState.hasWon ? (
              <>
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-5xl font-bold mb-4 text-green-400">
                  VICTORY!
                </h2>
                <p className="text-xl mb-6 text-green-300">
                  You successfully reached the finish line!<br/>
                  <span className="text-sm text-gray-300">You survived the Red Light, Green Light game!</span>
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-6">
                  <Skull className="mx-auto text-red-500" size={80} />
                </div>
                <h2 className="text-5xl font-bold mb-4 text-red-500 blood-drip">
                  ELIMINATED
                </h2>
                <p className="text-xl mb-4 text-red-300">
                  You were caught moving during Red Light!
                </p>
                <p className="text-lg mb-6 text-gray-300">
                  <span className="text-red-400">⚠️ CAUSE OF DEATH:</span><br/>
                  Multiple gunshot wounds<br/>
                  <span className="text-sm text-gray-400">The guards showed no mercy...</span>
                </p>
              </>
            )}
            <button
              onClick={() => {
                setShowGameOver(false);
                resetGame();
              }}
              className={`btn flex items-center justify-center mx-auto font-bold py-3 px-6 rounded-lg ${
                gameState.hasWon 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white border-2 border-red-400'
              }`}
            >
              <RotateCcw className="mr-2" size={20} />
              {gameState.hasWon ? 'Play Again' : 'Try Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UI;