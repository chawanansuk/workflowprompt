import React, { useEffect, useState } from 'react'
import { Stepper, ApiKeyModal, STEPS } from './components/Shell.jsx'
import Step1Input from './components/Step1Input.jsx'
import Step2Blueprint from './components/Step2Blueprint.jsx'
import Step3Mockup from './components/Step3Mockup.jsx'
import Step4Build from './components/Step4Build.jsx'
import Step5Iterate from './components/Step5Iterate.jsx'
import { GhostButton } from './components/ui.jsx'
import { generateText, generateImage, friendlyError, hasApiKey, validateBlueprint } from './lib/gemini.js'
import {
  BLUEPRINT_SCHEMA,
  blueprintSystem, blueprintUser,
  revisionSystem, revisionUser,
  mockupPromptSystem, mockupUser,
  mockupRevisionSystem, mockupRevisionUser,
  buildPromptSystem, buildUser,
  followupSystem, followupUser,
  enhanceSystem,
} from './lib/prompts.js'

const STORAGE = 'wtas_project_v1'

const initialState = {
  step: 1,
  maxStep: 1,
  input: { workflowPrompt: '', appName: '', features: '', themePreset: '', themeCustom: '', capabilities: [] },
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
    const parsed = JSON.parse(raw)
    // Deep-merge input so fields added in newer versions get their defaults.
    return { ...initialState, ...parsed, input: { ...initialState.input, ...(parsed.input || {}) } }
  } catch {
    return initialState
  }
}

