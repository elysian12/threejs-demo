import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Text, PerspectiveCamera, OrbitControls, useGLTF } from '@react-three/drei';
import ChatBubble from './ChatBubble';
import { useTTS } from '../hooks/useTTS';

interface Character {
  id: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
}

interface ConversationLine {
  character: string;
  text: string;
  emotion?: 'nervous' | 'confident' | 'scared' | 'determined' | 'angry';
}

// Character Model Component - properly cloned for each instance
const CharacterModel: React.FC<{ scale: number }> = ({ scale }) => {
  const { scene } = useGLTF('/models/player.glb');
  
  // Clone the scene to ensure each character gets their own instance
  const clonedScene = scene.clone();
  
  return (
    <primitive 
      object={clonedScene} 
      scale={scale}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
      castShadow
    />
  );
};

const harryPotterCharacters: Character[] = [
  {
    id: 'harry',
    name: 'Harry Potter',
    position: [-3, 0, -1],
    rotation: [0, Math.PI / 4, 0],
    scale: 1.0,
    color: '#8B0000', // Dark red for Gryffindor
  },
  {
    id: 'hermione',
    name: 'Hermione',
    position: [-1, 0, -3],
    rotation: [0, Math.PI / 6, 0],
    scale: 0.95,
    color: '#4169E1', // Royal blue
  },
  {
    id: 'ron',
    name: 'Ron',
    position: [3, 0, -1],
    rotation: [0, -Math.PI / 4, 0],
    scale: 1.05,
    color: '#FF4500', // Orange red
  },
  {
    id: 'neville',
    name: 'Neville',
    position: [1, 0, -3],
    rotation: [0, -Math.PI / 6, 0],
    scale: 0.9,
    color: '#228B22', // Forest green
  },
  {
    id: 'luna',
    name: 'Luna',
    position: [0, 0, 2],
    rotation: [0, Math.PI, 0],
    scale: 0.9,
    color: '#9932CC', // Dark orchid
  },
];

const conversation: ConversationLine[] = [
  {
    character: 'harry',
    text: 'Bloody hell... what is this place?',
    emotion: 'nervous',
  },
  {
    character: 'hermione',
    text: 'Harry, look around us. These guards, that giant doll...',
    emotion: 'scared',
  },
  {
    character: 'ron',
    text: 'This is mental! They said we\'re playing some kind of game?',
    emotion: 'nervous',
  },
  {
    character: 'luna',
    text: 'Red Light, Green Light. I\'ve heard whispers about it in Ravenclaw.',
    emotion: 'confident',
  },
  {
    character: 'neville',
    text: 'What happens if we lose?',
    emotion: 'scared',
  },
  {
    character: 'hermione',
    text: 'I don\'t think we want to find out, Neville.',
    emotion: 'determined',
  },
  {
    character: 'harry',
    text: 'Listen everyone, we stick together. When that thing turns around, we freeze completely.',
    emotion: 'determined',
  },
  {
    character: 'ron',
    text: 'But what if someone moves by accident? What then?',
    emotion: 'nervous',
  },
  {
    character: 'luna',
    text: 'Then they eliminate you. Permanently.',
    emotion: 'confident',
  },
  {
    character: 'neville',
    text: 'Oh no, oh no... I\'m going to mess this up!',
    emotion: 'scared',
  },
  {
    character: 'hermione',
    text: 'Neville! Breathe. You\'ve faced Death Eaters, you can do this.',
    emotion: 'determined',
  },
  {
    character: 'harry',
    text: 'She\'s right. We\'ve all been through worse than this.',
    emotion: 'confident',
  },
  {
    character: 'ron',
    text: 'Speak for yourself! I nearly wet myself when that doll moved!',
    emotion: 'nervous',
  },
  {
    character: 'luna',
    text: 'Just focus on the doll\'s song. When it stops, you stop.',
    emotion: 'confident',
  },
  {
    character: 'hermione',
    text: 'Wait... do you hear that? It\'s starting!',
    emotion: 'scared',
  },
  {
    character: 'harry',
    text: 'Everyone ready? Remember - we survive this together or not at all.',
    emotion: 'determined',
  },
  {
    character: 'ron',
    text: 'For Hogwarts!',
    emotion: 'determined',
  },
  {
    character: 'neville',
    text: 'For Dumbledore\'s Army!',
    emotion: 'determined',
  },
  {
    character: 'hermione',
    text: 'Let\'s show them what we\'re made of.',
    emotion: 'confident',
  },
  {
    character: 'luna',
    text: 'Good luck, everyone. May the odds be in our favor.',
    emotion: 'confident',
  },
];

