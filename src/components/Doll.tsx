import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameContext } from '../context/GameContext';

interface DollProps {
  position: [number, number, number];
}

const Doll: React.FC<DollProps> = ({ position }) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const [redLight, setRedLight] = useState(false);
  const [turnTimer, setTurnTimer] = useState(0);
  const [rotationDirection, setRotationDirection] = useState(1);
  const { gameState, checkPlayerMovement } = useGameContext();
  
  // Doll turning mechanism
  useFrame((_, delta) => {
    if (!gameState.isPlaying || gameState.isGameOver) return;
    
    if (headRef.current) {
      // Update turn timer
      setTurnTimer(prev => {
        const newTimer = prev + delta;
        
        // Every 3-7 seconds, change direction (randomly)
        if (newTimer > (redLight ? 3 : 5 + Math.random() * 2)) {
          // Play sound when turning
          const audio = new Audio(redLight 
            ? '/sounds/doll-song.mp3' 
            : '/sounds/doll-laugh.mp3');
          audio.volume = 0.5;
          audio.play().catch(e => console.log('Audio play error:', e));
          
          // Change light state and reset timer
          setRedLight(!redLight);
          setRotationDirection(redLight ? 1 : -1);
          
          // Check if players are moving during red light
          if (!redLight) {
            checkPlayerMovement();
          }
          
          return 0;
        }
        
        return newTimer;
      });
      
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
        color={redLight ? '#ff0000' : '#00ff00'}
        castShadow
      />
    </group>
  );
};

export default Doll;