export default function App() {
  const [state, setState] = useState(loadState)
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageError, setImageError] = useState('')
  const [lastAction, setLastAction] = useState(null) // for retry
  const [keyModal, setKeyModal] = useState(false)

  useEffect(() => {
    // Debounced persistence: typing in Step 1 patches state per keystroke, and a
    // full-state JSON.stringify + sync localStorage write per keypress lags input.
    const t = setTimeout(() => {
      try {
        // Persist everything except heavy images to stay within localStorage quota.
        const { mockupImage, ...rest } = state
        localStorage.setItem(STORAGE, JSON.stringify(rest))
      } catch { /* quota exceeded — skip persistence silently */ }
    }, 400)
    return () => clearTimeout(t)
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

  // ---- Step 1: enhance a rough idea into a full workflow prompt ----
  const [enhancing, setEnhancing] = useState(false)
  const [enhanceError, setEnhanceError] = useState('')
  const enhanceWorkflow = async () => {
    if (!hasApiKey()) { setKeyModal(true); return }
    setEnhancing(true)
    setEnhanceError('')
    try {
      const improved = await generateText({ system: enhanceSystem, user: state.input.workflowPrompt })
      setState((s) => ({ ...s, input: { ...s.input, workflowPrompt: improved } }))
    } catch (err) {
      setEnhanceError(friendlyError(err))
    } finally {
      setEnhancing(false)
    }
  }

  // ---- Step 1 → 2 ----
  // A new analysis starts a new design: every downstream artifact must be
  // invalidated, otherwise steps 3-5 keep serving the previous blueprint's output.
  const analyzeWorkflow = () => {
    if (!hasApiKey()) { setKeyModal(true); return }
    patch({
      step: 2, maxStep: 2,
      blueprint: null, mockupPrompt: '', mockupImage: null, buildPrompt: '',
      iterations: [], finished: false,
    })
    run(analyzeWorkflow, async () => {
      const { workflowPrompt, appName, features, themePreset, themeCustom, capabilities } = state.input
      const theme = themePreset === 'อื่นๆ' ? themeCustom : themePreset
      const blueprint = await generateText({
        system: blueprintSystem,
        user: blueprintUser({ workflowPrompt, appName, theme, features, capabilities }),
        json: true,
        schema: BLUEPRINT_SCHEMA,
      })
      if (!validateBlueprint(blueprint)) throw new Error('PARSE_FAILED')
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
      if (!validateBlueprint(blueprint)) throw new Error('PARSE_FAILED')
      // Blueprint changed → mockup/build prompts describe the old design; drop them.
      patch({ blueprint, mockupPrompt: '', mockupImage: null, buildPrompt: '', maxStep: 2 })
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
      // The build prompt must match the approved mockup — invalidate it too.
      patch({ mockupPrompt, mockupImage: null, buildPrompt: '', maxStep: 3 })
    })

  // Uses its own error channel so a failed optional image experiment never
  // hides the primary copy-paste workflow of step 3.
  const generateMockupInApp = async () => {
    if (!hasApiKey()) { setKeyModal(true); return }
    const promptAtCall = state.mockupPrompt
    setImageLoading(true)
    setImageError('')
    try {
      const img = await generateImage(promptAtCall)
      // The prompt may have been revised while the image was rendering — a stale
      // image must not attach itself to the new prompt.
      setState((s) => (s.mockupPrompt === promptAtCall ? { ...s, mockupImage: img } : s))
    } catch (err) {
      setImageError(friendlyError(err))
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
        user: buildUser({
          workflowPrompt: state.input.workflowPrompt,
          blueprint: state.blueprint,
          capabilities: state.input.capabilities,
        }),
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
    setImageError('')
  }

  const jump = (n) => {
    setError('')
    patch({ step: n })
  }

  const retry = () => { setError(''); lastAction?.() }

  // Project backup/restore — generated prompts are work products worth keeping.
  const exportProject = () => {
    const { mockupImage, ...rest } = state
    const blob = new Blob([JSON.stringify(rest, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${(state.blueprint?.appConcept?.name || 'workflow-app').replace(/\s+/g, '-')}-project.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importProject = (file) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (typeof data.step !== 'number' || !data.input) throw new Error('bad file')
        setState({ ...initialState, ...data, mockupImage: null })
        setError('')
        setImageError('')
      } catch {
        alert('ไฟล์นี้ไม่ใช่โปรเจกต์ของ Workflow → App Studio')
      }
    }
    reader.readAsText(file)
  }

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
          <button onClick={exportProject} title="ดาวน์โหลดโปรเจกต์เป็นไฟล์ .json"
            className="px-2.5 py-1.5 rounded-lg text-sm border border-ink-600 text-ink-300 hover:text-ink-100 hover:border-ink-300 transition">
            ⬇️
          </button>
          <label title="เปิดโปรเจกต์จากไฟล์ .json"
            className="px-2.5 py-1.5 rounded-lg text-sm border border-ink-600 text-ink-300 hover:text-ink-100 hover:border-ink-300 transition cursor-pointer">
            ⬆️
            <input type="file" accept="application/json,.json" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) importProject(f); e.target.value = '' }} />
          </label>
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
            onEnhance={enhanceWorkflow}
            enhancing={enhancing}
            enhanceError={enhanceError}
          />
        )}

        {state.step === 2 && (
          <Step2Blueprint
            blueprint={state.blueprint}
            loading={loading}
            error={error}
            onRetry={retry}
            onGenerate={analyzeWorkflow}
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
            imageError={imageError}
            onRetry={retry}
            onGenerate={generateMockupPrompt}
            onEditPrompt={(t) => patch({ mockupPrompt: t, mockupImage: null, buildPrompt: '' })}
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
            onGenerate={generateBuildPrompt}
            onEditPrompt={(t) => patch({ buildPrompt: t })}
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
            onUnfinish={() => patch({ finished: false })}
            finished={state.finished}
            onRestart={restart}
          />
        )}

        {/* back navigation (hidden only on the finished celebration screen itself) */}
        {state.step > 1 && !loading && !(state.finished && state.step === 5) && (
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

      {/* Mounted only while open so the key field re-reads storage on each open */}
      {keyModal && <ApiKeyModal open onClose={() => setKeyModal(false)} />}
    </div>
  )
}
