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
    playerPosition: 10,
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
      playerPosition: 10,
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
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        hasWon: false,
      }));
      
      const audio = new Audio('/sounds/elimination.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio play error:', e));
    }
  }, [gameState.isMoving]);
  
  const setPlayerPosition = useCallback((position: number) => {
    setGameState(prev => ({
      ...prev,
      playerPosition: position,
    }));
    
    if (position <= -80) {
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