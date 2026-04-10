// Synthesized chimes via Web Audio API — no audio files needed
let ctx = null

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

function playNote(freq, startTime, duration, gainVal = 0.3) {
  const ac = getCtx()
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.frequency.value = freq
  osc.type = 'sine'
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
  osc.start(startTime)
  osc.stop(startTime + duration)
}

// Ascending 4-note C major arpeggio — timer done
export function playTimerChime() {
  const ac = getCtx()
  const t = ac.currentTime
  const notes = [523.25, 659.25, 783.99, 1046.50] // C5 E5 G5 C6
  notes.forEach((freq, i) => playNote(freq, t + i * 0.18, 0.5))
}

// Descending 2-note bell — transition chime
export function playTransitionChime() {
  const ac = getCtx()
  const t = ac.currentTime
  playNote(523.25, t, 0.6)       // C5
  playNote(392.00, t + 0.25, 0.8) // G4
}
