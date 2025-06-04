import React, { useRef } from 'react';
import * as THREE from 'three';
import { useTexture, Environment as DreiEnvironment } from '@react-three/drei';

const Environment = () => {
  const groundRef = useRef<THREE.Mesh>(null);
  
  // Load textures with better quality
  const textures = useTexture({
    ground: 'https://images.pexels.com/photos/172276/pexels-photo-172276.jpeg',
    wall: 'https://images.pexels.com/photos/207142/pexels-photo-207142.jpeg',
  });

  // Configure textures
  Object.values(textures).forEach(texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.anisotropy = 16;
  });

  textures.ground.repeat.set(10, 20);
  textures.wall.repeat.set(5, 2);

  return (
    <group>
      {/* Environment lighting */}
      <DreiEnvironment preset="sunset" />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[0, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={new THREE.Vector2(2048, 2048)}
        shadow-camera-far={100}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />

      {/* Main arena ground - clean and organized */}
      <mesh 
        ref={groundRef} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[50, 100]} />
        <meshStandardMaterial 
          color="#f5f5dc"
          map={textures.ground}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Arena walls - enclosed space */}
      <ArenaWalls />
      
      {/* Player spawn area with clear start line */}
      <StartArea />
      
      {/* Organized lane markers and track lines */}
      <TrackLines />
      
      {/* Intentionally placed obstacles in organized lanes */}
      <OrganizedObstacles />
      
      {/* Elevated doll platform */}
      <DollPlatform />
      
      {/* Clear finish line */}
      <FinishLine />
      
      {/* Spectator stands and atmosphere */}
      <SpectatorStands />
      
      {/* Squid Game themed banners and decorations */}
      <SquidGameDecorations />
    </group>
  );
};

const ArenaWalls = () => {
  const { wall } = useTexture({
    wall: 'https://images.pexels.com/photos/207142/pexels-photo-207142.jpeg',
  });

  return (
    <group>
      {/* Left wall */}
      <mesh position={[-25, 5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 10, 100]} />
        <meshStandardMaterial 
          color="#e8e8e8" 
          map={wall}
          roughness={0.7}
        />
      </mesh>
      {/* Right wall */}
      <mesh position={[25, 5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 10, 100]} />
        <meshStandardMaterial 
          color="#e8e8e8" 
          map={wall}
          roughness={0.7}
        />
      </mesh>
      {/* Back wall (start area) */}
      <mesh position={[0, 5, 50]} castShadow receiveShadow>
        <boxGeometry args={[50, 10, 1]} />
        <meshStandardMaterial 
          color="#e8e8e8" 
          map={wall}
          roughness={0.7}
        />
      </mesh>
      {/* Front wall (finish area) */}
      <mesh position={[0, 5, -50]} castShadow receiveShadow>
        <boxGeometry args={[50, 10, 1]} />
        <meshStandardMaterial 
          color="#e8e8e8" 
          map={wall}
          roughness={0.7}
        />
      </mesh>
    </group>
  );
};

const StartArea = () => {
  return (
    <group>
      {/* Start line - bright and clear */}
      <mesh
        position={[0, 0.02, -35]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[40, 1]} />
        <meshStandardMaterial 
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Start area text markers */}
      <mesh
        position={[0, 0.03, -37]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[8, 2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Player spawn zone indicators */}
      {[-15, -5, 5, 15].map((x, i) => (
        <mesh
          key={`spawn-${i}`}
          position={[x, 0.01, -33]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <circleGeometry args={[1.5, 16]} />
          <meshStandardMaterial 
            color="#90EE90"
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
};

const TrackLines = () => {
  return (
    <group>
      {/* Lane divider lines */}
      {[-12, 0, 12].map((x, i) => (
        <mesh
          key={`lane-${i}`}
          position={[x, 0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[0.2, 80]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
      
      {/* Progress markers every 10 units from start to finish */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          key={`progress-${i}`}
          position={[0, 0.02, -30 + i * 10]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[36, 0.3]} />
          <meshStandardMaterial 
            color="#cccccc"
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
};

const OrganizedObstacles = () => {
  return (
    <group>
      {/* Simple strategic obstacles - just a few key ones */}
      {/* Row 1 obstacles - barrels in lanes */}
      <mesh position={[-12, 1, -15]} castShadow>
        <cylinderGeometry args={[1, 1, 2, 16]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[12, 1, -15]} castShadow>
        <cylinderGeometry args={[1, 1, 2, 16]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Row 2 obstacles - cones */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <coneGeometry args={[0.8, 1.5, 12]} />
        <meshStandardMaterial color="#FF6B35" />
      </mesh>
      
      {/* Row 3 obstacles - boxes */}
      <mesh position={[-12, 1, 15]} castShadow>
        <boxGeometry args={[1.5, 2, 1.5]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[12, 1, 15]} castShadow>
        <boxGeometry args={[1.5, 2, 1.5]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
    </group>
  );
};

const DollPlatform = () => {
  return (
    <group position={[0, 0, 35]}>
      {/* Elevated platform */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[6, 6, 3, 16]} />
        <meshStandardMaterial 
          color="#ff69b4"
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      
      {/* Platform steps */}
      <mesh position={[0, 0.5, -3]} castShadow receiveShadow>
        <boxGeometry args={[4, 1, 2]} />
        <meshStandardMaterial color="#ff1493" />
      </mesh>
      
      {/* Decorative pillars */}
      {[-4, 4].map((x, i) => (
        <mesh key={`pillar-${i}`} position={[x, 4, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 8, 12]} />
          <meshStandardMaterial color="#ff1493" />
        </mesh>
      ))}
    </group>
  );
};

const FinishLine = () => {
  return (
    <group>
      {/* Main finish line */}
      <mesh
        position={[0, 0.02, 30]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[40, 2]} />
        <meshStandardMaterial 
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.4}
        />
      </mesh>
      
      {/* Checkered pattern */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          key={`checker-${i}`}
          position={[-17.5 + i * 5, 0.03, 30]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[2, 2]} />
          <meshStandardMaterial 
            color={i % 2 === 0 ? "#ffffff" : "#000000"}
          />
        </mesh>
      ))}
    </group>
  );
};

const SpectatorStands = () => {
  return (
    <group>
      {/* Left side stands */}
      <mesh position={[-30, 3, 0]} castShadow>
        <boxGeometry args={[8, 6, 80]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Right side stands */}
      <mesh position={[30, 3, 0]} castShadow>
        <boxGeometry args={[8, 6, 80]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Stand railings */}
      {[-30, 30].map((x, i) => (
        <mesh key={`railing-${i}`} position={[x, 6.5, 0]} castShadow>
          <boxGeometry args={[8, 1, 80]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      ))}
    </group>
  );
};

const SquidGameDecorations = () => {
  return (
    <group>
      {/* Squid Game banners on walls */}
      <mesh position={[0, 8, 49]} rotation={[0, 0, 0]}>
        <planeGeometry args={[20, 4]} />
        <meshStandardMaterial 
          color="#ff69b4"
          emissive="#ff69b4"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Side banners */}
      <mesh position={[-24, 8, 0]} rotation={[0, Math.PI/2, 0]}>
        <planeGeometry args={[40, 4]} />
        <meshStandardMaterial 
          color="#00ff41"
          emissive="#00ff41"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <mesh position={[24, 8, 0]} rotation={[0, -Math.PI/2, 0]}>
        <planeGeometry args={[40, 4]} />
        <meshStandardMaterial 
          color="#00ff41"
          emissive="#00ff41"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
};

export default Environment;