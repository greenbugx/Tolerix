import { jobRepository } from '../db/repositories/jobs'
import { fileRepository } from '../db/repositories/files'
import { machineProfileRepository } from '../db/repositories/machineProfiles'
import { auditRepository } from '../db/repositories/audits'
import { auditService, type PreflightAuditResult } from '../audit/auditService'
import { validateDesignFile } from '../files/fileValidation'
import type { FullAuditReportData } from '../reports/reportService'
import type {
  Job,
  JobSpecification,
  DesignFile,
  JobStatus
} from '../validation/schemas'

export class JobService {
  async createJobWithInstructions(params: {
    name: string
    customerName: string
    customerReference?: string
    notes?: string
    instructions: string
    selectedModelId: string
    selectedMachineProfileId?: string
  }): Promise<Job> {
    const defaultProfile = await machineProfileRepository.getDefault()
    const now = Date.now()
    const id = `job-${now}-${Math.random().toString(36).slice(2, 6)}`

    const job: Job = {
      id,
      name: params.name.trim() || 'Untitled Job',
      customerName: params.customerName.trim() || 'Direct Customer',
      customerReference: params.customerReference?.trim(),
      notes: params.notes?.trim(),
      originalInstructions: params.instructions,
      workflowStage: 'upload_file',
      status: 'in_progress',
      selectedModelId: params.selectedModelId,
      selectedMachineProfileId:
        params.selectedMachineProfileId || defaultProfile?.id || 'prof-thunder-nova-35',
      createdAt: now,
      updatedAt: now
    }

    return jobRepository.create(job)
  }

  async attachUploadedFile(jobId: string, file: File | Blob, filename: string): Promise<DesignFile> {
    const validation = await validateDesignFile(file, filename)
    if (!validation.valid) {
      throw new Error(validation.error || 'The uploaded file is invalid or unsafe.')
    }

    await fileRepository.deleteByJobId(jobId)

    const now = Date.now()
    const designFile: DesignFile = {
      id: `file-${now}-${Math.random().toString(36).slice(2, 6)}`,
      jobId,
      filename,
      mimeType: file.type || 'image/svg+xml',
      extension: filename.split('.').pop()?.toLowerCase() || 'svg',
      fileSize: file.size,
      detectedFormat: validation.format,
      blob: file,
      sha256: validation.sha256,
      parserStatus: 'parsed',
      uploadedAt: now,
      validationStatus: validation.valid ? 'valid' : 'invalid'
    }

    await fileRepository.create(designFile)
    await jobRepository.update(jobId, { workflowStage: 'confirm_requirements' })
    return designFile
  }

  async saveConfirmedRequirements(spec: JobSpecification): Promise<JobSpecification> {
    const saved = await jobRepository.upsertSpecification(spec)
    await jobRepository.update(spec.jobId, { workflowStage: 'machine_profile' })
    return saved
  }

  async setMachineProfile(jobId: string, profileId: string): Promise<Job | undefined> {
    return jobRepository.update(jobId, {
      selectedMachineProfileId: profileId,
      workflowStage: 'analysis'
    })
  }

  async executeAudit(jobId: string, modelId?: string): Promise<PreflightAuditResult> {
    return auditService.runAudit(jobId, modelId)
  }

  async approveJob(jobId: string): Promise<Job | undefined> {
    const now = Date.now()
    return jobRepository.update(jobId, {
      status: 'ready' as JobStatus,
      approvedAt: now,
      workflowStage: 'review'
    })
  }

  async getFullReportBundle(jobId: string): Promise<FullAuditReportData> {
    const job = await jobRepository.getById(jobId)
    if (!job) {
      throw new Error(`Job ${jobId} not found.`)
    }

    const [spec, file, profile, run] = await Promise.all([
      jobRepository.getSpecification(jobId),
      fileRepository.getByJobId(jobId),
      machineProfileRepository.getById(job.selectedMachineProfileId),
      auditRepository.getLatestByJobId(jobId)
    ])

    const findings = run ? await auditRepository.getFindings(run.id) : []

    return {
      job,
      spec,
      file,
      profile,
      run,
      findings
    }
  }
}

export const jobService = new JobService()
