import React, { Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { GroupProps } from '@react-three/fiber';

interface ModelProps extends GroupProps {
  path: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const Model: React.FC<ModelProps> = ({ 
  path, 
  scale = 1, 
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  ...props 
}) => {
  const { scene } = useGLTF(path);
  
  return (
    <Suspense fallback={null}>
      <primitive 
        object={scene} 
        scale={scale}
        position={position}
        rotation={rotation}
        {...props}
      />
    </Suspense>
  );
};

// Preload models
useGLTF.preload('/models/guard.glb');
useGLTF.preload('/models/player.glb');
useGLTF.preload('/models/doll.glb');
useGLTF.preload('/models/tower.glb');

export default Model; 