'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import spellingWords from '../../clean_spelling_words.json';
import { ProgressManager } from '../utils/progressManager';
import { dictionaryAPI, DictionaryDefinition } from '../utils/dictionaryApi';

// DifficultWordCard component with meaning
function DifficultWordCard({ word, index }: { word: string; index: number }) {
  const [meaning, setMeaning] = useState<DictionaryDefinition | null>(null);
  const [showMeaning, setShowMeaning] = useState(false);
  const [isLoadingMeaning, setIsLoadingMeaning] = useState(false);

  const fetchMeaning = async () => {
    if (!meaning && !isLoadingMeaning) {
      setIsLoadingMeaning(true);
      try {
        const wordMeaning = await dictionaryAPI.getWordMeaning(word);
        setMeaning(wordMeaning);
      } catch (error) {
        console.warn('Failed to fetch meaning for', word, error);
      } finally {
        setIsLoadingMeaning(false);
      }
    }
    setShowMeaning(!showMeaning);
  };

  return (
    <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:bg-slate-100 transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-slate-800">{word}</span>
        <div className="flex space-x-2">
          <button
            onClick={fetchMeaning}
            className="text-slate-500 hover:text-blue-600 text-sm font-medium"
            title="Show meaning"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <Link
            href={`/practice?word=${word}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Practice
          </Link>
        </div>
      </div>

      {/* Meaning Section */}
      {showMeaning && (
        <div className="border-t border-slate-200 pt-2 mt-2">
          {isLoadingMeaning ? (
            <div className="text-xs text-slate-500">Loading meaning...</div>
          ) : meaning ? (
            <div className="space-y-1">
              <div className="text-xs text-slate-600">
                {meaning.partOfSpeech && (
                  <span className="font-medium text-blue-700">{meaning.partOfSpeech}</span>
                )}
                {meaning.pronunciation && (
                  <span className="ml-2 text-slate-500">/{meaning.pronunciation}/</span>
                )}
              </div>
              <p className="text-xs text-slate-700">{meaning.meaning}</p>
              {meaning.example && (
                <p className="text-xs text-slate-500 italic">
                  &quot;{meaning.example}&quot;
                </p>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-500">Meaning not available</div>
          )}
        </div>
      )}
    </div>
  );
}

interface ProgressStats {
  totalWords: number;
  practiceToday: number;
  accuracy: number;
  streak: number;
  totalPracticeSessions: number;
  averageAccuracy: number;
  lastPracticeDate: string;
  wordsLearned: string[];
  difficultWords: string[];
  sessionHistory: Array<{
    date: string;
    mode: 'random' | 'alphabet';
    alphabet?: string;
    wordsAttempted: number;
    correctAnswers: number;
    accuracy: number;
    duration: number;
    wordsLearned: string[];
    difficultWordsEncountered: string[];
  }>;
  streakStartDate: string;
  totalWordsAttempted: number;
  totalCorrectAnswers: number;
}

export default function Progress() {
  const [stats, setStats] = useState<ProgressStats>(() => {
    const defaultStats: ProgressStats = {
      totalWords: spellingWords.length,
      practiceToday: 0,
      accuracy: 0,
      streak: 0,
      totalPracticeSessions: 0,
      averageAccuracy: 0,
      lastPracticeDate: '',
      wordsLearned: [],
      difficultWords: [],
      sessionHistory: [],
      streakStartDate: '',
      totalWordsAttempted: 0,
      totalCorrectAnswers: 0,
    };
    return defaultStats;
  });

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    // Load stats from ProgressManager
    const loadStats = () => {
      const loadedStats = ProgressManager.loadProgress();
      setStats(prev => ({
        ...prev,
        ...loadedStats,
        totalWords: spellingWords.length, // Ensure this is always current
      }));
    };

    // Load initial stats
    loadStats();

    // Listen for storage changes to update in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'spellsan-progress') {
        loadStats();
      }
    };

    // Listen for custom events from other tabs/components
    const handleProgressUpdate = () => {
      loadStats();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('progressUpdated', handleProgressUpdate);

    // Poll for changes every 2 seconds (for same-tab updates)
    const pollInterval = setInterval(loadStats, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('progressUpdated', handleProgressUpdate);
      clearInterval(pollInterval);
    };
  }, []);

  const alphabetProgress = ProgressManager.getAlphabetProgress(stats, spellingWords);

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all your progress? This action cannot be undone.')) {
      ProgressManager.resetProgress();
      const defaultStats: ProgressStats = {
        totalWords: spellingWords.length,
        practiceToday: 0,
        accuracy: 0,
        streak: 0,
        totalPracticeSessions: 0,
        averageAccuracy: 0,
        lastPracticeDate: '',
        wordsLearned: [],
        difficultWords: [],
        sessionHistory: [],
        streakStartDate: '',
        totalWordsAttempted: 0,
        totalCorrectAnswers: 0,
      };
      setStats(defaultStats);
    }
  };

  const handleExportProgress = () => {
    const progressData = ProgressManager.exportProgress();
    const blob = new Blob([progressData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spellsan-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate recent activity for the selected period
  const getRecentSessions = () => {
    const now = new Date();
    const cutoffDate = new Date();

    switch (selectedPeriod) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'all':
        cutoffDate.setFullYear(2000); // Far in the past
        break;
    }

    return stats.sessionHistory.filter(session =>
      new Date(session.date) >= cutoffDate
    );
  };

  const recentSessions = getRecentSessions();
  const periodStats = {
    totalSessions: recentSessions.length,
    totalWords: recentSessions.reduce((sum, session) => sum + session.wordsAttempted, 0),
    totalCorrect: recentSessions.reduce((sum, session) => sum + session.correctAnswers, 0),
    averageAccuracy: recentSessions.length > 0
      ? Math.round(recentSessions.reduce((sum, session) => sum + session.accuracy, 0) / recentSessions.length)
      : 0,
  };

  const achievementBadges = [
    {
      title: 'First Steps',
      description: 'Complete your first practice session',
      earned: stats.totalPracticeSessions > 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: 'Streak Master',
      description: 'Maintain a 7-day practice streak',
      earned: stats.streak >= 7,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      )
    },
    {
      title: 'Accuracy Expert',
      description: 'Achieve 90% accuracy or higher',
      earned: stats.averageAccuracy >= 90,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Word Master',
      description: 'Learn 100 words',
      earned: stats.wordsLearned.length >= 100,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 py-6 md:py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3 md:mb-4">
            Your Progress
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto px-4">
            Track your spelling journey and see how far you&apos;ve come
          </p>
        </div>

        {/* Time Period Selector */}
        <div className="flex justify-center mb-6 md:mb-8">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-slate-200 p-1 md:p-2 flex">
            {(['week', 'month', 'all'] as const).map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 md:px-6 py-2 rounded-lg md:rounded-xl transition-all text-sm md:text-base ${selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Practice Sessions</p>
                <p className="text-3xl font-bold text-slate-800">{periodStats.totalSessions}</p>
                <p className="text-xs text-slate-500">
                  {selectedPeriod === 'all' ? 'Total completed' :
                    selectedPeriod === 'week' ? 'This week' : 'This month'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((periodStats.totalSessions / 50) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Current Streak</p>
                <p className="text-3xl font-bold text-slate-800">{stats.streak}</p>
                <p className="text-xs text-slate-500">Days in a row</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 716.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
              <div
                className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stats.streak / 30) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Period Accuracy</p>
                <p className="text-3xl font-bold text-slate-800">{periodStats.averageAccuracy}%</p>
                <p className="text-xs text-slate-500">
                  {selectedPeriod === 'all' ? 'Overall average' :
                    selectedPeriod === 'week' ? 'This week' : 'This month'}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${periodStats.averageAccuracy}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Words Learned</p>
                <p className="text-3xl font-bold text-slate-800">{stats.wordsLearned.length}</p>
                <p className="text-xs text-slate-500">of {stats.totalWords} total</p>
              </div>
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
              <div
                className="bg-violet-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(stats.wordsLearned.length / stats.totalWords) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievementBadges.map((badge, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-lg border border-slate-200 p-6 transition-all ${badge.earned ? 'ring-2 ring-blue-500' : 'opacity-60'
                  }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${badge.earned ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                  {badge.icon}
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{badge.title}</h3>
                <p className="text-sm text-slate-600">{badge.description}</p>
                {badge.earned && (
                  <div className="mt-3 inline-flex items-center text-blue-600 text-sm font-medium">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Earned
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Alphabet Progress */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-slate-200 p-4 md:p-8 mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 md:mb-6">Progress by Letter</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-13 gap-2 md:gap-3">
            {alphabetProgress.map(({ letter, totalWords, learnedWords, progress }) => (
              <div
                key={letter}
                className="bg-slate-50 rounded-lg md:rounded-xl p-2 md:p-3 text-center hover:bg-blue-50 transition-all border border-slate-200"
              >
                <div className="text-base md:text-lg font-bold text-slate-700 mb-1">{letter}</div>
                <div className="text-xs text-slate-500 mb-1 md:mb-2">{learnedWords}/{totalWords}</div>
                <div className="w-full bg-slate-200 rounded-full h-1">
                  <div
                    className="bg-blue-600 h-1 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">{progress}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Difficult Words */}
        {stats.difficultWords.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Words to Practice</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.difficultWords.slice(0, 12).map((word, index) => (
                <DifficultWordCard key={`${word}-${index}`} word={word} index={index} />
              ))}
            </div>
            {stats.difficultWords.length > 12 && (
              <div className="text-center mt-6">
                <Link
                  href="/practice"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
                >
                  Practice All Difficult Words
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Continue Learning</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/practice"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all"
            >
              Continue Practice
            </Link>
            <Link
              href="/learn"
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-8 rounded-xl transition-all"
            >
              Browse Words
            </Link>
          </div>
        </div>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Recent Sessions</h2>
            <div className="space-y-4">
              {recentSessions.slice(-10).reverse().map((session, index) => (
                <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${session.accuracy >= 80 ? 'bg-green-500' : session.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {session.mode === 'random' ? 'Random Practice' : `Letter "${session.alphabet}" Practice`}
                        </p>
                        <p className="text-sm text-slate-600">
                          {new Date(session.date).toLocaleDateString()} • {session.duration} min
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">{session.accuracy}%</p>
                      <p className="text-sm text-slate-600">{session.correctAnswers}/{session.wordsAttempted}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Management */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Progress Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleExportProgress}
              className="flex items-center justify-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-3 px-6 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export Progress</span>
            </button>
            <button
              onClick={handleResetProgress}
              className="flex items-center justify-center space-x-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3 px-6 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Reset Progress</span>
            </button>
          </div>
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-2">Progress Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-600">Total Words</p>
                <p className="font-bold text-slate-800">{stats.totalWordsAttempted}</p>
              </div>
              <div>
                <p className="text-slate-600">Correct</p>
                <p className="font-bold text-slate-800">{stats.totalCorrectAnswers}</p>
              </div>
              <div>
                <p className="text-slate-600">Sessions</p>
                <p className="font-bold text-slate-800">{stats.totalPracticeSessions}</p>
              </div>
              <div>
                <p className="text-slate-600">Streak</p>
                <p className="font-bold text-slate-800">{stats.streak} days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
