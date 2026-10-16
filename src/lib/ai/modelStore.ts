import { getModelDescriptor } from './modelConfig'

const MODEL_CACHE_NAME = 'tolerix-models-v1'

export interface ModelStoreProgress {
  receivedBytes: number
  totalBytes: number | null
}

export class ModelDownloadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ModelDownloadError'
  }
}

async function openModelCache(): Promise<Cache | null> {
  if (typeof caches === 'undefined') return null
  try {
    return await caches.open(MODEL_CACHE_NAME)
  } catch {
    return null
  }
}

export async function isModelCached(modelId: string): Promise<boolean> {
  const cache = await openModelCache()
  if (!cache) return false
  const descriptor = getModelDescriptor(modelId)
  const match = await cache.match(new Request(descriptor.url))
  if (!match) return false
  const verifiedLength = Number(match.headers.get('x-tolerix-verified-bytes'))
  return Number.isFinite(verifiedLength) && verifiedLength > 0
}

export async function cachedModelBytes(modelId: string): Promise<number | null> {
  const cache = await openModelCache()
  if (!cache) return null
  const descriptor = getModelDescriptor(modelId)
  const response = await cache.match(new Request(descriptor.url))
  if (!response) return null
  const verifiedLength = Number(response.headers.get('x-tolerix-verified-bytes'))
  if (Number.isFinite(verifiedLength) && verifiedLength > 0) return verifiedLength
  return null
}

export async function removeCachedModel(modelId: string): Promise<void> {
  const cache = await openModelCache()
  if (!cache) return
  const descriptor = getModelDescriptor(modelId)
  await cache.delete(new Request(descriptor.url))
}

export async function modelStorageSupported(): Promise<boolean> {
  const cache = await openModelCache()
  return cache !== null
}

async function probeRemoteSize(url: string): Promise<number | null> {
  try {
    const head = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    const length = Number(head.headers.get('content-length'))
    return Number.isFinite(length) && length > 0 ? length : null
  } catch {
    return null
  }
}

export async function downloadModel(
  modelId: string,
  onProgress: (progress: ModelStoreProgress) => void,
  signal: AbortSignal
): Promise<void> {
  const cache = await openModelCache()
  if (!cache) {
    throw new ModelDownloadError(
      'This browser cannot store model files locally, so the model cannot be kept for offline use.'
    )
  }

  const descriptor = getModelDescriptor(modelId)
  const cacheKey = new Request(descriptor.url)
  const totalBytes = (await probeRemoteSize(descriptor.url)) ?? descriptor.approxBytes
  const response = await fetch(descriptor.url, { signal, redirect: 'follow' })

  if (!response.ok || !response.body) {
    throw new ModelDownloadError(`The model download failed with status ${response.status}.`)
  }

  let receivedBytes = 0
  const tracker = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      receivedBytes += chunk.byteLength
      onProgress({ receivedBytes, totalBytes })
      controller.enqueue(chunk)
    },
    flush() {
      if (totalBytes > 0 && receivedBytes < totalBytes) {
        throw new ModelDownloadError(
          `The model download was truncated: received ${receivedBytes} of ${totalBytes} bytes.`
        )
      }
    }
  })

  try {
    await cache.put(
      cacheKey,
      new Response(response.body.pipeThrough(tracker), {
        headers: {
          'content-type': 'application/octet-stream',
          'x-tolerix-verified-bytes': String(totalBytes)
        }
      })
    )
  } catch (error) {
    await cache.delete(cacheKey)
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new ModelDownloadError('The browser ran out of storage while saving the model file.')
    }
    throw new ModelDownloadError(
      error instanceof Error ? error.message : 'The model file could not be written to local storage.'
    )
  }
}

export async function openCachedModelStream(
  modelId: string
): Promise<ReadableStream<Uint8Array> | null> {
  const cache = await openModelCache()
  if (!cache) return null
  const descriptor = getModelDescriptor(modelId)
  const cacheKey = new Request(descriptor.url)
  const response = await cache.match(cacheKey)
  if (!response?.body) return null
  const verifiedLength = Number(response.headers.get('x-tolerix-verified-bytes'))
  if (!Number.isFinite(verifiedLength) || verifiedLength <= 0) {
    await cache.delete(cacheKey)
    return null
  }
  return response.body
}
