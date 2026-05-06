// Voice priority for iOS/macOS: Samantha > Nicky > Monica > Karen > Daniel > fallback
const VOICE_PRIORITY = ['Samantha', 'Nicky', 'Monica', 'Karen', 'Daniel', 'Moira']

let selectedVoice = null

function loadVoice() {
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return
  for (const name of VOICE_PRIORITY) {
    const match = voices.find(v => v.name === name)
    if (match) { selectedVoice = match; return }
  }
  selectedVoice = voices[0] ?? null
}

// Voices load asynchronously on some browsers
if (typeof window !== 'undefined') {
  loadVoice()
  window.speechSynthesis.onvoiceschanged = loadVoice
}

export function speak(text, { rate = 0.80, pitch = 1.10 } = {}) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  if (selectedVoice) utt.voice = selectedVoice
  utt.rate = rate
  utt.pitch = pitch
  // resume() unsticks iOS Safari from the paused state that cancel() leaves behind
  window.speechSynthesis.resume()
  window.speechSynthesis.speak(utt)
  return utt
}
