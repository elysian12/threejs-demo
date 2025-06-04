import React, { useRef, useEffect, forwardRef, useCallback, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useGameContext } from '../context/GameContext';
import { playAudio } from '../utils/audio';

interface PlayerProps {
  position: [number, number, number];
  visible?: boolean;
}

const Player = forwardRef<THREE.Group, PlayerProps>(({ position, visible = true }, ref) => {
  const internalRef = useRef<THREE.Group>(null);
  const groupRef = (ref as React.RefObject<THREE.Group>) || internalRef;
  const { gameState, movePlayer, stopPlayer, setPlayerPosition } = useGameContext();
  const [isEliminated, setIsEliminated] = useState(false);
  const [deathAnimation, setDeathAnimation] = useState(0);

  // Load GLTF and animations
  const { scene, animations } = useGLTF('/models/player.glb');
  const { actions } = useAnimations(animations, groupRef);

  // Memoize the footstep sound callback
  const playFootstep = useCallback(() => {
    playAudio('FOOTSTEP', 0.2);
  }, []);

  // Check for elimination
  useEffect(() => {
    if (gameState.isGameOver && !gameState.hasWon && !isEliminated) {
      setIsEliminated(true);
      setDeathAnimation(4); // 4 second death sequence
    }
  }, [gameState.isGameOver, gameState.hasWon, isEliminated]);

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
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameState.isPlaying && !gameState.isGameOver) {
        switch (e.key.toLowerCase()) {
          case 'w':
          case 's':
          case 'arrowup':
          case 'arrowdown':
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

  // Animation logic
  useEffect(() => {
    if (!actions) return;
    if (isEliminated) {
      // Stop all animations when eliminated
      Object.values(actions).forEach(action => action?.stop());
    } else if (gameState.isMoving) {
      if (actions['Walk']) {
        actions['Walk'].reset().fadeIn(0.2).play();
        if (actions['Idle']) actions['Idle'].fadeOut(0.2);
      }
    } else {
      if (actions['Idle']) {
        actions['Idle'].reset().fadeIn(0.2).play();
        if (actions['Walk']) actions['Walk'].fadeOut(0.2);
      } else if (actions['Walk']) {
        actions['Walk'].fadeOut(0.2);
      }
    }
  }, [gameState.isMoving, actions, isEliminated]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Extended death animation - 4 seconds total
    if (isEliminated && deathAnimation > 0) {
      // Falling animation
      setDeathAnimation(prev => Math.max(0, prev - delta));
      
      // Multi-stage death animation
      if (deathAnimation > 3) {
        // Stage 1 (0-1 second): Initial impact and violent shake
        const impactProgress = (4 - deathAnimation); // 0 to 1
        groupRef.current.rotation.x = impactProgress * Math.PI / 6;
        groupRef.current.position.y = position[1] + (Math.random() - 0.5) * 0.8; // Violent convulsions
        groupRef.current.position.x = position[0] + (Math.random() - 0.5) * 1.2;
        groupRef.current.position.z += (Math.random() - 0.5) * 0.5;
      } else if (deathAnimation > 2) {
        // Stage 2 (1-2 seconds): Falling forward dramatically
        const fallProgress = (3 - deathAnimation); // 0 to 1
        groupRef.current.rotation.x = (Math.PI / 6) + fallProgress * (Math.PI / 2.5);
        groupRef.current.position.y = position[1] - fallProgress * 1.2;
        groupRef.current.position.x = position[0] + (Math.random() - 0.5) * 0.4; // Reduced convulsions
        groupRef.current.position.z += fallProgress * 0.3; // Fall slightly forward
      } else if (deathAnimation > 1) {
        // Stage 3 (2-3 seconds): Final collapse to ground
        const collapseProgress = (2 - deathAnimation); // 0 to 1
        groupRef.current.rotation.x = (Math.PI / 6) + (Math.PI / 2.5) + collapseProgress * (Math.PI / 4);
        groupRef.current.position.y = position[1] - 1.2 - collapseProgress * 0.8; // Completely flat
        groupRef.current.position.x = position[0]; // Stop shaking
        groupRef.current.position.z += 0.3; // Final forward position
        groupRef.current.rotation.z = collapseProgress * (Math.PI / 8); // Side tilt
        groupRef.current.rotation.y = collapseProgress * (Math.PI / 12); // Slight head turn
      } else {
        // Stage 4 (3-4 seconds): Death stillness
        groupRef.current.rotation.x = Math.PI * 0.85; // Almost face down
        groupRef.current.position.y = position[1] - 2; // Flat on ground
        groupRef.current.position.x = position[0];
        groupRef.current.position.z += 0.3;
        groupRef.current.rotation.z = Math.PI / 8;
        groupRef.current.rotation.y = Math.PI / 12;
        // Player is completely still and dead
      }
      return;
    }

    if (!gameState.isPlaying || gameState.isGameOver || gameState.isDollLooking || isEliminated) {
      if (groupRef.current && !isEliminated) {
        groupRef.current.position.y = position[1]; // Always keep above ground
      }
      return;
    }

    if (gameState.isMoving) {
      const speed = 5;
      const movement = delta * speed;
      
      switch (gameState.moveDirection) {
        case 'forward':
          groupRef.current.position.z += movement; // Move toward doll (positive Z)
          break;
        case 'backward':
          groupRef.current.position.z -= movement; // Move away from doll (negative Z)
          break;
      }
      
      // Update player position in game state
      setPlayerPosition(groupRef.current.position.z);
      
      // Animate walking (fallback if no animation)
      if (!actions || (!actions['Walk'] && !actions['Idle'])) {
        const time = Date.now() * 0.005;
        const height = Math.max(0, Math.sin(time) * 0.1);
        groupRef.current.position.y = position[1] + height;
      }
      
      // Play footstep sound
      if (Math.sin(Date.now() * 0.01) > 0.9) {
        playFootstep();
      }
      
      // Check for win condition - reaching the finish line
      if (groupRef.current.position.z >= 30) {
        playAudio('WIN', 0.5);
      }
    }
  });

  return (
    <group ref={groupRef} visible={visible}>
      {/* Use the 3D model with animation if available */}
      <primitive 
        object={scene} 
        scale={2} 
        position={[0, 0, 0]} 
        castShadow 
      />
      
      {/* Enhanced blood effects when eliminated */}
      {isEliminated && deathAnimation > 0 && (
        <group>
          {/* Blood splatter particles - intensity based on stage */}
          {Array.from({ length: deathAnimation > 3 ? 25 : deathAnimation > 2 ? 30 : deathAnimation > 1 ? 20 : 15 }).map((_, i) => (
            <mesh
              key={`blood-${i}`}
              position={[
                (Math.random() - 0.5) * (8 - deathAnimation * 1.5), // Spreads wider over time
                Math.random() * 4,
                (Math.random() - 0.5) * (8 - deathAnimation * 1.5)
              ]}
              scale={[0.12, 0.12, 0.12]}
            >
              <sphereGeometry args={[1, 8, 8]} />
              <meshStandardMaterial 
                color={Math.random() > 0.5 ? "#8B0000" : "#A52A2A"} 
                transparent 
                opacity={Math.min(deathAnimation / 4 * 1.5, 1)}
              />
            </mesh>
          ))}
          
          {/* Main blood pool on ground - grows over time */}
          {deathAnimation < 3.5 && (
            <mesh
              position={[0, -1.95, 0.2]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <circleGeometry args={[(4.5 - deathAnimation) * 1.2, 24]} />
              <meshStandardMaterial 
                color="#4B0000"
                transparent
                opacity={0.9}
              />
            </mesh>
          )}
          
          {/* Blood trail from impact */}
          {deathAnimation < 3 && (
            <mesh
              position={[0, -1.9, -0.5]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[1.5, 3]} />
              <meshStandardMaterial 
                color="#6B0000"
                transparent
                opacity={0.7}
              />
            </mesh>
          )}
          
          {/* Additional blood stains */}
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh
              key={`stain-${i}`}
              position={[
                (Math.random() - 0.5) * 4,
                -1.9,
                (Math.random() - 0.5) * 4
              ]}
              rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}
            >
              <circleGeometry args={[0.3 + Math.random() * 0.5, 12]} />
              <meshStandardMaterial 
                color="#5B0000"
                transparent
                opacity={0.8}
              />
            </mesh>
          ))}
          
          {/* Dust/impact particles */}
          {deathAnimation > 2 && Array.from({ length: 12 }).map((_, i) => (
            <mesh
              key={`dust-${i}`}
              position={[
                (Math.random() - 0.5) * 6,
                Math.random() * 3 + 0.5,
                (Math.random() - 0.5) * 6
              ]}
              scale={[0.25, 0.25, 0.25]}
            >
              <sphereGeometry args={[1, 6, 6]} />
              <meshStandardMaterial 
                color="#8B7355" 
                transparent 
                opacity={deathAnimation > 3 ? (deathAnimation - 3) * 0.6 : 0}
              />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Fallback basic shapes if model fails to load */}
      <group visible={false}>
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
          <meshStandardMaterial color="#1E3A8A" />
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
    </group>
  );
});

Player.displayName = 'Player';

export default Player;