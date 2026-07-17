import React, { useState } from 'react'

export function PrimaryButton({ children, onClick, disabled, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-600 to-glow-500
        hover:from-brand-500 hover:to-glow-400 active:scale-[0.98] transition
        disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-brand-600/25 ${className}`}
    >
      {children}
    </button>
  )
}

export function GhostButton({ children, onClick, disabled, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-3 rounded-xl font-medium text-ink-100 bg-ink-800 border border-ink-600
        hover:bg-ink-700 hover:border-brand-400/50 active:scale-[0.98] transition
        disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-sm font-medium text-ink-100">{label}</div>
      {children}
      {hint && <div className="mt-1 text-xs text-ink-300">{hint}</div>}
    </label>
  )
}

export function TextInput({ value, onChange, placeholder, className = '' }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 rounded-xl bg-ink-900 border border-ink-600 text-ink-100
        placeholder-ink-300/50 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition ${className}`}
    />
  )
}

export function TextArea({ value, onChange, placeholder, rows = 4, className = '', mono = false }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-4 py-3 rounded-xl bg-ink-900 border border-ink-600 text-ink-100 scroll-thin
        placeholder-ink-300/50 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition
        ${mono ? 'font-mono text-sm' : ''} ${className}`}
    />
  )
}

export const OTHER = 'อื่นๆ'

// Collapse a ChipGroup (preset, custom) pair into one resolved value.
// Selecting "อื่นๆ" without typing anything resolves to '' (not the sentinel).
export function resolveChip(preset, custom) {
  if (preset === OTHER) return (custom || '').trim()
  return preset || ''
}

/**
 * Preset chips — ALWAYS includes an "อื่นๆ" option revealing a short input.
 * value = selected preset label OR the custom text when "อื่นๆ" is active.
 */
export function ChipGroup({ options, value, custom, onSelect, otherPlaceholder = 'ระบุเอง...' }) {
  const isOther = value === OTHER
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {[...options, OTHER].map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt, '')}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition active:scale-95
              ${value === opt
                ? 'bg-brand-600 border-brand-400 text-white shadow-md shadow-brand-600/30'
                : 'bg-ink-800 border-ink-600 text-ink-300 hover:text-ink-100 hover:border-brand-400/50'}`}
          >
            {opt}
          </button>
        ))}
      </div>
      {isOther && (
        <div className="mt-2 animate-rise">
          <TextInput value={custom || ''} onChange={(v) => onSelect(OTHER, v)} placeholder={otherPlaceholder} />
        </div>
      )}
    </div>
  )
}

/**
 * Shared revision panel: preset chips (+ อื่นๆ) with a free notes field.
 * Submit is enabled only when the combined revision text is non-empty.
 */
export function RevisionForm({ icon = '🛠', title, presets, notesPlaceholder, submitLabel, warning, onSubmit, onCancel }) {
  const [preset, setPreset] = useState('')
  const [custom, setCustom] = useState('')
  const [notes, setNotes] = useState('')

  const resolved = resolveChip(preset, custom)
  const combined = [resolved, notes.trim()].filter(Boolean).join(' — ')

  return (
    <SectionCard icon={icon} title={title} className="animate-rise">
      {warning && (
        <div className="mb-3 rounded-xl bg-amber-400/10 border border-amber-400/30 px-4 py-2.5 text-sm text-amber-400">
          ⚠️ {warning}
        </div>
      )}
      <ChipGroup
        options={presets}
        value={preset}
        custom={custom}
        onSelect={(p, c) => { setPreset(p); setCustom(c) }}
        otherPlaceholder="ระบุสิ่งที่อยากปรับ..."
      />
      <div className="mt-3">
        <TextArea value={notes} onChange={setNotes} rows={3} placeholder={notesPlaceholder} />
      </div>
      <div className="mt-3 flex gap-3 justify-end">
        <GhostButton onClick={onCancel}>ยกเลิก</GhostButton>
        <PrimaryButton onClick={() => onSubmit(combined)} disabled={!combined}>
          {submitLabel}
        </PrimaryButton>
      </div>
    </SectionCard>
  )
}

/**
 * Power-user tools under a generated prompt: regenerate a fresh variant, or
 * hand-edit the prompt directly (pattern from v0/Lovable-style builders).
 */
export function PromptTools({ text, onSave, onRegenerate, regenerateLabel = '🔄 สร้างใหม่ทั้งฉบับ' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  if (editing) {
    return (
      <SectionCard icon="✏️" title="แก้ prompt เอง" className="animate-rise">
        <TextArea value={draft} onChange={setDraft} rows={12} mono />
        <div className="mt-3 flex gap-3 justify-end">
          <GhostButton onClick={() => setEditing(false)}>ยกเลิก</GhostButton>
          <PrimaryButton onClick={() => { onSave(draft); setEditing(false) }} disabled={!draft.trim()}>
            💾 ใช้ฉบับที่แก้
          </PrimaryButton>
        </div>
      </SectionCard>
    )
  }
  return (
    <div className="flex flex-wrap gap-2 justify-end">
      <GhostButton className="!px-4 !py-2 text-sm" onClick={() => { setDraft(text); setEditing(true) }}>
        ✏️ แก้ prompt เอง
      </GhostButton>
      <GhostButton className="!px-4 !py-2 text-sm" onClick={onRegenerate}>{regenerateLabel}</GhostButton>
    </div>
  )
}

/**
 * Shown when a step's content is missing (e.g. reload interrupted generation).
 * Always offers a button to (re)generate instead of a dead blank screen.
 */
export function MissingContent({ message, label, onGenerate }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center animate-rise">
      <span className="text-4xl">🗒️</span>
      <p className="text-ink-300 max-w-md">{message}</p>
      <PrimaryButton onClick={onGenerate}>{label}</PrimaryButton>
    </div>
  )
}

