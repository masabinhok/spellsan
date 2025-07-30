'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import spellingWords from '../spelling_words.json';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalWords: spellingWords.length,
    practiceToday: 0,
    accuracy: 0,
    streak: 0
  });

  useEffect(() => {
    // Load stats from localStorage if available
    const savedStats = localStorage.getItem('spellsan-stats');
    if (savedStats) {
      setStats(prev => ({ ...prev, ...JSON.parse(savedStats) }));
    }
  }, []);

  const alphabetStats = Array.from({ length: 26 }, (_, i) => {
    const letter = String.fromCharCode(65 + i);
    const wordsForLetter = spellingWords.filter(word =>
      word.charAt(0).toUpperCase() === letter
    ).length;
    return { letter, count: wordsForLetter };
  });

  const quickActions = [
    {
      title: 'Learn Words',
      description: 'Browse and study all spelling words',
      icon: '📚',
      href: '/learn',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Quick Practice',
      description: 'Start practicing random words',
      icon: '⚡',
      href: '/practice?mode=random',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Alphabet Practice',
      description: 'Practice words by specific letters',
      icon: '🔤',
      href: '/practice',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'View Progress',
      description: 'Check your learning statistics',
      icon: '📊',
      href: '/progress',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 dark:from-white dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
          Welcome to SpellSAN
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Master spelling for the SAN competition with our comprehensive practice platform
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Words</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalWords}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Practice Today</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.practiceToday}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.accuracy}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Streak</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.streak}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🔥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <span className="text-white text-2xl">{action.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{action.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Alphabet Overview */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Words by Alphabet</h2>
        <div className="grid grid-cols-6 md:grid-cols-13 gap-3">
          {alphabetStats.map(({ letter, count }) => (
            <Link
              key={letter}
              href={`/practice?alphabet=${letter.toLowerCase()}`}
              className="group bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 text-center hover:shadow-md transition-all duration-200 hover:scale-105 border border-indigo-100 dark:border-indigo-800"
            >
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{letter}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{count} words</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
