// Lightweight Browser SpeechSynthesis Helper for Accessibility
export function speakText(text, lang = 'en') {
  if (!('speechSynthesis' in window)) {
    alert('Text-to-speech is not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  if (!text) return;

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set language
  if (lang === 'hi') {
    utterance.lang = 'hi-IN';
  } else if (lang === 'mr') {
    utterance.lang = 'mr-IN';
  } else if (lang === 'ta') {
    utterance.lang = 'ta-IN';
  } else {
    utterance.lang = 'en-IN';
  }

  utterance.rate = 0.95; // Slightly slower for better clarity
  utterance.pitch = 1.0;

  // Find a suitable voice if available
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang.startsWith(utterance.lang) || v.lang.startsWith(lang));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
