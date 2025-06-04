import React, { useRef } from 'react';
import * as THREE from 'three';

const Environment = () => {
  const groundRef = useRef<THREE.Mesh>(null);
  
  // Create a more stable ground texture
  const groundTexture = new THREE.TextureLoader().load('https://images.pexels.com/photos/172276/pexels-photo-172276.jpeg');
  groundTexture.wrapS = THREE.RepeatWrapping;
  groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(10, 10);
  groundTexture.magFilter = THREE.NearestFilter;
  groundTexture.minFilter = THREE.NearestMipmapLinearFilter;
  
  return (
    <group>
      {/* Ground */}
      <mesh 
        ref={groundRef} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          map={groundTexture} 
          roughness={1}
          metalness={0}
          color="#a9a9a9"
        />
      </mesh>
      
      {/* Rest of the environment components */}
      <GuardTower position={[-40, 0, -40]} />
      <GuardTower position={[40, 0, -40]} />
      <GuardTower position={[-40, 0, 40]} />
      <GuardTower position={[40, 0, 40]} />
      
      {/* Walls */}
      <Wall position={[-50, 10, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Wall position={[50, 10, 0]} rotation={[0, -Math.PI / 2, 0]} />
      <Wall position={[0, 10, -50]} rotation={[0, 0, 0]} />
      <Wall position={[0, 10, 50]} rotation={[0, Math.PI, 0]} />
      
      {/* Finish Line */}
      <mesh
        position={[0, 0.01, -20]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </group>
  );
};

const Wall = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => {
  const wallTexture = new THREE.TextureLoader().load('https://images.pexels.com/photos/207142/pexels-photo-207142.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1');
  wallTexture.wrapS = THREE.RepeatWrapping;
  wallTexture.wrapT = THREE.RepeatWrapping;
  wallTexture.repeat.set(5, 1);
  
  return (
    <mesh
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
    >
      <planeGeometry args={[100, 20]} />
      <meshStandardMaterial 
        map={wallTexture} 
        roughness={0.8}
        color="#808080"
      />
    </mesh>
  );
};

const GuardTower = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      <mesh position={[0, 5, 0]} castShadow>
        <boxGeometry args={[5, 10, 5]} />
        <meshStandardMaterial color="#696969" roughness={0.9} />
      </mesh>
      <mesh position={[0, 12.5, 0]} castShadow>
        <boxGeometry args={[6, 5, 6]} />
        <meshStandardMaterial color="#808080" roughness={0.8} />
      </mesh>
      <mesh position={[0, 15.5, 0]} castShadow>
        <coneGeometry args={[4.5, 2, 4]} />
        <meshStandardMaterial color="#a52a2a" roughness={0.7} />
      </mesh>
    </group>
  );
};

export default Environment;