import React from 'react'
import { Field, TextArea, TextInput, ChipGroup, PrimaryButton, SectionCard } from './ui.jsx'

const THEME_PRESETS = ['มินิมอล สว่าง สะอาดตา', 'ดาร์กโหมด พรีเมียม', 'สดใส พาสเทล เป็นมิตร', 'จริงจัง องค์กร มืออาชีพ']

export default function Step1Input({ data, onChange, onNext }) {
  const set = (patch) => onChange({ ...data, ...patch })
  const themeValue = data.themePreset === 'อื่นๆ' ? (data.themeCustom || '') : data.themePreset
  const ready = data.workflowPrompt.trim().length >= 40

  return (
    <div className="space-y-6 animate-rise">
      <header>
        <h1 className="text-2xl font-bold text-ink-100">ขั้นที่ 1 · วาง Workflow Prompt ของคุณ</h1>
        <p className="text-ink-300 mt-1">
          วาง workflow prompt (ที่มี step / STOP-gate / persona / กฎต่างๆ) ที่อยากแปลงเป็นเว็บแอป —
          ระบบจะวิเคราะห์และออกแบบแอปให้ครบทุกหน้าจอ โดยกฎทุกข้อของ workflow เดิมจะถูกรักษาไว้ครบถ้วน
        </p>
      </header>

      <SectionCard icon="📜" title="Workflow Prompt ต้นฉบับ (จำเป็น)">
        <TextArea
          value={data.workflowPrompt}
          onChange={(v) => set({ workflowPrompt: v })}
          placeholder={'วาง workflow prompt ทั้งก้อนที่นี่...\nเช่น prompt ที่มี STEP 1..N, STOP-gates, persona, กฎห้ามทำ ฯลฯ'}
          rows={12}
          mono
        />
        <div className="mt-1 text-xs text-ink-300 text-right">{data.workflowPrompt.trim().length.toLocaleString()} ตัวอักษร</div>
      </SectionCard>

      <div className="grid md:grid-cols-2 gap-4">
        <SectionCard icon="✏️" title="ชื่อแอปที่อยากได้">
          <Field label="" hint="เว้นว่างได้ — เดี๋ยวดีไซเนอร์เสนอชื่อให้">
            <TextInput value={data.appName} onChange={(v) => set({ appName: v })} placeholder="เช่น StoryForge, สูตรลับครัวคุณแม่..." />
          </Field>
        </SectionCard>

        <SectionCard icon="🧩" title="ฟีเจอร์ที่อยากให้มี / ไม่อยากให้มี">
          <Field label="" hint="เว้นว่างได้">
            <TextInput value={data.features} onChange={(v) => set({ features: v })} placeholder="เช่น อยากได้ปุ่ม export PDF / ไม่เอาระบบล็อกอิน" />
          </Field>
        </SectionCard>
      </div>

      <SectionCard icon="🎨" title="แนวดีไซน์ / ธีมแบรนด์">
        <ChipGroup
          options={THEME_PRESETS}
          value={data.themePreset}
          custom={data.themeCustom}
          onSelect={(preset, custom) => set({ themePreset: preset, themeCustom: custom })}
          otherPlaceholder="อธิบายธีมที่ต้องการ เช่น สีแบรนด์ #FF6B35 โทนอบอุ่น..."
        />
        {!themeValue && <div className="mt-2 text-xs text-ink-300">ไม่เลือกก็ได้ — ดีไซเนอร์จะเสนอธีมที่เข้ากับบุคลิกของ workflow ให้เอง</div>}
      </SectionCard>

      <div className="flex justify-end">
        <PrimaryButton onClick={onNext} disabled={!ready}>
          {ready ? '🔍 วิเคราะห์ + ออกแบบแอป →' : 'วาง workflow prompt ก่อน (อย่างน้อย 40 ตัวอักษร)'}
        </PrimaryButton>
      </div>
    </div>
  )
}
