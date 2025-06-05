import { useCallback, useRef, useState } from 'react';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string; // Changed to string for ElevenLabs voice ID
}

// Character-specific voice mappings (using some popular ElevenLabs voice IDs)
const CHARACTER_VOICES: Record<string, string> = {
  harry: 'pNInz6obpgDQGcFmaJgB', // Adam - young male voice
  hermione: 'EXAVITQu4vr4xnSDxMaL', // Bella - intelligent female voice
  ron: 'VR6AewLTigWG4xSOukaG', // Josh - casual male voice
  neville: 'CYw3kZ02Hs0563khs1Fj', // Ethan - nervous/shy male voice
  luna: 'MF3mGyEYCl7XYWbV9V6O', // Elli - dreamy female voice
};

export const useTTS = (options: TTSOptions = {}) => {
  const { volume = 0.8 } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const speak = useCallback(async (text: string, customOptions?: TTSOptions & { characterId?: string; onComplete?: () => void }) => {
    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setIsLoading(true);
      isPlayingRef.current = false;

      // Get API key from environment
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || import.meta.env.ELEVENLABS_KEY;
      console.log('🔑 ElevenLabs API Key:', apiKey ? 'Found' : 'Not found');
      console.log('🔑 Environment variables:', {
        VITE_ELEVENLABS_API_KEY: import.meta.env.VITE_ELEVENLABS_API_KEY ? 'Set' : 'Not set',
        ELEVENLABS_KEY: import.meta.env.ELEVENLABS_KEY ? 'Set' : 'Not set'
      });
      
      if (!apiKey) {
        console.error('❌ ElevenLabs API key not found in environment variables');
        // Fallback to browser TTS
        fallbackToSpeechSynthesis(text, customOptions);
        return;
      }

      console.log('🎯 Using ElevenLabs for character:', customOptions?.characterId);

      // Create ElevenLabs client
      const client = new ElevenLabsClient({
        apiKey: apiKey
      });

      // Determine voice ID
      let voiceId = customOptions?.voice;
      if (customOptions?.characterId && CHARACTER_VOICES[customOptions.characterId]) {
        voiceId = CHARACTER_VOICES[customOptions.characterId];
      }
      if (!voiceId) {
        voiceId = 'pNInz6obpgDQGcFmaJgB'; // Default voice (Adam)
      }

      console.log('🗣️ Using voice ID:', voiceId, 'for character:', customOptions?.characterId);

      // Generate speech using the correct API method
      const audio = await client.textToSpeech.convert(voiceId, {
        text: text,
        modelId: 'eleven_multilingual_v2',
        voiceSettings: {
          stability: 0.5,
          similarityBoost: 0.75,
          style: customOptions?.rate ? Math.max(0, Math.min(1, (customOptions.rate - 0.5) * 2)) : 0.5,
          useSpeakerBoost: true
        }
      });

      console.log('✅ ElevenLabs audio generated successfully');

      // Convert audio stream to blob and create audio element
      const chunks: Uint8Array[] = [];
      const reader = audio.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audioElement = new Audio(audioUrl);
      audioElement.volume = customOptions?.volume || volume;
      
      audioElement.onplay = () => {
        isPlayingRef.current = true;
        console.log('🔊 Playing ElevenLabs audio');
      };
      
      audioElement.onended = () => {
        isPlayingRef.current = false;
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        console.log('⏹️ ElevenLabs audio finished');
        
        // Call the completion callback if provided
        if (customOptions?.onComplete) {
          customOptions.onComplete();
        }
      };
      
      audioElement.onerror = () => {
        isPlayingRef.current = false;
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        console.error('❌ Error playing ElevenLabs audio');
        
        // Call the completion callback even on error
        if (customOptions?.onComplete) {
          customOptions.onComplete();
        }
      };

      audioRef.current = audioElement;
      await audioElement.play();
      
    } catch (error) {
      console.error('❌ ElevenLabs TTS error:', error);
      // Fallback to browser TTS on error
      fallbackToSpeechSynthesis(text, customOptions);
    } finally {
      setIsLoading(false);
    }
  }, [volume]);

  const fallbackToSpeechSynthesis = useCallback((text: string, customOptions?: TTSOptions & { onComplete?: () => void }) => {
    try {
      console.log('🔄 Falling back to browser TTS');
      
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = customOptions?.rate || 1;
      utterance.pitch = customOptions?.pitch || 1;
      utterance.volume = customOptions?.volume || volume;

      utterance.onstart = () => {
        isPlayingRef.current = true;
        console.log('🔊 Playing browser TTS audio');
      };

      utterance.onend = () => {
        isPlayingRef.current = false;
        console.log('⏹️ Browser TTS audio finished');
        
        // Call the completion callback if provided
        if (customOptions?.onComplete) {
          customOptions.onComplete();
        }
      };

      utterance.onerror = () => {
        isPlayingRef.current = false;
        console.error('❌ Browser TTS error');
        
        // Call the completion callback even on error
        if (customOptions?.onComplete) {
          customOptions.onComplete();
        }
      };

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('❌ Speech synthesis fallback error:', error);
      
      // Call the completion callback on error
      if (customOptions?.onComplete) {
        customOptions.onComplete();
      }
    }
  }, [volume]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    isPlayingRef.current = false;
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play();
    }
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  }, []);

  const getVoices = useCallback(() => {
    // Return character voice options for ElevenLabs
    return Object.keys(CHARACTER_VOICES).map(characterId => ({
      characterId,
      voiceId: CHARACTER_VOICES[characterId],
      name: characterId.charAt(0).toUpperCase() + characterId.slice(1)
    }));
  }, []);

  const isPlaying = isPlayingRef.current;
  const isPaused = audioRef.current ? audioRef.current.paused : speechSynthesis.paused;

  return {
    speak,
    stop,
    pause,
    resume,
    getVoices,
    isPlaying,
    isPaused,
    isLoading,
  };
}; 