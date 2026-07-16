import React, { useState } from 'react'
import { PrimaryButton, GhostButton, TextArea, ChipGroup, Loading, ErrorBox, SectionCard } from './ui.jsx'

const CONTROL_COLORS = {
  'ปุ่ม': 'bg-brand-600/20 text-brand-400 border-brand-400/30',
  'chip': 'bg-glow-500/15 text-glow-400 border-glow-400/30',
  'card เลือก': 'bg-mint-400/15 text-mint-400 border-mint-400/30',
  'toggle': 'bg-amber-400/15 text-amber-400 border-amber-400/30',
  'checkbox': 'bg-amber-400/15 text-amber-400 border-amber-400/30',
  'dropdown': 'bg-sky-400/15 text-sky-400 border-sky-400/30',
  'ช่องกรอก': 'bg-ink-600/40 text-ink-300 border-ink-600',
  'upload': 'bg-rose-400/15 text-rose-400 border-rose-400/30',
}

const REVISION_PRESETS = ['เปลี่ยนโทนสี/ธีม', 'ลดจำนวนหน้าจอลง', 'ตัดฟีเจอร์ให้ MVP เล็กลง', 'เปลี่ยนชื่อแอป']

export default function Step2Blueprint({ blueprint, loading, error, onRetry, onApprove, onRevise }) {
  const [revising, setRevising] = useState(false)
  const [preset, setPreset] = useState('')
  const [custom, setCustom] = useState('')
  const [notes, setNotes] = useState('')

  if (loading) return <Loading message="ดีไซเนอร์กำลังแกะ workflow และร่างพิมพ์เขียวแอปทั้งระบบ... (ราว 20–40 วินาที)" />
  if (error) return <ErrorBox message={error} onRetry={onRetry} />
  if (!blueprint) return null

  const submitRevision = () => {
    const parts = []
    if (preset && preset !== 'อื่นๆ') parts.push(preset)
    if (preset === 'อื่นๆ' && custom) parts.push(custom)
    if (notes.trim()) parts.push(notes.trim())
    if (parts.length === 0) return
    setRevising(false)
    setPreset(''); setCustom(''); setNotes('')
    onRevise(parts.join(' — '))
  }

  return (
    <div className="space-y-5 animate-rise">
      <header>
        <h1 className="text-2xl font-bold text-ink-100">ขั้นที่ 2 · พิมพ์เขียวของแอป (Blueprint)</h1>
        <p className="text-ink-300 mt-1">ตรวจดีไซน์ทั้งระบบด้านล่าง — อนุมัติเพื่อไปทำ mockup หรือสั่งปรับได้ไม่จำกัดรอบ</p>
      </header>

      <SectionCard icon="💡" title="คอนเซ็ปต์แอป">
        <div className="text-xl font-bold bg-gradient-to-r from-brand-400 to-glow-400 bg-clip-text text-transparent">
          {blueprint.appConcept.name}
        </div>
        <p className="text-ink-100/90 mt-1">{blueprint.appConcept.positioning}</p>
      </SectionCard>

      <SectionCard icon="🖥️" title={`หน้าจอทั้งหมด (${blueprint.screens.length} หน้าจอ)`}>
        <div className="space-y-4">
          {blueprint.screens.map((s, i) => (
            <div key={i} className="rounded-xl border border-ink-600 bg-ink-900/60 p-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-600/30 text-brand-400 text-xs font-bold">{i + 1}</span>
                <span className="font-semibold text-ink-100">{s.name}</span>
              </div>
              <p className="text-sm text-ink-300 mt-1.5">{s.purpose}</p>
              <div className="mt-3 space-y-1.5">
                {s.controls.map((c, j) => (
                  <div key={j} className="flex items-start gap-2 text-sm">
                    <span className={`shrink-0 px-2 py-0.5 rounded-md border text-xs font-medium ${CONTROL_COLORS[c.type] || CONTROL_COLORS['ช่องกรอก']}`}>
                      [{c.type}]
                    </span>
                    <span className="text-ink-100 font-medium">{c.label}</span>
                    <span className="text-ink-300">— {c.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid md:grid-cols-2 gap-4">
        <SectionCard icon="🧭" title="Stepper / การนำทาง">
          <p className="text-sm text-ink-100/90">{blueprint.stepper}</p>
        </SectionCard>

        <SectionCard icon="🤖" title="AI Calls (กฎจาก workflow เดิมถูกฝังไว้)">
          <div className="space-y-3">
            {blueprint.aiCalls.map((a, i) => (
              <div key={i} className="text-sm">
                <div className="font-medium text-ink-100">📍 {a.screen} — {a.purpose}</div>
                <div className="text-ink-300 mt-0.5">🔒 {a.systemInstruction}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard icon="🎨" title="Design System">
        <div className="flex flex-wrap gap-3 mb-3">
          {blueprint.designSystem.palette.map((p, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl border border-ink-600 bg-ink-900/60 px-3 py-2">
              <span className="h-7 w-7 rounded-lg border border-white/10" style={{ background: p.hex }} />
              <div>
                <div className="text-xs font-mono text-ink-100">{p.hex}</div>
                <div className="text-xs text-ink-300">{p.name} · {p.usage}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-sm text-ink-100/90 space-y-1">
          <div>🔤 <span className="text-ink-300">Typography:</span> {blueprint.designSystem.typography}</div>
          <div>🌈 <span className="text-ink-300">Mood:</span> {blueprint.designSystem.mood}</div>
          <div>💬 <span className="text-ink-300">เหตุผล:</span> {blueprint.designSystem.rationale}</div>
        </div>
      </SectionCard>

      <SectionCard icon="📦" title="ขอบเขต MVP">
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-semibold text-mint-400 mb-1.5">✅ อยู่ใน MVP</div>
            <ul className="space-y-1 text-ink-100/90">
              {blueprint.mvp.included.map((x, i) => <li key={i}>• {x}</li>)}
            </ul>
          </div>
          <div>
            <div className="font-semibold text-amber-400 mb-1.5">⏳ เฟส 2 (ตัดออกก่อน)</div>
            <ul className="space-y-1 text-ink-300">
              {blueprint.mvp.excluded.map((x, i) => <li key={i}>• {x}</li>)}
            </ul>
          </div>
        </div>
      </SectionCard>

      {!revising ? (
        <div className="flex flex-wrap gap-3 justify-end sticky bottom-4">
          <GhostButton onClick={() => setRevising(true)}>🛠 ขอปรับแก้</GhostButton>
          <PrimaryButton onClick={onApprove}>✅ อนุมัติดีไซน์นี้ → ไปขั้น 3 (Mockup)</PrimaryButton>
        </div>
      ) : (
        <SectionCard icon="🛠" title="อยากปรับตรงไหน?" className="animate-rise">
          <ChipGroup
            options={REVISION_PRESETS}
            value={preset}
            custom={custom}
            onSelect={(p, c) => { setPreset(p); setCustom(c) }}
            otherPlaceholder="ระบุสิ่งที่อยากปรับ..."
          />
          <div className="mt-3">
            <TextArea value={notes} onChange={setNotes} rows={3} placeholder="รายละเอียดเพิ่มเติม (ถ้ามี) เช่น หน้าจอที่ 2 อยากให้รวมกับหน้าจอที่ 3..." />
          </div>
          <div className="mt-3 flex gap-3 justify-end">
            <GhostButton onClick={() => setRevising(false)}>ยกเลิก</GhostButton>
            <PrimaryButton onClick={submitRevision} disabled={!notes.trim() && !preset}>
              🔄 ปรับ blueprint ตามนี้
            </PrimaryButton>
          </div>
        </SectionCard>
      )}
    </div>
  )
}
