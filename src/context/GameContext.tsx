import React, { createContext, useContext, useState, useCallback } from 'react';

interface GameState {
  isPlaying: boolean;
  isGameOver: boolean;
  hasWon: boolean;
  isMoving: boolean;
  playerPosition: number;
  moveDirection: 'forward' | 'backward' | 'left' | 'right' | null;
  isDollLooking: boolean;
}

interface GameContextType {
  gameState: GameState;
  startGame: () => void;
  resetGame: () => void;
  movePlayer: (direction: 'forward' | 'backward' | 'left' | 'right') => void;
  stopPlayer: () => void;
  checkPlayerMovement: () => void;
  setPlayerPosition: (position: number) => void;
  setDollLooking: (isLooking: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isGameOver: false,
    hasWon: false,
    isMoving: false,
    playerPosition: -30,
    moveDirection: null,
    isDollLooking: false,
  });
  
  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isGameOver: false,
      hasWon: false,
    }));
    
    const bgMusic = new Audio('/sounds/background-music.mp3');
    bgMusic.volume = 0.3;
    bgMusic.loop = true;
    bgMusic.play().catch(e => console.log('Audio play error:', e));
  }, []);
  
  const resetGame = useCallback(() => {
    setGameState({
      isPlaying: false,
      isGameOver: false,
      hasWon: false,
      isMoving: false,
      playerPosition: -30,
      moveDirection: null,
      isDollLooking: false,
    });
  }, []);
  
  const movePlayer = useCallback((direction: 'forward' | 'backward' | 'left' | 'right') => {
    setGameState(prev => ({
      ...prev,
      isMoving: true,
      moveDirection: direction,
    }));
  }, []);
  
  const stopPlayer = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isMoving: false,
      moveDirection: null,
    }));
  }, []);
  
  const checkPlayerMovement = useCallback(() => {
    if (gameState.isMoving) {
      // Play gun shot sound immediately
      const gunShotAudio = new Audio('/sounds/gunshot.mp3');
      gunShotAudio.volume = 0.8;
      gunShotAudio.play().catch(e => console.log('Audio play error:', e));
      
      // Add screen flash effect
      const flashElement = document.createElement('div');
      flashElement.style.position = 'fixed';
      flashElement.style.top = '0';
      flashElement.style.left = '0';
      flashElement.style.width = '100vw';
      flashElement.style.height = '100vh';
      flashElement.style.backgroundColor = 'red';
      flashElement.style.opacity = '0.8';
      flashElement.style.zIndex = '9999';
      flashElement.style.pointerEvents = 'none';
      flashElement.style.transition = 'opacity 0.3s ease-out';
      document.body.appendChild(flashElement);
      
      // Fade out the flash
      setTimeout(() => {
        flashElement.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(flashElement);
        }, 300);
      }, 100);
      
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        hasWon: false,
      }));
      
      // Play elimination sound after gun shot
      setTimeout(() => {
        const audio = new Audio('/sounds/elimination.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio play error:', e));
      }, 500);
    }
  }, [gameState.isMoving]);
  
  const setPlayerPosition = useCallback((position: number) => {
    setGameState(prev => ({
      ...prev,
      playerPosition: position,
    }));
    
    if (position >= 30) {
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        hasWon: true,
      }));
    }
  }, []);
  
  const setDollLooking = useCallback((isLooking: boolean) => {
    setGameState(prev => ({
      ...prev,
      isDollLooking: isLooking,
    }));
    
    if (isLooking && gameState.isMoving) {
      checkPlayerMovement();
    }
  }, [gameState.isMoving, checkPlayerMovement]);
  
  const value = {
    gameState,
    startGame,
    resetGame,
    movePlayer,
    stopPlayer,
    checkPlayerMovement,
    setPlayerPosition,
    setDollLooking,
  };
  
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};