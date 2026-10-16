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

export async function initializeDatabase(database: TolerixDatabase = db): Promise<void> {
  const profileCount = await database.machineProfiles.count()
  if (profileCount === 0) {
    await database.machineProfiles.bulkAdd(DEFAULT_PROFILES)
  }
  const placeholderIds = ['job-1', 'job-2', 'job-3']
  for (const id of placeholderIds) {
    const existing = await database.jobs.get(id)
    if (existing) {
      await database.jobs.delete(id)
      await database.specifications.delete(id)
      await database.files.where('jobId').equals(id).delete()
      const runs = await database.auditRuns.where('jobId').equals(id).toArray()
      for (const r of runs) {
        await database.findings.where('auditRunId').equals(r.id).delete()
      }
      await database.auditRuns.where('jobId').equals(id).delete()
    }
  }
}
