"use client";
import { useState, useEffect } from "react";
import { britishAudioService } from "../utils/britishAudio";
import { hasBritishVoices } from "../utils/speech";

interface AudioStatus {
  wiktionaryAvailable: boolean;
  deviceVoicesAvailable: boolean;
  cacheStats: { cached: number; available: number; total: number };
}

const BritishAudioStatus = () => {
  const [audioStatus, setAudioStatus] = useState<AudioStatus>({
    wiktionaryAvailable: true, // Assume Wiktionary is available (internet-based)
    deviceVoicesAvailable: false,
    cacheStats: { cached: 0, available: 0, total: 0 }
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const checkAudioStatus = async () => {
      // Check device voices
      const deviceVoices = hasBritishVoices();

      // Get cache statistics
      const cacheStats = britishAudioService.getCacheStats();

      setAudioStatus({
        wiktionaryAvailable: navigator.onLine, // Check if online
        deviceVoicesAvailable: deviceVoices,
        cacheStats
      });
    };

    checkAudioStatus();

    // Update when online status changes
    const handleOnlineStatus = () => {
      setAudioStatus(prev => ({
        ...prev,
        wiktionaryAvailable: navigator.onLine
      }));
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  const getStatusColor = () => {
    if (audioStatus.wiktionaryAvailable) return "text-green-600 bg-green-50 border-green-200";
    if (audioStatus.deviceVoicesAvailable) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getStatusIcon = () => {
    if (audioStatus.wiktionaryAvailable) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    }
    if (audioStatus.deviceVoicesAvailable) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    );
  };

  const getStatusText = () => {
    if (audioStatus.wiktionaryAvailable) {
      return "British Audio: Wiktionary (High Quality)";
    }
    if (audioStatus.deviceVoicesAvailable) {
      return "British Audio: Device Voices (Fallback)";
    }
    return "British Audio: Limited";
  };

  const getStatusDescription = () => {
    if (audioStatus.wiktionaryAvailable) {
      return "Using authentic British pronunciation recordings from Wiktionary";
    }
    if (audioStatus.deviceVoicesAvailable) {
      return "Using local device voices with British English accent";
    }
    return "Limited audio availability - consider checking internet connection";
  };

  return (
    <div className={`border rounded-lg p-3 ${getStatusColor()}`}>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
        <button className="p-1 hover:bg-white/50 rounded">
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20 space-y-2">
          <p className="text-xs opacity-75">{getStatusDescription()}</p>

          {audioStatus.cacheStats.total > 0 && (
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Cached Words:</span>
                <span>{audioStatus.cacheStats.cached}</span>
              </div>
              <div className="flex justify-between">
                <span>Available Audio:</span>
                <span>{audioStatus.cacheStats.available}</span>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${audioStatus.wiktionaryAvailable ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>Wiktionary</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${audioStatus.deviceVoicesAvailable ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>Device Voices</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${navigator.onLine ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BritishAudioStatus;
