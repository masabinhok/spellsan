'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import spellingWords from '../../spelling_words.json';

interface GameStats {
  correct: number;
  incorrect: number;
  total: number;
}

export default function Practice() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'random' | 'alphabet' | null>(null);
  const [selectedAlphabet, setSelectedAlphabet] = useState('');
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isGameActive, setIsGameActive] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [stats, setStats] = useState<GameStats>({ correct: 0, incorrect: 0, total: 0 });
  const [showAnswer, setShowAnswer] = useState(false);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [availableWords, setAvailableWords] = useState<string[]>([]);

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    const alphabetParam = searchParams.get('alphabet');

    if (modeParam === 'random') {
      setMode('random');
      setAvailableWords(spellingWords);
    } else if (alphabetParam) {
      setMode('alphabet');
      setSelectedAlphabet(alphabetParam.toUpperCase());
      const wordsForAlphabet = spellingWords.filter(word =>
        word.charAt(0).toUpperCase() === alphabetParam.toUpperCase()
      );
      setAvailableWords(wordsForAlphabet);
    }
  }, [searchParams]);

  const alphabetOptions = Array.from({ length: 26 }, (_, i) => {
    const letter = String.fromCharCode(65 + i);
    const count = spellingWords.filter(word =>
      word.charAt(0).toUpperCase() === letter
    ).length;
    return { letter, count };
  }).filter(item => item.count > 0);

  const getRandomWord = useCallback(() => {
    const unusedWords = availableWords.filter(word => !usedWords.includes(word));
    if (unusedWords.length === 0) {
      setGameComplete(true);
      return '';
    }
    const randomIndex = Math.floor(Math.random() * unusedWords.length);
    return unusedWords[randomIndex];
  }, [availableWords, usedWords]);

  const startPractice = (practiceMode: 'random' | 'alphabet', alphabet?: string) => {
    let words: string[];

    if (practiceMode === 'random') {
      words = spellingWords;
      setMode('random');
    } else {
      words = spellingWords.filter(word =>
        word.charAt(0).toUpperCase() === alphabet?.toUpperCase()
      );
      setMode('alphabet');
      setSelectedAlphabet(alphabet?.toUpperCase() || '');
    }

    setAvailableWords(words);
    setIsGameActive(true);
    setGameComplete(false);
    setStats({ correct: 0, incorrect: 0, total: 0 });
    setUsedWords([]);
    setFeedback('');
    setShowAnswer(false);
    setUserInput('');

    if (words.length > 0) {
      const randomIndex = Math.floor(Math.random() * words.length);
      setCurrentWord(words[randomIndex]);
      setUsedWords([words[randomIndex]]);
    }
  };

  const nextWord = () => {
    const word = getRandomWord();
    if (word) {
      setCurrentWord(word);
      setUsedWords(prev => [...prev, word]);
    }
    setUserInput('');
    setFeedback('');
    setShowAnswer(false);
  };

  const checkSpelling = () => {
    const isCorrect = userInput.toLowerCase().trim() === currentWord.toLowerCase();
    const newStats = {
      correct: stats.correct + (isCorrect ? 1 : 0),
      incorrect: stats.incorrect + (isCorrect ? 0 : 1),
      total: stats.total + 1
    };
    setStats(newStats);

    if (isCorrect) {
      setFeedback('Correct! Well done! 🎉');
    } else {
      setFeedback(`Incorrect. The correct spelling is: ${currentWord}`);
      setShowAnswer(true);
    }

    // Save stats to localStorage
    const savedStats = localStorage.getItem('spellsan-stats');
    const existingStats = savedStats ? JSON.parse(savedStats) : {};
    const today = new Date().toDateString();
    localStorage.setItem('spellsan-stats', JSON.stringify({
      ...existingStats,
      practiceToday: (existingStats.practiceToday || 0) + 1,
      accuracy: Math.round((newStats.correct / newStats.total) * 100),
      lastPracticeDate: today
    }));

    setTimeout(() => {
      if (!gameComplete) nextWord();
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userInput.trim() && !feedback) {
      checkSpelling();
    }
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord);
      utterance.rate = 0.7;
      speechSynthesis.speak(utterance);
    }
  };

  const resetGame = () => {
    setIsGameActive(false);
    setGameComplete(false);
    setCurrentWord('');
    setUserInput('');
    setFeedback('');
    setStats({ correct: 0, incorrect: 0, total: 0 });
    setUsedWords([]);
    setShowAnswer(false);
    setMode(null);
  };

  useEffect(() => {
    if (gameComplete) {
      setFeedback(`Practice Complete! Final Score: ${stats.correct}/${stats.total} (${Math.round((stats.correct / stats.total) * 100)}%)`);
    }
  }, [gameComplete, stats]);

  if (isGameActive) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 p-8">
          {/* Game Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">
                  {mode === 'random' ? '🎲' : '🔤'}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mode === 'random' ? 'Random Practice' : `Letter "${selectedAlphabet}" Practice`}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {availableWords.length} words available
                </p>
              </div>
            </div>
            <button
              onClick={resetGame}
              className="flex items-center space-x-2 px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Exit</span>
            </button>
          </div>

          {/* Progress Stats */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 mb-8 border border-indigo-100 dark:border-indigo-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Your Progress</h3>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}% Accuracy
              </span>
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Words: {stats.total}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Correct: {stats.correct}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Incorrect: {stats.incorrect}</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.total > 0 ? (stats.correct / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {!gameComplete ? (
            <div className="text-center space-y-8">
              {/* Audio Button */}
              <div className="space-y-4">
                <button
                  onClick={speakWord}
                  className="group bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                    <span>Hear Word</span>
                  </div>
                </button>

                {showAnswer && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">Correct Spelling:</p>
                    <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 tracking-wider">
                      {currentWord}
                    </div>
                  </div>
                )}
              </div>

              {/* Input Field */}
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type the spelling here..."
                    className="w-full p-6 text-xl text-center border-2 border-gray-200 dark:border-slate-600 rounded-2xl focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!!feedback}
                    autoFocus
                  />
                  {userInput && !feedback && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                          {userInput.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {feedback ? (
                <div className={`p-6 rounded-2xl border-2 ${feedback.includes('Correct')
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700'
                    : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-700'
                  }`}>
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${feedback.includes('Correct') ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                      <span className="text-white text-xl">
                        {feedback.includes('Correct') ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                  <div className={`text-lg font-semibold ${feedback.includes('Correct')
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                    }`}>
                    {feedback}
                  </div>
                </div>
              ) : (
                <button
                  onClick={checkSpelling}
                  disabled={!userInput.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-2">
                    <span>Check Spelling</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                  </div>
                </button>
              )}
            </div>
          ) : (
            <div className="text-center space-y-8">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-3xl p-8 border-2 border-yellow-200 dark:border-yellow-700">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Excellent Work!
                </h3>
                <div className="text-xl text-gray-700 dark:text-gray-300 mb-6">
                  {feedback}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-4">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.total}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Words Practiced</div>
                  </div>
                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-4">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.correct}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
                  </div>
                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-4">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => startPractice(mode!, selectedAlphabet)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30"
                >
                  Practice Again
                </button>
                <Link
                  href="/"
                  className="bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold py-3 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 dark:from-white dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
          Practice Spelling
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Choose your practice mode: random words or focus on specific letters
        </p>
      </div>

      {/* Practice Options */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Random Practice */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <span className="text-white text-3xl">🎲</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Random Practice</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Practice with randomly selected words from the entire word list. Great for comprehensive review!
            </p>
            <button
              onClick={() => startPractice('random')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/30"
            >
              Start Random Practice
            </button>
          </div>
        </div>

        {/* Alphabet Practice */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <span className="text-white text-3xl">🔤</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Alphabet Practice</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Focus on words starting with specific letters. Perfect for targeted practice!
            </p>
            <div className="space-y-4">
              <select
                value={selectedAlphabet}
                onChange={(e) => setSelectedAlphabet(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/30 transition-all"
              >
                <option value="">Choose a letter...</option>
                {alphabetOptions.map(({ letter, count }) => (
                  <option key={letter} value={letter}>
                    {letter} ({count} words)
                  </option>
                ))}
              </select>
              <button
                onClick={() => startPractice('alphabet', selectedAlphabet)}
                disabled={!selectedAlphabet}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:shadow-md focus:outline-none focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/30 disabled:cursor-not-allowed"
              >
                Start Alphabet Practice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alphabet Grid */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Alphabet Access</h2>
        <div className="grid grid-cols-6 md:grid-cols-13 gap-3">
          {alphabetOptions.map(({ letter, count }) => (
            <button
              key={letter}
              onClick={() => startPractice('alphabet', letter)}
              className="group bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 text-center hover:shadow-md transition-all duration-200 hover:scale-105 border border-indigo-100 dark:border-indigo-800"
            >
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{letter}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{count} words</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
