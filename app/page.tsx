"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import spellingWords from "../clean_spelling_words.json";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalWords: spellingWords.length,
    practiceToday: 0,
    accuracy: 0,
    streak: 0,
  });

  useEffect(() => {
    // Load stats from localStorage if available
    const savedStats = localStorage.getItem("spellsan-stats");
    if (savedStats) {
      setStats((prev) => ({ ...prev, ...JSON.parse(savedStats) }));
    }
  }, []);

  const alphabetStats = Array.from({ length: 26 }, (_, i) => {
    const letter = String.fromCharCode(65 + i);
    const wordsForLetter = spellingWords.filter(
      (word) => word.charAt(0).toUpperCase() === letter,
    ).length;
    return { letter, count: wordsForLetter };
  });

  const quickActions = [
    {
      title: "Learn Words",
      description: "Browse and study all spelling words",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      href: "/learn",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      title: "Quick Practice",
      description: "Start practicing random words",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      href: "/practice?mode=random",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      borderColor: "border-emerald-200",
    },
    {
      title: "Alphabet Practice",
      description: "Practice words by specific letters",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      ),
      href: "/practice",
      bgColor: "bg-violet-50",
      iconColor: "text-violet-600",
      borderColor: "border-violet-200",
    },
    {
      title: "View Progress",
      description: "Check your learning statistics",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      href: "/progress",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      borderColor: "border-amber-200",
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 py-6 md:py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Welcome to SpellSAN
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto px-4">
            Master spelling for the SAN competition with our comprehensive
            practice platform
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-slate-200 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-slate-600">
                  Total Words
                </p>
                <p className="text-xl md:text-3xl font-bold text-slate-800">
                  {stats.totalWords}
                </p>
              </div>
              <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-100 rounded-lg md:rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-slate-200 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-slate-600">
                  Practice Today
                </p>
                <p className="text-xl md:text-3xl font-bold text-slate-800">
                  {stats.practiceToday}
                </p>
              </div>
              <div className="w-8 h-8 md:w-12 md:h-12 bg-emerald-100 rounded-lg md:rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 md:w-6 md:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-slate-200 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-slate-600">
                  Accuracy
                </p>
                <p className="text-xl md:text-3xl font-bold text-slate-800">
                  {stats.accuracy}%
                </p>
              </div>
              <div className="w-8 h-8 md:w-12 md:h-12 bg-violet-100 rounded-lg md:rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 md:w-6 md:h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-slate-200 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-slate-600">Streak</p>
                <p className="text-xl md:text-3xl font-bold text-slate-800">
                  {stats.streak}
                </p>
              </div>
              <div className="w-8 h-8 md:w-12 md:h-12 bg-amber-100 rounded-lg md:rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 md:w-6 md:h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6 md:mb-8 text-center">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className={`group bg-white rounded-xl md:rounded-2xl shadow-lg border ${action.borderColor} p-4 md:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-95`}
              >
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 ${action.bgColor} rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform`}
                >
                  <span className={action.iconColor}>{action.icon}</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2">
                  {action.title}
                </h3>
                <p className="text-sm md:text-base text-slate-600">
                  {action.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Alphabet Overview */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-slate-200 p-4 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 md:mb-6">
            Words by Alphabet
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-13 gap-2 md:gap-3">
            {alphabetStats.map(({ letter, count }) => (
              <Link
                key={letter}
                href={`/practice?alphabet=${letter.toLowerCase()}`}
                className="group bg-slate-50 rounded-lg md:rounded-xl p-2 md:p-4 text-center hover:bg-blue-50 hover:shadow-md transition-all duration-200 hover:scale-105 border border-slate-200 hover:border-blue-300 active:scale-95"
              >
                <div className="text-lg md:text-2xl font-bold text-slate-700 group-hover:text-blue-600 mb-1 transition-colors">
                  {letter}
                </div>
                <div className="text-xs md:text-sm text-slate-500 group-hover:text-blue-500 transition-colors">
                  {count} words
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
