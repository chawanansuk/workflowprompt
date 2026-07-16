import React, { useState } from 'react'
import { getApiKey, setApiKey } from '../lib/gemini.js'
import { GhostButton, PrimaryButton, TextInput } from './ui.jsx'

export const STEPS = [
  { n: 1, label: 'วาง Workflow' },
  { n: 2, label: 'ออกแบบแอป' },
  { n: 3, label: 'Mockup' },
  { n: 4, label: 'Build Prompt' },
  { n: 5, label: 'Iterate' },
]

export function Stepper({ step, maxStep, onJump }) {
  return (
    <nav className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
      {STEPS.map((s, i) => {
        const done = s.n < step
        const active = s.n === step
        const reachable = s.n <= maxStep
        return (
          <React.Fragment key={s.n}>
            {i > 0 && <div className={`h-px w-4 sm:w-8 ${done || active ? 'bg-brand-400' : 'bg-ink-600'}`} />}
            <button
              onClick={() => reachable && onJump(s.n)}
              disabled={!reachable}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition
                ${active ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : done ? 'bg-ink-800 text-mint-400 border border-mint-400/30 hover:border-mint-400/60'
                  : reachable ? 'bg-ink-800 text-ink-300 border border-ink-600 hover:text-ink-100'
                  : 'bg-ink-900 text-ink-600 border border-ink-700 cursor-not-allowed'}`}
            >
              <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold
                ${active ? 'bg-white/20' : done ? 'bg-mint-400/20' : 'bg-ink-700'}`}>
                {done ? '✓' : s.n}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export function ApiKeyModal({ open, onClose }) {
  const [key, setKey] = useState(getApiKey())
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-ink-600 bg-ink-800 p-6 animate-rise" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-ink-100 mb-1">🔑 Gemini API Key</h2>
        <p className="text-sm text-ink-300 mb-4">
          แอปนี้เรียก Gemini API ตรงจากเบราว์เซอร์ของคุณ — key ถูกเก็บใน localStorage ของเครื่องคุณเท่านั้น ไม่ถูกส่งไปที่อื่น
          ขอ key ฟรีได้ที่{' '}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-brand-400 underline hover:text-glow-400">
            aistudio.google.com/apikey
          </a>
        </p>
        <TextInput value={key} onChange={setKey} placeholder="วาง API key ที่นี่ (ขึ้นต้นด้วย AIza...)" />
        <div className="mt-4 flex gap-3 justify-end">
          <GhostButton onClick={onClose}>ปิด</GhostButton>
          <PrimaryButton onClick={() => { setApiKey(key); onClose() }}>💾 บันทึก key</PrimaryButton>
        </div>
      </div>
    </div>
  )
}
