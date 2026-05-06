import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'

const CATEGORIES = [
  { id: 'food',       label: 'Food',       emoji: '🍗' },
  { id: 'activities', label: 'Activities', emoji: '🎯' },
  { id: 'feelings',   label: 'Feelings',   emoji: '💛' },
  { id: 'people',     label: 'People',     emoji: '👥' },
]

const QUICK_EMOJIS = ['⭐','🌟','❤️','🎈','🎁','🏆','🌈','🦁','🐯','🐻','🦊','🐸','🍎','🍦','🍰','🎮','📱','🎸','⚽','🚀']

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

export default function AddCardForm({ onSaved, onCancel }) {
  const [label, setLabel] = useState('')
  const [emoji, setEmoji] = useState('⭐')
  const [category, setCategory] = useState('activities')
  const [imgFile, setImgFile] = useState(null)
  const [imgPreview, setImgPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImgFile(file)
    setImgPreview(URL.createObjectURL(file))
  }

  function clearImage() {
    setImgFile(null)
    setImgPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!label.trim() || saving) return
    setSaving(true)
    setError(null)

    let img_url = null
    if (imgFile) {
      setUploading(true)
      try {
        img_url = await uploadImage(imgFile)
      } catch (err) {
        setError(`Image upload failed: ${err.message}`)
        setSaving(false)
        setUploading(false)
        return
      }
      setUploading(false)
    }

    const { error } = await supabase.from('cards').insert({
      label: label.trim(),
      emoji,
      category,
      img_url,
      is_custom: true,
      sort_order: Date.now(),
    })

    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      onSaved()
    }
  }

  const useImage = !!imgPreview

  return (
    <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
      <h3 className="font-bold text-slate-800 text-lg mb-5">New Card</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column — label + category */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Label</label>
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Card name…"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm
                       outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
          />

          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 mt-4">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition
                  ${category === cat.id ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
              >
                <span>{cat.emoji}</span> {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right column — image or emoji */}
        <div>
          {/* Image upload */}
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Card Image <span className="normal-case font-normal text-slate-400">(optional — replaces emoji)</span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />

          {imgPreview ? (
            <div className="flex items-center gap-3 mb-4">
              <img src={imgPreview} alt="preview" className="w-16 h-16 object-cover rounded-xl border border-slate-200" />
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-blue-500 hover:text-blue-700 transition"
                >
                  Replace image
                </button>
                <button
                  type="button"
                  onClick={clearImage}
                  className="text-xs font-semibold text-slate-400 hover:text-red-500 transition"
                >
                  Remove image
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-200 rounded-xl px-4 py-5 text-sm text-slate-400
                         hover:border-blue-300 hover:text-blue-500 transition flex flex-col items-center gap-1 mb-4"
            >
              <span className="text-2xl">📷</span>
              <span className="font-semibold">Upload image</span>
              <span className="text-xs">JPG, PNG, WebP · max 5 MB</span>
            </button>
          )}

          {/* Emoji fallback — only shown when no image selected */}
          {!useImage && (
            <>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Emoji fallback
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {QUICK_EMOJIS.map(e => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`text-xl p-1.5 rounded-lg border-2 transition
                      ${emoji === e ? 'border-blue-400 bg-blue-50' : 'border-transparent hover:border-slate-200'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Preview card */}
          <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
            {imgPreview
              ? <img src={imgPreview} alt="card" className="w-12 h-12 object-cover rounded-lg" />
              : <span className="text-4xl">{emoji}</span>
            }
            <div>
              <p className="font-bold text-slate-800 text-base">{label || 'Preview'}</p>
              <p className="text-xs text-slate-400 capitalize">{category}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          disabled={!label.trim() || saving}
          className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition disabled:opacity-50"
        >
          {uploading ? 'Uploading image…' : saving ? 'Saving…' : 'Add Card'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
