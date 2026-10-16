import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  isModelCached,
  removeCachedModel,
  modelStorageSupported
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
})
