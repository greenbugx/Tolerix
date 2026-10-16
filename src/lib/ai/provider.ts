import type { ModelInstallationState } from '../validation/schemas'

export interface ProviderStatus {
  status: ModelInstallationState
  detail: string | null
}

export interface LoadOptions {
  allowRemoteLoad: boolean
}

export interface GenerateOptions {
  systemPrompt: string
  userPrompt: string
  onToken?: (chunk: string) => void
  signal?: AbortSignal
}

export interface LocalTextModel {
  readonly id: string
  load(report: (status: ProviderStatus) => void, options: LoadOptions): Promise<void>
  generate(options: GenerateOptions): Promise<string>
  release(): Promise<void>
  isLoaded(): boolean
}
