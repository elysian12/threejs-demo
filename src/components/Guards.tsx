import React from 'react';
import * as THREE from 'three';

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
  // Calculate rotation to face center
  const angle = Math.atan2(position[0], position[2]);
  
  return (
    <group position={position} rotation={[0, angle, 0]}>
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
      
      {/* Gun */}
      <mesh position={[0, 1.5, 0.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 1.5, 16]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </group>
  );
};

export default Guards;