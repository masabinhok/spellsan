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

    // Shuffle middle letters
    for (let i = middle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [middle[i], middle[j]] = [middle[j], middle[i]];
    }

    return first + middle.join('') + last;
  };

  // Get random word from available words
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

    setFeedback(`Time's up! The correct spelling is: ${currentWord}`);
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
      setFeedback("Correct! Well done!");
    } else {
      setFeedback(`Incorrect. The correct spelling is: ${currentWord}`);
      setShowAnswer(true);
    }

    setTimeout(() => {
      if (!gameComplete) nextWord();
    }, 2000);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userInput.trim() && !feedback) {
      checkSpelling();
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
            <div className="bg-purple-50 rounded-lg p-3 mb-4 border border-purple-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-800">Progress</span>
                <span className="text-sm text-slate-600">
                  {stats.correct}/{stats.total} correct
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div
                  className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.total > 0 ? (stats.correct / stats.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {!gameComplete ? (
              <div className="text-center space-y-4">
                {/* Timer and Word Display */}
                <div className="flex justify-center items-center gap-4">
                  {isTimerActive && !feedback && (
                    <div className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold border transition-all ${timeLeft <= 10
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : timeLeft <= 20
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {timeLeft}s
                    </div>
                  )}
                </div>

                {/* Scrambled Word Display */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200">
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Unscramble this word:</h3>
                  <div className="text-4xl md:text-5xl font-bold text-purple-700 tracking-wider mb-4">
                    {scrambledWord}
                  </div>
                  <p className="text-sm text-slate-600">
                    Hint: The first and last letters are in the correct position
                  </p>
                </div>

                {/* Input and Submit */}
                <div className="space-y-4">
                  <input
                    ref={answerRef}
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type the correct spelling..."
                    className="w-full text-lg p-4 border-2 border-slate-300 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 text-center"
                    disabled={!!feedback}
                  />

                  {feedback ? (
                    <div className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-opacity-20">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${feedback.includes("Correct") ? "bg-green-500" : "bg-red-500"
                            }`}
                        >
                          <span className="text-white text-sm">
                            {feedback.includes("Correct") ? "✓" : "✗"}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`text-sm font-semibold ${feedback.includes("Correct") ? "text-green-800" : "text-red-800"
                          }`}
                      >
                        {feedback}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={checkSpelling}
                      disabled={!userInput.trim()}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Check Spelling</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                        </svg>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
                  <div className="text-3xl mb-2">🎉</div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    Excellent Work!
                  </h3>
                  <div className="text-sm text-slate-700 mb-3">
                    {feedback}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-white/50 rounded-lg p-2">
                      <div className="text-lg font-bold text-purple-600">
                        {stats.total}
                      </div>
                      <div className="text-xs text-slate-600">
                        Words
                      </div>
                    </div>
                    <div className="bg-white/50 rounded-lg p-2">
                      <div className="text-lg font-bold text-green-600">
                        {stats.correct}
                      </div>
                      <div className="text-xs text-slate-600">Correct</div>
                    </div>
                    <div className="bg-white/50 rounded-lg p-2">
                      <div className="text-lg font-bold text-purple-600">
                        {stats.total > 0
                          ? Math.round((stats.correct / stats.total) * 100)
                          : 0}
                        %
                      </div>
                      <div className="text-xs text-slate-600">
                        Accuracy
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    onClick={() => startPractice()}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all text-sm"
                  >
                    Play Again
                  </button>
                  <Link
                    href="/"
                    className="bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg transition-all text-center text-sm"
                  >
                    Back to Dashboard
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
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 md:gap-8 mb-8 md:mb-12 max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-slate-200 p-6 md:p-8">
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 mx-auto">
                <svg
                  className="w-6 h-6 md:w-8 md:h-8 text-white"
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
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-3 md:mb-4">
                Scramble Challenge
              </h2>
              <p className="text-sm md:text-base text-slate-600 mb-6 md:mb-8">
                Unscramble words with the first and last letters in the correct position.
                Perfect for testing your word recognition and spelling skills!
              </p>
              <div className="mb-6 md:mb-8">
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-2">How it works:</h3>
                  <ul className="text-sm text-purple-700 space-y-1 text-left">
                    <li>• First and last letters stay in place</li>
                    <li>• Middle letters are scrambled</li>
                    <li>• 45 seconds per word</li>
                    <li>• No audio clues - rely on your spelling knowledge!</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => startPractice()}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 md:py-4 md:px-8 rounded-xl md:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-100 active:scale-95"
              >
                Start Scramble Quiz
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
