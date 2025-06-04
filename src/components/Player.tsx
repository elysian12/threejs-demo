import React, { useRef, useEffect, forwardRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameContext } from '../context/GameContext';
import { playAudio } from '../utils/audio';

interface PlayerProps {
  position: [number, number, number];
}

const Player = forwardRef<THREE.Group, PlayerProps>(({ position }, ref) => {
  const internalRef = useRef<THREE.Group>(null);
  const groupRef = (ref as React.RefObject<THREE.Group>) || internalRef;
  const { gameState, movePlayer, stopPlayer, setPlayerPosition } = useGameContext();
  
  // Memoize the footstep sound callback
  const playFootstep = useCallback(() => {
    playAudio('FOOTSTEP', 0.2);
  }, []);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      setPlayerPosition(position[2]);
    }
    // Only run on mount!
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.isPlaying && !gameState.isGameOver && !gameState.isDollLooking) {
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
  }, [gameState.isPlaying, gameState.isGameOver, gameState.isDollLooking, movePlayer, stopPlayer]);
  
  useFrame((_, delta) => {
    if (!groupRef.current || !gameState.isPlaying || gameState.isGameOver || gameState.isDollLooking) return;

    if (gameState.isMoving) {
      const speed = 5;
      const movement = delta * speed;
      
      switch (gameState.moveDirection) {
        case 'forward':
          groupRef.current.position.z -= movement;
          break;
        case 'backward':
          groupRef.current.position.z += movement;
          break;
        case 'left':
          groupRef.current.position.x -= movement;
          break;
        case 'right':
          groupRef.current.position.x += movement;
          break;
      }
      
      // Update player position in game state
      setPlayerPosition(groupRef.current.position.z);
      
      // Animate walking
      const time = Date.now() * 0.005;
      const height = Math.sin(time) * 0.1;
      groupRef.current.position.y = position[1] + height;
      
      // Play footstep sound
      if (Math.sin(time * 2) > 0.9) {
        playFootstep();
      }
      
      // Check for win condition
      if (groupRef.current.position.z <= -20) {
        playAudio('WIN', 0.5);
      }
    }
  });
  
  return (
    <group ref={groupRef}>
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
});

Player.displayName = 'Player';

export default Player;