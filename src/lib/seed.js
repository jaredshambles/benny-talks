import { supabase } from './supabase'
import { DEFAULT_CARDS, DEFAULT_ROUTINES, DEFAULT_ROUTINE_STEPS, DEFAULT_PRESETS, DEFAULT_PRESET_CARDS } from './defaultData'

// Check for a known stable default card rather than total count, so a custom
// card added before seeding completes doesn't trick this into skipping defaults.
export async function seedIfEmpty() {
  try {
    const { data: probe } = await supabase
      .from('cards')
      .select('id')
      .eq('id', 'food-nuggets')
      .maybeSingle()

    if (probe) return // defaults already seeded

    await supabase.from('cards').upsert(DEFAULT_CARDS, { onConflict: 'id' })
    await supabase.from('routines').upsert(DEFAULT_ROUTINES, { onConflict: 'id' })
    const allSteps = Object.entries(DEFAULT_ROUTINE_STEPS).flatMap(([routineId, steps]) =>
      steps.map((s, i) => ({ ...s, id: `${routineId}-step-${i}`, routine_id: routineId }))
    )
    await supabase.from('routine_steps').upsert(allSteps, { onConflict: 'id' })
    await supabase.from('presets').upsert(DEFAULT_PRESETS, { onConflict: 'id' })
    const allPresetCards = Object.entries(DEFAULT_PRESET_CARDS).flatMap(([presetId, cardIds]) =>
      cardIds.map((cardId, i) => ({ preset_id: presetId, card_id: cardId, sort_order: i }))
    )
    await supabase.from('preset_cards').upsert(allPresetCards, { onConflict: 'preset_id,card_id' })
  } catch {
    // offline or Supabase error — keep localStorage defaults
  }
}
