import React, { useEffect, useState } from 'react'
import { Stepper, ApiKeyModal, STEPS } from './components/Shell.jsx'
import Step1Input from './components/Step1Input.jsx'
import Step2Blueprint from './components/Step2Blueprint.jsx'
import Step3Mockup from './components/Step3Mockup.jsx'
import Step4Build from './components/Step4Build.jsx'
import Step5Iterate from './components/Step5Iterate.jsx'
import { GhostButton } from './components/ui.jsx'
import { generateText, generateImage, friendlyError, hasApiKey } from './lib/gemini.js'
import {
  BLUEPRINT_SCHEMA,
  blueprintSystem, blueprintUser,
  revisionSystem, revisionUser,
  mockupPromptSystem, mockupUser,
  mockupRevisionSystem, mockupRevisionUser,
  buildPromptSystem, buildUser,
  followupSystem, followupUser,
} from './lib/prompts.js'

const STORAGE = 'wtas_project_v1'

const initialState = {
  step: 1,
  maxStep: 1,
  input: { workflowPrompt: '', appName: '', features: '', themePreset: '', themeCustom: '' },
  blueprint: null,
  mockupPrompt: '',
  mockupImage: null,
  buildPrompt: '',
  iterations: [],
  finished: false,
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE)
    if (!raw) return initialState
    return { ...initialState, ...JSON.parse(raw) }
  } catch {
    return initialState
  }
}

