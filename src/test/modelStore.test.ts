import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  isModelCached,
  removeCachedModel,
  modelStorageSupported,
  downloadModel
} from '../lib/ai/modelStore'
import { getModelDescriptor, formatBytes } from '../lib/ai/modelConfig'

describe('Model Store and Descriptors', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('correctly resolves verified model descriptors', () => {
    const model4b = getModelDescriptor('gemma-4b')
    expect(model4b.label).toBe('Gemma 4B')
    expect(model4b.url).toContain('huggingface.co/litert-community/gemma-4-E4B-it-litert-lm')
    expect(model4b.approxBytes).toBeGreaterThan(2_000_000_000)

    const model2b = getModelDescriptor('gemma-2b')
    expect(model2b.label).toBe('Gemma 2B')
    expect(model2b.url).toContain('huggingface.co/litert-community/gemma-4-E2B-it-litert-lm')
    expect(model2b.approxBytes).toBeGreaterThan(1_500_000_000)
  })

  it('rejects unknown model identifiers with a descriptive error', () => {
    expect(() => getModelDescriptor('unknown-model-xyz')).toThrow('Unknown model identifier')
    expect(() => getModelDescriptor('gpt-4')).toThrow('Unknown model identifier')
  })

  it('formats byte measurements into human readable strings', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(500)).toBe('500 B')
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB')
    expect(formatBytes(2008432640)).toBe('1.9 GB')
  })

  it('checks model cache status and removal gracefully when caches API is mock or missing', async () => {
    const isCached = await isModelCached('gemma-4b')
    expect(typeof isCached).toBe('boolean')

    await expect(removeCachedModel('gemma-4b')).resolves.toBeUndefined()
    const supported = await modelStorageSupported()
    expect(typeof supported).toBe('boolean')
  })

  it('cleans up and rejects truncated model downloads', async () => {
    const mockCache = {
      match: vi.fn().mockResolvedValue(undefined),
      put: vi.fn().mockImplementation(async (_key, res: Response) => {
        const reader = res.body?.getReader()
        if (reader) {
          while (true) {
            const { done } = await reader.read()
            if (done) break
          }
        }
      }),
      delete: vi.fn().mockResolvedValue(true)
    }

    const originalCaches = globalThis.caches
    globalThis.caches = {
      open: vi.fn().mockResolvedValue(mockCache),
      delete: vi.fn(),
      has: vi.fn(),
      keys: vi.fn(),
      match: vi.fn()
    } as unknown as CacheStorage

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2, 3]))
        controller.close()
      }
    })

    const originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn().mockImplementation(async (_url: string | URL | Request, init?: RequestInit) => {
      if (init?.method === 'HEAD') {
        return new Response(null, { headers: { 'content-length': '1000' } })
      }
      return new Response(stream, { status: 200 })
    })

    const controller = new AbortController()
    await expect(downloadModel('gemma-2b', () => {}, controller.signal)).rejects.toThrow('truncated')

    expect(mockCache.delete).toHaveBeenCalled()

    globalThis.caches = originalCaches
    globalThis.fetch = originalFetch
  })
})
