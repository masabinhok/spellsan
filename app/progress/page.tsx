'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import spellingWords from '../../clean_spelling_words.json';

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
}

export default function Progress() {
  const [stats, setStats] = useState<ProgressStats>({
    totalWords: spellingWords.length,
    practiceToday: 0,
    accuracy: 0,
    streak: 0,
    totalPracticeSessions: 0,
    averageAccuracy: 0,
    lastPracticeDate: '',
    wordsLearned: [],
    difficultWords: [],
  });

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    // Load stats from localStorage
    const savedStats = localStorage.getItem('spellsan-stats');
    if (savedStats) {
      const parsedStats = JSON.parse(savedStats);
      setStats(prev => ({ ...prev, ...parsedStats }));
    }
  }, []);

  const alphabetProgress = Array.from({ length: 26 }, (_, i) => {
    const letter = String.fromCharCode(65 + i);
    const totalWords = spellingWords.filter(
      word => word.charAt(0).toUpperCase() === letter
    ).length;
    const learnedWords = stats.wordsLearned.filter(
      word => word.charAt(0).toUpperCase() === letter
    ).length;
    const progress = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;

    return { letter, totalWords, learnedWords, progress };
  });

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
                <p className="text-3xl font-bold text-slate-800">{stats.totalPracticeSessions}</p>
                <p className="text-xs text-slate-500">Total completed</p>
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
                style={{ width: `${Math.min((stats.totalPracticeSessions / 50) * 100, 100)}%` }}
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
                <p className="text-sm text-slate-600">Average Accuracy</p>
                <p className="text-3xl font-bold text-slate-800">{stats.averageAccuracy}%</p>
                <p className="text-xs text-slate-500">Across all sessions</p>
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
                style={{ width: `${stats.averageAccuracy}%` }}
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
                <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">{word}</span>
                    <Link
                      href={`/practice?word=${word}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Practice
                    </Link>
                  </div>
                </div>
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
        <div className="text-center">
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
      </div>
    </div>
  );
}
