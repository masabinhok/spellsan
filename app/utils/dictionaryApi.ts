interface DictionaryDefinition {
  word: string;
  meaning: string;
  pronunciation?: string;
  partOfSpeech?: string;
  example?: string;
}

interface ApiResponse {
  word: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
    }>;
  }>;
  phonetics?: Array<{
    text?: string;
    audio?: string;
  }>;
}

class DictionaryAPI {
  private cache: Map<string, DictionaryDefinition> = new Map();
  private readonly baseUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

  async getWordMeaning(word: string): Promise<DictionaryDefinition | null> {
    // Check cache first
    const cacheKey = word.toLowerCase();
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const response = await fetch(`${this.baseUrl}${encodeURIComponent(word)}`);
      
      if (!response.ok) {
        // If API fails, return a fallback
        const fallback = this.getFallbackMeaning(word);
        this.cache.set(cacheKey, fallback);
        return fallback;
      }

      const data: ApiResponse[] = await response.json();
      
      if (data && data.length > 0) {
        const entry = data[0];
        const firstMeaning = entry.meanings[0];
        const firstDefinition = firstMeaning?.definitions[0];

        const definition: DictionaryDefinition = {
          word: entry.word,
          meaning: firstDefinition?.definition || 'Definition not available',
          partOfSpeech: firstMeaning?.partOfSpeech || '',
          example: firstDefinition?.example || '',
          pronunciation: entry.phonetics?.[0]?.text || ''
        };

        // Cache the result
        this.cache.set(cacheKey, definition);
        return definition;
      }
    } catch (error) {
      console.warn(`Failed to fetch meaning for "${word}":`, error);
    }

    // Return fallback if all else fails
    const fallback = this.getFallbackMeaning(word);
    this.cache.set(cacheKey, fallback);
    return fallback;
  }

  private getFallbackMeaning(word: string): DictionaryDefinition {
    // Simple fallbacks for common words
    const fallbacks: Record<string, string> = {
      'abode': 'A place where someone lives; a residence',
      'abruptly': 'Suddenly and unexpectedly',
      'absorb': 'To take in or soak up',
      'absurd': 'Wildly unreasonable or illogical',
      'abundance': 'A very large quantity of something',
      'accent': 'A distinctive way of pronouncing a language',
      'accessible': 'Easily reached or obtained',
      'accuracy': 'The quality of being correct or precise',
      'acquainted': 'Having knowledge of something or someone'
    };

    return {
      word: word,
      meaning: fallbacks[word.toLowerCase()] || 'A word to practice spelling',
      partOfSpeech: '',
      example: ''
    };
  }

  // Get multiple meanings at once (with rate limiting)
  async getMultipleWordMeanings(words: string[]): Promise<Map<string, DictionaryDefinition>> {
    const results = new Map<string, DictionaryDefinition>();
    
    // Process in batches to avoid rate limiting
    for (let i = 0; i < words.length; i += 5) {
      const batch = words.slice(i, i + 5);
      const batchPromises = batch.map(word => 
        this.getWordMeaning(word).then(definition => ({ word, definition }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ word, definition }) => {
        if (definition) {
          results.set(word, definition);
        }
      });
      
      // Small delay between batches to be respectful to the API
      if (i + 5 < words.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  // Clear cache if needed
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache size for debugging
  getCacheSize(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const dictionaryAPI = new DictionaryAPI();
export type { DictionaryDefinition };
