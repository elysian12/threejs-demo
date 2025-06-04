import React, { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameContext } from '../context/GameContext';
import { playAudio } from '../utils/audio';

interface DollProps {
  position: [number, number, number];
}

const Doll: React.FC<DollProps> = ({ position }) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const [rotationDirection, setRotationDirection] = useState(1);
  const { gameState, setDollLooking } = useGameContext();
  
  // Memoize the sound callback
  const playDollSound = useCallback(() => {
    playAudio('DOLL_SONG', 0.5);
  }, []);
  
  // Doll turning mechanism
  useFrame((_, delta) => {
    if (!gameState.isPlaying || gameState.isGameOver) return;
    
    if (headRef.current) {
      // Update turn timer
      const turnDuration = gameState.isDollLooking ? 3 : 5 + Math.random() * 2;
      
      // Every 3-7 seconds, change direction (randomly)
      if (delta > turnDuration) {
        // Play sound when turning
        playDollSound();
        
        // Change light state and reset timer
        setDollLooking(!gameState.isDollLooking);
        setRotationDirection(gameState.isDollLooking ? 1 : -1);
      }
      
      // Smooth rotation when turning
      if (rotationDirection !== 0) {
        const targetRotation = rotationDirection > 0 ? 0 : Math.PI;
        const currentRotation = headRef.current.rotation.y;
        const rotationStep = delta * 3; // Speed of turning
        
        if (Math.abs(targetRotation - currentRotation) < rotationStep) {
          headRef.current.rotation.y = targetRotation;
          setRotationDirection(0);
        } else {
          headRef.current.rotation.y += rotationDirection > 0 
            ? rotationStep 
            : -rotationStep;
        }
      }
    }
  });
  
  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[1, 1.5, 4, 16]} />
        <meshStandardMaterial color="#ffa500" />
      </mesh>
      
      {/* Dress/Skirt */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[2, 1.5, 2.5, 16]} />
        <meshStandardMaterial color="#ff4500" />
      </mesh>
      
      {/* Head */}
      <group ref={headRef} position={[0, 5.5, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshStandardMaterial color="#ffe4c4" />
        </mesh>
        
        {/* Eyes */}
        <mesh position={[-0.4, 0.2, 1]} castShadow>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial color="black" />
        </mesh>
        <mesh position={[0.4, 0.2, 1]} castShadow>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial color="black" />
        </mesh>
        
        {/* Mouth */}
        <mesh position={[0, -0.3, 1]} castShadow>
          <boxGeometry args={[0.8, 0.1, 0.1]} />
          <meshStandardMaterial color="black" />
        </mesh>
        
        {/* Hair */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[1.3, 1.3, 0.5, 16]} />
          <meshStandardMaterial color="black" />
        </mesh>
      </group>
      
      {/* Arms */}
      <mesh position={[-1.5, 3, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 3, 16]} />
        <meshStandardMaterial color="#ffe4c4" />
      </mesh>
      <mesh position={[1.5, 3, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 3, 16]} />
        <meshStandardMaterial color="#ffe4c4" />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.7, -0.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 2, 16]} />
        <meshStandardMaterial color="#ffe4c4" />
      </mesh>
      <mesh position={[0.7, -0.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 2, 16]} />
        <meshStandardMaterial color="#ffe4c4" />
      </mesh>
      
      {/* Red/Green Light Indicator */}
      <pointLight
        position={[0, 7, 1]}
        intensity={10}
        distance={5}
        color={gameState.isDollLooking ? '#ff0000' : '#00ff00'}
        castShadow
      />
    </group>
  );
};

export default Doll;