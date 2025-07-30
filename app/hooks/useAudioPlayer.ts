"use client";
import { useState, useEffect, useCallback } from 'react';
import { britishAudioService } from '../utils/britishAudio';

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWord, setCurrentWord] = useState('');

  // Check playing status periodically
  useEffect(() => {
    const checkStatus = () => {
      const playing = britishAudioService.isCurrentlyPlaying();
      setIsPlaying(playing);
      
      if (!playing) {
        setCurrentWord('');
      }
    };

    const interval = setInterval(checkStatus, 200);
    return () => clearInterval(interval);
  }, []);

  const playWord = useCallback(async (word: string) => {
    if (britishAudioService.isCurrentlyPlaying(word)) {
      return; // Already playing this word
    }

    setCurrentWord(word);
    setIsPlaying(true);
    
    try {
      await britishAudioService.playBritishPronunciation(word);
    } catch (error) {
      console.error('Error playing word:', error);
      setIsPlaying(false);
      setCurrentWord('');
    }
  }, []);

  const stopAudio = useCallback(() => {
    britishAudioService.stopAudio();
    setIsPlaying(false);
    setCurrentWord('');
  }, []);

  return {
    isPlaying,
    currentWord,
    playWord,
    stopAudio,
    isPlayingWord: (word: string) => isPlaying && currentWord === word
  };
};
