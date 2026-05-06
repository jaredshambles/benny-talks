// dashboard/src/views/SafetyGameView.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import SafetyCardForm from '../components/safety/SafetyCardForm'
import SafetyDeckManager from '../components/safety/SafetyDeckManager'

const SUB_TABS = ['Cards', 'Themes']

async function uploadImage(file) {
  const ext = file.name.split('.').pop()
  const path = `safety/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('card-images').upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from('card-images').getPublicUrl(path)
  return data.publicUrl
}

export default function SafetyGameView() {
  const [subTab, setSubTab]         = useState('Cards')
  const [cards, setCards]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)

  // Inline edit state
  const [editingId, setEditingId]       = useState(null)
  const [editLabel, setEditLabel]       = useState('')
  const [editEmoji, setEditEmoji]       = useState('')
  const [editIsSafe, setEditIsSafe]     = useState(false)
  const [editImgPreview, setEditImgPreview] = useState(null)
  const [editImgFile, setEditImgFile]   = useState(null)
  const [savingEdit, setSavingEdit]     = useState(false)
  const fileInputRef                    = useRef(null)

  const loadCards = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('safety_cards').select('*').order('sort_order')
    setCards(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { loadCards() }, [loadCards])

  async function handleDelete(id) {
    if (!confirm('Delete this card?')) return
    await supabase.from('safety_cards').delete().eq('id', id)
    setCards(prev => prev.filter(c => c.id !== id))
  }

  function startEdit(card) {
    setEditingId(card.id)
    setEditLabel(card.label)
    setEditEmoji(card.emoji ?? '⭐')
    setEditIsSafe(card.is_safe)
    setEditImgPreview(card.img_url ?? null)
    setEditImgFile(null)
  }

  function handleEditFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setEditImgFile(file)
    setEditImgPreview(URL.createObjectURL(file))
    // reset input so the same file can be re-selected after removal
    e.target.value = ''
  }

  async function saveEdit(id) {
    setSavingEdit(true)
    let img_url = editImgPreview // keep existing URL unless changed

    if (editImgFile) {
      try {
        img_url = await uploadImage(editImgFile)
      } catch (err) {
        alert(`Image upload failed: ${err.message}`)
        setSavingEdit(false)
        return
      }
    }

    // If preview was cleared without a new file, remove the image
    if (!editImgPreview && !editImgFile) img_url = null

    await supabase.from('safety_cards').update({
      label: editLabel.trim(),
      emoji: editEmoji,
      img_url,
      is_safe: editIsSafe,
    }).eq('id', id)

    setCards(prev => prev.map(c =>
      c.id === id ? { ...c, label: editLabel.trim(), emoji: editEmoji, img_url, is_safe: editIsSafe } : c
    ))
    setEditingId(null)
    setEditImgFile(null)
    setSavingEdit(false)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditImgFile(null)
    setEditImgPreview(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">🛡️ Safety Game</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage cards and themed decks</p>
        </div>
        {subTab === 'Cards' && (
          <button onClick={() => setShowForm(v => !v)}
            className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition">
            {showForm ? 'Cancel' : '+ Add Card'}
          </button>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6">
        {SUB_TABS.map(t => (
          <button key={t} onClick={() => { setSubTab(t); setShowForm(false) }}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition
              ${subTab === t ? 'bg-blue-500 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-300'}`}>
            {t}
          </button>
        ))}
      </div>

      {subTab === 'Cards' && (
        <>
          {showForm && (
            <SafetyCardForm
              onSaved={() => { setShowForm(false); loadCards() }}
              onCancel={() => setShowForm(false)}
            />
          )}

          {loading ? <div className="text-slate-400 text-sm">Loading…</div> : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Hidden file input shared across all edit rows */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleEditFileChange}
                className="hidden"
              />

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    <th className="text-left px-5 py-3">Card</th>
                    <th className="text-left px-5 py-3">Answer</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {cards.map(card => (
                    <tr key={card.id} className={`transition ${editingId === card.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>

                      {/* Card cell */}
                      <td className="px-5 py-3">
                        {editingId === card.id ? (
                          <div className="flex items-center gap-3">
                            {/* Clickable thumbnail / emoji — opens file picker */}
                            <div className="relative">
                              {editImgPreview
                                ? <img
                                    src={editImgPreview}
                                    alt=""
                                    className="w-10 h-10 object-cover rounded-lg border border-slate-200 cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Click to replace image"
                                  />
                                : <span
                                    className="text-2xl cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Click to upload image"
                                  >{editEmoji}</span>
                              }
                              {/* Upload badge */}
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center"
                                title="Upload image"
                              >📷</button>
                            </div>

                            {/* Remove image button */}
                            {editImgPreview && (
                              <button
                                type="button"
                                onClick={() => { setEditImgPreview(null); setEditImgFile(null) }}
                                className="text-xs text-slate-400 hover:text-red-500 transition"
                                title="Remove image"
                              >✕ remove</button>
                            )}

                            {/* Label input */}
                            <input
                              value={editLabel}
                              onChange={e => setEditLabel(e.target.value)}
                              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-400 w-36"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            {card.img_url
                              ? <img src={card.img_url} alt={card.label} className="w-10 h-10 object-cover rounded-lg border border-slate-100" />
                              : <span className="text-2xl">{card.emoji}</span>}
                            <span className="font-medium text-slate-700">{card.label}</span>
                          </div>
                        )}
                      </td>

                      {/* Answer cell */}
                      <td className="px-5 py-3">
                        {editingId === card.id ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEditIsSafe(true)}
                              className={`px-3 py-1 rounded-lg border text-xs font-semibold transition
                                ${editIsSafe ? 'border-green-400 bg-green-50 text-green-700' : 'border-slate-200 text-slate-400'}`}
                            >✅ Safe</button>
                            <button
                              type="button"
                              onClick={() => setEditIsSafe(false)}
                              className={`px-3 py-1 rounded-lg border text-xs font-semibold transition
                                ${!editIsSafe ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-200 text-slate-400'}`}
                            >🚫 Not Safe</button>
                          </div>
                        ) : (
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                            ${card.is_safe ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {card.is_safe ? '✅ Safe' : '🚫 Not Safe'}
                          </span>
                        )}
                      </td>

                      {/* Actions cell */}
                      <td className="px-5 py-3 text-right">
                        {editingId === card.id ? (
                          <div className="flex gap-2 justify-end items-center">
                            <button
                              onClick={() => saveEdit(card.id)}
                              disabled={savingEdit || !editLabel.trim()}
                              className="text-blue-500 hover:text-blue-700 font-semibold text-xs disabled:opacity-50"
                            >
                              {savingEdit ? 'Saving…' : 'Save'}
                            </button>
                            <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600 text-xs">Cancel</button>
                          </div>
                        ) : (
                          <div className="flex gap-3 justify-end">
                            <button onClick={() => startEdit(card)} className="text-slate-400 hover:text-blue-500 transition text-xs font-medium">Edit</button>
                            <button onClick={() => handleDelete(card.id)} className="text-slate-400 hover:text-red-500 transition text-xs font-medium">Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {cards.length === 0 && <div className="px-5 py-10 text-center text-slate-400 text-sm">No safety cards yet.</div>}
            </div>
          )}
        </>
      )}

      {subTab === 'Themes' && <SafetyDeckManager allCards={cards} />}
    </div>
  )
}
