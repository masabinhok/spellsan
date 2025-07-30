"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import spellingWords from "../../spelling_words.json";

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
    lastPracticeDate: "",
    wordsLearned: [],
    difficultWords: [],
  });

  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "all"
  >("week");

  useEffect(() => {
    // Load stats from localStorage
    const savedStats = localStorage.getItem("spellsan-stats");
    if (savedStats) {
      const parsedStats = JSON.parse(savedStats);
      setStats((prev) => ({ ...prev, ...parsedStats }));
    }
  }, []);

  const alphabetProgress = Array.from({ length: 26 }, (_, i) => {
    const letter = String.fromCharCode(65 + i);
    const totalWords = spellingWords.filter(
      (word) => word.charAt(0).toUpperCase() === letter,
    ).length;

    const practicedWords = stats.wordsLearned.filter(
      (word) => word.charAt(0).toUpperCase() === letter,
    ).length;

    const progress = totalWords > 0 ? (practicedWords / totalWords) * 100 : 0;

    return { letter, totalWords, practicedWords, progress };
  }).filter((item) => item.totalWords > 0);

  const achievements = [
    {
      title: "First Steps",
      description: "Complete your first practice session",
      icon: "👶",
      achieved: stats.totalPracticeSessions > 0,
      progress: Math.min(stats.totalPracticeSessions, 1),
    },
    {
      title: "Word Explorer",
      description: "Practice 50 different words",
      icon: "🌟",
      achieved: stats.wordsLearned.length >= 50,
      progress: Math.min(stats.wordsLearned.length / 50, 1),
    },
    {
      title: "Accuracy Master",
      description: "Achieve 90% accuracy in a session",
      icon: "🎯",
      achieved: stats.accuracy >= 90,
      progress: Math.min(stats.accuracy / 90, 1),
    },
    {
      title: "Streak Warrior",
      description: "Practice for 7 consecutive days",
      icon: "🔥",
      achieved: stats.streak >= 7,
      progress: Math.min(stats.streak / 7, 1),
    },
    {
      title: "Word Collector",
      description: "Practice 100 different words",
      icon: "📚",
      achieved: stats.wordsLearned.length >= 100,
      progress: Math.min(stats.wordsLearned.length / 100, 1),
    },
    {
      title: "Perfectionist",
      description: "Achieve 100% accuracy in a session",
      icon: "💯",
      achieved: stats.accuracy === 100,
      progress: Math.min(stats.accuracy / 100, 1),
    },
  ];

  const clearProgress = () => {
    if (
      confirm(
        "Are you sure you want to clear all progress? This action cannot be undone.",
      )
    ) {
      localStorage.removeItem("spellsan-stats");
      setStats({
        totalWords: spellingWords.length,
        practiceToday: 0,
        accuracy: 0,
        streak: 0,
        totalPracticeSessions: 0,
        averageAccuracy: 0,
        lastPracticeDate: "",
        wordsLearned: [],
        difficultWords: [],
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 dark:from-white dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
          Your Progress
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Track your spelling journey and celebrate your achievements
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Words Learned
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.wordsLearned.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                of {stats.totalWords}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(stats.wordsLearned.length / stats.totalWords) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current Streak
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.streak}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">days</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🔥</span>
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Average Accuracy
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.averageAccuracy}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Practice Sessions
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalPracticeSessions}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">total</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className={`bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6 ${
                achievement.achieved
                  ? "ring-2 ring-green-500 dark:ring-green-400"
                  : ""
              }`}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    achievement.achieved
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}
                >
                  <span className="text-2xl">{achievement.icon}</span>
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-bold ${
                      achievement.achieved
                        ? "text-green-700 dark:text-green-300"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {achievement.description}
                  </p>
                </div>
                {achievement.achieved && (
                  <div className="text-green-500 dark:text-green-400">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
              </div>

              {!achievement.achieved && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${achievement.progress * 100}%` }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Alphabet Progress */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Progress by Letter
        </h2>
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <div className="grid grid-cols-6 md:grid-cols-13 gap-4">
            {alphabetProgress.map(
              ({ letter, totalWords, practicedWords, progress }) => (
                <div
                  key={letter}
                  className="text-center p-3 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800"
                >
                  <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                    {letter}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {practicedWords}/{totalWords}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                    <div
                      className="bg-indigo-500 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/practice"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 text-center"
        >
          Continue Practice
        </Link>

        <Link
          href="/learn"
          className="bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold py-3 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center"
        >
          Study Words
        </Link>

        <button
          onClick={clearProgress}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/30"
        >
          Reset Progress
        </button>
      </div>

      {/* Last Practice Info */}
      {stats.lastPracticeDate && (
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last practice session:{" "}
            {new Date(stats.lastPracticeDate).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
