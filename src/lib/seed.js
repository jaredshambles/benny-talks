import { supabase } from './supabase'
import { DEFAULT_CARDS, DEFAULT_ROUTINES, DEFAULT_ROUTINE_STEPS, DEFAULT_PRESETS, DEFAULT_PRESET_CARDS } from './defaultData'

export async function seedIfEmpty() {
  try {
    const { count } = await supabase.from('cards').select('*', { count: 'exact', head: true })
    if (count > 0) return

    await supabase.from('cards').insert(DEFAULT_CARDS)
    await supabase.from('routines').insert(DEFAULT_ROUTINES)
    const allSteps = Object.entries(DEFAULT_ROUTINE_STEPS).flatMap(([routineId, steps]) =>
      steps.map(s => ({ ...s, routine_id: routineId }))
    )
    await supabase.from('routine_steps').insert(allSteps)
    await supabase.from('presets').insert(DEFAULT_PRESETS)
    const allPresetCards = Object.entries(DEFAULT_PRESET_CARDS).flatMap(([presetId, cardIds]) =>
      cardIds.map((cardId, i) => ({ preset_id: presetId, card_id: cardId, sort_order: i }))
    )
    await supabase.from('preset_cards').insert(allPresetCards)
  } catch {
    // offline or Supabase error — keep localStorage defaults
  }
}
