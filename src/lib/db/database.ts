import Dexie, { type EntityTable } from 'dexie'
import type {
  Job,
  JobSpecification,
  DesignFile,
  MachineProfile,
  AuditRun,
  Finding,
  ModelMetadata
} from '../validation/schemas'

export interface AppSetting {
  key: string
  value: unknown
  updatedAt: number
}

export class TolerixDatabase extends Dexie {
  jobs!: EntityTable<Job, 'id'>
  specifications!: EntityTable<JobSpecification, 'id'>
  files!: EntityTable<DesignFile, 'id'>
  machineProfiles!: EntityTable<MachineProfile, 'id'>
  auditRuns!: EntityTable<AuditRun, 'id'>
  findings!: EntityTable<Finding, 'id'>
  modelMetadata!: EntityTable<ModelMetadata, 'modelId'>
  settings!: EntityTable<AppSetting, 'key'>

  constructor(databaseName = 'tolerix-db-v1') {
    super(databaseName)
    this.version(1).stores({
      jobs: 'id, status, workflowStage, createdAt, updatedAt',
      specifications: 'id, jobId',
      files: 'id, jobId, filename',
      machineProfiles: 'id, name, isDefault',
      auditRuns: 'id, jobId, startedAt',
      findings: 'id, auditRunId, ruleId, severity, verificationStatus',
      modelMetadata: 'modelId',
      settings: 'key'
    })
  }
}

export const db = new TolerixDatabase()

export const DEFAULT_PROFILES: MachineProfile[] = [
  {
    id: 'prof-thunder-nova-35',
    name: 'Thunder Laser Nova 35',
    machineType: 'CO2 Laser',
    bedWidth: 900,
    bedHeight: 600,
    units: 'mm',
    supportedFormats: ['svg', 'dxf'],
    supportedMaterials: ['acrylic', 'plywood', 'mdf', 'leather'],
    minThickness: 0.5,
    maxThickness: 10,
    minFeatureSize: 0.8,
    kerf: 0.15,
    allowedOperations: ['cut', 'engrave', 'score'],
    defaultTolerance: 0.5,
    isDefault: true,
    createdAt: Date.now()
  },
  {
    id: 'prof-co2-60w',
    name: 'CO2 Laser Cutter 60W',
    machineType: 'CO2 Laser',
    bedWidth: 600,
    bedHeight: 400,
    units: 'mm',
    supportedFormats: ['svg', 'dxf'],
    supportedMaterials: ['acrylic', 'plywood', 'paper'],
    minThickness: 0.5,
    maxThickness: 6,
    minFeatureSize: 1.0,
    kerf: 0.15,
    allowedOperations: ['cut', 'engrave'],
    defaultTolerance: 0.5,
    isDefault: false,
    createdAt: Date.now()
  }
]

export const SEED_JOBS: Job[] = [
  {
    id: 'job-1',
    name: 'Acrylic Tags - Batch 01',
    customerName: 'Maple Studio',
    customerReference: 'REF-8841',
    notes: 'Urgent tag order for boutique shop.',
    originalInstructions:
      'Please make 10 acrylic tags, 120 by 80 mm, using 3 mm clear acrylic. Cut the outside and engrave the name on the front.',
    workflowStage: 'analysis',
    status: 'needs_review',
    selectedModelId: 'gemma-4b',
    selectedMachineProfileId: 'prof-thunder-nova-35',
    createdAt: Date.now() - 1000 * 60 * 2,
    updatedAt: Date.now() - 1000 * 60 * 2,
    dueDate: '2026-10-20'
  },
  {
    id: 'job-2',
    name: 'Coaster Set - Custom Pattern',
    customerName: 'Lumen Crafts',
    customerReference: 'LC-401',
    notes: 'Laser cut wooden coaster mandala.',
    originalInstructions:
      'Cut 4 wooden mandala coasters 100 x 100 mm in 4 mm birch plywood. All outer and inner geometry must be closed.',
    workflowStage: 'review',
    status: 'ready',
    selectedModelId: 'gemma-4b',
    selectedMachineProfileId: 'prof-thunder-nova-35',
    createdAt: Date.now() - 1000 * 60 * 60,
    updatedAt: Date.now() - 1000 * 60 * 60,
    dueDate: '2026-10-22',
    approvedAt: Date.now() - 1000 * 60 * 30
  },
  {
    id: 'job-3',
    name: 'Ornament - Logo Cut',
    customerName: 'Pine & Pixel',
    customerReference: 'PP-09',
    notes: 'Holiday ornament logo cutout test.',
    originalInstructions:
      'Circular holiday ornament 80 mm diameter with logo silhouette in center using 3 mm basswood.',
    workflowStage: 'upload_file',
    status: 'in_progress',
    selectedModelId: 'gemma-2b',
    selectedMachineProfileId: 'prof-co2-60w',
    createdAt: Date.now() - 1000 * 60 * 180,
    updatedAt: Date.now() - 1000 * 60 * 180,
    dueDate: '2026-10-25'
  }
]

export async function initializeDatabase(database: TolerixDatabase = db): Promise<void> {
  const profileCount = await database.machineProfiles.count()
  if (profileCount === 0) {
    await database.machineProfiles.bulkAdd(DEFAULT_PROFILES)
  }

  const jobCount = await database.jobs.count()
  if (jobCount === 0) {
    await database.jobs.bulkAdd(SEED_JOBS)
  }
}
