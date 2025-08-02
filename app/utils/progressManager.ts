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
  sessionHistory: SessionRecord[];
  streakStartDate: string;
  totalWordsAttempted: number;
  totalCorrectAnswers: number;
}

interface SessionRecord {
  date: string;
  mode: 'random' | 'alphabet';
  alphabet?: string;
  wordsAttempted: number;
  correctAnswers: number;
  accuracy: number;
  duration: number; // in minutes
  wordsLearned: string[];
  difficultWordsEncountered: string[];
}

export class ProgressManager {
  private static readonly STORAGE_KEY = 'spellsan-progress';
  private static readonly STORAGE_VERSION = '1.0';

  private static getDefaultStats(): ProgressStats {
    return {
      totalWords: 0,
      practiceToday: 0,
      accuracy: 0,
      streak: 0,
      totalPracticeSessions: 0,
      averageAccuracy: 0,
      lastPracticeDate: '',
      wordsLearned: [],
      difficultWords: [],
      sessionHistory: [],
      streakStartDate: '',
      totalWordsAttempted: 0,
      totalCorrectAnswers: 0,
    };
  }

  static loadProgress(): ProgressStats {
    if (typeof window === 'undefined') {
      return this.getDefaultStats();
    }

    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (!saved) {
        return this.getDefaultStats();
      }

      const data = JSON.parse(saved);
      
      // Handle version migrations if needed
      const stats = { ...this.getDefaultStats(), ...data };
      
      // Calculate today's practice count
      const today = new Date().toDateString();
      stats.practiceToday = stats.sessionHistory.filter(
        (session: SessionRecord) => new Date(session.date).toDateString() === today
      ).length;

      return stats;
    } catch (error) {
      console.error('Error loading progress:', error);
      return this.getDefaultStats();
    }
  }

  static saveProgress(stats: ProgressStats): void {
    if (typeof window === 'undefined') return;

    try {
      const dataToSave = {
        ...stats,
        version: this.STORAGE_VERSION,
        lastSaved: new Date().toISOString(),
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('progressUpdated', { 
        detail: stats 
      }));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  static getSmartWordSelection(
    allWords: string[], 
    mode: 'random' | 'alphabet', 
    alphabet?: string
  ): string[] {
    if (typeof window === 'undefined') return allWords;

    try {
      const stats = this.loadProgress();
      
      // Filter words by alphabet if needed
      let baseWords = allWords;
      if (mode === 'alphabet' && alphabet) {
        baseWords = allWords.filter(
          word => word.charAt(0).toUpperCase() === alphabet.toUpperCase()
        );
      }

      // Categorize words
      const learnedWords = baseWords.filter(word => stats.wordsLearned.includes(word));
      const difficultWords = baseWords.filter(word => stats.difficultWords.includes(word));
      const newWords = baseWords.filter(word => 
        !stats.wordsLearned.includes(word) && !stats.difficultWords.includes(word)
      );

      // If no difficult or new words, return learned words for review (this prevents empty practice sessions)
      if (difficultWords.length === 0 && newWords.length === 0) {
        return learnedWords.length > 0 ? [...learnedWords].sort(() => Math.random() - 0.5) : baseWords;
      }

      // Priority: difficult words (60%), new words (40%)
      const practiceWords: string[] = [];
      
      // Add difficult words (high priority)
      if (difficultWords.length > 0) {
        const difficultCount = Math.max(1, Math.ceil(difficultWords.length * 0.8)); // Include most difficult words
        const shuffledDifficult = [...difficultWords].sort(() => Math.random() - 0.5);
        practiceWords.push(...shuffledDifficult.slice(0, Math.min(difficultCount, difficultWords.length)));
      }

      // Add new words (medium-high priority)
      if (newWords.length > 0) {
        const targetTotal = Math.max(20, Math.floor(baseWords.length * 0.3)); // Target practice size
        const remainingSlots = targetTotal - practiceWords.length;
        if (remainingSlots > 0) {
          const newCount = Math.min(remainingSlots, newWords.length);
          const shuffledNew = [...newWords].sort(() => Math.random() - 0.5);
          practiceWords.push(...shuffledNew.slice(0, newCount));
        }
      }

      // Add some learned words for reinforcement only if we have room and few difficult/new words
      if (practiceWords.length < 15 && learnedWords.length > 0) {
        const remainingSlots = 15 - practiceWords.length;
        const reviewCount = Math.min(remainingSlots, Math.floor(learnedWords.length * 0.1), 5);
        if (reviewCount > 0) {
          const shuffledLearned = [...learnedWords].sort(() => Math.random() - 0.5);
          practiceWords.push(...shuffledLearned.slice(0, reviewCount));
        }
      }

      // Ensure we have at least some words to practice
      if (practiceWords.length === 0) {
        return baseWords.slice(0, 20).sort(() => Math.random() - 0.5);
      }

      // Shuffle the final practice words
      return practiceWords.sort(() => Math.random() - 0.5);
    } catch (error) {
      console.error('Error getting smart word selection:', error);
      return allWords;
    }
  }

  static startPracticeSession(): void {
    if (typeof window === 'undefined') return;

    try {
      const stats = this.loadProgress();
      const today = new Date().toDateString();
      
      // Update last practice date
      stats.lastPracticeDate = new Date().toISOString();
      
      // Update today's practice count
      const todaySessions = stats.sessionHistory.filter(
        session => new Date(session.date).toDateString() === today
      );
      stats.practiceToday = todaySessions.length;
      
      // Calculate and update streak
      const mockSession = {
        date: new Date().toISOString(),
        mode: 'random' as const,
        wordsAttempted: 0,
        correctAnswers: 0,
        accuracy: 0,
        duration: 0,
        wordsLearned: [],
        difficultWordsEncountered: [],
      };
      
      const newStreak = this.calculateStreak([...stats.sessionHistory, mockSession]);
      if (newStreak > stats.streak) {
        stats.streak = newStreak;
        if (stats.streak === 1) {
          stats.streakStartDate = new Date().toISOString();
        }
      }
      
      this.saveProgress(stats);
    } catch (error) {
      console.error('Error starting practice session:', error);
    }
  }

  static updateWordProgress(word: string, isCorrect: boolean): void {
    if (typeof window === 'undefined') return;

    try {
      const stats = this.loadProgress();
      
      if (isCorrect) {
        // Add to learned words if not already there
        if (!stats.wordsLearned.includes(word)) {
          stats.wordsLearned.push(word);
        }
        // Remove from difficult words if it was there
        stats.difficultWords = stats.difficultWords.filter(w => w !== word);
      } else {
        // Add to difficult words if not already there
        if (!stats.difficultWords.includes(word)) {
          stats.difficultWords.push(word);
        }
      }

      // Update total counters
      stats.totalWordsAttempted += 1;
      if (isCorrect) {
        stats.totalCorrectAnswers += 1;
      }

      // Recalculate average accuracy
      stats.averageAccuracy = stats.totalWordsAttempted > 0 
        ? Math.round((stats.totalCorrectAnswers / stats.totalWordsAttempted) * 100)
        : 0;

      this.saveProgress(stats);
    } catch (error) {
      console.error('Error updating word progress:', error);
    }
  }

  static recordPracticeSession(sessionData: {
    mode: 'random' | 'alphabet';
    alphabet?: string;
    wordsAttempted: number;
    correctAnswers: number;
    startTime: Date;
    endTime: Date;
    wordsCorrect: string[];
    wordsIncorrect: string[];
  }): ProgressStats {
    const stats = this.loadProgress();
    const today = new Date().toDateString();
    const sessionAccuracy = sessionData.wordsAttempted > 0 
      ? Math.round((sessionData.correctAnswers / sessionData.wordsAttempted) * 100) 
      : 0;
    
    const duration = Math.round((sessionData.endTime.getTime() - sessionData.startTime.getTime()) / (1000 * 60));

    // Create session record
    const sessionRecord: SessionRecord = {
      date: new Date().toISOString(),
      mode: sessionData.mode,
      alphabet: sessionData.alphabet,
      wordsAttempted: sessionData.wordsAttempted,
      correctAnswers: sessionData.correctAnswers,
      accuracy: sessionAccuracy,
      duration: Math.max(1, duration), // At least 1 minute
      wordsLearned: sessionData.wordsCorrect,
      difficultWordsEncountered: sessionData.wordsIncorrect,
    };

    // Update stats
    const updatedStats: ProgressStats = {
      ...stats,
      totalPracticeSessions: stats.totalPracticeSessions + 1,
      totalWordsAttempted: stats.totalWordsAttempted + sessionData.wordsAttempted,
      totalCorrectAnswers: stats.totalCorrectAnswers + sessionData.correctAnswers,
      sessionHistory: [...stats.sessionHistory, sessionRecord],
      lastPracticeDate: new Date().toISOString(),
    };

    // Update words learned (only words that were spelled correctly with high confidence)
    const newWordsLearned = sessionData.wordsCorrect.filter(
      word => !updatedStats.wordsLearned.includes(word)
    );
    updatedStats.wordsLearned = [...updatedStats.wordsLearned, ...newWordsLearned];

    // Update difficult words (words that were spelled incorrectly)
    const newDifficultWords = sessionData.wordsIncorrect.filter(
      word => !updatedStats.difficultWords.includes(word)
    );
    updatedStats.difficultWords = [...updatedStats.difficultWords, ...newDifficultWords];

    // Remove words from difficult list if they were spelled correctly this session
    updatedStats.difficultWords = updatedStats.difficultWords.filter(
      word => !sessionData.wordsCorrect.includes(word)
    );

    // Calculate overall accuracy
    updatedStats.averageAccuracy = updatedStats.totalWordsAttempted > 0 
      ? Math.round((updatedStats.totalCorrectAnswers / updatedStats.totalWordsAttempted) * 100)
      : 0;

    // Update streak
    updatedStats.streak = this.calculateStreak(updatedStats.sessionHistory);
    if (updatedStats.streak === 1) {
      updatedStats.streakStartDate = new Date().toISOString();
    }

    // Update today's practice count
    updatedStats.practiceToday = updatedStats.sessionHistory.filter(
      (session: SessionRecord) => new Date(session.date).toDateString() === today
    ).length;

    this.saveProgress(updatedStats);
    return updatedStats;
  }

  private static calculateStreak(sessionHistory: SessionRecord[]): number {
    if (sessionHistory.length === 0) return 0;

    const today = new Date();
    const sortedSessions = [...sessionHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Get unique practice dates
    const uniqueDates = [...new Set(
      sortedSessions.map((session: SessionRecord) => new Date(session.date).toDateString())
    )];

    let streak = 0;
    let currentDate = new Date(today);

    for (const dateString of uniqueDates) {
      const sessionDate = new Date(dateString);
      const daysDiff = Math.floor(
        (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === streak) {
        streak++;
        currentDate = sessionDate;
      } else if (daysDiff === streak + 1 && streak === 0) {
        // Allow for today not being practiced yet, but yesterday was
        streak++;
        currentDate = sessionDate;
      } else {
        break;
      }
    }

    return streak;
  }

  static getAlphabetProgress(stats: ProgressStats, spellingWords: string[]): Array<{
    letter: string;
    totalWords: number;
    learnedWords: number;
    progress: number;
  }> {
    return Array.from({ length: 26 }, (_, i) => {
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
  }

  static resetProgress(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  }

  static exportProgress(): string {
    const stats = this.loadProgress();
    return JSON.stringify(stats, null, 2);
  }

  static importProgress(progressData: string): boolean {
    try {
      const data = JSON.parse(progressData);
      const stats = { ...this.getDefaultStats(), ...data };
      this.saveProgress(stats);
      return true;
    } catch (error) {
      console.error('Error importing progress:', error);
      return false;
    }
  }
}