export function CopyBlock({ text, label = 'คัดลอก prompt' }) {
  const [status, setStatus] = useState('') // '' | 'copied' | 'failed'
  const copy = async () => {
    let ok = false
    try {
      await navigator.clipboard.writeText(text)
      ok = true
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      ok = document.execCommand('copy')
      ta.remove()
    }
    setStatus(ok ? 'copied' : 'failed')
    setTimeout(() => setStatus(''), 2500)
  }
  return (
    <div className="rounded-2xl border border-ink-600 bg-ink-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-ink-800 border-b border-ink-600">
        <span className="text-xs font-medium text-ink-300 uppercase tracking-wider">Prompt · English · copy-paste-ready</span>
        <button
          onClick={copy}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition active:scale-95
            ${status === 'copied' ? 'bg-mint-400/20 text-mint-400'
              : status === 'failed' ? 'bg-red-400/20 text-red-300'
              : 'bg-brand-600 text-white hover:bg-brand-500'}`}
        >
          {status === 'copied' ? '✓ คัดลอกแล้ว' : status === 'failed' ? '✕ คัดลอกไม่สำเร็จ — เลือกข้อความเอง' : `📋 ${label}`}
        </button>
      </div>
      <pre className="p-4 text-[13px] leading-relaxed text-ink-100 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto scroll-thin">{text}</pre>
    </div>
  )
}

/**
 * Loading state for 20-40s AI operations. With `messages` (array of stages)
 * it renders an NN/g-style step checklist that ticks progressively, plus an
 * elapsed-time counter — spinner-only is appropriate just for short waits.
 */
export function Loading({ message, messages }) {
  const lines = messages && messages.length ? messages : message ? [message] : []
  const [elapsed, setElapsed] = useState(0)
  React.useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  const active = Math.min(Math.floor(elapsed / 5), lines.length - 1)

  return (
    <div className="flex flex-col items-center gap-5 py-14 animate-rise">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-4 border-ink-700" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-400 border-r-glow-400 animate-spin" />
      </div>
      {lines.length > 1 ? (
        <div className="space-y-1.5 text-sm text-left">
          {lines.map((line, i) => (
            <div key={i} className={`flex items-center gap-2 transition
              ${i < active ? 'text-mint-400' : i === active ? 'text-ink-100 animate-pulse-soft' : 'text-ink-300/40'}`}>
              <span className="w-4 text-center">{i < active ? '✓' : i === active ? '▸' : '·'}</span>
              {line}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-ink-300 animate-pulse-soft text-center px-4">{lines[0]}</div>
      )}
      <div className="text-xs text-ink-300/60">ผ่านไป {elapsed} วินาที · ปกติใช้เวลา 20–40 วินาที</div>
    </div>
  )
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-5 animate-rise">
      <div className="flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div className="flex-1">
          <div className="font-semibold text-red-300 mb-1">อุ๊ปส์ มีบางอย่างผิดพลาด</div>
          <div className="text-sm text-ink-100/90">{message}</div>
        </div>
      </div>
      {onRetry && (
        <div className="mt-4">
          <GhostButton onClick={onRetry} className="!border-red-400/40 hover:!border-red-300">🔄 ลองใหม่</GhostButton>
        </div>
      )}
    </div>
  )
}

export function SectionCard({ icon, title, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-ink-600 bg-ink-800/60 p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h3 className="font-semibold text-ink-100">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export function UploadZone({ image, onImage, onClear, label = 'ลากรูปมาวาง หรือคลิกเพื่ออัปโหลด' }) {
  const [drag, setDrag] = useState(false)
  const handleFiles = (files) => {
    const file = files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => onImage(reader.result)
    reader.readAsDataURL(file)
  }
  if (image) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-ink-600 animate-rise">
        <img src={image} alt="uploaded" className="w-full max-h-[420px] object-contain bg-ink-900" />
        <button
          onClick={onClear}
          className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-ink-950/80 text-ink-100 text-sm border border-ink-600 hover:bg-red-500/80 transition"
        >
          ✕ ลบรูป
        </button>
      </div>
    )
  }
  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files) }}
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-12 cursor-pointer transition
        ${drag ? 'border-brand-400 bg-brand-600/10' : 'border-ink-600 bg-ink-900/50 hover:border-brand-400/60 hover:bg-ink-800/60'}`}
    >
      <span className="text-3xl">🖼️</span>
      <span className="text-sm text-ink-300">{label}</span>
      <span className="text-xs text-ink-300/60">PNG / JPG / WebP</span>
      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
    </label>
  )
}
