export interface BrowserCapabilities {
  secureContext: boolean
  indexedDb: boolean
  cacheStorage: boolean
  serviceWorker: boolean
  webGpu: 'available' | 'unavailable'
  webGpuReason: string | null
  storageEstimate: { usage: number | null; quota: number | null }
  persistentStorage: 'granted' | 'denied' | 'unsupported' | 'unknown'
  online: boolean
}

export async function requestWebGpuAdapter(): Promise<{ available: boolean; reason: string | null }> {
  const nav = typeof navigator !== 'undefined' ? (navigator as Navigator & { gpu?: GPU }) : undefined
  const gpu = nav?.gpu
  if (!gpu) {
    return { available: false, reason: 'This browser does not expose the WebGPU API.' }
  }
  try {
    const adapter = await gpu.requestAdapter({ powerPreference: 'high-performance' })
    if (!adapter) {
      return { available: false, reason: 'No WebGPU adapter is available on this device.' }
    }
    return { available: true, reason: null }
  } catch (error) {
    return {
      available: false,
      reason: error instanceof Error ? error.message : 'WebGPU adapter request failed.'
    }
  }
}

export async function readStorageEstimate(): Promise<{ usage: number | null; quota: number | null }> {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) {
    return { usage: null, quota: null }
  }
  try {
    const estimate = await navigator.storage.estimate()
    return { usage: estimate.usage ?? null, quota: estimate.quota ?? null }
  } catch {
    return { usage: null, quota: null }
  }
}

export async function readPersistentStorage(): Promise<BrowserCapabilities['persistentStorage']> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) {
    return 'unsupported'
  }
  try {
    const isPersisted = await navigator.storage.persisted()
    return isPersisted ? 'granted' : 'denied'
  } catch {
    return 'unknown'
  }
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) {
    return false
  }
  try {
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

export async function detectBrowserCapabilities(): Promise<BrowserCapabilities> {
  const webGpu = await requestWebGpuAdapter()
  const [storageEstimate, persistentStorage] = await Promise.all([
    readStorageEstimate(),
    readPersistentStorage()
  ])

  return {
    secureContext: typeof window !== 'undefined' ? window.isSecureContext : false,
    indexedDb: typeof indexedDB !== 'undefined',
    cacheStorage: typeof caches !== 'undefined',
    serviceWorker: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
    webGpu: webGpu.available ? 'available' : 'unavailable',
    webGpuReason: webGpu.reason,
    storageEstimate,
    persistentStorage,
    online: typeof navigator !== 'undefined' ? navigator.onLine : true
  }
}
