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
      // Professional 3-shot sequence with realistic timing
      
      // Shot 1 - immediate
      const gunShot1 = new Audio('/sounds/gunshot.mp3');
      gunShot1.volume = 0.9;
      gunShot1.play().catch(e => console.log('Audio play error:', e));
      
      // Shot 2 - after 200ms
      setTimeout(() => {
        const gunShot2 = new Audio('/sounds/gunshot.mp3');
        gunShot2.volume = 0.85;
        gunShot2.play().catch(e => console.log('Audio play error:', e));
      }, 200);
      
      // Shot 3 - after 400ms
      setTimeout(() => {
        const gunShot3 = new Audio('/sounds/gunshot.mp3');
        gunShot3.volume = 0.8;
        gunShot3.play().catch(e => console.log('Audio play error:', e));
      }, 400);
      
      // Add screen flash effect
      const flashElement = document.createElement('div');
      flashElement.style.position = 'fixed';
      flashElement.style.top = '0';
      flashElement.style.left = '0';
      flashElement.style.width = '100vw';
      flashElement.style.height = '100vh';
      flashElement.style.backgroundColor = 'red';
      flashElement.style.opacity = '0.9';
      flashElement.style.zIndex = '9999';
      flashElement.style.pointerEvents = 'none';
      flashElement.style.transition = 'opacity 0.5s ease-out';
      document.body.appendChild(flashElement);
      
      // Fade out the flash over 2 seconds
      setTimeout(() => {
        flashElement.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(flashElement);
        }, 500);
      }, 200);
      
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        hasWon: false,
      }));
      
      // Play elimination sound after gun shots
      setTimeout(() => {
        const audio = new Audio('/sounds/elimination.mp3');
        audio.volume = 0.6;
        audio.play().catch(e => console.log('Audio play error:', e));
      }, 1000);
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