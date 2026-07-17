import React from 'react'
import { Field, TextArea, TextInput, ChipGroup, PrimaryButton, GhostButton, SectionCard, ErrorBox } from './ui.jsx'

// Maps 1:1 to what Google AI Studio Build mode can wire up.
const CAPABILITIES = [
  '🖼️ สร้างภาพด้วย AI (Nano Banana)',
  '👁️ วิเคราะห์ภาพ/ไฟล์ที่อัปโหลด',
  '🎙️ รับ-ตอบด้วยเสียง',
  '🌐 ค้นข้อมูลเว็บสด (Search grounding)',
  '🗺️ แผนที่ (Google Maps)',
]

const THEME_PRESETS = ['มินิมอล สว่าง สะอาดตา', 'ดาร์กโหมด พรีเมียม', 'สดใส พาสเทล เป็นมิตร', 'จริงจัง องค์กร มืออาชีพ']

// One-click starters — every leading AI builder teaches by example, not docs.
const EXAMPLES = [
  {
    icon: '📖',
    title: 'นักวางโครงเรื่องนิยาย',
    desc: 'workflow เขียนนิยาย 4 ขั้น มี STOP-gate ทุกจุดสำคัญ',
    appName: 'StoryForge',
    theme: 'ดาร์กโหมด พรีเมียม',
    prompt: `คุณคือบรรณาธิการนิยายมือรางวัลผู้เคี่ยวเข็ญนักเขียนมาแล้วนับร้อยคน

STEP 1 — ถามผู้ใช้: แนวเรื่อง (แฟนตาซี/สืบสวน/โรแมนซ์/ไซไฟ), กลุ่มผู้อ่านเป้าหมาย, ความยาวที่ตั้งใจ (เรื่องสั้น/นิยายขนาดสั้น/นิยายเต็ม) แล้ว STOP รอคำตอบ

STEP 2 — เสนอ logline 3 แบบที่ต่างกันชัดเจน ให้ผู้ใช้เลือก 1 หรือขอชุดใหม่ STOP รอการเลือก

STEP 3 — จาก logline ที่เลือก ร่างโครงเรื่อง 3 องก์ พร้อมจุดหักเห ให้ผู้ใช้อนุมัติหรือสั่งแก้เป็นจุดๆ วนจนกว่าจะอนุมัติ STOP

STEP 4 — สร้าง character sheet ตัวละครหลักทีละตัว (ชื่อ เป้าหมาย บาดแผลในใจ ความลับ) ผู้ใช้อนุมัติทีละตัว

กฎเหล็ก: ห้ามเขียนเนื้อเรื่องจริงก่อนโครงผ่านการอนุมัติ / ทุกจุดหักเหต้องสมเหตุสมผลกับแรงจูงใจตัวละคร / ห้ามใช้ deus ex machina`,
  },
  {
    icon: '🥗',
    title: 'นักโภชนาการส่วนตัว',
    desc: 'วางแผนมื้ออาหารรายสัปดาห์ ยึดข้อจำกัดสุขภาพเป็นกฎศักดิ์สิทธิ์',
    appName: 'ครัวสมดุล',
    theme: 'สดใส พาสเทล เป็นมิตร',
    prompt: `คุณคือนักโภชนาการวิชาชีพที่ให้คำแนะนำแบบไม่ตัดสินและอิงหลักฐาน

STEP 1 — เก็บข้อมูล: เพศ อายุ น้ำหนัก ส่วนสูง ระดับกิจกรรม, โรคประจำตัว/อาหารที่แพ้ (ล็อกเป็นข้อห้ามเด็ดขาด), เป้าหมาย (ลดน้ำหนัก/เพิ่มกล้าม/คุมเบาหวาน), งบต่อวัน แล้ว STOP

STEP 2 — คำนวณ TDEE และเสนอกรอบแคลอรี่+สัดส่วนโปรตีน/คาร์บ/ไขมัน พร้อมเหตุผล ให้ผู้ใช้ยืนยันหรือปรับ STOP

STEP 3 — สร้างแผนมื้ออาหาร 7 วัน (เช้า/กลางวัน/เย็น/ว่าง) ใช้วัตถุดิบหาง่ายในไทย ระบุแคลอรี่ต่อมื้อ ผู้ใช้ขอสลับเมนูรายมื้อได้ไม่จำกัดรอบจนพอใจ

STEP 4 — สรุปรายการซื้อของรายสัปดาห์จัดตามหมวด

กฎเหล็ก: อาหารที่แพ้ต้องไม่โผล่ในแผนเด็ดขาดแม้เป็นส่วนผสมแฝง / ห้ามแนะนำต่ำกว่า 1,200 kcal/วัน / ทุกคำแนะนำต้องมีเหตุผลประกอบ`,
  },
  {
    icon: '🏷️',
    title: 'ครีเอทีฟตั้งชื่อแบรนด์',
    desc: 'ตั้งชื่อ + สโลแกน + ตรวจความเสี่ยง ผ่าน gate ทีละชั้น',
    appName: 'BrandSmith',
    theme: 'จริงจัง องค์กร มืออาชีพ',
    prompt: `คุณคือ creative director เอเจนซี่ระดับโลกที่เชี่ยวชาญการตั้งชื่อแบรนด์ไทยให้ไปได้ไกลระดับสากล

STEP 1 — ถาม: ธุรกิจทำอะไร, กลุ่มลูกค้า, บุคลิกแบรนด์ 3 คำ, ภาษาที่ต้องการ (ไทย/อังกฤษ/ผสม), สิ่งที่ห้ามสื่อถึง แล้ว STOP

STEP 2 — เสนอชื่อ 10 ชื่อใน 3 กลุ่มสไตล์ (ตรงตัว/เชิงเปรียบเทียบ/ประดิษฐ์ใหม่) พร้อมเหตุผลสั้นๆ ต่อชื่อ ให้ผู้ใช้คัดเหลือ 3 หรือขอชุดใหม่ STOP

STEP 3 — สำหรับ 3 ชื่อที่ผ่าน: วิเคราะห์ความเสี่ยง (เสียงพ้องคำหยาบในภาษาหลัก, ความยาว, การสะกดง่าย) แล้วให้ผู้ใช้เลือกชื่อสุดท้าย STOP

STEP 4 — สร้างสโลแกน 5 แบบสำหรับชื่อที่เลือก + แนวทาง tone of voice ให้ผู้ใช้อนุมัติ

กฎเหล็ก: ห้ามเสนอชื่อที่ออกเสียงยากเกิน 4 พยางค์ / ทุกชื่อต้องผ่านการเช็คเสียงพ้องก่อนเสนอ / บุคลิกแบรนด์ 3 คำจากขั้นแรกคือเกณฑ์ตัดสินทุกอย่าง`,
  },
]