export default function App() {
  const [state, setState] = useState(loadState)
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastAction, setLastAction] = useState(null) // for retry
  const [keyModal, setKeyModal] = useState(false)

  useEffect(() => {
    try {
      // Persist everything except heavy images to stay within localStorage quota.
      const { mockupImage, ...rest } = state
      localStorage.setItem(STORAGE, JSON.stringify(rest))
    } catch { /* quota exceeded — skip persistence silently */ }
  }, [state])

  const patch = (p) => setState((s) => ({ ...s, ...p }))

  async function run(action, fn) {
    if (!hasApiKey()) { setKeyModal(true); return }
    setLoading(true)
    setError('')
    setLastAction(() => action)
    try {
      await fn()
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  // ---- Step 1 → 2 ----
  const analyzeWorkflow = () => {
    if (!hasApiKey()) { setKeyModal(true); return }
    patch({ step: 2, maxStep: Math.max(state.maxStep, 2) })
    run(analyzeWorkflow, async () => {
      const { workflowPrompt, appName, features, themePreset, themeCustom } = state.input
      const theme = themePreset === 'อื่นๆ' ? themeCustom : themePreset
      const blueprint = await generateText({
        system: blueprintSystem,
        user: blueprintUser({ workflowPrompt, appName, theme, features }),
        json: true,
        schema: BLUEPRINT_SCHEMA,
      })
      patch({ blueprint })
    })
  }

  const reviseBlueprint = (notes) =>
    run(() => reviseBlueprint(notes), async () => {
      const blueprint = await generateText({
        system: revisionSystem,
        user: revisionUser({ blueprint: state.blueprint, notes }),
        json: true,
        schema: BLUEPRINT_SCHEMA,
      })
      patch({ blueprint })
    })

  // ---- Step 2 → 3 ----
  const approveBlueprint = () => {
    patch({ step: 3, maxStep: Math.max(state.maxStep, 3) })
    if (!state.mockupPrompt) generateMockupPrompt()
  }

  const generateMockupPrompt = () =>
    run(generateMockupPrompt, async () => {
      const mockupPrompt = await generateText({
        system: mockupPromptSystem,
        user: mockupUser({ blueprint: state.blueprint }),
      })
      patch({ mockupPrompt })
    })

  const reviseMockupPrompt = (notes) =>
    run(() => reviseMockupPrompt(notes), async () => {
      const mockupPrompt = await generateText({
        system: mockupRevisionSystem,
        user: mockupRevisionUser({ blueprint: state.blueprint, previousPrompt: state.mockupPrompt, notes }),
      })
      patch({ mockupPrompt, mockupImage: null })
    })

  const generateMockupInApp = async () => {
    if (!hasApiKey()) { setKeyModal(true); return }
    setImageLoading(true)
    setError('')
    try {
      const img = await generateImage(state.mockupPrompt)
      patch({ mockupImage: img })
    } catch (err) {
      setError(friendlyError(err))
      setLastAction(() => generateMockupInApp)
    } finally {
      setImageLoading(false)
    }
  }

  // ---- Step 3 → 4 ----
  const approveMockup = () => {
    patch({ step: 4, maxStep: Math.max(state.maxStep, 4) })
    if (!state.buildPrompt) generateBuildPrompt()
  }

  const generateBuildPrompt = () =>
    run(generateBuildPrompt, async () => {
      const buildPrompt = await generateText({
        system: buildPromptSystem,
        user: buildUser({ workflowPrompt: state.input.workflowPrompt, blueprint: state.blueprint }),
      })
      patch({ buildPrompt })
    })

  // ---- Step 5 ----
  const generateFollowup = ({ category, request, screenshot }) =>
    run(() => generateFollowup({ category, request, screenshot }), async () => {
      const result = await generateText({
        system: followupSystem,
        user: followupUser({ blueprint: state.blueprint, category, request, hasScreenshot: Boolean(screenshot) }),
        images: screenshot ? [screenshot] : [],
      })
      setState((s) => ({ ...s, iterations: [...s.iterations, { category, request, result }] }))
    })

  const restart = () => {
    if (!confirm('เริ่มโปรเจกต์ใหม่? งานปัจจุบันทั้งหมดจะถูกล้าง')) return
    localStorage.removeItem(STORAGE)
    setState(initialState)
    setError('')
  }

  const jump = (n) => {
    setError('')
    patch({ step: n })
  }

  const retry = () => { setError(''); lastAction?.() }

  return (
    <div className="min-h-screen text-ink-100">
      {/* header */}
      <header className="sticky top-0 z-40 border-b border-ink-700 bg-ink-950/85 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-2xl">🏭</span>
            <div>
              <div className="font-bold leading-tight bg-gradient-to-r from-brand-400 to-glow-400 bg-clip-text text-transparent">
                Workflow → App Studio
              </div>
              <div className="text-[11px] text-ink-300 leading-tight">แปลง workflow prompt เป็นเว็บแอปด้วย vibe coding</div>
            </div>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => setKeyModal(true)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition
              ${hasApiKey() ? 'border-mint-400/40 text-mint-400 hover:border-mint-400' : 'border-amber-400/50 text-amber-400 hover:border-amber-400 animate-pulse-soft'}`}
          >
            🔑 API Key {hasApiKey() ? '✓' : '· ยังไม่ได้ตั้งค่า'}
          </button>
          <button onClick={restart} className="px-3 py-1.5 rounded-lg text-sm border border-ink-600 text-ink-300 hover:text-ink-100 hover:border-ink-300 transition">
            🆕 เริ่มใหม่
          </button>
        </div>
        <div className="mx-auto max-w-5xl px-4 pb-3">
          <Stepper step={state.step} maxStep={state.maxStep} onJump={jump} />
        </div>
      </header>

      {/* body */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        {state.step === 1 && (
          <Step1Input
            data={state.input}
            onChange={(input) => patch({ input })}
            onNext={analyzeWorkflow}
          />
        )}

        {state.step === 2 && (
          <Step2Blueprint
            blueprint={state.blueprint}
            loading={loading}
            error={error}
            onRetry={retry}
            onApprove={approveBlueprint}
            onRevise={reviseBlueprint}
          />
        )}

        {state.step === 3 && (
          <Step3Mockup
            mockupPrompt={state.mockupPrompt}
            mockupImage={state.mockupImage}
            loading={loading}
            imageLoading={imageLoading}
            error={error}
            onRetry={retry}
            onSetImage={(img) => patch({ mockupImage: img })}
            onGenerateInApp={generateMockupInApp}
            onApprove={approveMockup}
            onRevise={reviseMockupPrompt}
          />
        )}

        {state.step === 4 && (
          <Step4Build
            buildPrompt={state.buildPrompt}
            appName={state.blueprint?.appConcept?.name}
            loading={loading}
            error={error}
            onRetry={retry}
            onNext={() => patch({ step: 5, maxStep: Math.max(state.maxStep, 5) })}
          />
        )}

        {state.step === 5 && (
          <Step5Iterate
            history={state.iterations}
            loading={loading}
            error={error}
            onRetry={retry}
            onGenerate={generateFollowup}
            onFinish={() => patch({ finished: true })}
            finished={state.finished}
            onRestart={restart}
          />
        )}

        {/* back navigation */}
        {state.step > 1 && !loading && !state.finished && (
          <div className="mt-8">
            <GhostButton onClick={() => jump(state.step - 1)} className="!px-4 !py-2 text-sm">
              ← กลับขั้นที่ {state.step - 1} ({STEPS[state.step - 2].label})
            </GhostButton>
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-8 text-center text-xs text-ink-300/60">
        ทุกการตัดสินใจคือปุ่ม · ทุกคำถามคือฟอร์ม · กฎของ workflow เดิมศักดิ์สิทธิ์เสมอ
      </footer>

      <ApiKeyModal open={keyModal} onClose={() => setKeyModal(false)} />
    </div>
  )
}
