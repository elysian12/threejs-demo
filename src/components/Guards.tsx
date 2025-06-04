import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameContext } from '../context/GameContext';
import Model from './Model';

const Guards = () => {
  // Create a number of guards around the perimeter
  const guardPositions = [
    [-30, 0, -30],
    [30, 0, -30],
    [-30, 0, 30],
    [30, 0, 30],
    [-20, 0, 0],
    [20, 0, 0]
  ];
  
  return (
    <group>
      {guardPositions.map((position, index) => (
        <Guard key={index} position={position as [number, number, number]} />
      ))}
    </group>
  );
};

interface GuardProps {
  position: [number, number, number];
}

const Guard: React.FC<GuardProps> = ({ position }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { gameState } = useGameContext();
  const [muzzleFlash, setMuzzleFlash] = useState(false);
  const [recoilAnimation, setRecoilAnimation] = useState(0);
  const [bulletTrail, setBulletTrail] = useState(false);
  const [shootingTime, setShootingTime] = useState(0);
  const [shotCount, setShotCount] = useState(0);
  const [gunSmoke, setGunSmoke] = useState(false);
  
  // Calculate rotation to face center
  const angle = Math.atan2(position[0], position[2]);
  
  // Trigger realistic shooting sequence when player is eliminated
  useEffect(() => {
    if (gameState.isGameOver && !gameState.hasWon) {
      setShootingTime(2); // 2 second total sequence
      setBulletTrail(true);
      setGunSmoke(true);
      setShotCount(0);
      
      // Shot 1 - immediate
      setMuzzleFlash(true);
      setRecoilAnimation(1);
      setShotCount(1);
      setTimeout(() => setMuzzleFlash(false), 80);
      
      // Shot 2 - after 200ms
      setTimeout(() => {
        setMuzzleFlash(true);
        setRecoilAnimation(1);
        setShotCount(2);
        setTimeout(() => setMuzzleFlash(false), 80);
      }, 200);
      
      // Shot 3 - after 400ms
      setTimeout(() => {
        setMuzzleFlash(true);
        setRecoilAnimation(1);
        setShotCount(3);
        setTimeout(() => setMuzzleFlash(false), 80);
      }, 400);
      
      // Clear effects after 2 seconds
      setTimeout(() => {
        setBulletTrail(false);
        setRecoilAnimation(0);
        setShootingTime(0);
        setShotCount(0);
      }, 2000);
      
      // Smoke lingers longer (3 seconds total)
      setTimeout(() => {
        setGunSmoke(false);
      }, 3000);
    }
  }, [gameState.isGameOver, gameState.hasWon]);
  
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    // Countdown shooting time
    if (shootingTime > 0) {
      setShootingTime(prev => Math.max(0, prev - delta));
    }
    
    // Realistic recoil animation - quick snap back
    if (recoilAnimation > 0) {
      setRecoilAnimation(prev => Math.max(0, prev - delta * 8)); // Fast recovery
      // Sharp recoil with quick return
      const recoilOffset = Math.sin(recoilAnimation * Math.PI) * 0.4;
      const shakeMagnitude = recoilAnimation * 0.2;
      groupRef.current.position.z = position[2] + recoilOffset * Math.cos(angle);
      groupRef.current.position.x = position[0] + recoilOffset * Math.sin(angle);
      groupRef.current.position.y = position[1] + (Math.random() - 0.5) * shakeMagnitude;
    }
  });
  
  return (
    <group ref={groupRef} position={position} rotation={[0, angle, 0]}>
      {/* Use the 3D model if available, fallback to basic shapes */}
      <Model 
        path="/models/guard.glb"
        scale={2}
        position={[0, 0, 0]}
        castShadow
      />
      
      {/* Realistic bullet trails - 3 shots */}
      {bulletTrail && shootingTime > 0 && (
        <group>
          {/* Shot 1 bullet */}
          {shotCount >= 1 && (
            <mesh
              position={[0, 1.5, 0.8 + (2 - shootingTime) * 25]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.015, 0.015, 1, 8]} />
              <meshBasicMaterial 
                color="#ffd700"
                transparent
                opacity={Math.max(0, shootingTime / 2)}
              />
            </mesh>
          )}
          
          {/* Shot 2 bullet */}
          {shotCount >= 2 && shootingTime < 1.8 && (
            <mesh
              position={[0.1, 1.4, 0.8 + (1.8 - shootingTime) * 25]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.015, 0.015, 1, 8]} />
              <meshBasicMaterial 
                color="#ffd700"
                transparent
                opacity={Math.max(0, (shootingTime - 0.2) / 2)}
              />
            </mesh>
          )}
          
          {/* Shot 3 bullet */}
          {shotCount >= 3 && shootingTime < 1.6 && (
            <mesh
              position={[-0.1, 1.6, 0.8 + (1.6 - shootingTime) * 25]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.015, 0.015, 1, 8]} />
              <meshBasicMaterial 
                color="#ffd700"
                transparent
                opacity={Math.max(0, (shootingTime - 0.4) / 2)}
              />
            </mesh>
          )}
          
          {/* Shell casings ejecting */}
          {Array.from({ length: shotCount }).map((_, i) => (
            <mesh
              key={`casing-${i}`}
              position={[
                0.3 + i * 0.1,
                1.2 - (2 - shootingTime) * 2,
                0.2 + (2 - shootingTime) * 3
              ]}
              rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
            >
              <cylinderGeometry args={[0.02, 0.015, 0.15, 8]} />
              <meshStandardMaterial color="#c9b037" />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Professional muzzle flash effect */}
      {muzzleFlash && (
        <group position={[0, 1.5, 0.8]}>
          {/* Primary flash */}
          <mesh>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshBasicMaterial 
              color="#fff200"
              transparent
              opacity={0.9}
            />
          </mesh>
          
          {/* Secondary flash cone */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.3, 0.8, 8]} />
            <meshBasicMaterial 
              color="#ff6b00"
              transparent
              opacity={0.7}
            />
          </mesh>
          
          {/* Intense point light */}
          <pointLight
            intensity={30}
            distance={15}
            color="#fff200"
            decay={1}
          />
          
          {/* Flash particles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh
              key={`flash-${i}`}
              position={[
                (Math.random() - 0.5) * 1,
                (Math.random() - 0.5) * 1,
                Math.random() * 1.2
              ]}
              scale={[0.08, 0.08, 0.08]}
            >
              <sphereGeometry args={[1, 6, 6]} />
              <meshBasicMaterial 
                color={Math.random() > 0.5 ? "#fff200" : "#ff6b00"}
                transparent
                opacity={0.8}
              />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Gun smoke effect */}
      {gunSmoke && (
        <group position={[0, 1.5, 0.8]}>
          {Array.from({ length: 12 }).map((_, i) => (
            <mesh
              key={`smoke-${i}`}
              position={[
                (Math.random() - 0.5) * 3,
                Math.random() * 2,
                Math.random() * 4 + (3 - shootingTime) * 2
              ]}
              scale={[0.3 + Math.random() * 0.3, 0.3 + Math.random() * 0.3, 0.3 + Math.random() * 0.3]}
            >
              <sphereGeometry args={[1, 6, 6]} />
              <meshStandardMaterial 
                color="#555555"
                transparent
                opacity={0.4 * (shootingTime > 0 ? shootingTime / 2 : 0.6)}
              />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Fallback basic shapes if model fails to load */}
      <group visible={false}>
        {/* Body */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <capsuleGeometry args={[0.5, 2, 4, 8]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
        
        {/* Head (mask) */}
        <mesh position={[0, 2.7, 0]} castShadow>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="black" />
        </mesh>
        
        {/* Mask symbol */}
        <mesh position={[0, 2.7, 0.4]} rotation={[0, 0, 0]} castShadow>
          <planeGeometry args={[0.5, 0.5]} />
          <meshBasicMaterial color="white" side={THREE.DoubleSide} />
        </mesh>
        
        {/* Gun with enhanced recoil */}
        <mesh 
          position={[0, 1.5, 0.5]} 
          rotation={[Math.PI / 2 + (recoilAnimation * 0.6), 0, 0]} 
          castShadow
        >
          <cylinderGeometry args={[0.1, 0.1, 1.5, 16]} />
          <meshStandardMaterial color="black" />
        </mesh>
      </group>
    </group>
  );
};

export default Guards;