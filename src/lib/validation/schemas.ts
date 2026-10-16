import { z } from 'zod'

export const UnitSchema = z.enum(['mm', 'cm', 'in'])
export type Unit = z.infer<typeof UnitSchema>

export const FieldStateSchema = z.enum([
  'provided',
  'inferred',
  'ambiguous',
  'missing',
  'operator_confirmed'
])
export type FieldState = z.infer<typeof FieldStateSchema>

export const WorkflowStageSchema = z.enum([
  'order_details',
  'upload_file',
  'confirm_requirements',
  'machine_profile',
  'analysis',
  'review'
])
export type WorkflowStage = z.infer<typeof WorkflowStageSchema>

export const JobStatusSchema = z.enum([
  'draft',
  'needs_review',
  'ready',
  'in_progress'
])
export type JobStatus = z.infer<typeof JobStatusSchema>

export const JobSpecificationSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  quantity: z.number().int().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  units: UnitSchema,
  material: z.string(),
  thickness: z.number().nonnegative(),
  operations: z.array(z.string()),
  expectedCutLayers: z.array(z.string()).default([]),
  expectedEngraveLayers: z.array(z.string()).default([]),
  tolerances: z
    .object({
      width: z.number().positive().optional(),
      height: z.number().positive().optional()
    })
    .default({}),
  fieldStates: z.record(z.string(), FieldStateSchema).default({}),
  sourceExcerpts: z.record(z.string(), z.string()).default({}),
  updatedAt: z.number()
})
export type JobSpecification = z.infer<typeof JobSpecificationSchema>

export const ExtractedRequirementSchema = z.object({
  quantity: z.number().int().positive().nullable(),
  width: z.number().positive().nullable(),
  height: z.number().positive().nullable(),
  units: UnitSchema.nullable(),
  material: z.string().nullable(),
  thickness: z.number().nonnegative().nullable(),
  operations: z.array(z.string()).default([]),
  expectedCutLayers: z.array(z.string()).default([]),
  expectedEngraveLayers: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  missingFields: z.array(z.string()).default([]),
  ambiguousFields: z.array(z.string()).default([]),
  sourceExcerpts: z.record(z.string(), z.string()).default({})
})
export type ExtractedRequirement = z.infer<typeof ExtractedRequirementSchema>

export const JobSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  customerName: z.string().min(1),
  customerReference: z.string().optional(),
  notes: z.string().optional(),
  originalInstructions: z.string(),
  workflowStage: WorkflowStageSchema,
  status: JobStatusSchema,
  selectedModelId: z.string(),
  selectedMachineProfileId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  lastAuditedAt: z.number().optional(),
  dueDate: z.string().optional(),
  approvedAt: z.number().optional()
})
export type Job = z.infer<typeof JobSchema>

export const DesignFileSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  extension: z.string(),
  fileSize: z.number().nonnegative(),
  detectedFormat: z.enum(['svg', 'dxf', 'unsupported']),
  blob: z.instanceof(Blob),
  sha256: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  units: z.string().optional(),
  parserStatus: z.enum(['parsed', 'failed', 'unsupported']),
  uploadedAt: z.number(),
  validationStatus: z.enum(['valid', 'invalid', 'unverified'])
})
export type DesignFile = z.infer<typeof DesignFileSchema>

export const MachineProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  machineType: z.string(),
  bedWidth: z.number().positive(),
  bedHeight: z.number().positive(),
  units: UnitSchema,
  supportedFormats: z.array(z.string()),
  supportedMaterials: z.array(z.string()),
  minThickness: z.number().nonnegative(),
  maxThickness: z.number().positive(),
  minFeatureSize: z.number().nonnegative(),
  kerf: z.number().nonnegative(),
  allowedOperations: z.array(z.string()),
  defaultTolerance: z.number().nonnegative(),
  isDefault: z.boolean().default(false),
  createdAt: z.number()
})
export type MachineProfile = z.infer<typeof MachineProfileSchema>

export const FindingSeveritySchema = z.enum(['high', 'medium', 'low'])
export type FindingSeverity = z.infer<typeof FindingSeveritySchema>

export const VerificationStatusSchema = z.enum([
  'issue',
  'warning',
  'passed',
  'unverified'
])
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>

export const ReviewStatusSchema = z.enum([
  'needs_review',
  'confirmed',
  'dismissed',
  'fixed_externally'
])
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>

export const FindingSchema = z.object({
  id: z.string(),
  auditRunId: z.string(),
  ruleId: z.string(),
  category: z.enum(['dimension', 'layer', 'geometry', 'material', 'quantity']),
  severity: FindingSeveritySchema,
  title: z.string(),
  description: z.string(),
  expectedValue: z.string().optional(),
  detectedValue: z.string().optional(),
  units: z.string().optional(),
  evidence: z.string().optional(),
  geometryId: z.string().optional(),
  verificationStatus: VerificationStatusSchema,
  reviewStatus: ReviewStatusSchema,
  resolutionNotes: z.string().optional(),
  createdAt: z.number()
})
export type Finding = z.infer<typeof FindingSchema>

export const AuditRunSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  sourceFileDigest: z.string(),
  specificationVersion: z.number(),
  machineProfileVersion: z.string(),
  startedAt: z.number(),
  completedAt: z.number(),
  ruleEngineVersion: z.string(),
  modelId: z.string().optional(),
  status: z.enum(['completed', 'failed']),
  issueCount: z.number().int().nonnegative(),
  warningCount: z.number().int().nonnegative(),
  passedCount: z.number().int().nonnegative(),
  unverifiedCount: z.number().int().nonnegative()
})
export type AuditRun = z.infer<typeof AuditRunSchema>

export const ModelInstallationStateSchema = z.enum([
  'not_downloaded',
  'downloading',
  'downloaded',
  'loading',
  'ready',
  'error',
  'unsupported'
])
export type ModelInstallationState = z.infer<typeof ModelInstallationStateSchema>

export const ModelMetadataSchema = z.object({
  modelId: z.string(),
  artifactIdentifier: z.string(),
  downloadUrl: z.string(),
  runtimeCompatibility: z.string(),
  fileSize: z.number().nonnegative(),
  license: z.string(),
  installationState: ModelInstallationStateSchema,
  downloadedBytes: z.number().nonnegative().optional(),
  updatedAt: z.number()
})
export type ModelMetadata = z.infer<typeof ModelMetadataSchema>
