import React, { useState } from 'react'
import { PrimaryButton, GhostButton, CopyBlock, Loading, ErrorBox, SectionCard, UploadZone, RevisionForm, MissingContent, PromptTools } from './ui.jsx'

const MOCKUP_REVISION_PRESETS = ['สีเพี้ยนจากที่ตั้งใจ', 'เลย์เอาต์แน่น/รกไป', 'อยากได้อารมณ์หรูขึ้น', 'สัดส่วนหน้าจอไม่สมจริง']

export default function Step3Mockup({
  mockupPrompt, mockupImage, loading, imageLoading, error, imageError,
  onRetry, onGenerate, onSetImage, onGenerateInApp, onApprove, onRevise, onEditPrompt,
}) {
  const [revising, setRevising] = useState(false)

  if (loading) {
    return <Loading messages={[
      'อ่าน blueprint ที่อนุมัติไว้ทุกหน้าจอ...',
      'แปลงทุก control เป็นคำบรรยายภาพ...',
      'ใส่ hex สี ฟอนต์ และ mood ลงใน prompt...',
      'ขัดเกลาให้เป็นบอร์ดพรีเซนต์ระดับ Dribbble...',
    ]} />
  }
  // A global error with no prompt on screen is fatal for this step; once a
  // prompt exists, errors render inline so the copy-paste path stays usable.
  if (error && !mockupPrompt) return <ErrorBox message={error} onRetry={onRetry} />
  if (!mockupPrompt) {
    return (
      <MissingContent
        message="ยังไม่มี image prompt (อาจปิดหน้าไประหว่างสร้าง) — กดปุ่มด้านล่างเพื่อสร้างจาก blueprint ที่อนุมัติไว้"
        label="🖼️ สร้าง image prompt"
        onGenerate={onGenerate}
      />
    )
  }

  return (
    <div className="space-y-5 animate-rise">
      <header>
        <h1 className="text-2xl font-bold text-ink-100">ขั้นที่ 3 · Mockup ภาพ UI</h1>
        <p className="text-ink-300 mt-1">เห็นก่อนสร้างจริง — เอา prompt นี้ไปสร้างภาพ แล้วนำภาพกลับมาอนุมัติที่นี่</p>
      </header>

      {error && <ErrorBox message={error} onRetry={onRetry} />}

      <CopyBlock text={mockupPrompt} label="คัดลอก image prompt" />
      <PromptTools text={mockupPrompt} onSave={onEditPrompt} onRegenerate={onGenerate} />

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
        {imageError && <div className="mb-3"><ErrorBox message={imageError} onRetry={onGenerateInApp} /></div>}
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

      {!mockupImage && !revising && (
        <div className="text-center">
          <GhostButton onClick={() => setRevising(true)} className="text-sm">🛠 ยังไม่มีภาพ แต่อยากปรับ image prompt ก่อน</GhostButton>
        </div>
      )}

      {revising && (
        <RevisionForm
          title="อยากปรับจุดไหนในภาพ?"
          presets={MOCKUP_REVISION_PRESETS}
          notesPlaceholder="รายละเอียด เช่น หน้าจอซ้ายบนปุ่มใหญ่ไป อยากให้พื้นหลังเข้มกว่านี้..."
          submitLabel="🔄 เขียน image prompt ใหม่ตามนี้"
          warning="การแก้ image prompt จะล้างภาพเดิมและ build prompt เดิม เพื่อให้ทุกอย่างตรงกับดีไซน์ล่าสุดเสมอ"
          onCancel={() => setRevising(false)}
          onSubmit={(notes) => { setRevising(false); onRevise(notes) }}
        />
      )}
    </div>
  )
}