export default function Step1Input({ data, onChange, onNext, onEnhance, enhancing, enhanceError }) {
  const set = (patch) => onChange({ ...data, ...patch })
  const themeValue = data.themePreset === 'อื่นๆ' ? (data.themeCustom || '') : data.themePreset
  const promptLen = data.workflowPrompt.trim().length
  const ready = promptLen >= 40 && !enhancing
  const capabilities = data.capabilities || []

  const toggleCapability = (cap) => {
    set({
      capabilities: capabilities.includes(cap)
        ? capabilities.filter((c) => c !== cap)
        : [...capabilities, cap],
    })
  }

  return (
    <div className="space-y-6 animate-rise">
      <header>
        <h1 className="text-2xl font-bold text-ink-100">ขั้นที่ 1 · วาง Workflow Prompt ของคุณ</h1>
        <p className="text-ink-300 mt-1">
          วาง workflow prompt (ที่มี step / STOP-gate / persona / กฎต่างๆ) ที่อยากแปลงเป็นเว็บแอป —
          ระบบจะวิเคราะห์และออกแบบแอปให้ครบทุกหน้าจอ โดยกฎทุกข้อของ workflow เดิมจะถูกรักษาไว้ครบถ้วน
        </p>
      </header>

      {!data.workflowPrompt.trim() && (
        <SectionCard icon="✨" title="ยังไม่มี workflow? ลองจากตัวอย่างก่อนได้">
          <div className="grid md:grid-cols-3 gap-3">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.title}
                onClick={() => set({ workflowPrompt: ex.prompt, appName: ex.appName, themePreset: ex.theme, themeCustom: '' })}
                className="text-left rounded-xl border border-ink-600 bg-ink-900/60 p-4 transition
                  hover:border-brand-400/60 hover:bg-ink-800 active:scale-[0.98]"
              >
                <div className="text-2xl mb-1.5">{ex.icon}</div>
                <div className="font-semibold text-ink-100 text-sm">{ex.title}</div>
                <div className="text-xs text-ink-300 mt-1">{ex.desc}</div>
              </button>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard icon="📜" title="Workflow Prompt ต้นฉบับ (จำเป็น)">
        <TextArea
          value={data.workflowPrompt}
          onChange={(v) => set({ workflowPrompt: v })}
          placeholder={'วาง workflow prompt ทั้งก้อนที่นี่...\nเช่น prompt ที่มี STEP 1..N, STOP-gates, persona, กฎห้ามทำ ฯลฯ'}
          rows={12}
          mono
        />
        <div className="mt-1 flex items-center justify-between gap-3">
          <GhostButton
            onClick={onEnhance}
            disabled={promptLen < 20 || enhancing}
            className="!px-4 !py-2 text-sm"
          >
            {enhancing ? '⏳ กำลังขัดเกลา...' : '✨ ให้ AI ขัดเกลาเป็น workflow เต็มรูปแบบ'}
          </GhostButton>
          <div className="text-xs text-ink-300">{promptLen.toLocaleString()} ตัวอักษร</div>
        </div>
        <div className="mt-1 text-xs text-ink-300/70">
          💡 มีแค่ไอเดียคร่าวๆ ก็วางมาได้เลย แล้วกด "ขัดเกลา" — AI จะเติม STEP, STOP-gate และกฎเหล็กให้ครบ
        </div>
        {enhanceError && <div className="mt-2"><ErrorBox message={enhanceError} onRetry={onEnhance} /></div>}
      </SectionCard>

      <SectionCard icon="🤖" title="ความสามารถ AI ที่อยากให้แอปมี (เลือกได้หลายอัน · ตรงกับที่ AI Studio รองรับ)">
        <div className="flex flex-wrap gap-2">
          {CAPABILITIES.map((cap) => (
            <button
              key={cap}
              onClick={() => toggleCapability(cap)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition active:scale-95
                ${capabilities.includes(cap)
                  ? 'bg-brand-600 border-brand-400 text-white shadow-md shadow-brand-600/30'
                  : 'bg-ink-800 border-ink-600 text-ink-300 hover:text-ink-100 hover:border-brand-400/50'}`}
            >
              {capabilities.includes(cap) ? '✓ ' : ''}{cap}
            </button>
          ))}
        </div>
        <div className="mt-2 text-xs text-ink-300">ไม่เลือกก็ได้ — แอปจะใช้แค่การสร้างข้อความ (ค่าเริ่มต้น)</div>
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
