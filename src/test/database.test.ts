import { describe, it, expect, beforeEach } from 'vitest'
import { TolerixDatabase } from '../lib/db/database'
import { JobRepository } from '../lib/db/repositories/jobs'
import { MachineProfileRepository } from '../lib/db/repositories/machineProfiles'
import { FileRepository } from '../lib/db/repositories/files'
import { AuditRepository } from '../lib/db/repositories/audits'

describe('Database and Repositories', () => {
  let testDb: TolerixDatabase
  let jobRepo: JobRepository
  let machineRepo: MachineProfileRepository
  let fileRepo: FileRepository
  let auditRepo: AuditRepository

  beforeEach(async () => {
    testDb = new TolerixDatabase(`test-db-${Date.now()}-${Math.random()}`)
    jobRepo = new JobRepository(testDb)
    machineRepo = new MachineProfileRepository(testDb)
    fileRepo = new FileRepository(testDb)
    auditRepo = new AuditRepository(testDb)
  })

  it('creates, retrieves, and updates a job', async () => {
    const job = await jobRepo.create({
      id: 'job-test-1',
      name: 'Test Name Tag',
      customerName: 'Acme Signs',
      originalInstructions: 'Cut 10 acrylic tags 120 x 80 mm',
      workflowStage: 'order_details',
      status: 'in_progress',
      selectedModelId: 'gemma-4b',
      selectedMachineProfileId: 'prof-thunder-nova-35',
      createdAt: Date.now(),
      updatedAt: Date.now()
    })

    expect(job.id).toBe('job-test-1')

    const fetched = await jobRepo.getById('job-test-1')
    expect(fetched?.name).toBe('Test Name Tag')

    const updated = await jobRepo.update('job-test-1', { status: 'ready' })
    expect(updated?.status).toBe('ready')
  })

  it('cascades deletion across files, specifications, audit runs, and findings', async () => {
    await jobRepo.create({
      id: 'job-del-1',
      name: 'To Delete',
      customerName: 'Client',
      originalInstructions: 'Cut 1 tag',
      workflowStage: 'analysis',
      status: 'needs_review',
      selectedModelId: 'gemma-4b',
      selectedMachineProfileId: 'prof-thunder-nova-35',
      createdAt: Date.now(),
      updatedAt: Date.now()
    })

    await jobRepo.upsertSpecification({
      id: 'spec-1',
      jobId: 'job-del-1',
      quantity: 1,
      width: 100,
      height: 50,
      units: 'mm',
      material: 'acrylic',
      thickness: 3,
      operations: ['cut'],
      expectedCutLayers: ['cut'],
      expectedEngraveLayers: [],
      tolerances: { width: 0.5, height: 0.5 },
      fieldStates: {},
      sourceExcerpts: {},
      updatedAt: Date.now()
    })

    await fileRepo.create({
      id: 'file-1',
      jobId: 'job-del-1',
      filename: 'sample.svg',
      mimeType: 'image/svg+xml',
      extension: 'svg',
      fileSize: 1024,
      detectedFormat: 'svg',
      blob: new Blob(['<svg></svg>'], { type: 'image/svg+xml' }),
      sha256: 'abc123hash',
      parserStatus: 'parsed',
      uploadedAt: Date.now(),
      validationStatus: 'valid'
    })

    await auditRepo.createAuditRun(
      {
        id: 'run-1',
        jobId: 'job-del-1',
        sourceFileDigest: 'abc123hash',
        specificationVersion: 1,
        machineProfileVersion: 'prof-1',
        startedAt: Date.now() - 1000,
        completedAt: Date.now(),
        ruleEngineVersion: '1.0.0',
        status: 'completed',
        issueCount: 1,
        warningCount: 0,
        passedCount: 1,
        unverifiedCount: 0
      },
      [
        {
          id: 'fnd-1',
          auditRunId: 'run-1',
          ruleId: 'RULE_DIM_WIDTH',
          category: 'dimension',
          severity: 'high',
          title: 'Mismatch',
          description: 'Width does not match',
          verificationStatus: 'issue',
          reviewStatus: 'needs_review',
          createdAt: Date.now()
        }
      ]
    )

    const success = await jobRepo.delete('job-del-1')
    expect(success).toBe(true)

    expect(await jobRepo.getById('job-del-1')).toBeUndefined()
    expect(await jobRepo.getSpecification('job-del-1')).toBeUndefined()
    expect(await fileRepo.getByJobId('job-del-1')).toBeUndefined()
    expect((await auditRepo.listByJobId('job-del-1')).length).toBe(0)
    expect((await auditRepo.getFindings('run-1')).length).toBe(0)
  })

  it('manages machine profiles and default profile selection', async () => {
    const prof1 = await machineRepo.create({
      id: 'prof-test-1',
      name: 'Custom Laser',
      machineType: 'CO2 Laser',
      bedWidth: 800,
      bedHeight: 500,
      units: 'mm',
      supportedFormats: ['svg'],
      supportedMaterials: ['wood'],
      minThickness: 1,
      maxThickness: 8,
      minFeatureSize: 0.5,
      kerf: 0.1,
      allowedOperations: ['cut'],
      defaultTolerance: 0.4,
      isDefault: true,
      createdAt: Date.now()
    })

    const prof2 = await machineRepo.create({
      id: 'prof-test-2',
      name: 'Second Laser',
      machineType: 'Diode Laser',
      bedWidth: 400,
      bedHeight: 400,
      units: 'mm',
      supportedFormats: ['svg'],
      supportedMaterials: ['paper'],
      minThickness: 0.1,
      maxThickness: 3,
      minFeatureSize: 0.2,
      kerf: 0.08,
      allowedOperations: ['engrave'],
      defaultTolerance: 0.3,
      isDefault: true,
      createdAt: Date.now()
    })

    const defaultProf = await machineRepo.getDefault()
    expect(defaultProf?.id).toBe(prof2.id)

    const updatedProf1 = await machineRepo.getById(prof1.id)
    expect(updatedProf1?.isDefault).toBe(false)
  })
})
