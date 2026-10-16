import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TolerixDatabase } from '../lib/db/database'
import { JobRepository } from '../lib/db/repositories/jobs'
import { FileRepository } from '../lib/db/repositories/files'
import { MachineProfileRepository } from '../lib/db/repositories/machineProfiles'
import { AuditRepository } from '../lib/db/repositories/audits'
import { AuditService } from '../lib/audit/auditService'
import {
  downloadModel,
  isModelCached,
  openCachedModelStream,
  removeCachedModel
} from '../lib/ai/modelStore'
import { createGemmaProvider } from '../lib/ai/gemmaProvider'
import { MODELS } from '../lib/ai/modelConfig'

describe('End-to-End Workflow & Model Lifecycle', () => {
  let db: TolerixDatabase
  let jobRepo: JobRepository
  let fileRepo: FileRepository
  let machineRepo: MachineProfileRepository
  let auditRepo: AuditRepository

  beforeEach(async () => {
    vi.restoreAllMocks()
    db = new TolerixDatabase(`e2e-db-${Date.now()}-${Math.random()}`)
    jobRepo = new JobRepository(db)
    fileRepo = new FileRepository(db)
    machineRepo = new MachineProfileRepository(db)
    auditRepo = new AuditRepository(db)
  })

  it('runs deterministic preflight audit on real SVG with known dimensional mismatch', async () => {
    const profile = await machineRepo.create({
      id: 'prof-test-e2e',
      name: 'Thunder Laser Nova 35',
      machineType: 'CO2 Laser',
      bedWidth: 900,
      bedHeight: 600,
      units: 'mm',
      supportedFormats: ['svg', 'dxf'],
      supportedMaterials: ['acrylic', 'plywood'],
      minThickness: 0.5,
      maxThickness: 10,
      minFeatureSize: 0.8,
      kerf: 0.15,
      allowedOperations: ['cut', 'engrave'],
      defaultTolerance: 0.5,
      isDefault: true,
      createdAt: Date.now()
    })

    const job = await jobRepo.create({
      id: 'job-mismatch-1',
      name: 'Acrylic Name Tag Batch',
      customerName: 'Maple Studio',
      originalInstructions:
        'Please make 10 acrylic tags, 120 by 80 mm, using 3 mm clear acrylic. Cut the outside and engrave the name on the front.',
      workflowStage: 'analysis',
      status: 'in_progress',
      selectedModelId: 'gemma-4b',
      selectedMachineProfileId: profile.id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })

    await jobRepo.upsertSpecification({
      id: 'spec-mismatch-1',
      jobId: job.id,
      quantity: 10,
      width: 120,
      height: 80,
      units: 'mm',
      material: 'acrylic',
      thickness: 3,
      operations: ['cut', 'engrave'],
      expectedCutLayers: ['cut', 'outside'],
      expectedEngraveLayers: ['engrave', 'text'],
      tolerances: { width: 0.5, height: 0.5 },
      fieldStates: {},
      sourceExcerpts: {},
      updatedAt: Date.now()
    })

    const realMismatchedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100mm" height="60mm" viewBox="0 0 100 60">
      <rect x="0" y="0" width="100.2" height="60.1" rx="5" stroke="red" fill="none" id="outer_contour" />
      <circle cx="10" cy="30" r="3" stroke="red" fill="none" id="keyhole" />
      <path d="M 30 35 L 70 35" stroke="#1e293b" fill="none" id="text_line" />
    </svg>`

    await fileRepo.create({
      id: 'file-mismatch-1',
      jobId: job.id,
      filename: 'name_tag_v2.svg',
      mimeType: 'image/svg+xml',
      extension: 'svg',
      fileSize: realMismatchedSvg.length,
      detectedFormat: 'svg',
      blob: new Blob([realMismatchedSvg], { type: 'image/svg+xml' }),
      sha256: '8f3a2e01b7a2d4889c1d00000000000000000000000000000000000000000000',
      parserStatus: 'parsed',
      uploadedAt: Date.now(),
      validationStatus: 'valid'
    })
    const auditService = new AuditService(jobRepo, fileRepo, machineRepo, auditRepo)
    const result = await auditService.runAudit(job.id, 'gemma-4b')
    expect(result.geometry.overallBoundsMm.widthMm).toBeCloseTo(100.2, 0.5)
    expect(result.geometry.overallBoundsMm.heightMm).toBeCloseTo(60.1, 0.5)

    const widthFinding = result.findings.find((f) => f.ruleId === 'RULE_DIM_WIDTH')
    expect(widthFinding?.severity).toBe('high')
    expect(widthFinding?.verificationStatus).toBe('issue')
    expect(widthFinding?.expectedValue).toBe('120.0 mm')
    expect(widthFinding?.detectedValue).toBe('100.2 mm')

    const heightFinding = result.findings.find((f) => f.ruleId === 'RULE_DIM_HEIGHT')
    expect(heightFinding?.severity).toBe('high')
    expect(heightFinding?.verificationStatus).toBe('issue')
    expect(heightFinding?.expectedValue).toBe('80.0 mm')
    expect(heightFinding?.detectedValue).toBe('60.1 mm')

    const thicknessFinding = result.findings.find((f) => f.ruleId === 'RULE_MAT_THICKNESS')
    expect(thicknessFinding?.verificationStatus).toBe('unverified')

    const nestingFinding = result.findings.find((f) => f.ruleId === 'RULE_QTY_NESTING')
    expect(nestingFinding?.verificationStatus).toBe('warning')

    const updatedJob = await jobRepo.getById(job.id)
    expect(updatedJob?.status).toBe('needs_review')
    expect(updatedJob?.lastAuditedAt).toBeGreaterThan(0)
  })

  it('verifies model download, cache storage, switching, and offline model execution check', async () => {
    const memoryCache = new Map<string, Response>()

    const mockCache = {
      match: vi.fn().mockImplementation(async (req: Request) => memoryCache.get(req.url)),
      put: vi.fn().mockImplementation(async (req: Request, res: Response) => {
        const reader = res.body?.getReader()
        let size = 0
        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            if (value) size += value.byteLength
          }
        }
        const headers = new Headers(res.headers)
        headers.set('x-tolerix-verified-bytes', String(size))
        memoryCache.set(req.url, new Response(new Uint8Array(size), { headers }))
      }),
      delete: vi.fn().mockImplementation(async (req: Request) => memoryCache.delete(req.url))
    }
    const originalCaches = globalThis.caches
    globalThis.caches = {
      open: vi.fn().mockResolvedValue(mockCache),
      delete: vi.fn(),
      has: vi.fn(),
      keys: vi.fn(),
      match: vi.fn()
    } as unknown as CacheStorage

    const originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn().mockImplementation(async (url: string | URL | Request, init?: RequestInit) => {
      const urlStr = typeof url === 'string' ? url : url.toString()
      const is2b = urlStr.includes(MODELS['gemma-2b'].fileName)
      const expectedSize = is2b ? 2048 : 4096
      if (init?.method === 'HEAD') {
        return new Response(null, { headers: { 'content-length': String(expectedSize) } })
      }

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(expectedSize))
          controller.close()
        }
      })
      return new Response(stream, {
        status: 200,
        headers: { 'content-length': String(expectedSize) }
      })
    })

    const controller = new AbortController()

    expect(await isModelCached('gemma-2b')).toBe(false)
    await downloadModel('gemma-2b', () => {}, controller.signal)
    expect(await isModelCached('gemma-2b')).toBe(true)

    expect(await isModelCached('gemma-4b')).toBe(false)
    await downloadModel('gemma-4b', () => {}, controller.signal)
    expect(await isModelCached('gemma-4b')).toBe(true)

    const stream2b = await openCachedModelStream('gemma-2b')
    expect(stream2b).not.toBeNull()

    const stream4b = await openCachedModelStream('gemma-4b')
    expect(stream4b).not.toBeNull()

    const provider2b = createGemmaProvider('gemma-2b')
    const provider4b = createGemmaProvider('gemma-4b')

    expect(provider2b.id).toBe('gemma-2b')
    expect(provider4b.id).toBe('gemma-4b')

    await removeCachedModel('gemma-2b')
    expect(await isModelCached('gemma-2b')).toBe(false)
    expect(await isModelCached('gemma-4b')).toBe(true)

    globalThis.caches = originalCaches
    globalThis.fetch = originalFetch
  })
})
