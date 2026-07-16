import React, { useState } from 'react'
import { PrimaryButton, GhostButton, TextArea, CopyBlock, Loading, ErrorBox, SectionCard, UploadZone, ChipGroup } from './ui.jsx'

const MOCKUP_REVISION_PRESETS = ['สีเพี้ยนจากที่ตั้งใจ', 'เลย์เอาต์แน่น/รกไป', 'อยากได้อารมณ์หรูขึ้น', 'สัดส่วนหน้าจอไม่สมจริง']

export default function Step3Mockup({
  mockupPrompt, mockupImage, loading, imageLoading, error,
  onRetry, onSetImage, onGenerateInApp, onApprove, onRevise,
}) {
  const [revising, setRevising] = useState(false)
  const [preset, setPreset] = useState('')
  const [custom, setCustom] = useState('')
  const [notes, setNotes] = useState('')

  if (loading) return <Loading message="กำลังเขียน image prompt ระดับ Dribbble ให้... " />
  if (error) return <ErrorBox message={error} onRetry={onRetry} />
  if (!mockupPrompt) return null

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
        <h1 className="text-2xl font-bold text-ink-100">ขั้นที่ 3 · Mockup ภาพ UI</h1>
        <p className="text-ink-300 mt-1">เห็นก่อนสร้างจริง — เอา prompt นี้ไปสร้างภาพ แล้วนำภาพกลับมาอนุมัติที่นี่</p>
      </header>

      <CopyBlock text={mockupPrompt} label="คัดลอก image prompt" />

      <SectionCard icon="📋" title="วิธีใช้">
        <ol className="text-sm text-ink-100/90 space-y-1.5 list-decimal list-inside">
          <li>กด <b>คัดลอก image prompt</b> ด้านบน</li>
          <li>วางใน <b>ChatGPT (GPT Image)</b> หรือเครื่องมือสร้างภาพที่ถนัด แล้วสั่งสร้างภาพ</li>
          <li>ได้ภาพแล้ว <b>อัปโหลดกลับมาที่โซนด้านล่าง</b> เพื่อรีวิวและอนุมัติ</li>
        </ol>
        <div className="mt-3 rounded-xl bg-amber-400/10 border border-amber-400/30 px-4 py-2.5 text-sm text-amber-400">
          ⚠️ ตัวหนังสือในภาพ AI (โดยเฉพาะภาษาไทย) จะเพี้ยนเป็นปกติ — ให้ดูแค่ <b>เลย์เอาต์ อารมณ์ และสี</b> ไม่ต้องสนตัวสะกด
        </div>
        <div className="mt-3">
          <GhostButton onClick={onGenerateInApp} disabled={imageLoading}>
            {imageLoading ? '⏳ กำลังสร้างภาพ...' : '✨ หรือลองสร้างภาพด้วย Gemini ในแอปเลย (ทดลอง)'}
          </GhostButton>
        </div>
      </SectionCard>

      <SectionCard icon="🖼️" title="ภาพ mockup ที่สร้างได้">
        {imageLoading
          ? <Loading message="Gemini กำลังวาด mockup... (ราว 15–30 วินาที)" />
          : <UploadZone image={mockupImage} onImage={onSetImage} onClear={() => onSetImage(null)} label="อัปโหลดภาพ mockup ที่สร้างได้มาที่นี่" />}
      </SectionCard>

      {mockupImage && !revising && (
        <div className="animate-rise">
          <p className="text-ink-100 font-medium mb-3 text-center">จุดไหนอยากปรับไหม หรืออนุมัติ mockup นี้เลย?</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <GhostButton onClick={() => setRevising(true)}>🛠 ขอปรับ (บอกจุด)</GhostButton>
            <PrimaryButton onClick={onApprove}>✅ อนุมัติ mockup → ไปขั้น 4 (Build Prompt)</PrimaryButton>
          </div>
        </div>
      )}

      {revising && (
        <SectionCard icon="🛠" title="อยากปรับจุดไหนในภาพ?" className="animate-rise">
          <ChipGroup
            options={MOCKUP_REVISION_PRESETS}
            value={preset}
            custom={custom}
            onSelect={(p, c) => { setPreset(p); setCustom(c) }}
            otherPlaceholder="ระบุจุดที่อยากแก้..."
          />
          <div className="mt-3">
            <TextArea value={notes} onChange={setNotes} rows={3} placeholder="รายละเอียด เช่น หน้าจอซ้ายบนปุ่มใหญ่ไป อยากให้พื้นหลังเข้มกว่านี้..." />
          </div>
          <div className="mt-3 flex gap-3 justify-end">
            <GhostButton onClick={() => setRevising(false)}>ยกเลิก</GhostButton>
            <PrimaryButton onClick={submitRevision} disabled={!notes.trim() && !preset}>
              🔄 เขียน image prompt ใหม่ตามนี้
            </PrimaryButton>
          </div>
        </SectionCard>
      )}
    </div>
  )
}
