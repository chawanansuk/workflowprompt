import { GoogleGenAI } from '@google/genai'

const KEY_STORAGE = 'wtas_gemini_api_key'

export function getApiKey() {
  return (
    localStorage.getItem(KEY_STORAGE) ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    (typeof process !== 'undefined' && process.env && process.env.API_KEY) ||
    ''
  )
}

export function setApiKey(key) {
  if (key) localStorage.setItem(KEY_STORAGE, key.trim())
  else localStorage.removeItem(KEY_STORAGE)
}

export function hasApiKey() {
  return Boolean(getApiKey())
}

function client() {
  const apiKey = getApiKey()
  if (!apiKey) {
    const err = new Error('NO_API_KEY')
    err.code = 'NO_API_KEY'
    throw err
  }
  return new GoogleGenAI({ apiKey })
}

function stripCodeFences(text) {
  let t = (text || '').trim()
  const fence = t.match(/^```(?:json|javascript|js)?\s*([\s\S]*?)\s*```$/)
  if (fence) t = fence[1].trim()
  return t
}

export function parseJsonLoose(text) {
  const t = stripCodeFences(text)
  try {
    return JSON.parse(t)
  } catch {
    const start = t.indexOf('{')
    const end = t.lastIndexOf('}')
    if (start >= 0 && end > start) {
      return JSON.parse(t.slice(start, end + 1))
    }
    throw new Error('PARSE_FAILED')
  }
}

// dataUrl -> { inlineData: { mimeType, data } }
function dataUrlToPart(dataUrl) {
  const [head, data] = dataUrl.split(',')
  const mimeType = head.match(/data:(.*?);base64/)?.[1] || 'image/png'
  return { inlineData: { mimeType, data } }
}

/**
 * Call Gemini for text (optionally structured JSON, optionally with images).
 */
export async function generateText({ system, user, json = false, schema = null, images = [] }) {
  const ai = client()
  const parts = [{ text: user }]
  for (const img of images) parts.push(dataUrlToPart(img))

  const config = { systemInstruction: system }
  if (json) {
    config.responseMimeType = 'application/json'
    if (schema) config.responseSchema = schema
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts }],
    config,
  })

  const text = response.text
  if (!text) throw new Error('EMPTY_RESPONSE')
  return json ? parseJsonLoose(text) : stripCodeFences(text)
}

/**
 * Experimental: generate a mockup image directly with Gemini (nano banana).
 * Returns a dataURL.
 */
export async function generateImage(prompt) {
  const ai = client()
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  })
  const parts = response.candidates?.[0]?.content?.parts || []
  for (const part of parts) {
    if (part.inlineData?.data) {
      const mime = part.inlineData.mimeType || 'image/png'
      return `data:${mime};base64,${part.inlineData.data}`
    }
  }
  throw new Error('NO_IMAGE_RETURNED')
}

export function friendlyError(err) {
  const msg = String(err?.message || err)
  if (err?.code === 'NO_API_KEY' || msg.includes('NO_API_KEY')) {
    return 'ยังไม่ได้ใส่ Gemini API Key — กดปุ่ม "🔑 API Key" มุมขวาบนเพื่อตั้งค่าก่อนนะครับ'
  }
  if (msg.includes('API key not valid') || msg.includes('API_KEY_INVALID') || msg.includes('403')) {
    return 'API Key ไม่ถูกต้องหรือหมดสิทธิ์ใช้งาน — ลองตรวจสอบ key ที่ aistudio.google.com/apikey'
  }
  if (msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('resource_exhausted')) {
    return 'เรียกใช้งานถี่เกินโควต้าชั่วคราว — พักสักครู่แล้วกด "ลองใหม่" อีกครั้ง'
  }
  if (msg.includes('PARSE_FAILED') || msg.includes('EMPTY_RESPONSE')) {
    return 'AI ตอบกลับมาในรูปแบบที่อ่านไม่ได้ — กด "ลองใหม่" เพื่อให้สร้างคำตอบอีกครั้ง'
  }
  if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')) {
    return 'เชื่อมต่ออินเทอร์เน็ตไม่สำเร็จ — ตรวจสอบการเชื่อมต่อแล้วกด "ลองใหม่"'
  }
  return `เกิดข้อผิดพลาด: ${msg.slice(0, 160)} — กด "ลองใหม่" ได้เลย`
}
