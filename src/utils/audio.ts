// Audio file paths
const AUDIO_FILES = {
  FOOTSTEP: '/sounds/footstep.mp3',
  WIN: '/sounds/win.mp3',
  DOLL_SONG: '/sounds/doll-song.mp3',
  RED_LIGHT: '/sounds/red-light.mp3',
  GREEN_LIGHT: '/sounds/green-light.mp3',
} as const;

// Audio cache
const audioCache: { [key: string]: HTMLAudioElement } = {};
const audioLoadStatus: { [key: string]: boolean } = {};

// Check if audio file exists
const checkAudioFile = async (path: string): Promise<boolean> => {
  try {
    const response = await fetch(path, { method: 'HEAD' });
    return response.ok;
  } catch (e) {
    console.warn(`Failed to check audio file ${path}:`, e);
    return false;
  }
};

// Preload all audio files
const preloadAudio = async () => {
  for (const [key, path] of Object.entries(AUDIO_FILES)) {
    try {
      const exists = await checkAudioFile(path);
      if (!exists) {
        console.warn(`Audio file not found: ${path}`);
        audioLoadStatus[key] = false;
        continue;
      }

      const audio = new Audio();
      audio.preload = 'auto';
      
      // Set up load event handlers
      audio.addEventListener('canplaythrough', () => {
        console.log(`Audio loaded successfully: ${key}`);
        audioLoadStatus[key] = true;
      }, { once: true });

      audio.addEventListener('error', (e) => {
        console.warn(`Error loading audio ${key}:`, e);
        audioLoadStatus[key] = false;
      }, { once: true });

      // Start loading
      audio.src = path;
      audioCache[key] = audio;
      audioLoadStatus[key] = false; // Will be set to true when loaded
    } catch (e) {
      console.warn(`Failed to initialize audio ${key}:`, e);
      audioLoadStatus[key] = false;
    }
  }
};

// Initialize audio system
preloadAudio().catch(e => {
  console.error('Failed to preload audio:', e);
});

// Audio utility function
export const playAudio = (key: keyof typeof AUDIO_FILES, volume: number = 1.0): void => {
  try {
    // Check if audio is available
    if (!audioLoadStatus[key]) {
      console.warn(`Audio not loaded or not available: ${key}`);
      return;
    }

    const audio = audioCache[key];
    if (!audio) {
      console.warn(`Audio cache miss: ${key}`);
      return;
    }

    // Clone the audio to allow multiple instances to play simultaneously
    const audioClone = audio.cloneNode() as HTMLAudioElement;
    audioClone.volume = volume;

    // Set up error handling for the clone
    audioClone.addEventListener('error', (e) => {
      console.warn(`Error playing audio ${key}:`, e);
      audioClone.remove();
    }, { once: true });

    // Play the audio
    const playPromise = audioClone.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        console.warn(`Failed to play audio ${key}:`, e);
        audioClone.remove();
      });
    }

    // Clean up the clone after it's done playing
    audioClone.addEventListener('ended', () => {
      audioClone.remove();
    }, { once: true });
  } catch (e) {
    console.warn(`Error in playAudio for ${key}:`, e);
  }
};

// Export audio keys for type safety
export const AudioKeys = AUDIO_FILES;

// Export audio status for debugging
export const getAudioStatus = () => ({ ...audioLoadStatus }); 