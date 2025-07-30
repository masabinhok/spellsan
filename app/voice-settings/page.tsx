'use client';

import { useState, useEffect } from 'react';
import { getBritishVoices, speakWordInBritishEnglish } from '../utils/speech';

export default function VoiceSettings() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [britishVoices, setBritishVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [testWord, setTestWord] = useState('pronunciation');

  useEffect(() => {
    const loadVoices = () => {
      const allVoices = speechSynthesis.getVoices();
      const britishVoicesList = getBritishVoices();

      setVoices(allVoices);
      setBritishVoices(britishVoicesList);

      if (britishVoicesList.length > 0 && !selectedVoice) {
        setSelectedVoice(britishVoicesList[0].name);
      }
    };

    // Load voices immediately if available
    loadVoices();

    // Also listen for voices changed event (needed for some browsers)
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [selectedVoice]);

  const testVoice = (voiceName?: string) => {
    if (voiceName) {
      // Test specific voice
      const voice = voices.find(v => v.name === voiceName);
      if (voice) {
        const utterance = new SpeechSynthesisUtterance(testWord);
        utterance.voice = voice;
        utterance.rate = 0.7;
        utterance.lang = 'en-GB';
        speechSynthesis.speak(utterance);
      }
    } else {
      // Test with our British English utility
      speakWordInBritishEnglish(testWord);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Voice Settings & Diagnostics
        </h1>

        <div className="space-y-8">
          {/* Test Word Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Test Word
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={testWord}
                onChange={(e) => setTestWord(e.target.value)}
                className="flex-1 p-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                placeholder="Enter a word to test pronunciation"
              />
              <button
                onClick={() => testVoice()}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                Test British Pronunciation
              </button>
            </div>
          </div>

          {/* British Voices Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Available British English Voices ({britishVoices.length})
            </h2>

            {britishVoices.length > 0 ? (
              <div className="space-y-3">
                {britishVoices.map((voice) => (
                  <div
                    key={voice.name}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-green-800 dark:text-green-200">
                          {voice.name}
                        </h3>
                        <p className="text-sm text-green-600 dark:text-green-300">
                          Language: {voice.lang} | {voice.localService ? 'Local' : 'Remote'}
                        </p>
                      </div>
                      <button
                        onClick={() => testVoice(voice.name)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
                      >
                        Test Voice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  No British English Voices Found
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                  Your system doesn't have any British English voices installed. The application will use the default system voice.
                </p>
                <div className="space-y-2 text-sm text-yellow-600 dark:text-yellow-400">
                  <p><strong>Windows:</strong> Go to Settings → Time & language → Speech → Add more voices</p>
                  <p><strong>macOS:</strong> System Preferences → Accessibility → Speech → System Voice</p>
                  <p><strong>Linux:</strong> Install espeak-ng or festival with British English voices</p>
                </div>
              </div>
            )}
          </div>

          {/* All Available Voices */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              All Available Voices ({voices.length})
            </h2>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {voices.map((voice) => (
                <div
                  key={voice.name}
                  className={`p-3 rounded-lg border transition-all ${voice.lang.toLowerCase().includes('en-gb') || voice.lang.toLowerCase().includes('british')
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                      : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {voice.name}
                      </span>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        ({voice.lang})
                      </span>
                    </div>
                    <button
                      onClick={() => testVoice(voice.name)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium"
                    >
                      Test
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
              How to Enable British English Voices
            </h3>
            <div className="space-y-3 text-blue-700 dark:text-blue-300">
              <div>
                <h4 className="font-semibold">Windows 10/11:</h4>
                <p className="text-sm">
                  Settings → Time & language → Speech → Add more voices → Download British English voices (like "Microsoft Hazel" or "Microsoft George")
                </p>
              </div>
              <div>
                <h4 className="font-semibold">macOS:</h4>
                <p className="text-sm">
                  System Preferences → Accessibility → Speech → System Voice → Customize → Download voices like "Daniel (UK)" or "Kate (UK)"
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Chrome Browser:</h4>
                <p className="text-sm">
                  Chrome uses system voices, so install them via your operating system first.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
