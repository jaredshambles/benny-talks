// dashboard/src/components/safety/SafetyCardForm.jsx
import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'

const QUICK_EMOJIS = ['🔥','🔪','✂️','💊','🧑','🚗','⚡','🐶','👮','👩‍🏫','👨‍🚒','🩺','🏫','🚒','🏠','🌊']

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

export default function SafetyCardForm({ onSaved, onCancel }) {
  const [label, setLabel]           = useState('')
  const [emoji, setEmoji]           = useState('🔥')
  const [isSafe, setIsSafe]         = useState(false)
  const [imgFile, setImgFile]       = useState(null)
  const [imgPreview, setImgPreview] = useState(null)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState(null)
  const fileRef                     = useRef(null)

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImgFile(file)
    setImgPreview(URL.createObjectURL(file))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!label.trim() || saving) return
    setSaving(true)
    setError(null)

    let img_url = null
    if (imgFile) {
      try { img_url = await uploadImage(imgFile) }
      catch (err) { setError(`Upload failed: ${err.message}`); setSaving(false); return }
    }

    const { error: dbErr } = await supabase.from('safety_cards').insert({
      label: label.trim(), emoji, img_url, is_safe: isSafe, sort_order: Date.now(),
    })
    if (dbErr) { setError(dbErr.message); setSaving(false) }
    else onSaved()
  }

  return (
    <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
      <h3 className="font-bold text-slate-800 text-lg mb-5">New Safety Card</h3>
      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Label</label>
          <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Fire"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 mb-4" />

          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Answer</label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setIsSafe(true)}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition
                ${isSafe ? 'border-green-400 bg-green-50 text-green-700' : 'border-slate-200 text-slate-500'}`}>
              ✅ Safe
            </button>
            <button type="button" onClick={() => setIsSafe(false)}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition
                ${!isSafe ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-200 text-slate-500'}`}>
              🚫 Not Safe
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Image <span className="normal-case font-normal text-slate-400">(optional)</span>
          </label>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFile} className="hidden" />

          {imgPreview
            ? <div className="flex items-center gap-3 mb-4">
                <img src={imgPreview} alt="" className="w-14 h-14 object-cover rounded-xl border border-slate-200" />
                <div className="flex flex-col gap-1">
                  <button type="button" onClick={() => fileRef.current?.click()} className="text-xs font-semibold text-blue-500 hover:text-blue-700">Replace</button>
                  <button type="button" onClick={() => { setImgPreview(null); setImgFile(null) }} className="text-xs text-slate-400 hover:text-red-500">Remove</button>
                </div>
              </div>
            : <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 rounded-xl py-4 text-sm text-slate-400 hover:border-blue-300 hover:text-blue-500 transition mb-4 flex flex-col items-center gap-1">
                <span className="text-xl">📷</span>
                <span className="font-semibold">Upload image</span>
              </button>
          }

          {!imgPreview && (
            <>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Emoji</label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_EMOJIS.map(e => (
                  <button key={e} type="button" onClick={() => setEmoji(e)}
                    className={`text-xl p-1.5 rounded-lg border-2 transition ${emoji === e ? 'border-blue-400 bg-blue-50' : 'border-transparent hover:border-slate-200'}`}>
                    {e}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button type="submit" disabled={!label.trim() || saving}
          className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition disabled:opacity-50">
          {saving ? 'Saving…' : 'Add Card'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition">
          Cancel
        </button>
      </div>
    </form>
  )
}
