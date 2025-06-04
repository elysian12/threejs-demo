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
      const targetPosition = new THREE.Vector3(
        playerRef.current.position.x,
        playerRef.current.position.y + 5,
        playerRef.current.position.z + 10
      );
      cameraRef.current.position.lerp(targetPosition, 0.1);
      cameraRef.current.lookAt(
        playerRef.current.position.x,
        playerRef.current.position.y,
        playerRef.current.position.z
      );
    }
  });
  
  return (
    <group>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 5, 15]}
        fov={60}
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
      <Doll position={[0, 2, -60]} />
      <Player position={[0, 1, 5]} ref={playerRef} />
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