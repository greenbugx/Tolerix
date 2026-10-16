export interface ModelDescriptor {
  id: string
  label: string
  repo: string
  fileName: string
  url: string
  approxBytes: number
  license: string
  licenseUrl: string
  purpose: string
}

export const GEMMA_4B: ModelDescriptor = {
  id: 'gemma-4b',
  label: 'Gemma 4B',
  repo: 'litert-community/gemma-4-E4B-it-litert-lm',
  fileName: 'gemma-4-E4B-it-web.litertlm',
  url: 'https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm/resolve/main/gemma-4-E4B-it-web.litertlm',
  approxBytes: 2969059328,
  license: 'Apache-2.0 (Gemma terms apply)',
  licenseUrl: 'https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm',
  purpose: 'High precision on-device requirements extraction'
}

export const GEMMA_2B: ModelDescriptor = {
  id: 'gemma-2b',
  label: 'Gemma 2B',
  repo: 'litert-community/gemma-4-E2B-it-litert-lm',
  fileName: 'gemma-4-E2B-it-web.litertlm',
  url: 'https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm/resolve/main/gemma-4-E2B-it-web.litertlm',
  approxBytes: 2008432640,
  license: 'Apache-2.0 (Gemma terms apply)',
  licenseUrl: 'https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm',
  purpose: 'Fast lightweight on-device requirements extraction'
}

export const MODELS: Record<string, ModelDescriptor> = {
  'gemma-4b': GEMMA_4B,
  'gemma-2b': GEMMA_2B
}

export const LITERT_WASM_PATH = '/runtime/litert'

export function getModelDescriptor(id: string): ModelDescriptor {
  const descriptor = MODELS[id]
  if (!descriptor) {
    throw new Error(`Unknown model identifier: "${id}". Supported models: ${Object.keys(MODELS).join(', ')}.`)
  }
  return descriptor
}

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes) || bytes <= 0) {
    return '0 B'
  }
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let val = bytes / 1024
  let u = 0
  while (val >= 1024 && u < units.length - 1) {
    val /= 1024
    u += 1
  }
  return `${val.toFixed(val >= 10 ? 0 : 1)} ${units[u]}`
}
