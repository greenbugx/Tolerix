import { Engine, loadLiteRtLm } from '@litert-lm/core'
import type { Conversation, Engine as LiteRtEngine, LiteRtLm } from '@litert-lm/core'
import { getModelDescriptor, LITERT_WASM_PATH } from './modelConfig'
import { openCachedModelStream } from './modelStore'
import type { GenerateOptions, LoadOptions, LocalTextModel, ProviderStatus } from './provider'

export class LocalInferenceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LocalInferenceError'
  }
}

let wasmLoad: Promise<LiteRtLm> | null = null
let activeEngine: LiteRtEngine | null = null
let activeConversation: Conversation | null = null
let activeModelId: string | null = null
let engineLoad: Promise<void> | null = null

async function ensureRuntime(): Promise<void> {
  if (wasmLoad) {
    await wasmLoad
    return
  }
  wasmLoad = loadLiteRtLm(LITERT_WASM_PATH)
  try {
    await wasmLoad
  } catch (error) {
    wasmLoad = null
    throw new LocalInferenceError(
      error instanceof Error ? error.message : 'The LiteRT-LM WebGPU runtime could not be loaded.'
    )
  }
}

async function createEngineForModel(
  modelId: string,
  report: (status: ProviderStatus) => void,
  allowRemoteLoad: boolean
): Promise<LiteRtEngine> {
  const descriptor = getModelDescriptor(modelId)
  const cachedStream = await openCachedModelStream(modelId)

  if (cachedStream) {
    report({ status: 'loading', detail: `Loading ${descriptor.label} from local storage...` })
    return Engine.create({
      model: cachedStream,
      mainExecutorSettings: { maxNumTokens: 4096 }
    })
  }

  if (!allowRemoteLoad) {
    throw new LocalInferenceError(
      `${descriptor.label} has not been downloaded to this device yet. Please download it first.`
    )
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new LocalInferenceError(`${descriptor.label} is not downloaded and this workstation is offline.`)
  }

  report({ status: 'loading', detail: `Streaming ${descriptor.label} from upstream repository...` })
  return Engine.create({
    model: descriptor.url,
    mainExecutorSettings: { maxNumTokens: 4096 }
  })
}

export function createGemmaProvider(modelId: string): LocalTextModel {
  return {
    id: modelId,

    isLoaded() {
      return activeModelId === modelId && activeConversation !== null
    },

    async load(report: (status: ProviderStatus) => void, options: LoadOptions): Promise<void> {
      if (activeModelId === modelId && activeConversation !== null) {
        report({ status: 'ready', detail: null })
        return
      }

      if (activeEngine && activeModelId !== modelId) {
        await this.release()
      }

      if (engineLoad) {
        await engineLoad
        if (activeModelId === modelId && activeConversation !== null) {
          report({ status: 'ready', detail: null })
          return
        }
      }

      engineLoad = (async () => {
        await ensureRuntime()
        report({ status: 'loading', detail: 'Initializing WebGPU execution engine...' })
        activeEngine = await createEngineForModel(modelId, report, options.allowRemoteLoad)
        activeConversation = await activeEngine.createConversation()
        activeModelId = modelId
        report({ status: 'ready', detail: null })
      })()

      try {
        await engineLoad
      } finally {
        engineLoad = null
      }
    },

    async generate(options: GenerateOptions): Promise<string> {
      const active = activeConversation
      if (!active || activeModelId !== modelId) {
        throw new LocalInferenceError('The Gemma model is not ready. Please initialize it first.')
      }

      const cancel = () => active.cancel()
      options.signal?.addEventListener('abort', cancel, { once: true })

      try {
        const stream = active.sendMessageStreaming([
          { role: 'system', content: options.systemPrompt },
          { role: 'user', content: options.userPrompt }
        ])
        let output = ''
        for await (const message of stream) {
          const parts = message.content ?? []
          for (const part of typeof parts === 'string' ? [{ type: 'text' as const, text: parts }] : parts) {
            if (part.type === 'text') {
              output += part.text
              options.onToken?.(part.text)
            }
          }
        }
        return output
      } catch (error) {
        if (options.signal?.aborted) {
          throw new LocalInferenceError('Inference was cancelled by operator.')
        }
        throw new LocalInferenceError(
          error instanceof Error ? error.message : 'Inference generation failed.'
        )
      } finally {
        options.signal?.removeEventListener('abort', cancel)
      }
    },

    async release(): Promise<void> {
      activeConversation?.cancel()
      const engineToDelete = activeEngine
      activeConversation = null
      activeModelId = null
      activeEngine = null
      engineLoad = null
      if (engineToDelete) {
        await engineToDelete.delete()
      }
    }
  }
}