interface ConversationSceneProps {
  onConversationEnd: () => void;
}

const ConversationScene: React.FC<ConversationSceneProps> = ({ onConversationEnd }) => {
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState<string>('');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const { speak, stop: stopTTS } = useTTS();
  const timeoutRef = useRef<number | null>(null);

  const playNextLine = useCallback(() => {
    if (currentLineIndex >= conversation.length) {
      // Conversation finished
      setCurrentSpeaker(null);
      setCurrentText('');
      setTimeout(() => {
        onConversationEnd();
      }, 3000); // Longer delay before ending
      return;
    }

    const line = conversation[currentLineIndex];
    
    // Set current speaker and text
    setCurrentSpeaker(line.character);
    setCurrentText(line.text);

    // Function to handle when audio finishes
    const handleAudioComplete = () => {
      console.log('🎭 Audio finished for:', line.character);
      
      // Brief delay before clearing speaker (like a human finishing their thought)
      setTimeout(() => {
        setCurrentSpeaker(null);
        setCurrentText('');
        
        // Pause between speakers based on emotion and content
        let pauseDuration = 2000; // Base pause
        
        // Adjust pause based on emotion and content
        if (line.emotion === 'scared' || line.emotion === 'nervous') {
          pauseDuration = 2800; // Longer pause for nervous/scared moments
        } else if (line.emotion === 'determined' || line.emotion === 'angry') {
          pauseDuration = 1600; // Shorter pause for determined/angry moments
        } else if (line.emotion === 'confident') {
          pauseDuration = 1400; // Quick response for confident characters
        }
        
        // Add extra pause for dramatic moments (questions, revelations)
        if (line.text.includes('?') || line.text.includes('!') || line.text.includes('...')) {
          pauseDuration += 600; // Extra dramatic pause
        }
        
        // Add pause for longer sentences (more natural)
        const wordCount = line.text.split(' ').length;
        if (wordCount > 15) {
          pauseDuration += 400; // Extra pause after longer statements
        }
        
        console.log('⏱️ Pausing for', pauseDuration, 'ms before next line');
        
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Move to next line after pause
        timeoutRef.current = setTimeout(() => {
          setCurrentLineIndex(prev => prev + 1);
        }, pauseDuration);
      }, 300); // 300ms delay before clearing speaker visual (human-like pause)
    };

    // Speak with character-specific voice settings and completion callback
    const voiceSettings = getVoiceSettings(line.character, line.emotion);
    speak(line.text, { 
      ...voiceSettings, 
      characterId: line.character,
      onComplete: handleAudioComplete
    });

  }, [currentLineIndex, onConversationEnd, speak]);

  const getVoiceSettings = (character: string, emotion?: string) => {
    const baseSettings = {
      harry: { rate: 1.1, pitch: 1.0, volume: 0.9 },
      hermione: { rate: 1.2, pitch: 1.2, volume: 0.8 },
      ron: { rate: 0.9, pitch: 0.9, volume: 1.0 },
      neville: { rate: 0.8, pitch: 1.1, volume: 0.7 },
      luna: { rate: 1.0, pitch: 1.3, volume: 0.8 },
    }[character] || { rate: 1.0, pitch: 1.0, volume: 0.8 };

    // Modify based on emotion
    if (emotion === 'scared') {
      baseSettings.rate *= 1.2;
      baseSettings.pitch *= 1.1;
    } else if (emotion === 'angry') {
      baseSettings.rate *= 0.8;
      baseSettings.pitch *= 0.9;
    } else if (emotion === 'nervous') {
      baseSettings.rate *= 1.1;
      baseSettings.pitch *= 1.05;
    }

    return baseSettings;
  };

  // Start conversation
  useEffect(() => {
    const startDelay = setTimeout(() => {
      setConversationStarted(true);
      setShowSkipButton(true);
      playNextLine();
    }, 4000); // Longer initial delay to let scene load

    return () => clearTimeout(startDelay);
  }, [playNextLine]);

  const skipConversation = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    stopTTS();
    setCurrentSpeaker(null);
    setCurrentText('');
    onConversationEnd();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      stopTTS();
    };
  }, [stopTTS]);

  return (
    <div className="w-full h-full relative">
      <Canvas shadows camera={{ position: [0, 8, 20], fov: 60 }}>
        <color attach="background" args={['#2a2a2a']} />
        <fog attach="fog" args={['#2a2a2a', 30, 80]} />
        
        <PerspectiveCamera makeDefault position={[0, 8, 20]} />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={15}
          maxDistance={35}
          target={[0, 2, 0]}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.8}
        />

        {/* Environment */}
        <group>
          {/* Floor */}
          <mesh receiveShadow position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[40, 40]} />
            <meshStandardMaterial color="#4a4a4a" />
          </mesh>
          
          {/* Brighter atmospheric elements */}
          <mesh position={[0, 15, -20]}>
            <planeGeometry args={[40, 30]} />
            <meshBasicMaterial color="#3a3a3a" transparent opacity={0.5} />
          </mesh>
        </group>

        {/* Characters */}
        {harryPotterCharacters.map((character) => {
          const isActive = currentSpeaker === character.id;
          
          return (
            <group key={character.id} position={character.position} rotation={character.rotation}>
              {/* 3D Model with proper cloning */}
              <Suspense fallback={null}>
                <CharacterModel scale={character.scale} />
              </Suspense>
              
              {/* Subtle character aura (much smaller and behind the model) */}
              <mesh position={[0, 0.9, -0.3]}>
                <cylinderGeometry args={[0.8, 0.8, 0.1, 16]} />
                <meshStandardMaterial 
                  color={character.color} 
                  transparent 
                  opacity={isActive ? 0.4 : 0.1}
                  emissive={character.color}
                  emissiveIntensity={isActive ? 0.3 : 0.05}
                />
              </mesh>

              {/* Smaller Character Name Badge on Chest */}
              <group position={[0, 1.2, 0.4]}>
                {/* Badge background */}
                <mesh>
                  <boxGeometry args={[0.8, 0.2, 0.03]} />
                  <meshStandardMaterial 
                    color="#ffffff" 
                    transparent 
                    opacity={0.95}
                  />
                </mesh>
                {/* Badge border */}
                <mesh position={[0, 0, 0.015]}>
                  <boxGeometry args={[0.85, 0.25, 0.01]} />
                  <meshStandardMaterial 
                    color={character.color} 
                    transparent 
                    opacity={0.9}
                  />
                </mesh>
                {/* Name text */}
                <Text
                  position={[0, 0, 0.03]}
                  fontSize={0.08}
                  color="#000000"
                  anchorX="center"
                  anchorY="middle"
                  maxWidth={0.7}
                >
                  {character.name}
                </Text>
              </group>

              {/* Speaking indicator above head */}
              {isActive && (
                <group>
                  <mesh position={[0, 3.5, 0]}>
                    <sphereGeometry args={[0.15, 16, 16]} />
                    <meshStandardMaterial 
                      color="#00ff00" 
                      emissive="#00ff00"
                      emissiveIntensity={0.8}
                    />
                  </mesh>
                  
                  {/* Pulsing sound waves */}
                  <mesh position={[0, 3.5, 0]}>
                    <ringGeometry args={[0.25, 0.35, 16]} />
                    <meshBasicMaterial color="#00ff00" transparent opacity={0.6} />
                  </mesh>
                  <mesh position={[0, 3.5, 0]}>
                    <ringGeometry args={[0.4, 0.5, 16]} />
                    <meshBasicMaterial color="#00ff00" transparent opacity={0.3} />
                  </mesh>
                </group>
              )}

              {/* Chat Bubble when speaking */}
              {isActive && currentText && (
                <ChatBubble
                  text={currentText}
                  position={[0, 4.5, 0]}
                  characterName={character.name}
                />
              )}
            </group>
          );
        })}

        {/* Much brighter lighting */}
        <ambientLight intensity={1.2} />
        
        {/* Main directional light */}
        <directionalLight
          position={[5, 15, 5]}
          intensity={2.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* Room corner lights - much brighter */}
        <pointLight position={[-15, 8, -15]} intensity={1.5} color="#ffffff" />
        <pointLight position={[15, 8, -15]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-15, 8, 15]} intensity={1.5} color="#ffffff" />
        <pointLight position={[15, 8, 15]} intensity={1.5} color="#ffffff" />
        
        {/* Center overhead light - very bright */}
        <pointLight position={[0, 12, 0]} intensity={2.0} color="#ffffff" />
        
        {/* Additional fill lights */}
        <pointLight position={[0, 8, -20]} intensity={1.0} color="#ffffff" />
        <pointLight position={[0, 8, 20]} intensity={1.0} color="#ffffff" />
        <pointLight position={[-20, 8, 0]} intensity={1.0} color="#ffffff" />
        <pointLight position={[20, 8, 0]} intensity={1.0} color="#ffffff" />
        
        {/* Character spot lights - updated positions */}
        <spotLight
          position={[-3, 10, -1]}
          intensity={1.2}
          angle={Math.PI / 5}
          penumbra={0.2}
          target-position={[-3, 0, -1]}
          color="#ffffff"
        />
        <spotLight
          position={[-1, 10, -3]}
          intensity={1.2}
          angle={Math.PI / 5}
          penumbra={0.2}
          target-position={[-1, 0, -3]}
          color="#ffffff"
        />
        <spotLight
          position={[3, 10, -1]}
          intensity={1.2}
          angle={Math.PI / 5}
          penumbra={0.2}
          target-position={[3, 0, -1]}
          color="#ffffff"
        />
        <spotLight
          position={[1, 10, -3]}
          intensity={1.2}
          angle={Math.PI / 5}
          penumbra={0.2}
          target-position={[1, 0, -3]}
          color="#ffffff"
        />
        <spotLight
          position={[0, 10, 2]}
          intensity={1.2}
          angle={Math.PI / 5}
          penumbra={0.2}
          target-position={[0, 0, 2]}
          color="#ffffff"
        />
        
        {/* Main spotlight from above - much brighter */}
        <spotLight
          position={[0, 25, 0]}
          intensity={2.0}
          angle={Math.PI / 2.5}
          penumbra={0.1}
          target-position={[0, 0, 0]}
          castShadow
        />
      </Canvas>

      {/* UI Controls */}
      {showSkipButton && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={skipConversation}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold text-lg transition-colors shadow-lg"
          >
            Skip Conversation
          </button>
        </div>
      )}

      {/* Progress indicator */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-black bg-opacity-70 rounded-lg px-4 py-2">
          <span className="text-green-400 text-sm font-mono">
            {currentLineIndex + 1} / {conversation.length}
          </span>
        </div>
      </div>

      {/* Scene title with current speaker */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black bg-opacity-70 rounded-lg px-4 py-2">
          <span className="text-white font-bold text-lg">Pre-Game Discussion</span>
          {currentSpeaker && (
            <p className="text-green-400 text-sm mt-1">
              {harryPotterCharacters.find(c => c.id === currentSpeaker)?.name} is speaking...
            </p>
          )}
          {!conversationStarted && (
            <p className="text-gray-400 text-sm mt-1">Starting conversation...</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Preload the model
useGLTF.preload('/models/player.glb');

export default ConversationScene; 