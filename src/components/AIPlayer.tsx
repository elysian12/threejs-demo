import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameContext } from '../context/GameContext';

interface AIPlayerProps {
  position: [number, number, number];
  color: string;
  index: number; // Add index to differentiate AI players
}

const AIPlayer: React.FC<AIPlayerProps> = ({ position, color, index }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { gameState } = useGameContext();
  const [isMoving, setIsMoving] = useState(false);
  const [isEliminated, setIsEliminated] = useState(false);
  
  // Each AI player has a slightly different base speed
  const baseSpeed = 3 + (index * 0.2);
  
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
    }
  }, [position]);

  useFrame((_, delta) => {
    if (!groupRef.current || !gameState.isPlaying || gameState.isGameOver || isEliminated) return;

    // Check if doll is looking (red light)
    const isRedLight = gameState.isDollLooking; // You'll need to add this to your game state

    if (isRedLight && isMoving) {
      // Eliminate AI player if they move during red light
      setIsEliminated(true);
      // You might want to add elimination effects here
      return;
    }

    // During green light, move forward with some variation
    if (!isRedLight) {
      // Add some randomness to movement but keep it more controlled
      const shouldMove = Math.random() > 0.1; // 90% chance to move during green light
      
      if (shouldMove) {
        setIsMoving(true);
        // Move forward with slight speed variation
        const currentSpeed = baseSpeed * (0.9 + Math.random() * 0.2);
        groupRef.current.position.z -= delta * currentSpeed;
        
        // Subtle lateral movement
        const lateralMovement = Math.sin(Date.now() * 0.001 + index) * 0.1;
        groupRef.current.position.x += lateralMovement * delta;
        
        // Keep within bounds
        groupRef.current.position.x = THREE.MathUtils.clamp(
          groupRef.current.position.x,
          -20,
          20
        );
        
        // Animate walking
        const time = Date.now() * 0.005;
        const height = Math.sin(time) * 0.1;
        groupRef.current.position.y = position[1] + height;
      } else {
        setIsMoving(false);
      }
    } else {
      setIsMoving(false);
    }
  });
  
  if (isEliminated) {
    return null; // Or render an eliminated state
  }

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh position={[0, 1, 0]} castShadow>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 2, 0]} castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#FFE4C4" />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.7, 1, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
        <capsuleGeometry args={[0.2, 0.8, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.7, 1, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <capsuleGeometry args={[0.2, 0.8, 4, 8]} />
        <meshStandardMaterial color={color} />
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

export default AIPlayer;