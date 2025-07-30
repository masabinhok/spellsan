// British English Audio Service using Wiktionary
// Fetches actual British pronunciation recordings instead of relying on device voices

interface AudioCache {
  [word: string]: string | null; // URL or null if not available
}

class BritishAudioService {
  private cache: AudioCache = {};
  private loadingWords = new Set<string>();
  private currentAudio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private currentWord = '';

  // Stop any currently playing audio
  private stopCurrentAudio(): void {
    // Stop HTML audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    // Stop speech synthesis
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    this.isPlaying = false;
    this.currentWord = '';
  }

  // Check if audio is currently playing
  isCurrentlyPlaying(word?: string): boolean {
    if (word && this.currentWord !== word) {
      return false;
    }
    return this.isPlaying;
  }

  // Get British audio URL for a word from Wiktionary
  async getBritishAudioUrl(word: string): Promise<string | null> {
    // Check cache first
    if (this.cache[word] !== undefined) {
      return this.cache[word];
    }

    // Avoid duplicate requests
    if (this.loadingWords.has(word)) {
      return new Promise((resolve) => {
        const checkCache = () => {
          if (this.cache[word] !== undefined) {
            resolve(this.cache[word]);
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    this.loadingWords.add(word);

    try {
      // Wiktionary API endpoint for page content
      const apiUrl = `https://en.wiktionary.org/api/rest_v1/page/html/${encodeURIComponent(word)}`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        this.cache[word] = null;
        this.loadingWords.delete(word);
        return null;
      }

      const html = await response.text();
      
      // Look for British English audio files in the HTML
      // Wiktionary uses specific patterns for British pronunciation
      const britishAudioRegex = /href="([^"]*\.(?:ogg|wav|mp3))"[^>]*>(?:[^<]*(?:UK|British|RP|Received Pronunciation|England)[^<]*)/gi;
      const matches = html.match(britishAudioRegex);

      if (matches && matches.length > 0) {
        // Extract the actual URL from the first match
        const urlMatch = matches[0].match(/href="([^"]*)"/);
        if (urlMatch && urlMatch[1]) {
          let audioUrl = urlMatch[1];
          
          // Convert relative URLs to absolute
          if (audioUrl.startsWith('//')) {
            audioUrl = 'https:' + audioUrl;
          } else if (audioUrl.startsWith('/')) {
            audioUrl = 'https://upload.wikimedia.org' + audioUrl;
          }
          
          this.cache[word] = audioUrl;
          this.loadingWords.delete(word);
          return audioUrl;
        }
      }

      // Alternative: Try direct Wikimedia Commons search
      const alternativeUrl = await this.searchWikimediaCommons(word);
      this.cache[word] = alternativeUrl;
      this.loadingWords.delete(word);
      return alternativeUrl;

    } catch (error) {
      console.warn(`Failed to fetch British audio for "${word}":`, error);
      this.cache[word] = null;
      this.loadingWords.delete(word);
      return null;
    }
  }

  // Search Wikimedia Commons directly for British pronunciation files
  private async searchWikimediaCommons(word: string): Promise<string | null> {
    try {
      const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(`${word} british pronunciation en-GB`)}&srnamespace=6&format=json&origin=*`;
      
      const response = await fetch(searchUrl);
      if (!response.ok) return null;

      const data = await response.json();
      
      if (data.query && data.query.search && data.query.search.length > 0) {
        const fileName = data.query.search[0].title;
        // Convert to direct media URL
        const mediaUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName.replace('File:', ''))}`;
        return mediaUrl;
      }

      return null;
    } catch (error) {
      console.warn(`Wikimedia Commons search failed for "${word}":`, error);
      return null;
    }
  }

  // Play British pronunciation audio for a word
  async playBritishPronunciation(word: string): Promise<boolean> {
    // Debounce: Don't play if same word is already playing
    if (this.isCurrentlyPlaying(word)) {
      console.log(`Already playing "${word}" - ignoring duplicate request`);
      return true;
    }

    // Stop any currently playing audio
    this.stopCurrentAudio();
    
    // Set playing state immediately to prevent double-clicks
    this.isPlaying = true;
    this.currentWord = word;

    try {
      const audioUrl = await this.getBritishAudioUrl(word);
      
      if (!audioUrl) {
        console.warn(`No British audio available for "${word}"`);
        // Fallback to device speech synthesis
        this.fallbackToDeviceSpeech(word);
        return false;
      }

      // Create and play audio element
      const audio = new Audio();
      this.currentAudio = audio;
      
      // Set up audio properties
      audio.crossOrigin = 'anonymous'; // Handle CORS
      audio.volume = 0.8;
      audio.playbackRate = 0.9; // Slightly slower for clarity
      audio.src = audioUrl;

      // Set up event listeners
      audio.onended = () => {
        this.isPlaying = false;
        this.currentWord = '';
        this.currentAudio = null;
      };

      audio.onerror = () => {
        console.warn(`Failed to load audio for "${word}", using fallback`);
        this.fallbackToDeviceSpeech(word);
      };

      audio.oncanplay = () => {
        audio.play().catch(error => {
          console.warn(`Failed to play audio for "${word}":`, error);
          this.fallbackToDeviceSpeech(word);
        });
      };

      // Load the audio
      audio.load();
      
      console.log(`Playing British pronunciation for "${word}" from:`, audioUrl);
      return true;

    } catch (error) {
      console.warn(`Failed to play British audio for "${word}":`, error);
      // Fallback to device speech synthesis
      this.fallbackToDeviceSpeech(word);
      return false;
    }
  }

  // Fallback to device speech synthesis (existing method)
  private fallbackToDeviceSpeech(word: string): void {
    if (!("speechSynthesis" in window)) {
      console.warn("No audio playback available");
      this.isPlaying = false;
      this.currentWord = '';
      return;
    }

    // Ensure speech synthesis is stopped first
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    // Small delay to ensure cancellation is processed
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.7;
      utterance.lang = "en-GB";

      // Set up event listeners
      utterance.onstart = () => {
        this.isPlaying = true;
        this.currentWord = word;
      };

      utterance.onend = () => {
        this.isPlaying = false;
        this.currentWord = '';
      };

      utterance.onerror = () => {
        this.isPlaying = false;
        this.currentWord = '';
      };

      // Try to find a British voice (existing logic)
      const voices = speechSynthesis.getVoices();
      const britishVoice = voices.find((voice) => {
        const name = voice.name.toLowerCase();
        return (
          voice.lang === "en-GB" ||
          voice.lang === "en-gb" ||
          name.includes("british") ||
          name.includes("uk") ||
          name.includes("daniel") ||
          name.includes("kate")
        );
      });

      if (britishVoice) {
        utterance.voice = britishVoice;
      }

      speechSynthesis.speak(utterance);
      console.log(`Fallback: Using device speech synthesis for "${word}"`);
    }, 100);
  }

  // Preload audio for common words to improve performance
  async preloadCommonWords(words: string[]): Promise<void> {
    const preloadPromises = words.slice(0, 50).map(word => 
      this.getBritishAudioUrl(word.toLowerCase())
    );

    try {
      await Promise.allSettled(preloadPromises);
      console.log(`Preloaded British audio for ${words.length} words`);
    } catch (error) {
      console.warn("Error preloading audio:", error);
    }
  }

  // Get cache statistics
  getCacheStats(): { cached: number; available: number; total: number } {
    const total = Object.keys(this.cache).length;
    const available = Object.values(this.cache).filter(url => url !== null).length;
    
    return {
      cached: total,
      available,
      total
    };
  }

  // Clear cache (useful for testing)
  clearCache(): void {
    this.stopCurrentAudio(); // Stop any playing audio
    this.cache = {};
    this.loadingWords.clear();
  }

  // Stop any currently playing audio (public method)
  stopAudio(): void {
    this.stopCurrentAudio();
  }
}

// Create singleton instance
const britishAudioService = new BritishAudioService();

// Export the service and main function
export { britishAudioService };

// Main function to play British pronunciation - replaces the old speakWordInBritishEnglish
export const playBritishPronunciation = async (word: string): Promise<boolean> => {
  return await britishAudioService.playBritishPronunciation(word);
};

// Helper function to check if British audio is available for a word
export const hasBritishAudio = async (word: string): Promise<boolean> => {
  const audioUrl = await britishAudioService.getBritishAudioUrl(word);
  return audioUrl !== null;
};

// Preload function for common words
export const preloadBritishAudio = async (words: string[]): Promise<void> => {
  return await britishAudioService.preloadCommonWords(words);
};
