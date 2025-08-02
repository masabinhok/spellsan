"use client";
import { useState, useMemo, useEffect } from "react";
import spellingWords from "../../clean_spelling_words.json";
import { speakWordInBritishEnglish } from "../utils/speech";
import { dictionaryAPI, DictionaryDefinition } from "../utils/dictionaryApi";

// WordCard component with meaning functionality
function WordCard({ word, index }: { word: string; index: number }) {
  const [meaning, setMeaning] = useState<DictionaryDefinition | null>(null);
  const [showMeaning, setShowMeaning] = useState(false);
  const [isLoadingMeaning, setIsLoadingMeaning] = useState(false);

  const speakWord = (word: string) => {
    speakWordInBritishEnglish(word);
  };

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
    <div
      key={`${word}-${index}`}
      className="group bg-white rounded-xl md:rounded-2xl shadow-lg border border-slate-200 p-3 md:p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-95"
    >
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <span className="text-base md:text-lg font-semibold text-slate-800">
          {word}
        </span>
        <div className="flex space-x-1">
          <button
            onClick={() => speakWord(word)}
            className="w-7 h-7 md:w-8 md:h-8 bg-blue-100 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-all group-hover:scale-110"
            title="Pronounce word"
          >
            <svg
              className="w-3 h-3 md:w-4 md:h-4 text-blue-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          </button>
          <button
            onClick={fetchMeaning}
            className="w-7 h-7 md:w-8 md:h-8 bg-green-100 rounded-lg flex items-center justify-center hover:bg-green-200 transition-all group-hover:scale-110"
            title="Show meaning"
          >
            <svg
              className="w-3 h-3 md:w-4 md:h-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Word Details */}
      <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
        <span>{word.length} letters</span>
        <span className="bg-blue-100 px-2 py-1 rounded-md text-blue-600 font-medium">
          {word.charAt(0).toUpperCase()}
        </span>
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
                  <span className="font-medium text-green-700">{meaning.partOfSpeech}</span>
                )}
                {meaning.pronunciation && (
                  <span className="ml-2 text-slate-500">/{meaning.pronunciation}/</span>
                )}
              </div>
              <p className="text-xs text-slate-700">{meaning.meaning}</p>
              {meaning.example && (
                <p className="text-xs text-slate-500 italic">
                  "{meaning.example}"
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
export default function LearnWords() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAlphabet, setSelectedAlphabet] = useState("");

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
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3 md:mb-4">
            Learn Spelling Words
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto px-4">
            Browse, search, and study all {spellingWords.length} competition
            words with British English pronunciation{" "}
          </p>{" "}
        </div>{" "}
        {/* Filters */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-slate-200 p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:gap-6">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search Words
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type to search words..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:border-blue-500 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <svg
                      className="w-5 h-5"
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
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter by Letter
              </label>
              <select
                value={selectedAlphabet}
                onChange={(e) => setSelectedAlphabet(e.target.value)}
                className="w-full p-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:border-blue-500 bg-white text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
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
              <div className="flex items-end md:items-end">{" "}
                <button
                  onClick={clearFilters}
                  className="w-full md:w-auto px-4 py-3 bg-slate-100 text-slate-600 rounded-lg md:rounded-xl hover:bg-slate-200 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
          {/* Results count */}
          <div className="mt-4 text-sm text-slate-600">
            Showing {filteredWords.length} of {spellingWords.length} words
          </div>
        </div>
        {/* Words Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {filteredWords.map((word, index) => (
            <WordCard key={`${word}-${index}`} word={word} index={index} />
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
