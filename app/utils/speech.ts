// British English Speech Synthesis Utility

export const speakWordInBritishEnglish = (word: string): void => {
  if (!("speechSynthesis" in window)) {
    console.warn("Speech synthesis not supported in this browser");
    return;
  }

  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.7;
    utterance.lang = "en-GB";

    // Get available voices
    const voices = speechSynthesis.getVoices();

    // Try to find a British English voice
    const britishVoice = voices.find((voice) => {
      const name = voice.name.toLowerCase();
      return (
        voice.lang === "en-GB" ||
        voice.lang === "en-gb" ||
        name.includes("british") ||
        name.includes("uk") ||
        name.includes("daniel") ||
        name.includes("kate") ||
        name.includes("serena") ||
        name.includes("oliver") ||
        name.includes("emma")
      );
    });

    if (britishVoice) {
      utterance.voice = britishVoice;
      console.log(`Using British voice: ${britishVoice.name}`);
    } else {
      // Fallback to any en-GB voice
      const gbVoice = voices.find((voice) =>
        voice.lang.toLowerCase().startsWith("en-gb"),
      );
      if (gbVoice) {
        utterance.voice = gbVoice;
        console.log(`Using GB voice: ${gbVoice.name}`);
      } else {
        console.warn("No British English voice found, using default");
      }
    }

    speechSynthesis.speak(utterance);
  };

  // Voices might not be loaded initially, so we need to wait for them
  if (speechSynthesis.getVoices().length === 0) {
    speechSynthesis.addEventListener("voiceschanged", speak, { once: true });
  } else {
    speak();
  }
};

// Function to get available British English voices
export const getBritishVoices = (): SpeechSynthesisVoice[] => {
  if (!("speechSynthesis" in window)) {
    return [];
  }

  const voices = speechSynthesis.getVoices();
  return voices.filter((voice) => {
    const name = voice.name.toLowerCase();
    return (
      voice.lang === "en-GB" ||
      voice.lang === "en-gb" ||
      name.includes("british") ||
      name.includes("uk") ||
      name.includes("daniel") ||
      name.includes("kate") ||
      name.includes("serena") ||
      name.includes("oliver") ||
      name.includes("emma")
    );
  });
};
