import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import AddCardForm from '../components/cards/AddCardForm'

const CAT_COLORS = {
  food:       'bg-teal-100 text-teal-700',
  activities: 'bg-orange-100 text-orange-700',
  feelings:   'bg-pink-100 text-pink-700',
  people:     'bg-blue-100 text-blue-700',
}

const ALL_CATS = ['all', 'food', 'activities', 'feelings', 'people']

async function uploadImage(file) {
  const ext = file.name.split('.').pop()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('card-images').upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from('card-images').getPublicUrl(path)
  return data.publicUrl
}

export default function CardsView() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editLabel, setEditLabel] = useState('')
  const [editEmoji, setEditEmoji] = useState('')
  const [editImgPreview, setEditImgPreview] = useState(null) // shown in row
  const [editImgFile, setEditImgFile] = useState(null)       // pending upload
  const [savingEdit, setSavingEdit] = useState(false)
  const fileInputRef = useRef(null)

  const loadCards = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('cards')
      .select('*')
      .order('is_custom', { ascending: false })
      .order('sort_order', { ascending: true })
    setCards(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { loadCards() }, [loadCards])

  async function handleDelete(id) {
    if (!confirm('Delete this card? This cannot be undone.')) return
    await supabase.from('cards').delete().eq('id', id)
    setCards(prev => prev.filter(c => c.id !== id))
  }

  function startEdit(card) {
    setEditingId(card.id)
    setEditLabel(card.label)
    setEditEmoji(card.emoji ?? '⭐')
    setEditImgPreview(card.img_url ?? null)
    setEditImgFile(null)
  }

  function handleEditFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setEditImgFile(file)
    setEditImgPreview(URL.createObjectURL(file))
  }

  async function saveEdit(id) {
    setSavingEdit(true)
    let img_url = editImgPreview // keep existing URL by default

    // If a new file was chosen, upload it
    if (editImgFile) {
      try {
        img_url = await uploadImage(editImgFile)
      } catch (err) {
        alert(`Image upload failed: ${err.message}`)
        setSavingEdit(false)
        return
      }
    }

    // If preview was explicitly cleared (user removed the image)
    if (!editImgPreview && !editImgFile) img_url = null

    await supabase.from('cards').update({
      label: editLabel.trim(),
      emoji: editEmoji,
      img_url,
    }).eq('id', id)

    setCards(prev => prev.map(c =>
      c.id === id ? { ...c, label: editLabel.trim(), emoji: editEmoji, img_url } : c
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

  const visible = filter === 'all' ? cards : cards.filter(c => c.category === filter)
  const customCount = cards.filter(c => c.is_custom).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cards</h2>
          <p className="text-slate-500 text-sm mt-0.5">{cards.length} total · {customCount} custom</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition"
        >
          {showForm ? 'Cancel' : '+ Add Card'}
        </button>
      </div>

      {showForm && (
        <AddCardForm
          onSaved={() => { setShowForm(false); loadCards() }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Category filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {ALL_CATS.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition
              ${filter === cat ? 'bg-blue-500 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-300'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading…</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Hidden file input for in-row image replacement */}
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
                <th className="text-left px-5 py-3">Category</th>
                <th className="text-left px-5 py-3">Type</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visible.map(card => (
                <tr key={card.id} className="hover:bg-slate-50 transition">

                  {/* Card cell */}
                  <td className="px-5 py-3">
                    {editingId === card.id ? (
                      <div className="flex items-center gap-3">
                        {/* Image / emoji toggle */}
                        <div className="relative group">
                          {editImgPreview
                            ? <img src={editImgPreview} alt="" className="w-10 h-10 object-cover rounded-lg border border-slate-200 cursor-pointer" onClick={() => fileInputRef.current?.click()} />
                            : <span className="text-2xl cursor-pointer" title="Upload image" onClick={() => fileInputRef.current?.click()}>{editEmoji}</span>
                          }
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center leading-none"
                            title="Upload image"
                          >
                            +
                          </button>
                        </div>

                        {editImgPreview && (
                          <button
                            type="button"
                            onClick={() => { setEditImgPreview(null); setEditImgFile(null) }}
                            className="text-xs text-slate-400 hover:text-red-500 transition"
                            title="Remove image"
                          >
                            ✕
                          </button>
                        )}

                        <input
                          value={editLabel}
                          onChange={e => setEditLabel(e.target.value)}
                          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-400 w-40"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        {card.img_url
                          ? <img src={card.img_url} alt={card.label} className="w-10 h-10 object-cover rounded-lg border border-slate-100" />
                          : <span className="text-2xl">{card.emoji}</span>
                        }
                        <span className="font-medium text-slate-700">{card.label}</span>
                      </div>
                    )}
                  </td>

                  {/* Category */}
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${CAT_COLORS[card.category] ?? 'bg-slate-100 text-slate-600'}`}>
                      {card.category}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="px-5 py-3 text-slate-400 text-xs">
                    {card.is_custom ? <span className="text-amber-600 font-semibold">Custom</span> : 'Default'}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3 text-right">
                    {editingId === card.id ? (
                      <div className="flex gap-2 justify-end items-center">
                        <button
                          onClick={() => saveEdit(card.id)}
                          disabled={savingEdit}
                          className="text-blue-500 hover:text-blue-700 font-semibold text-xs disabled:opacity-50"
                        >
                          {savingEdit ? 'Saving…' : 'Save'}
                        </button>
                        <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600 text-xs">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex gap-3 justify-end">
                        <button onClick={() => startEdit(card)} className="text-slate-400 hover:text-blue-500 transition text-xs font-medium">Edit</button>
                        {card.is_custom && (
                          <button onClick={() => handleDelete(card.id)} className="text-slate-400 hover:text-red-500 transition text-xs font-medium">Delete</button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {visible.length === 0 && (
            <div className="px-5 py-10 text-center text-slate-400 text-sm">No cards in this category.</div>
          )}
        </div>
      )}
    </div>
  )
}
