import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { supabase } from '../../lib/supabase'
import { DEFAULT_CARDS, DEFAULT_ROUTINES, DEFAULT_ROUTINE_STEPS, DEFAULT_PRESETS, DEFAULT_PRESET_CARDS } from '../../lib/defaultData'
import AddCard from './AddCard'

export default function SettingsModal() {
  const {
    settingsOpen, closeSettings, settings, updateSettings,
    presets, cards, updatePresetCards, presetCards,
  } = useStore()
  const [view, setView] = useState('main')
  const [editPreset, setEditPreset] = useState(null)
  const [stats, setStats] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState(settings.webhookUrl ?? '')

  useEffect(() => {
    if (settingsOpen) fetchStats()
  }, [settingsOpen])

  async function fetchStats() {
    try {
      const { data } = await supabase
        .from('tap_log')
        .select('card_label, created_at')
        .eq('event_type', 'card_tap')
        .order('created_at', { ascending: false })
        .limit(200)
      if (!data) return
      const today = new Date().toDateString()
      const todayTaps = data.filter(r => new Date(r.created_at).toDateString() === today).length
      const counts = {}
      data.forEach(r => { counts[r.card_label] = (counts[r.card_label] ?? 0) + 1 })
      const topWord = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
      setStats({ total: data.length, todayTaps, topWord, recent: data.slice(0, 8) })
    } catch {}
  }

  async function handleExportCSV() {
    try {
      const { data } = await supabase.from('tap_log').select('*').order('created_at', { ascending: false })
      if (!data?.length) return
      const headers = Object.keys(data[0]).join(',')
      const rows = data.map(r => Object.values(r).map(v => JSON.stringify(v ?? '')).join(','))
      const csv = [headers, ...rows].join('\n')
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
      const a = document.createElement('a')
      a.href = url; a.download = 'benny-talks-export.csv'; a.click()
      URL.revokeObjectURL(url)
    } catch {}
  }

  function handleClearData() {
    if (!confirmClear) { setConfirmClear(true); return }
    useStore.setState({
      cards: DEFAULT_CARDS, presets: DEFAULT_PRESETS,
      presetCards: DEFAULT_PRESET_CARDS, routines: DEFAULT_ROUTINES,
      routineSteps: DEFAULT_ROUTINE_STEPS, activePresetId: 'preset-home',
    })
    localStorage.removeItem('benny-talks-store')
    setConfirmClear(false)
  }

  function getTitle() {
    if (view === 'addCard') return 'Add a Card'
    if (view === 'browseCards') return 'Browse Cards'
    if (view === 'editPreset') return editPreset?.label ?? 'Edit Preset'
    return 'Settings'
  }

  function handleClose() { setView('main'); setConfirmClear(false); closeSettings() }

  return (
    <AnimatePresence>
      {settingsOpen && (
        <motion.div
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          className="absolute inset-0 bg-bg z-50 flex flex-col overflow-hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 flex-shrink-0 border-b border-bg2"
            style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
          >
            <h2 className="font-display text-xl text-txt">{getTitle()}</h2>
            <button
              onTouchStart={view !== 'main' ? () => setView('main') : handleClose}
              onClick={view !== 'main' ? () => setView('main') : handleClose}
              className="w-9 h-9 rounded-btn bg-bg2 flex items-center justify-center text-txt-m font-body font-bold"
            >
              {view !== 'main' ? '←' : '✕'}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {view === 'main' && (
              <MainView
                settings={settings}
                updateSettings={updateSettings}
                presets={presets}
                stats={stats}
                webhookUrl={webhookUrl}
                setWebhookUrl={v => { setWebhookUrl(v); updateSettings({ webhookUrl: v }) }}
                confirmClear={confirmClear}
                setConfirmClear={setConfirmClear}
                onAddCard={() => setView('addCard')}
                onBrowseCards={() => setView('browseCards')}
                onEditPreset={p => { setEditPreset(p); setView('editPreset') }}
                onExportCSV={handleExportCSV}
                onClearData={handleClearData}
              />
            )}
            {view === 'addCard' && <AddCard onClose={() => setView('main')} />}
            {view === 'browseCards' && <BrowseCardsView />}
            {view === 'editPreset' && editPreset && (
              <PresetEditorView
                preset={editPreset}
                currentCardIds={presetCards[editPreset.id] ?? []}
                onUpdate={cardIds => updatePresetCards(editPreset.id, cardIds)}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MainView({ settings, updateSettings, presets, stats, webhookUrl, setWebhookUrl, confirmClear, setConfirmClear, onAddCard, onBrowseCards, onEditPreset, onExportCSV, onClearData }) {
  return (
    <div className="flex flex-col gap-1 p-4">
      {/* CARDS */}
      <SectionLabel>Cards</SectionLabel>
      <SettingsRow icon="➕" label="Add a Card" onPress={onAddCard} />
      <SettingsRow icon="📋" label="Browse & Edit Cards" onPress={onBrowseCards} />

      {/* PRESETS */}
      <SectionLabel>Presets</SectionLabel>
      <div className="flex flex-col gap-1">
        {presets.map(p => (
          <SettingsRow key={p.id} icon={p.icon ?? '⭐'} label={p.label} onPress={() => onEditPreset(p)} />
        ))}
      </div>

      {/* ANALYTICS */}
      <SectionLabel>Analytics</SectionLabel>
      <div className="bg-card rounded-btn p-4">
        <label className="font-body font-bold text-sm text-txt block mb-2">Webhook URL</label>
        <input
          type="url"
          value={webhookUrl}
          onChange={e => setWebhookUrl(e.target.value)}
          placeholder="https://hooks.example.com/..."
          className="w-full bg-bg2 rounded-btn px-3 py-2 font-body text-sm text-txt placeholder:text-txt-l outline-none"
        />
      </div>

      {/* VOICE */}
      <SectionLabel>Voice</SectionLabel>
      <div className="bg-card rounded-btn p-4 flex flex-col gap-4">
        <SliderRow label="Speed" value={settings.voiceRate} min={0.5} max={1.2} step={0.05}
          onChange={v => updateSettings({ voiceRate: v })} />
        <SliderRow label="Pitch" value={settings.voicePitch} min={0.8} max={1.5} step={0.05}
          onChange={v => updateSettings({ voicePitch: v })} />
        <SliderRow
          label="Label"
          value={settings.labelDisplayMs ?? 2000}
          min={500} max={5000} step={500}
          onChange={v => updateSettings({ labelDisplayMs: v })}
          format={v => `${(v / 1000).toFixed(1)}s`}
        />
      </div>

      {/* SOUND */}
      <SectionLabel>Sound</SectionLabel>
      <div className="bg-card rounded-btn p-4 flex items-center justify-between">
        <span className="font-body font-bold text-sm text-txt">Transition Chime</span>
        <Toggle on={settings.transitionChimeEnabled}
          onToggle={() => updateSettings({ transitionChimeEnabled: !settings.transitionChimeEnabled })} />
      </div>

      {/* DATA */}
      <SectionLabel>Data</SectionLabel>
      <button
        onTouchStart={onExportCSV} onClick={onExportCSV}
        className="bg-card rounded-btn p-4 flex items-center gap-3 w-full text-left active:bg-bg2 transition-colors"
      >
        <span className="text-xl">📤</span>
        <span className="font-body font-bold text-sm text-txt flex-1">Export as CSV</span>
      </button>
      <button
        onTouchStart={onClearData} onClick={onClearData}
        className={`rounded-btn p-4 flex items-center gap-3 w-full text-left transition-colors ${confirmClear ? 'bg-feel' : 'bg-card active:bg-bg2'}`}
      >
        <span className="text-xl">🗑️</span>
        <span className={`font-body font-bold text-sm flex-1 ${confirmClear ? 'text-white' : 'text-feel'}`}>
          {confirmClear ? 'Tap again to confirm reset' : 'Clear All Data'}
        </span>
      </button>

      {/* STATS */}
      <SectionLabel>Stats</SectionLabel>
      {stats ? (
        <div className="bg-card rounded-btn p-4 flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-3">
            <StatBlock label="Today" value={stats.todayTaps} />
            <StatBlock label="All-time" value={stats.total} />
            <StatBlock label="Top word" value={stats.topWord} small />
          </div>
          {stats.recent.length > 0 && (
            <>
              <div className="h-px bg-bg2" />
              <p className="font-body font-bold text-xs text-txt-l uppercase tracking-wider">Recent taps</p>
              <div className="flex flex-wrap gap-2">
                {stats.recent.map((r, i) => (
                  <span key={i} className="bg-bg2 rounded-pill px-2.5 py-1 font-body text-xs text-txt">{r.card_label}</span>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-btn p-4 flex items-center justify-center">
          <span className="font-body text-sm text-txt-l">Loading stats…</span>
        </div>
      )}

      <p className="text-center font-body text-xs text-txt-l pt-6 pb-2">Benny Talks v1.0.0</p>
    </div>
  )
}

const BROWSE_EMOJIS = ['⭐','🌟','❤️','🎈','🎁','🏆','🌈','🦁','🐯','🐻','🦊','🐸','🍎','🍦','🍰','🎮','📱','🎸','⚽','🚀','🔥','🌺','🌊','🍕','🎀','🚂','✈️','🏠','🐕','🐱']

function BrowseCardsView() {
  const { cards, updateCard, deleteCard } = useStore()
  const [expandedId, setExpandedId] = useState(null)
  const [editLabel, setEditLabel]   = useState('')
  const [editEmoji, setEditEmoji]   = useState('')
  const [saving, setSaving]         = useState(false)

  const categories = ['food', 'activities', 'feelings', 'people', 'custom']

  function openEdit(card) {
    setExpandedId(card.id)
    setEditLabel(card.label)
    setEditEmoji(card.emoji ?? '⭐')
    setSaving(false)
  }

  function closeEdit() {
    setExpandedId(null)
  }

  async function handleSave(card) {
    if (!editLabel.trim() || saving) return
    setSaving(true)
    await updateCard(card.id, { label: editLabel.trim(), emoji: editEmoji })
    setSaving(false)
    setExpandedId(null)
  }

  async function handleDelete(id) {
    await deleteCard(id)
    setExpandedId(null)
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      {categories.map(cat => {
        const catCards = cards.filter(c => c.category === cat)
        if (!catCards.length) return null
        return (
          <div key={cat}>
            <p className="font-body font-bold text-xs text-txt-l uppercase tracking-wider px-1 pb-2 capitalize">
              {cat}
            </p>
            <div className="flex flex-col gap-1">
              {catCards.map(card => (
                <div key={card.id}>
                  {/* Card row — always visible */}
                  <button
                    onTouchStart={() => expandedId === card.id ? closeEdit() : openEdit(card)}
                    onClick={() => expandedId === card.id ? closeEdit() : openEdit(card)}
                    className={`w-full bg-card rounded-btn px-4 py-3 flex items-center gap-3 text-left transition-colors
                      ${expandedId === card.id ? 'bg-act-l rounded-b-none' : 'active:bg-bg2'}`}
                  >
                    {card.img_url
                      ? <img src={card.img_url} alt={card.label} className="w-8 h-8 object-cover rounded-lg flex-shrink-0" />
                      : <span className="text-2xl flex-shrink-0">{card.emoji}</span>
                    }
                    <span className="font-body font-bold text-sm text-txt flex-1">{card.label}</span>
                    {card.is_custom && (
                      <span className="font-body text-xs text-txt-l bg-bg2 rounded-pill px-2 py-0.5 flex-shrink-0">custom</span>
                    )}
                    <span className="text-txt-l text-sm flex-shrink-0">
                      {expandedId === card.id ? '∧' : '›'}
                    </span>
                  </button>

                  {/* Inline edit panel */}
                  {expandedId === card.id && (
                    <div className="bg-act-l border-t border-act/20 rounded-b-btn px-4 pt-3 pb-4 flex flex-col gap-3">
                      {/* Emoji picker */}
                      <div>
                        <p className="font-body font-bold text-xs text-txt-m uppercase tracking-wide mb-2">Emoji</p>
                        <div className="flex flex-wrap gap-1.5">
                          {BROWSE_EMOJIS.map(e => (
                            <button
                              key={e}
                              onTouchStart={() => setEditEmoji(e)}
                              onClick={() => setEditEmoji(e)}
                              className={`text-xl p-1.5 rounded-lg border-2 transition-colors
                                ${editEmoji === e ? 'border-act bg-white' : 'border-transparent bg-white/50'}`}
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Label */}
                      <div>
                        <p className="font-body font-bold text-xs text-txt-m uppercase tracking-wide mb-2">Label</p>
                        <input
                          value={editLabel}
                          onChange={e => setEditLabel(e.target.value)}
                          className="w-full bg-white border border-bg2 rounded-btn px-3 py-2.5 font-body text-txt text-base outline-none focus:border-act"
                          autoFocus
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onTouchStart={() => handleSave(card)}
                          onClick={() => handleSave(card)}
                          disabled={!editLabel.trim() || saving}
                          className="flex-1 py-3 rounded-btn bg-act text-white font-display text-base shadow-btn
                                     disabled:opacity-50 active:scale-[0.97] transition-transform duration-150"
                        >
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          onTouchStart={closeEdit}
                          onClick={closeEdit}
                          className="px-4 py-3 rounded-btn bg-white text-txt-m font-body font-bold text-sm"
                        >
                          Cancel
                        </button>
                        {card.is_custom && (
                          <button
                            onTouchStart={() => handleDelete(card.id)}
                            onClick={() => handleDelete(card.id)}
                            className="px-4 py-3 rounded-btn bg-feel text-white font-body font-bold text-sm
                                       active:scale-[0.97] transition-transform duration-150"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PresetEditorView({ preset, currentCardIds, onUpdate }) {
  const { cards } = useStore()
  const [selected, setSelected] = useState(new Set(currentCardIds))

  function toggle(cardId) {
    const next = new Set(selected)
    next.has(cardId) ? next.delete(cardId) : next.add(cardId)
    setSelected(next)
    onUpdate([...next])
  }

  return (
    <div className="p-4">
      <p className="font-body text-sm text-txt-m mb-4">Tap cards to include or exclude from <strong>{preset.label}</strong>.</p>
      <div className="grid grid-cols-3 gap-2">
        {cards.map(card => {
          const on = selected.has(card.id)
          return (
            <button
              key={card.id}
              onTouchStart={() => toggle(card.id)}
              onClick={() => toggle(card.id)}
              className={`rounded-btn p-3 flex flex-col items-center gap-1 border-2 transition-colors
                ${on ? 'bg-act-l border-act' : 'bg-card border-transparent'}`}
            >
              <span className="text-2xl">{card.emoji}</span>
              <span className="font-body text-xs text-txt text-center leading-tight">{card.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StatBlock({ label, value, small }) {
  return (
    <div className="flex flex-col items-center bg-bg2 rounded-btn py-3 px-1">
      <span className={`font-display text-txt ${small ? 'text-lg' : 'text-2xl'}`}>{value}</span>
      <span className="font-body text-xs text-txt-l">{label}</span>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="font-body font-bold text-xs text-txt-l uppercase tracking-wider px-2 pb-1 pt-4 first:pt-2">
      {children}
    </p>
  )
}

function SettingsRow({ icon, label, onPress }) {
  return (
    <button
      onTouchStart={onPress} onClick={onPress}
      className="bg-card rounded-btn p-4 flex items-center gap-3 w-full text-left active:bg-bg2 transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <span className="font-body font-bold text-sm text-txt flex-1">{label}</span>
      <span className="text-txt-l text-sm">›</span>
    </button>
  )
}

function SliderRow({ label, value, min, max, step, onChange, format }) {
  const display = format ? format(value) : value.toFixed(2)
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-body font-bold text-sm text-txt w-12">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))} className="flex-1" />
      <span className="font-body text-xs text-txt-m w-8 text-right">{display}</span>
    </div>
  )
}

function Toggle({ on, onToggle }) {
  return (
    <button
      onTouchStart={onToggle} onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-colors relative ${on ? 'bg-food' : 'bg-bg2'}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${on ? 'left-[26px]' : 'left-0.5'}`} />
    </button>
  )
}
