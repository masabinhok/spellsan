"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import spellingWords from "../../clean_spelling_words.json";
import { ProgressManager } from "../utils/progressManager";

interface GameStats {
  correct: number;
  incorrect: number;
  total: number;
}

interface SessionData {
  startTime: Date;
  endTime: Date | null;
  wordsCorrect: string[];
  wordsIncorrect: string[];
}

function ScrambleComponent() {
  const [currentWord, setCurrentWord] = useState("");
  const [scrambledWord, setScrambledWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isGameActive, setIsGameActive] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [stats, setStats] = useState<GameStats>({
    correct: 0,
    incorrect: 0,
    total: 0,
  });
  const [showAnswer, setShowAnswer] = useState(false);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(45); // 45 seconds for scramble
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData>({
    startTime: new Date(),
    endTime: null,
    wordsCorrect: [],
    wordsIncorrect: [],
  });

  const answerRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to scramble word (keeping first and last letters intact)
  const scrambleWord = (word: string): string => {
    if (word.length <= 3) {
      // For very short words, just scramble all but first letter
      if (word.length <= 2) return word;
      return word[0] + word.slice(1).split('').sort(() => Math.random() - 0.5).join('');
    }

    const first = word[0];
    const last = word[word.length - 1];
    const middle = word.slice(1, -1).split('');

    // Ensure we actually scramble the word (avoid identical result)
    let scrambled;
    let attempts = 0;
    do {
      const shuffled = [...middle];
      // Fisher-Yates shuffle
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      scrambled = first + shuffled.join('') + last;
      attempts++;
    } while (scrambled === word && attempts < 10);

    return scrambled;
  };  // Get random word from available words
  const getRandomWord = useCallback(() => {
    if (availableWords.length === 0) return null;

    const remainingWords = availableWords.filter(word => !usedWords.includes(word));
    if (remainingWords.length === 0) {
      setGameComplete(true);
      return null;
    }

    const randomIndex = Math.floor(Math.random() * remainingWords.length);
    return remainingWords[randomIndex];
  }, [availableWords, usedWords]);

  // Timer countdown effect
  useEffect(() => {
    if (isTimerActive && timeLeft > 0 && !feedback && isGameActive) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive && isGameActive && !feedback) {
      handleTimeUp();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, isTimerActive, feedback, isGameActive]);

  // Handle when time runs out
  const handleTimeUp = useCallback(() => {
    const newStats = {
      correct: stats.correct,
      incorrect: stats.incorrect + 1,
      total: stats.total + 1,
    };
    setStats(newStats);

    // Update progress in real-time
    ProgressManager.updateWordProgress(currentWord, false);

    // Track words for session data
    setSessionData(prev => ({
      ...prev,
      wordsIncorrect: [...prev.wordsIncorrect, currentWord],
    }));

    setFeedback(`⏰ Time's up! The correct spelling is: ${currentWord}`);
    setShowAnswer(true);
    setIsTimerActive(false);

    setTimeout(() => {
      if (!gameComplete) nextWord();
    }, 3000);
  }, [currentWord, stats, gameComplete]);

  // Load next word
  const nextWord = useCallback(() => {
    const word = getRandomWord();
    if (word) {
      setCurrentWord(word);
      setScrambledWord(scrambleWord(word));
      setUsedWords((prev) => [...prev, word]);
      // Start timer for the new word
      setTimeout(() => {
        startTimer();
        answerRef.current?.focus();
      }, 500);
    }
    setUserInput("");
    setFeedback("");
    setShowAnswer(false);
  }, [getRandomWord]);

  // Start practice session
  const startPractice = () => {
    const smartWords = ProgressManager.getSmartWordSelection(spellingWords, "random");
    setAvailableWords(smartWords);
    setIsGameActive(true);
    setGameComplete(false);
    setUsedWords([]);
    setStats({ correct: 0, incorrect: 0, total: 0 });
    setFeedback("");
    setShowAnswer(false);
    setSessionData({
      startTime: new Date(),
      endTime: null,
      wordsCorrect: [],
      wordsIncorrect: [],
    });

    // Start practice session in progress manager
    ProgressManager.startPracticeSession();

    if (smartWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * smartWords.length);
      setCurrentWord(smartWords[randomIndex]);
      setScrambledWord(scrambleWord(smartWords[randomIndex]));
      setUsedWords([smartWords[randomIndex]]);
      // Start timer for the first word
      setTimeout(() => {
        startTimer();
        answerRef.current?.focus();
      }, 500);
    }
  };

  // Check spelling
  const checkSpelling = () => {
    // Stop the timer
    stopTimer();

    const isCorrect = userInput.toLowerCase().trim() === currentWord.toLowerCase();
    const newStats = {
      correct: stats.correct + (isCorrect ? 1 : 0),
      incorrect: stats.incorrect + (isCorrect ? 0 : 1),
      total: stats.total + 1,
    };
    setStats(newStats);

    // Update progress in real-time
    ProgressManager.updateWordProgress(currentWord, isCorrect);

    // Track words for session data
    setSessionData(prev => ({
      ...prev,
      wordsCorrect: isCorrect
        ? [...prev.wordsCorrect, currentWord]
        : prev.wordsCorrect,
      wordsIncorrect: !isCorrect
        ? [...prev.wordsIncorrect, currentWord]
        : prev.wordsIncorrect,
    }));

    if (isCorrect) {
      setFeedback("🎉 Correct! Well done!");
    } else {
      setFeedback(`❌ Incorrect. The correct spelling is: ${currentWord}`);
      setShowAnswer(true);
    }

    setTimeout(() => {
      if (!gameComplete) nextWord();
    }, isCorrect ? 1500 : 2500); // Shorter delay for correct answers
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userInput.trim() && !feedback) {
      checkSpelling();
    } else if (e.key === "Escape") {
      setUserInput("");
    }
  };

  // Reset game
  const resetGame = () => {
    stopTimer();

    // Save progress if there was any practice
    if (stats.total > 0) {
      const finalSessionData = {
        ...sessionData,
        endTime: new Date(),
      };

      ProgressManager.recordPracticeSession({
        mode: 'random',
        wordsAttempted: stats.total,
        correctAnswers: stats.correct,
        startTime: finalSessionData.startTime,
        endTime: finalSessionData.endTime,
        wordsCorrect: finalSessionData.wordsCorrect,
        wordsIncorrect: finalSessionData.wordsIncorrect,
      });
    }

    setIsGameActive(false);
    setGameComplete(false);
    setCurrentWord("");
    setScrambledWord("");
    setUserInput("");
    setFeedback("");
    setStats({ correct: 0, incorrect: 0, total: 0 });
    setUsedWords([]);
    setShowAnswer(false);
    setTimeLeft(45);
    setIsTimerActive(false);
  };

  // Start timer
  const startTimer = () => {
    setTimeLeft(45);
    setIsTimerActive(true);
  };

  // Stop timer
  const stopTimer = () => {
    setIsTimerActive(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  // Save progress when game completes
  useEffect(() => {
    if (gameComplete) {
      stopTimer();
      setFeedback(
        `Scramble Complete! Final Score: ${stats.correct}/${stats.total} (${Math.round((stats.correct / stats.total) * 100)}%)`
      );

      // Save progress when game is complete
      const finalSessionData = {
        ...sessionData,
        endTime: new Date(),
      };

      ProgressManager.recordPracticeSession({
        mode: 'random',
        wordsAttempted: stats.total,
        correctAnswers: stats.correct,
        startTime: finalSessionData.startTime,
        endTime: finalSessionData.endTime,
        wordsCorrect: finalSessionData.wordsCorrect,
        wordsIncorrect: finalSessionData.wordsIncorrect,
      });
    }
  }, [gameComplete, stats, sessionData]);

  // Periodic save during active practice
  useEffect(() => {
    if (!isGameActive || stats.total === 0) return;

    const saveInterval = setInterval(() => {
      if (stats.total > 0) {
        const currentSessionData = {
          ...sessionData,
          endTime: new Date(),
        };

        ProgressManager.recordPracticeSession({
          mode: 'random',
          wordsAttempted: stats.total,
          correctAnswers: stats.correct,
          startTime: currentSessionData.startTime,
          endTime: currentSessionData.endTime,
          wordsCorrect: currentSessionData.wordsCorrect,
          wordsIncorrect: currentSessionData.wordsIncorrect,
        });
      }
    }, 10000); // Save every 10 seconds

    return () => clearInterval(saveInterval);
  }, [isGameActive, stats.total, stats.correct, sessionData]);

  // Save progress before unloading the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      stopTimer();

      if (isGameActive && stats.total > 0) {
        const finalSessionData = {
          ...sessionData,
          endTime: new Date(),
        };

        ProgressManager.recordPracticeSession({
          mode: 'random',
          wordsAttempted: stats.total,
          correctAnswers: stats.correct,
          startTime: finalSessionData.startTime,
          endTime: finalSessionData.endTime,
          wordsCorrect: finalSessionData.wordsCorrect,
          wordsIncorrect: finalSessionData.wordsIncorrect,
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [isGameActive, stats, sessionData]);

  if (isGameActive) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 md:p-6">
            {/* Game Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm md:text-lg font-bold text-slate-800">
                    Word Scramble Quiz
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span>{availableWords.length} words</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={resetGame}
                  className="flex items-center space-x-1 px-2 py-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Exit</span>
                </button>
              </div>
            </div>

            {/* Progress Stats */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6 border border-purple-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-slate-800">Progress</span>
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <span>{stats.correct}/{stats.total} correct</span>
                  <span className="px-2 py-1 bg-white rounded-full text-xs font-medium">
                    {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}% accuracy
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${stats.total > 0 ? (stats.correct / stats.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {!gameComplete ? (
              <div className="text-center space-y-4">
                {/* Timer and Word Display */}
                <div className="flex justify-center items-center gap-4 mb-2">
                  {isTimerActive && !feedback && (
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border-2 transition-all duration-300 ${timeLeft <= 10
                        ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                        : timeLeft <= 20
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                          : 'bg-blue-50 text-blue-700 border-blue-300'
                      }`}>
                      <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {timeLeft}s remaining
                    </div>
                  )}
                </div>

                {/* Scrambled Word Display */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200 transition-all duration-300 hover:shadow-lg">
                  <h3 className="text-lg font-semibold text-slate-700 mb-4">Unscramble this word:</h3>
                  <div className="text-4xl md:text-6xl font-bold text-purple-700 tracking-widest mb-6 font-mono select-all">
                    {scrambledWord.split('').map((letter, index) => (
                      <span
                        key={index}
                        className={`inline-block transition-all duration-200 hover:scale-110 ${index === 0 || index === scrambledWord.length - 1
                            ? 'text-green-600 animate-pulse'
                            : 'text-purple-700'
                          }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {letter}
                      </span>
                    ))}
                  </div>
                  <div className="bg-white/70 rounded-lg p-3 border border-purple-100">
                    <p className="text-sm text-slate-600">
                      💡 <strong>Hint:</strong> The <span className="text-green-600 font-semibold">green letters</span> are in the correct position
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Press <kbd className="px-1 py-0.5 bg-slate-200 rounded text-xs">Esc</kbd> to clear your input
                    </p>
                  </div>
                </div>

                {/* Input and Submit */}
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      ref={answerRef}
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type the correct spelling..."
                      className="w-full text-lg p-4 border-2 border-slate-300 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 text-center transition-all duration-200 hover:border-purple-300"
                      disabled={!!feedback}
                      maxLength={50}
                      autoComplete="off"
                      spellCheck="false"
                    />
                    {userInput && (
                      <button
                        onClick={() => setUserInput("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {feedback ? (
                    <div className={`flex items-center justify-center space-x-3 p-4 rounded-xl transition-all duration-300 ${feedback.includes("Correct")
                        ? "bg-green-50 border-2 border-green-200"
                        : "bg-red-50 border-2 border-red-200"
                      }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${feedback.includes("Correct") ? "bg-green-500" : "bg-red-500"
                        }`}>
                        <span className="text-white font-bold">
                          {feedback.includes("Correct") ? "✓" : "✗"}
                        </span>
                      </div>
                      <div className={`text-base font-semibold ${feedback.includes("Correct") ? "text-green-800" : "text-red-800"
                        }`}>
                        {feedback}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={checkSpelling}
                      disabled={!userInput.trim()}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span>Check Spelling</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                        </svg>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
                  <div className="text-4xl mb-3">🎉</div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">
                    Scramble Complete!
                  </h3>
                  <div className="text-base text-slate-700 mb-4">
                    {feedback}
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white/70 rounded-xl p-3 border border-yellow-200">
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.total}
                      </div>
                      <div className="text-sm text-slate-600">
                        Words
                      </div>
                    </div>
                    <div className="bg-white/70 rounded-xl p-3 border border-yellow-200">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.correct}
                      </div>
                      <div className="text-sm text-slate-600">Correct</div>
                    </div>
                    <div className="bg-white/70 rounded-xl p-3 border border-yellow-200">
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.total > 0
                          ? Math.round((stats.correct / stats.total) * 100)
                          : 0}
                        %
                      </div>
                      <div className="text-sm text-slate-600">
                        Accuracy
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => startPractice()}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    🔄 Play Again
                  </button>
                  <Link
                    href="/"
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 text-center"
                  >
                    🏠 Back to Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 py-6 md:py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3 md:mb-4">
            Word Scramble Quiz
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto px-4">
            Test your spelling skills with scrambled words! The first and last letters stay in place.
          </p>
        </div>

        {/* Game Mode Card */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 md:gap-8 mb-8 md:mb-12 max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-slate-200 p-6 md:p-8 hover:shadow-2xl transition-all duration-300">
            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl md:rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                <svg
                  className="w-8 h-8 md:w-10 md:h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
                🧩 Scramble Challenge
              </h2>
              <p className="text-base md:text-lg text-slate-600 mb-8 leading-relaxed">
                Test your spelling skills with our exciting word scramble game!
                Unscramble words with the first and last letters in the correct position.
              </p>

              <div className="mb-8">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
                  <h3 className="font-bold text-purple-800 mb-4 text-lg">🎯 How it works:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="flex items-start space-x-3">
                      <span className="text-green-500 text-xl">✅</span>
                      <div>
                        <p className="font-semibold text-purple-700">First & last letters stay</p>
                        <p className="text-sm text-purple-600">They remain in correct position</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500 text-xl">🔀</span>
                      <div>
                        <p className="font-semibold text-purple-700">Middle letters scrambled</p>
                        <p className="text-sm text-purple-600">You need to figure them out</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-orange-500 text-xl">⏱️</span>
                      <div>
                        <p className="font-semibold text-purple-700">45 seconds per word</p>
                        <p className="text-sm text-purple-600">Beat the clock!</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-red-500 text-xl">🤫</span>
                      <div>
                        <p className="font-semibold text-purple-700">No audio clues</p>
                        <p className="text-sm text-purple-600">Pure spelling challenge</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h4 className="font-semibold text-slate-700 mb-2">💡 Example:</h4>
                  <div className="flex items-center justify-center space-x-4">
                    <span className="text-2xl font-mono font-bold text-slate-400">A _ _ _ _ E</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-2xl font-mono font-bold text-purple-600">A<span className="text-slate-600">RBSO</span>B</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-2xl font-mono font-bold text-green-600">ABSORB</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => startPractice()}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-8 md:py-5 md:px-10 rounded-2xl md:rounded-3xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-100 active:scale-95 text-lg"
              >
                🚀 Start Scramble Quiz
              </button>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ScrambleComponent;
