'use client';

import { useState, useMemo } from 'react';
import spellingWords from '../../spelling_words.json';
import { speakWordInBritishEnglish } from '../utils/speech';

export default function LearnWords() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlphabet, setSelectedAlphabet] = useState('');
  const [currentWord, setCurrentWord] = useState<string | null>(null);

  const filteredWords = useMemo(() => {
    let words = spellingWords;

    if (selectedAlphabet) {
      words = words.filter(word =>
        word.charAt(0).toUpperCase() === selectedAlphabet.toUpperCase()
      );
    }

    if (searchTerm) {
      words = words.filter(word =>
        word.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return words.sort();
  }, [searchTerm, selectedAlphabet]);

  const alphabetOptions = Array.from({ length: 26 }, (_, i) => {
    const letter = String.fromCharCode(65 + i);
    const count = spellingWords.filter(word =>
      word.charAt(0).toUpperCase() === letter
    ).length;
    return { letter, count };
  }).filter(item => item.count > 0);

  const speakWord = (word: string) => {
    speakWordInBritishEnglish(word);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedAlphabet('');
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 dark:from-white dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
          Learn Spelling Words
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Browse, search, and study all {spellingWords.length} competition words with audio pronunciation
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Words
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type to search words..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Alphabet Filter */}
          <div className="lg:w-64">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Letter
            </label>
            <select
              value={selectedAlphabet}
              onChange={(e) => setSelectedAlphabet(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all"
            >
              <option value="">All Letters</option>
              {alphabetOptions.map(({ letter, count }) => (
                <option key={letter} value={letter}>
                  {letter} ({count} words)
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedAlphabet) && (
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-3 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredWords.length} of {spellingWords.length} words
        </div>
      </div>

      {/* Words Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredWords.map((word, index) => (
          <div
            key={`${word}-${index}`}
            className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {word}
              </span>
              <button
                onClick={() => speakWord(word)}
                className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all group-hover:scale-110"
                title="Pronounce word"
              >
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{word.length} letters</span>
              <span className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded-md text-indigo-600 dark:text-indigo-400 font-medium">
                {word.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* No results */}
      {filteredWords.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No words found
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={clearFilters}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Quick alphabet navigation */}
      <div className="mt-12 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Navigation</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedAlphabet('')}
            className={`px-3 py-2 rounded-lg transition-all ${selectedAlphabet === ''
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
          >
            All
          </button>
          {alphabetOptions.map(({ letter, count }) => (
            <button
              key={letter}
              onClick={() => setSelectedAlphabet(letter)}
              className={`px-3 py-2 rounded-lg transition-all ${selectedAlphabet === letter
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
            >
              {letter} ({count})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
