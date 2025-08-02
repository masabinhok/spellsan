"use client";
import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import spellingWords from "../../clean_spelling_words.json";
import AudioButton from "../components/AudioButton";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
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

function PracticeComponent() {
  const searchParams = useSearchParams();
  const { playWord } = useAudioPlayer();
  const [mode, setMode] = useState<"random" | "alphabet" | null>(null);
  const [selectedAlphabet, setSelectedAlphabet] = useState("");
  const [currentWord, setCurrentWord] = useState("");
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
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData>({
    startTime: new Date(),
    endTime: null,
    wordsCorrect: [],
    wordsIncorrect: [],
  });
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const answerRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (isTimerActive && timeLeft > 0 && !feedback && isGameActive) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !feedback && isGameActive) {
      // Time's up - mark as incorrect
      handleTimeUp();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, isTimerActive, feedback, isGameActive]);

  // Handle when time runs out
  const handleTimeUp = () => {
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
    }, 3000); // Show answer for 3 seconds when time runs out
  };

  // Reset timer when new word starts
  const startTimer = () => {
    setTimeLeft(30);
    setIsTimerActive(true);
  };

  // Stop timer
  const stopTimer = () => {
    setIsTimerActive(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  // Helper function to get word category
  const getWordCategory = (word: string) => {
    const currentProgress = ProgressManager.loadProgress();
    if (currentProgress.difficultWords.includes(word)) {
      return { type: 'difficult', label: 'Difficult Word', color: 'text-red-600 bg-red-50 border-red-200' };
    } else if (currentProgress.wordsLearned.includes(word)) {
      return { type: 'learned', label: 'Review Word', color: 'text-green-600 bg-green-50 border-green-200' };
    } else {
      return { type: 'new', label: 'New Word', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    }
  };

  // Save progress before unloading the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Stop timer on unload
      stopTimer();

      if (isGameActive && stats.total > 0) {
        const finalSessionData = {
          ...sessionData,
          endTime: new Date(),
        };

        ProgressManager.recordPracticeSession({
          mode: mode as 'random' | 'alphabet',
          alphabet: mode === 'alphabet' ? selectedAlphabet : undefined,
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
      // Also save on component unmount and cleanup timer
      handleBeforeUnload();
    };
  }, [isGameActive, stats, sessionData, mode, selectedAlphabet]);

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    const alphabetParam = searchParams.get("alphabet");
    if (modeParam === "random") {
      setMode("random");
      const smartWords = ProgressManager.getSmartWordSelection(spellingWords, "random");
      setAvailableWords(smartWords);
    } else if (alphabetParam) {
      setMode("alphabet");
      setSelectedAlphabet(alphabetParam.toUpperCase());
      const smartWords = ProgressManager.getSmartWordSelection(
        spellingWords,
        "alphabet",
        alphabetParam.toUpperCase()
      );
      setAvailableWords(smartWords);
    }
  }, [searchParams]);

  // Auto-play word when it changes after user submits an answer
  useEffect(() => {
    if (currentWord && shouldAutoPlay && isGameActive && !gameComplete) {
      const timer = setTimeout(() => {
        playWord(currentWord);
        setShouldAutoPlay(false);
        answerRef.current?.focus()
      }, 100); // Small delay to ensure word is set
      return () => clearTimeout(timer);
    }
  }, [currentWord, shouldAutoPlay, isGameActive, gameComplete, playWord]);

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
          mode: mode as 'random' | 'alphabet',
          alphabet: mode === 'alphabet' ? selectedAlphabet : undefined,
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
  }, [isGameActive, stats.total, stats.correct, sessionData, mode, selectedAlphabet]);
  const alphabetOptions = Array.from({ length: 26 }, (_, i) => {
    const letter = String.fromCharCode(65 + i);
    const count = spellingWords.filter(
      (word) => word.charAt(0).toUpperCase() === letter,
    ).length;
    return { letter, count };
  }).filter((item) => item.count > 0);
  const getRandomWord = useCallback(() => {
    const unusedWords = availableWords.filter(
      (word) => !usedWords.includes(word),
    );
    if (unusedWords.length === 0) {
      setGameComplete(true);
      return "";
    }
    const randomIndex = Math.floor(Math.random() * unusedWords.length);
    return unusedWords[randomIndex];
  }, [availableWords, usedWords]);
  const startPractice = (
    practiceMode: "random" | "alphabet",
    alphabet?: string,
  ) => {
    // Get smart word selection based on progress
    const smartWords = ProgressManager.getSmartWordSelection(
      spellingWords,
      practiceMode,
      alphabet
    );

    setAvailableWords(smartWords);
    setMode(practiceMode);
    if (practiceMode === "alphabet") {
      setSelectedAlphabet(alphabet?.toUpperCase() || "");
    }

    setIsGameActive(true);
    setGameComplete(false);
    setStats({ correct: 0, incorrect: 0, total: 0 });
    setUsedWords([]);
    setFeedback("");
    setShowAnswer(false);
    setUserInput("");
    setShouldAutoPlay(false); // Don't auto-play the first word

    // Initialize session tracking and start practice session
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
      setUsedWords([smartWords[randomIndex]]);
      // Start timer for the first word
      setTimeout(() => startTimer(), 500); // Small delay to let the word load
    }
  };
  const nextWord = () => {
    const word = getRandomWord();
    if (word) {
      setCurrentWord(word);
      setUsedWords((prev) => [...prev, word]);
      setShouldAutoPlay(true); // Enable auto-play for the new word
      // Start timer for the new word
      setTimeout(() => startTimer(), 500); // Small delay to let the word load
    }
    setUserInput("");
    setFeedback("");
    setShowAnswer(false);
  };
  const checkSpelling = () => {
    // Stop the timer
    stopTimer();

    const isCorrect =
      userInput.toLowerCase().trim() === currentWord.toLowerCase();
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
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userInput.trim() && !feedback) {
      checkSpelling();
    }
  };

  const resetGame = () => {
    // Stop and cleanup timer
    stopTimer();

    // Save progress if there was any practice
    if (stats.total > 0) {
      const finalSessionData = {
        ...sessionData,
        endTime: new Date(),
      };

      ProgressManager.recordPracticeSession({
        mode: mode as 'random' | 'alphabet',
        alphabet: mode === 'alphabet' ? selectedAlphabet : undefined,
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
    setUserInput("");
    setFeedback("");
    setStats({ correct: 0, incorrect: 0, total: 0 });
    setUsedWords([]);
    setShowAnswer(false);
    setMode(null);
    setShouldAutoPlay(false);
    setTimeLeft(30);
    setIsTimerActive(false);
  };
  useEffect(() => {
    if (gameComplete) {
      // Stop timer when game completes
      stopTimer();

      setFeedback(
        `Practice Complete! Final Score: ${stats.correct}/${stats.total} (${Math.round((stats.correct / stats.total) * 100)}%)`,
      );

      // Save progress when game is complete
      const finalSessionData = {
        ...sessionData,
        endTime: new Date(),
      };

      ProgressManager.recordPracticeSession({
        mode: mode as 'random' | 'alphabet',
        alphabet: mode === 'alphabet' ? selectedAlphabet : undefined,
        wordsAttempted: stats.total,
        correctAnswers: stats.correct,
        startTime: finalSessionData.startTime,
        endTime: finalSessionData.endTime,
        wordsCorrect: finalSessionData.wordsCorrect,
        wordsIncorrect: finalSessionData.wordsIncorrect,
      });
    }
  }, [gameComplete, stats, sessionData, mode, selectedAlphabet]);
  if (isGameActive) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <div className="container mx-auto px-4 py-6 md:py-12 max-w-4xl">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-slate-200 p-4 md:p-8">
            {/* Game Header */}
            <div className="flex justify-between items-start md:items-center mb-6 md:mb-8">
              <div className="flex items-start md:items-center space-x-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                  {mode === "random" ? (
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl font-bold text-slate-800">
                    {mode === "random"
                      ? "Random Practice"
                      : `Letter "${selectedAlphabet}" Practice`}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-600">
                    {availableWords.length} words available
                  </p>
                  {availableWords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(() => {
                        const currentProgress = ProgressManager.loadProgress();
                        const difficult = availableWords.filter(w => currentProgress.difficultWords.includes(w)).length;
                        const learned = availableWords.filter(w => currentProgress.wordsLearned.includes(w)).length;
                        const newWords = availableWords.length - difficult - learned;

                        return (
                          <>
                            {newWords > 0 && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {newWords} new
                              </span>
                            )}
                            {difficult > 0 && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                {difficult} difficult
                              </span>
                            )}
                            {learned > 0 && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                {learned} review
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={resetGame}
                className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg md:rounded-xl transition-all"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
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
                <span className="text-sm md:text-base">Exit</span>
              </button>
            </div>
            {/* Progress Stats */}
            <div className="bg-blue-50 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border border-blue-100">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 md:mb-4">
                <h3 className="font-semibold text-slate-800 mb-2 sm:mb-0">
                  Your Progress
                </h3>
                <span className="text-sm text-slate-600">
                  {stats.total > 0
                    ? Math.round((stats.correct / stats.total) * 100)
                    : 0}
                  % Accuracy
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-slate-700">
                    Words: {stats.total}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-slate-700">
                    Correct: {stats.correct}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-slate-700">
                    Incorrect: {stats.incorrect}
                  </span>
                </div>
              </div>
              <div className="mt-3 md:mt-4">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.total > 0 ? (stats.correct / stats.total) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
            {!gameComplete ? (
              <div className="text-center space-y-6 md:space-y-8">
                {/* Word Category Indicator */}
                {currentWord && (
                  <div className="flex justify-center">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getWordCategory(currentWord).color}`}>
                      {getWordCategory(currentWord).label}
                    </div>
                  </div>
                )}

                {/* Timer Display */}
                {isTimerActive && !feedback && (
                  <div className="flex justify-center">
                    <div className={`inline-flex items-center px-4 py-2 rounded-xl text-lg font-bold border-2 transition-all ${timeLeft <= 10
                        ? 'text-red-600 bg-red-50 border-red-200 animate-pulse'
                        : timeLeft <= 20
                          ? 'text-yellow-600 bg-yellow-50 border-yellow-200'
                          : 'text-blue-600 bg-blue-50 border-blue-200'
                      }`}>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {timeLeft}s
                    </div>
                  </div>
                )}

                {/* Audio Button */}
                <div className="space-y-3 md:space-y-4">
                  <AudioButton
                    word={currentWord}
                    size="lg"
                    variant="primary"
                    className="group font-bold py-3 px-6 md:py-4 md:px-8 rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl focus:ring-4 focus:ring-blue-100 w-auto h-auto"
                  >
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <svg
                        className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                      </svg>
                      <span className="text-sm md:text-base">Hear Word</span>
                    </div>
                  </AudioButton>
                  {showAnswer && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl md:rounded-2xl p-3 md:p-4">
                      <p className="text-xs md:text-sm text-yellow-800 mb-2">
                        Correct Spelling:
                      </p>
                      <div className="text-xl md:text-2xl font-bold text-yellow-900 tracking-wider">
                        {currentWord}
                      </div>
                    </div>
                  )}
                </div>
                {/* Input Field */}
                <div className="space-y-3 md:space-y-4">
                  <input
                    ref={answerRef}
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type the spelling here..."
                    className="w-full p-4 md:p-6 text-lg md:text-xl text-center border-2 border-slate-200 rounded-xl md:rounded-2xl focus:border-blue-500 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50"
                    disabled={!!feedback}
                    autoFocus
                  />
                  {!feedback && userInput.trim() && (
                    <button
                      onClick={checkSpelling}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
                      disabled={!!feedback || !userInput.trim()}
                    >
                      Submit Answer
                    </button>
                  )}
                </div>
                {feedback ? (
                  <div
                    className={`p-4 md:p-6 rounded-xl md:rounded-2xl border-2 ${feedback.includes("Correct")
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                      }`}
                  >
                    <div className="flex items-center justify-center space-x-3 mb-2">
                      <div
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${feedback.includes("Correct") ? "bg-green-500" : "bg-red-500"
                          }`}
                      >
                        <span className="text-white text-lg md:text-xl">
                          {feedback.includes("Correct") ? "✓" : "✗"}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`text-base md:text-lg font-semibold ${feedback.includes("Correct") ? "text-green-800" : "text-red-800"
                        }`}
                    >
                      {feedback}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={checkSpelling}
                    disabled={!userInput.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold py-3 px-6 md:py-4 md:px-10 rounded-xl md:rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed active:scale-95"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm md:text-base">Check Spelling</span>
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4"
                        />
                      </svg>
                    </div>
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center space-y-6 md:space-y-8">
                <div className="bg-yellow-50 rounded-2xl md:rounded-3xl p-4 md:p-8 border-2 border-yellow-200">
                  <div className="text-4xl md:text-6xl mb-3 md:mb-4">🎉</div>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3 md:mb-4">
                    Excellent Work!
                  </h3>
                  <div className="text-lg md:text-xl text-slate-700 mb-4 md:mb-6">
                    {feedback}
                  </div>
                  <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
                    <div className="bg-white/50 rounded-xl md:rounded-2xl p-3 md:p-4">
                      <div className="text-lg md:text-2xl font-bold text-blue-600">
                        {stats.total}
                      </div>
                      <div className="text-xs md:text-sm text-slate-600">
                        Words Practiced
                      </div>
                    </div>
                    <div className="bg-white/50 rounded-xl md:rounded-2xl p-3 md:p-4">
                      <div className="text-lg md:text-2xl font-bold text-green-600">
                        {stats.correct}
                      </div>
                      <div className="text-xs md:text-sm text-slate-600">Correct</div>
                    </div>
                    <div className="bg-white/50 rounded-xl md:rounded-2xl p-3 md:p-4">
                      <div className="text-lg md:text-2xl font-bold text-blue-600">
                        {stats.total > 0
                          ? Math.round((stats.correct / stats.total) * 100)
                          : 0}
                        %
                      </div>
                      <div className="text-xs md:text-sm text-slate-600">
                        Accuracy
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                  <button
                    onClick={() => startPractice(mode!, selectedAlphabet)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 md:px-8 rounded-xl md:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-100 active:scale-95"
                  >
                    Practice Again
                  </button>
                  <Link
                    href="/"
                    className="bg-slate-200 text-slate-700 font-bold py-3 px-6 md:px-8 rounded-xl md:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center"
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
            Practice Spelling
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto px-4">
            Choose your practice mode: random words or focus on specific
            letters
          </p>
        </div>
        {/* Practice Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Random Practice */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-slate-200 p-6 md:p-8">
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 mx-auto">
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-3 md:mb-4">
                Random Practice
              </h2>
              <p className="text-sm md:text-base text-slate-600 mb-6 md:mb-8">
                Practice with randomly selected words from the entire word list.
                Great for comprehensive review!
              </p>
              <button
                onClick={() => startPractice("random")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 md:py-4 md:px-8 rounded-xl md:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-100 active:scale-95"
              >
                Start Random Practice
              </button>
            </div>
          </div>
          {/* Alphabet Practice */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-slate-200 p-6 md:p-8">
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 mx-auto">
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
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-3 md:mb-4">
                Alphabet Practice
              </h2>
              <p className="text-sm md:text-base text-slate-600 mb-6 md:mb-8">
                Focus on words starting with specific letters. Perfect for
                targeted practice!
              </p>
              <div className="space-y-3 md:space-y-4">
                <select
                  value={selectedAlphabet}
                  onChange={(e) => setSelectedAlphabet(e.target.value)}
                  className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 bg-white text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                >
                  {" "}
                  <option value="">Choose a letter...</option>{" "}
                  {alphabetOptions.map(({ letter, count }) => (
                    <option key={letter} value={letter}>
                      {" "}
                      {letter} ({count} words){" "}
                    </option>
                  ))}{" "}
                </select>{" "}
                <button
                  onClick={() => startPractice("alphabet", selectedAlphabet)}
                  disabled={!selectedAlphabet}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed"
                >
                  {" "}
                  Start Alphabet Practice{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Alphabet Grid */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-slate-200 p-4 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 md:mb-6">
            Quick Alphabet Access
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-13 gap-2 md:gap-3">
            {alphabetOptions.map(({ letter, count }) => (
              <button
                key={letter}
                onClick={() => startPractice("alphabet", letter)}
                className="group bg-blue-50 rounded-lg md:rounded-xl p-2 md:p-4 text-center hover:shadow-md transition-all duration-200 hover:scale-105 border border-blue-100 hover:bg-blue-100 active:scale-95"
              >
                <div className="text-lg md:text-2xl font-bold text-blue-600 mb-1">
                  {letter}
                </div>
                <div className="text-xs md:text-sm text-slate-600">{count} words</div>
              </button>
            ))}{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}

export default function Practice() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-white">Loading...</div>}>
      <PracticeComponent />
    </Suspense>
  );
}
