import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { speak } from '../lib/speech'
import { playTimerChime } from '../lib/sounds'
import { DEFAULT_CARDS, DEFAULT_ROUTINES, DEFAULT_ROUTINE_STEPS, DEFAULT_PRESETS, DEFAULT_PRESET_CARDS } from '../lib/defaultData'

let speakingTimer = null

export const useStore = create(
  persist(
    (set, get) => ({
      // ── DATA ──
      cards: DEFAULT_CARDS,
      presets: DEFAULT_PRESETS,
      presetCards: DEFAULT_PRESET_CARDS,
      routines: DEFAULT_ROUTINES,
      routineSteps: DEFAULT_ROUTINE_STEPS,

      // ── UI ──
      activeTab: 'home',
      activePresetId: 'preset-home',
      speaking: null,
      settingsOpen: false,
      presetSwitcherOpen: false,

      // ── ROUTINE ──
      routineActive: null,
      routineStepIndex: 0,

      // ── TIMER ──
      timer: {
        running: false,
        paused: false,
        totalSecs: 0,
        remainingSecs: 0,
        label: null,
        intervalId: null,
      },

      // ── SETTINGS ──
      settings: {
        voiceRate: 0.80,
        voicePitch: 1.10,
        transitionChimeEnabled: true,
      },

      // ── ACTIONS ──

      setActiveTab: (tab) => set({ activeTab: tab }),

      tapCard: (card) => {
        const { settings } = get()
        speak(card.label, { rate: settings.voiceRate, pitch: settings.voicePitch })
        set({ speaking: { label: card.label, emoji: card.emoji } })
        if (speakingTimer) clearTimeout(speakingTimer)
        speakingTimer = setTimeout(() => set({ speaking: null }), 2800)

        // Fire-and-forget tap log
        supabase.from('tap_log').insert({
          event_type: 'card_tap',
          card_id: card.id,
          card_label: card.label,
          card_emoji: card.emoji,
          category: card.category,
          is_custom: card.is_custom ?? false,
          preset_id: get().activePresetId,
          preset_label: get().presets.find(p => p.id === get().activePresetId)?.label ?? null,
        }).then(() => {})
      },

      setSpeaking: (speaking) => set({ speaking }),

      setActivePreset: (presetId) => set({ activePresetId: presetId, presetSwitcherOpen: false }),

      openPresetSwitcher: () => set({ presetSwitcherOpen: true }),
      closePresetSwitcher: () => set({ presetSwitcherOpen: false }),

      openSettings: () => set({ settingsOpen: true }),
      closeSettings: () => set({ settingsOpen: false }),

      updateSettings: (partial) => set(s => ({ settings: { ...s.settings, ...partial } })),

      addCard: async (cardData) => {
        const card = {
          ...cardData,
          is_custom: true,
          sort_order: get().cards.filter(c => c.category === cardData.category).length,
        }
        const { data, error } = await supabase.from('cards').insert(card).select().single()
        if (!error && data) {
          set(s => ({ cards: [...s.cards, data] }))
        }
      },

      // ── TIMER ──

      startTimer: (secs, label = null) => {
        const { timer } = get()
        if (timer.intervalId) clearInterval(timer.intervalId)

        const intervalId = setInterval(() => {
          const { timer } = get()
          if (timer.paused) return
          if (timer.remainingSecs <= 1) {
            clearInterval(timer.intervalId)
            playTimerChime()
            set({ timer: { running: false, paused: false, totalSecs: 0, remainingSecs: 0, label: null, intervalId: null } })
            return
          }
          set(s => ({ timer: { ...s.timer, remainingSecs: s.timer.remainingSecs - 1 } }))
        }, 1000)

        set({ timer: { running: true, paused: false, totalSecs: secs, remainingSecs: secs, label, intervalId } })
      },

      pauseTimer: () => set(s => ({ timer: { ...s.timer, paused: !s.timer.paused } })),

      cancelTimer: () => {
        const { timer } = get()
        if (timer.intervalId) clearInterval(timer.intervalId)
        set({ timer: { running: false, paused: false, totalSecs: 0, remainingSecs: 0, label: null, intervalId: null } })
      },

      // ── ROUTINES ──

      startRoutine: (routine) => {
        set({ routineActive: routine, routineStepIndex: 0 })
      },

      nextStep: () => {
        const { routineActive, routineStepIndex, routineSteps } = get()
        if (!routineActive) return
        const steps = routineSteps[routineActive.id] ?? []
        get().cancelTimer()
        if (routineStepIndex >= steps.length - 1) {
          get().completeRoutine()
        } else {
          set(s => ({ routineStepIndex: s.routineStepIndex + 1 }))
        }
      },

      completeRoutine: () => {
        const { routineActive } = get()
        supabase.from('tap_log').insert({
          event_type: 'routine_complete',
          routine_name: routineActive?.label ?? null,
        }).then(() => {})
        set({ routineActive: null, routineStepIndex: 0 })
      },

      closeRoutine: () => {
        get().cancelTimer()
        set({ routineActive: null, routineStepIndex: 0 })
      },

      // ── HYDRATE (background Supabase sync) ──

      hydrate: async () => {
        let cardsRes, routinesRes, stepsRes, presetsRes, presetCardsRes
        try {
          ;[cardsRes, routinesRes, stepsRes, presetsRes, presetCardsRes] = await Promise.all([
            supabase.from('cards').select('*').order('sort_order'),
            supabase.from('routines').select('*').order('sort_order'),
            supabase.from('routine_steps').select('*').order('sort_order'),
            supabase.from('presets').select('*').order('sort_order'),
            supabase.from('preset_cards').select('*').order('sort_order'),
          ])
        } catch {
          return // offline or network error — keep defaults
        }

        const updates = {}
        if (cardsRes.data?.length)    updates.cards = cardsRes.data
        if (routinesRes.data?.length) updates.routines = routinesRes.data
        if (stepsRes.data?.length) {
          const stepMap = {}
          stepsRes.data.forEach(s => {
            if (!stepMap[s.routine_id]) stepMap[s.routine_id] = []
            stepMap[s.routine_id].push(s)
          })
          updates.routineSteps = stepMap
        }
        if (presetsRes.data?.length) updates.presets = presetsRes.data
        if (presetCardsRes.data?.length) {
          const pcMap = {}
          presetCardsRes.data.forEach(pc => {
            if (!pcMap[pc.preset_id]) pcMap[pc.preset_id] = []
            pcMap[pc.preset_id].push(pc.card_id)
          })
          updates.presetCards = pcMap
        }

        if (Object.keys(updates).length) set(updates)
      },
    }),
    {
      name: 'benny-talks-store',
      // Don't persist timer interval IDs or open modal state
      partialize: (s) => ({
        cards: s.cards,
        presets: s.presets,
        presetCards: s.presetCards,
        routines: s.routines,
        routineSteps: s.routineSteps,
        activePresetId: s.activePresetId,
        settings: s.settings,
      }),
    }
  )
)
