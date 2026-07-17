import React from 'react'
import { PrimaryButton, CopyBlock, Loading, ErrorBox, SectionCard, GhostButton, MissingContent } from './ui.jsx'

export default function Step4Build({ buildPrompt, appName, loading, error, onRetry, onGenerate, onNext }) {
  if (loading) return <Loading message="กำลังประกอบ build prompt ฉบับสมบูรณ์ — ฝังกฎทุกข้อของ workflow เดิมลงไป..." />
  if (error) return <ErrorBox message={error} onRetry={onRetry} />
  if (!buildPrompt) {
    return (
      <MissingContent
        message="ยังไม่มี build prompt (อาจปิดหน้าไประหว่างสร้าง หรือมีการแก้ blueprint/mockup ใหม่) — กดปุ่มด้านล่างเพื่อประกอบจากดีไซน์ล่าสุด"
        label="🚀 สร้าง build prompt"
        onGenerate={onGenerate}
      />
    )
  }

  const download = () => {
    const blob = new Blob([buildPrompt], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${(appName || 'app').replace(/\s+/g, '-')}-build-prompt.txt`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="space-y-5 animate-rise">
      <header>
        <h1 className="text-2xl font-bold text-ink-100">ขั้นที่ 4 · Build Prompt สำหรับ Google AI Studio</h1>
        <p className="text-ink-300 mt-1">สเปกแอปทั้งระบบในก้อนเดียว — ไม่มี placeholder, พร้อมวางแล้วกด generate</p>
      </header>

      <CopyBlock text={buildPrompt} label="คัดลอก build prompt" />

      <SectionCard icon="🚀" title="ขั้นตอนการ build">
        <ol className="text-sm text-ink-100/90 space-y-2 list-decimal list-inside">
          <li>เปิด <a href="https://aistudio.google.com/apps" target="_blank" rel="noreferrer" className="text-brand-400 underline hover:text-glow-400">Google AI Studio → Build</a></li>
          <li><b>แนบภาพ mockup ที่อนุมัติจากขั้นที่ 3</b> ไปพร้อมกับ prompt แล้วบอก AI Studio ให้ยึดดีไซน์ตามภาพนี้เป๊ะๆ</li>
          <li>วาง build prompt แล้วกด generate — รอแอปประกอบร่าง</li>
        </ol>
      </SectionCard>

      <div className="flex flex-wrap gap-3 justify-end">
        <GhostButton onClick={download}>⬇️ ดาวน์โหลดเป็น .txt</GhostButton>
        <PrimaryButton onClick={onNext}>🧪 ได้แอปแล้ว → ไปขั้น 5 (Iterate)</PrimaryButton>
      </div>
    </div>
  )
}
