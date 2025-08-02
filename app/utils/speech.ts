// British English Speech Synthesis Utility
import { britishAudioService } from './britishAudio';

// Function to check if British English voices are available
export const hasBritishVoices = (): boolean => {
  if (!("speechSynthesis" in window)) {
    return false;
  }

  const voices = speechSynthesis.getVoices();
  return voices.some((voice) => {
    const name = voice.name.toLowerCase();
    return (
      voice.lang === "en-GB" ||
      voice.lang === "en-gb" ||
      name.includes("british") ||
      name.includes("uk") ||
      name.includes("daniel") ||
      name.includes("kate") ||
      name.includes("serena") ||
      name.includes("oliver") ||
      name.includes("emma")
    );
  });
};

// Function to get device/browser type for download instructions
export const getDeviceType = (): 'windows' | 'mac' | 'android' | 'ios' | 'linux' | 'other' => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('windows')) return 'windows';
  if (userAgent.includes('mac')) return 'mac';
  if (userAgent.includes('android')) return 'android';
  if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
  if (userAgent.includes('linux')) return 'linux';
  
  return 'other';
};

// Main function - now uses Wiktionary British audio as primary method
export const speakWordInBritishEnglish = async (word: string): Promise<void> => {
  try {
    // Check if audio is already playing for this word
    if (britishAudioService.isCurrentlyPlaying(word)) {
      console.log(`Already playing "${word}" - ignoring duplicate request`);
      return;
    }

    // First try: Use Wiktionary British audio (most reliable)
    const success = await britishAudioService.playBritishPronunciation(word);
    
    if (success) {
      console.log(`✅ Played British audio from Wiktionary for: ${word}`);
      return;
    }
    
  } catch (error) {
    console.warn(`Error playing British pronunciation for "${word}":`, error);
  }
};



// Function to get available British English voices
export const getBritishVoices = (): SpeechSynthesisVoice[] => {
  if (!("speechSynthesis" in window)) {
    return [];
  }

  const voices = speechSynthesis.getVoices();
  return voices.filter((voice) => {
    const name = voice.name.toLowerCase();
    return (
      voice.lang === "en-GB" ||
      voice.lang === "en-gb" ||
      name.includes("british") ||
      name.includes("uk") ||
      name.includes("daniel") ||
      name.includes("kate") ||
      name.includes("serena") ||
      name.includes("oliver") ||
      name.includes("emma")
    );
  });
};
