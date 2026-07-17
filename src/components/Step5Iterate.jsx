import React, { useMemo, useState } from 'react'
import { PrimaryButton, GhostButton, TextArea, CopyBlock, Loading, ErrorBox, SectionCard, UploadZone, ChipGroup, resolveChip } from './ui.jsx'

const CATEGORIES = ['🐛 บั๊ก / ทำงานผิด', '🎨 ปรับดีไซน์', '➕ เพิ่มฟีเจอร์', '✏️ แก้ข้อความ/copy']

export default function Step5Iterate({ history, loading, error, onRetry, onGenerate, onFinish, onUnfinish, finished, onRestart }) {
  const [preset, setPreset] = useState('')
  const [custom, setCustom] = useState('')
  const [request, setRequest] = useState('')
  const [screenshot, setScreenshot] = useState(null)

  const category = resolveChip(preset, custom)
  const ready = request.trim().length > 0 && Boolean(category)
  const reversed = useMemo(() => [...history].reverse(), [history])

  const submit = () => {
    onGenerate({ category, request: request.trim(), screenshot })
    setRequest('')
    setScreenshot(null)
  }

  if (finished) {
    return (
      <div className="text-center py-16 space-y-5 animate-rise">
        <div className="text-6xl">🎉</div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-400 to-glow-400 bg-clip-text text-transparent">แอปของคุณเสร็จสมบูรณ์!</h1>
        <p className="text-ink-300 max-w-md mx-auto">
          จาก workflow prompt หนึ่งก้อน กลายเป็นเว็บแอปเต็มรูปแบบ — ผ่านการออกแบบ, mockup, build และ iterate จนพอใจ
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <GhostButton onClick={onUnfinish}>↩️ กลับไปแก้ต่อ (Iterate)</GhostButton>
          <PrimaryButton onClick={onRestart}>🆕 เริ่มโปรเจกต์ใหม่</PrimaryButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-rise">
      <header>
        <h1 className="text-2xl font-bold text-ink-100">ขั้นที่ 5 · Iterate จนกว่าจะพอใจ</h1>
        <p className="text-ink-300 mt-1">
          แอปที่ generate มามีอะไรต้องแก้/เพิ่ม/เปลี่ยน — บอกที่นี่ (แนบ screenshot ยิ่งดี)
          ระบบจะเขียน follow-up prompt ให้เอาไปวางใน <b>AI Studio session เดิม</b> ได้ทันที วนได้ไม่จำกัดรอบ
        </p>
      </header>

      <SectionCard icon="🔧" title="อยากแก้อะไร?">
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-ink-100 mb-2">ประเภทการแก้ไข</div>
            <ChipGroup
              options={CATEGORIES}
              value={preset}
              custom={custom}
              onSelect={(p, c) => { setPreset(p); setCustom(c) }}
              otherPlaceholder="ระบุประเภท..."
            />
          </div>
          <div>
            <div className="text-sm font-medium text-ink-100 mb-2">รายละเอียด (หน้าจอไหน จุดไหน อยากให้เป็นยังไง)</div>
            <TextArea value={request} onChange={setRequest} rows={3}
              placeholder="เช่น หน้าจอที่ 2 กดปุ่มยืนยันแล้วขึ้น error / อยากให้ปุ่มหลักเป็นสีเขียว #34D399..." />
          </div>
          <div>
            <div className="text-sm font-medium text-ink-100 mb-2">Screenshot จุดที่อยากแก้ (ไม่บังคับ แต่ช่วยได้มาก)</div>
            <UploadZone image={screenshot} onImage={setScreenshot} onClear={() => setScreenshot(null)} label="แนบ screenshot ของจุดที่อยากแก้" />
          </div>
          <div className="flex justify-end">
            <PrimaryButton onClick={submit} disabled={!ready || loading}>
              {loading ? '⏳ กำลังเขียน...' : '⚡ สร้าง follow-up prompt'}
            </PrimaryButton>
          </div>
        </div>
      </SectionCard>

      {loading && <Loading message="กำลังวิเคราะห์และเขียน follow-up prompt..." />}
      {error && <ErrorBox message={error} onRetry={onRetry} />}

      {history.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-ink-100">📚 Follow-up prompts ที่สร้างไว้ ({history.length} รอบ)</h2>
          {reversed.map((h, i) => (
            <div key={history.length - 1 - i} className="space-y-2 animate-rise">
              <div className="text-sm text-ink-300">
                <span className="px-2 py-0.5 rounded-md bg-ink-800 border border-ink-600 text-xs mr-2">รอบที่ {history.length - i}</span>
                {h.category} — {h.request}
              </div>
              <CopyBlock text={h.result} label="คัดลอก follow-up prompt" />
              <div className="text-xs text-ink-300">
                💡 วาง prompt นี้ใน <b>AI Studio session เดิม</b> (ห้ามเปิด chat ใหม่) แล้วกลับมารายงานผลหรือส่ง screenshot ใหม่ได้เลย
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center pt-4 border-t border-ink-700">
        <GhostButton onClick={onFinish}>🏁 แอปเสร็จสมบูรณ์แล้ว — ปิดงาน</GhostButton>
      </div>
    </div>
  )
}
