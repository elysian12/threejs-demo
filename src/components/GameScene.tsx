import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Doll from './Doll';
import Player from './Player';
import Environment from './Environment';
import Guards from './Guards';
import { useGameContext } from '../context/GameContext';

interface GameSceneProps {
  cameraMode: 'character' | 'world';
}

const GameScene: React.FC<GameSceneProps> = ({ cameraMode }) => {
  const { gameState } = useGameContext();
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const playerRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!cameraRef.current) return;
    if (cameraMode === 'character' && playerRef.current && gameState.isPlaying) {
      const player = playerRef.current;
      // Always face forward (negative Z)
      player.rotation.y = 0;
      // Third-person camera: behind and above the player
      const cameraOffset = new THREE.Vector3(0, 5, 15); // [x, y, z]
      const camPos = player.position.clone().add(cameraOffset);
      cameraRef.current.position.lerp(camPos, 0.2);
      cameraRef.current.lookAt(player.position.x, player.position.y + 3.5, player.position.z);
    }
  });
  
  return (
    <group>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 3.5, 5]} // Start at head height
        fov={75}
      />
      {cameraMode === 'world' && (
        <OrbitControls
          {...(cameraRef.current ? { camera: cameraRef.current } : {})}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={500}
          target={[0, 0, 0]}
        />
      )}
      <Environment />
      <Doll position={[0, 3, 35]} />
      {/* Hide player model in first-person mode */}
      <Player position={[0, 1, -30]} ref={playerRef} visible={cameraMode !== 'character'} />
      <Guards />
      
      {/* Lighting */}
      <directionalLight
        position={[10, 10, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <hemisphereLight
        intensity={0.5}
        groundColor="#000000"
      />
    </group>
  );
};

export default GameScene;