import React from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface ChatBubbleProps {
  text: string;
  position: [number, number, number];
  characterName: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ text, position, characterName }) => {
  // Calculate bubble dimensions based on text length
  const bubbleWidth = Math.max(4, Math.min(8, text.length * 0.08));
  const bubbleHeight = 2;

  return (
    <group position={position}>
      {/* Main bubble background */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[bubbleWidth, bubbleHeight, 0.2]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Bubble border */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[bubbleWidth + 0.1, bubbleHeight + 0.1, 0.1]} />
        <meshStandardMaterial 
          color="#333333" 
          transparent 
          opacity={0.8}
        />
      </mesh>

      {/* Bubble tail/pointer */}
      <mesh position={[0, -bubbleHeight / 2 - 0.3, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.4, 0.4, 0.2]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.95}
        />
      </mesh>

      {/* Character name */}
      <Text
        position={[0, bubbleHeight / 2 - 0.3, 0.2]}
        fontSize={0.3}
        color="#666666"
        anchorX="center"
        anchorY="middle"
      >
        {characterName}
      </Text>

      {/* Chat text */}
      <Text
        position={[0, 0, 0.2]}
        fontSize={0.25}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        maxWidth={bubbleWidth - 0.5}
        textAlign="center"
      >
        {text}
      </Text>

      {/* Animated typing indicator (optional visual enhancement) */}
      <mesh position={[bubbleWidth / 2 - 0.3, -bubbleHeight / 2 + 0.3, 0.2]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial 
          color="#4CAF50" 
          emissive="#4CAF50"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
};

export default ChatBubble; 