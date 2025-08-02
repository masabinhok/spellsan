"use client";
import { useState, useMemo, useEffect } from "react";
import spellingWords from "../../clean_spelling_words.json";
import { speakWordInBritishEnglish } from "../utils/speech";
import { dictionaryAPI, DictionaryDefinition } from "../utils/dictionaryApi";

// WordCard component with meaning functionality
function WordCard({ word, index, hintsEnabled }: { word: string; index: number; hintsEnabled: boolean }) {
  const [meaning, setMeaning] = useState<DictionaryDefinition | null>(null);
  const [isLoadingMeaning, setIsLoadingMeaning] = useState(false);

  const speakWord = (word: string) => {
    speakWordInBritishEnglish(word);
  };

  // Auto-fetch meaning when hints are enabled
  useEffect(() => {
    if (hintsEnabled && !isLoadingMeaning) {
      const fetchMeaning = async () => {
        setIsLoadingMeaning(true);
        try {
          const wordMeaning = await dictionaryAPI.getWordMeaning(word);
          setMeaning(wordMeaning);
        } catch (error) {
          console.warn('Failed to fetch meaning for', word, error);
        } finally {
          setIsLoadingMeaning(false);
        }
      };

      // If we don't have meaning yet, fetch it
      if (!meaning) {
        fetchMeaning();
      }
    }
  }, [hintsEnabled, word, meaning, isLoadingMeaning]);

  return (
    <div
      key={`${word}-${index}`}
      className="group bg-gradient-to-br from-white to-slate-50 rounded-xl md:rounded-2xl shadow-lg border border-slate-200 p-4 md:p-5 hover:shadow-xl hover:from-blue-50 hover:to-slate-50 transition-all duration-300 hover:-translate-y-1 active:scale-95"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg md:text-xl font-bold text-slate-800 group-hover:text-blue-800 transition-colors">
            {word}
          </span>
          <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            {word.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => speakWord(word)}
            className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center hover:from-blue-200 hover:to-blue-300 transition-all group-hover:scale-110 shadow-sm hover:shadow-md"
            title="Pronounce word"
          >
            <svg
              className="w-4 h-4 text-blue-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Word Details */}
      <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            <span>{word.length} letters</span>
          </span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span>Competition word</span>
        </div>
        <div className="text-xs text-slate-400 font-mono">#{index + 1}</div>
      </div>
      {/* Meaning Section - Auto-show when hints enabled */}
      {hintsEnabled && (
        <div className="border-t border-slate-200 pt-3 mt-3 animate-in slide-in-from-top-2 duration-200">
          {isLoadingMeaning ? (
            <div className="flex items-center space-x-2 text-slate-500">
              <div className="w-4 h-4 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin"></div>
              <span className="text-sm">Loading meaning...</span>
            </div>
          ) : meaning ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {meaning.partOfSpeech && (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                    {meaning.partOfSpeech}
                  </span>
                )}
                {meaning.pronunciation && (
                  <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded">
                    /{meaning.pronunciation}/
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{meaning.meaning}</p>
              {meaning.example && (
                <div className="bg-slate-50 border-l-4 border-emerald-300 pl-3 py-2 rounded-r">
                  <p className="text-xs text-slate-600 italic">
                    <span className="font-medium text-emerald-600">Example:</span> "{meaning.example}"
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm">Meaning not available</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default function LearnWords() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAlphabet, setSelectedAlphabet] = useState("");
  const [hintsEnabled, setHintsEnabled] = useState(false);

  const filteredWords = useMemo(() => {
    let words = spellingWords;
    if (selectedAlphabet) {
      words = words.filter(
        (word) =>
          word.charAt(0).toUpperCase() === selectedAlphabet.toUpperCase(),
      );
    }
    if (searchTerm) {
      words = words.filter((word) =>
        word.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    return words.sort();
  }, [searchTerm, selectedAlphabet]);
  const alphabetOptions = Array.from({ length: 26 }, (_, i) => {
    const letter = String.fromCharCode(65 + i);
    const count = spellingWords.filter(
      (word) => word.charAt(0).toUpperCase() === letter,
    ).length;
    return { letter, count };
  }).filter((item) => item.count > 0);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedAlphabet("");
  };
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 py-6 md:py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Word Library</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
            Learn Spelling Words
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto px-4">
            Browse, search, and study all <span className="font-semibold text-blue-600">{spellingWords.length}</span> competition
            words with meanings and British English pronunciation
          </p>
        </div>
        {/* Filters */}
        <div className="bg-gradient-to-r from-white to-slate-50 rounded-xl md:rounded-2xl shadow-lg border border-slate-200 p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:gap-6">
            {/* Search */}
            <div className="flex-1">
              <label className="flex items-center space-x-1 text-sm font-semibold text-slate-700 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search Words</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Type to search words..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 md:p-4 pl-10 border-2 border-slate-200 rounded-lg md:rounded-xl focus:border-blue-500 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            {/* Alphabet Filter */}
            <div className="md:w-64">
              <label className="flex items-center space-x-1 text-sm font-semibold text-slate-700 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                <span>Filter by Letter</span>
              </label>
              <select
                value={selectedAlphabet}
                onChange={(e) => setSelectedAlphabet(e.target.value)}
                className="w-full p-3 md:p-4 border-2 border-slate-200 rounded-lg md:rounded-xl focus:border-blue-500 bg-white text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
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
                  className="w-full md:w-auto px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 rounded-lg md:rounded-xl hover:from-slate-200 hover:to-slate-300 transition-all shadow-sm font-medium"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Clear</span>
                  </div>
                </button>
              </div>
            )}

            {/* Hints Toggle */}
            <div className="flex items-end">
              <button
                onClick={() => setHintsEnabled(!hintsEnabled)}
                className={`w-full md:w-auto px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl transition-all shadow-sm font-medium ${hintsEnabled
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                  : 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 hover:from-emerald-200 hover:to-emerald-300'
                  }`}
                title={hintsEnabled ? "Disable automatic hints" : "Enable automatic hints"}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>{hintsEnabled ? 'Hints ON' : 'Hints OFF'}</span>
                </div>
              </button>
            </div>
          </div>
          {/* Results count */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-600 flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Showing <span className="font-semibold text-blue-600">{filteredWords.length}</span> of <span className="font-semibold">{spellingWords.length}</span> words</span>
            </div>
            {filteredWords.length > 0 && (
              <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                {Math.round((filteredWords.length / spellingWords.length) * 100)}% of collection
              </div>
            )}
          </div>
        </div>
        {/* Words Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {filteredWords.map((word, index) => (
            <WordCard key={`${word}-${index}`} word={word} index={index} hintsEnabled={hintsEnabled} />
          ))}
        </div>{" "}
        {/* No results */}{" "}
        {filteredWords.length === 0 && (
          <div className="text-center py-12">
            {" "}
            <div className="text-6xl mb-4">
              {" "}
              <svg
                className="w-24 h-24 mx-auto text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />{" "}
              </svg>{" "}
            </div>{" "}
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              {" "}
              No words found{" "}
            </h3>{" "}
            <p className="text-slate-600 mb-4">
              {" "}
              Try adjusting your search or filter criteria{" "}
            </p>{" "}
            <button
              onClick={clearFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl transition-all"
            >
              {" "}
              Clear Filters{" "}
            </button>{" "}
          </div>
        )}{" "}
        {/* Quick alphabet navigation */}{" "}
        <div className="mt-12 bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          {" "}
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Quick Navigation
          </h3>{" "}
          <div className="flex flex-wrap gap-2">
            {" "}
            <button
              onClick={() => setSelectedAlphabet("")}
              className={`px-3 py-2 rounded-lg transition-all ${selectedAlphabet === "" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {" "}
              All{" "}
            </button>{" "}
            {alphabetOptions.map(({ letter, count }) => (
              <button
                key={letter}
                onClick={() => setSelectedAlphabet(letter)}
                className={`px-3 py-2 rounded-lg transition-all ${selectedAlphabet === letter ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {" "}
                {letter} ({count}){" "}
              </button>
            ))}{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
