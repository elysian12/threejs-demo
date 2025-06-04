import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameContext } from '../context/GameContext';

interface PlayerProps {
  position: [number, number, number];
}

const Player: React.FC<PlayerProps> = ({ position }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { gameState, movePlayer, stopPlayer, setPlayerPosition } = useGameContext();
  
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      setPlayerPosition(position[2]);
    }
  }, [position, setPlayerPosition]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.isPlaying && !gameState.isGameOver) {
        switch (e.key.toLowerCase()) {
          case 'w':
          case 'arrowup':
            movePlayer('forward');
            break;
          case 's':
          case 'arrowdown':
            movePlayer('backward');
            break;
          case 'a':
          case 'arrowleft':
            movePlayer('left');
            break;
          case 'd':
          case 'arrowright':
            movePlayer('right');
            break;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameState.isPlaying && !gameState.isGameOver) {
        switch (e.key.toLowerCase()) {
          case 'w':
          case 's':
          case 'a':
          case 'd':
          case 'arrowup':
          case 'arrowdown':
          case 'arrowleft':
          case 'arrowright':
            stopPlayer();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.isPlaying, gameState.isGameOver, movePlayer, stopPlayer]);
  
  useFrame((_, delta) => {
    if (groupRef.current && gameState.isPlaying && !gameState.isGameOver) {
      if (gameState.isMoving) {
        const speed = 5;
        switch (gameState.moveDirection) {
          case 'forward':
            groupRef.current.position.z -= delta * speed;
            break;
          case 'backward':
            groupRef.current.position.z += delta * speed;
            break;
          case 'left':
            groupRef.current.position.x -= delta * speed;
            break;
          case 'right':
            groupRef.current.position.x += delta * speed;
            break;
        }
        
        setPlayerPosition(groupRef.current.position.z);
        
        // Animate walking
        const time = Date.now() * 0.005;
        const height = Math.sin(time) * 0.1;
        groupRef.current.position.y = position[1] + height;
        
        if (Math.sin(time * 2) > 0.9) {
          const audio = new Audio('/sounds/footstep.mp3');
          audio.volume = 0.2;
          audio.play().catch(e => console.log('Audio play error:', e));
        }
      }
      
      if (groupRef.current.position.z <= -20) {
        const audio = new Audio('/sounds/win.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio play error:', e));
      }
    }
  });
  
  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh position={[0, 1, 0]} castShadow>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial color="#4682B4" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 2, 0]} castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#FFE4C4" />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.7, 1, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
        <capsuleGeometry args={[0.2, 0.8, 4, 8]} />
        <meshStandardMaterial color="#4682B4" />
      </mesh>
      <mesh position={[0.7, 1, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <capsuleGeometry args={[0.2, 0.8, 4, 8]} />
        <meshStandardMaterial color="#4682B4" />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.3, 0, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.8, 4, 8]} />
        <meshStandardMaterial color="#1E3A8A" />
      </mesh>
      <mesh position={[0.3, 0, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.8, 4, 8]} />
        <meshStandardMaterial color="#1E3A8A" />
      </mesh>
    </group>
  );
};

export default Player;