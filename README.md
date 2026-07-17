# 🏭 Workflow → App Studio

🌐 **ใช้งานได้เลยที่:** https://workflow-app-studio-chawanansuk-7902s-projects.vercel.app

เว็บแอปที่แปลง **workflow prompt** (prompt แบบมี step / STOP-gate / persona / กฎต่างๆ)
ให้กลายเป็น **เว็บแอปจริง** ผ่านกระบวนการ vibe coding บน Google AI Studio — ครบทั้ง 5 ขั้นตอน
โดยยึดหลัก *"ทุกการตัดสินใจคือปุ่ม ทุกคำถามคือฟอร์ม ไม่มี free-text chat"*

## ✨ 5 ขั้นตอนในแอป

| ขั้น | ทำอะไร | AI call |
|---|---|---|
| 1. วาง Workflow | วาง workflow prompt + ชื่อแอป + ธีม + ฟีเจอร์ (ฟอร์มล้วน มี chip "อื่นๆ" เสมอ) | – |
| 2. ออกแบบแอป | AI แกะ step/gate/กฎ → สร้าง **blueprint ภาษาไทย** ครบทุกหน้าจอ ทุก control ([ปุ่ม] [chip] [card เลือก] ...) พร้อม design system + MVP scope → **วนแก้จนกว่าจะอนุมัติ** | Gemini 2.5 Flash + JSON schema |
| 3. Mockup | สร้าง **image prompt ภาษาอังกฤษ** สำหรับ GPT Image (หรือกดสร้างภาพด้วย Gemini ในแอปเลย) → อัปโหลดภาพกลับมารีวิว → **วนแก้จนกว่าจะอนุมัติ** | Gemini 2.5 Flash (+ 2.5 Flash Image) |
| 4. Build Prompt | ประกอบ **build prompt ฉบับสมบูรณ์** สำหรับ Google AI Studio (Build mode) — กฎของ workflow เดิมถูกฝังเป็น CORE PHILOSOPHY, ไม่มี placeholder | Gemini 2.5 Flash |
| 5. Iterate | แจ้งสิ่งที่อยากแก้ (+แนบ screenshot) → ได้ **follow-up prompt** สำหรับ AI Studio session เดิม — วนได้ไม่จำกัดจนกด "เสร็จสมบูรณ์" | Gemini 2.5 Flash (vision) |

กฎจาก workflow ต้นฉบับ (Designer's Mandate, STOP-gates → UI gates, MVP discipline ฯลฯ)
ถูกฝังไว้ใน system instruction ของทุก AI call ที่ `src/lib/prompts.js`

## 🚀 วิธีรัน

```bash
npm install
npm run dev        # เปิด http://localhost:5173
```

จากนั้นกดปุ่ม **🔑 API Key** มุมขวาบน แล้ววาง Gemini API key
(ขอฟรีได้ที่ [aistudio.google.com/apikey](https://aistudio.google.com/apikey))
— key ถูกเก็บใน localStorage ของเบราว์เซอร์คุณเท่านั้น ไม่ผ่าน server ใดๆ

หรือกำหนดผ่าน env: สร้างไฟล์ `.env` แล้วใส่ `VITE_GEMINI_API_KEY=...`

## 🏗️ Tech stack

- React 18 + Vite 6 + Tailwind CSS 4
- `@google/genai` เรียก Gemini ตรงจากเบราว์เซอร์ (ไม่มี backend, ไม่มี database, ไม่มี login)
- ฟอนต์ IBM Plex Sans Thai · ธีมดาร์กพรีเมียม (#0B0E14 / indigo #6366F1 → fuchsia #D946EF)
- งานทั้งหมด (ยกเว้นรูปภาพ) ถูก autosave ลง localStorage — refresh แล้วงานไม่หาย

## 📁 โครงสร้าง

```
src/
├── App.jsx                  # state machine + orchestration ของ 5 ขั้น
├── lib/
│   ├── gemini.js            # Gemini client, defensive JSON parsing, friendly Thai errors
│   └── prompts.js           # system instructions ทุก AI call (กฎ workflow เดิมฝังที่นี่)
└── components/
    ├── Shell.jsx            # Stepper + API key modal
    ├── ui.jsx               # ปุ่ม, ChipGroup (มี "อื่นๆ" เสมอ), CopyBlock, UploadZone ฯลฯ
    └── Step1..Step5*.jsx    # หน้าจอทั้ง 5 ขั้น
```
