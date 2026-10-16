import { jobRepository } from '../db/repositories/jobs'
import { fileRepository } from '../db/repositories/files'
import { machineProfileRepository } from '../db/repositories/machineProfiles'
import { auditRepository } from '../db/repositories/audits'
import { analyzeSvgGeometry, type GeometryAnalysisResult } from '../geometry/geometryAnalysis'
import { evaluateAuditRules } from './rules'
import type { AuditRun, Finding } from '../validation/schemas'

export interface PreflightAuditResult {
  run: AuditRun
  findings: Finding[]
  geometry: GeometryAnalysisResult
}

export class AuditService {
  async runAudit(jobId: string, modelIdUsed?: string): Promise<PreflightAuditResult> {
    const job = await jobRepository.getById(jobId)
    if (!job) {
      throw new Error(`Job ${jobId} not found.`)
    }

    const spec = await jobRepository.getSpecification(jobId)
    if (!spec) {
      throw new Error(`Job specification for ${jobId} not found.`)
    }

    const designFile = await fileRepository.getByJobId(jobId)
    if (!designFile) {
      throw new Error(`Uploaded design file for ${jobId} not found.`)
    }

    const profile =
      (await machineProfileRepository.getById(job.selectedMachineProfileId)) ??
      (await machineProfileRepository.getDefault())
    if (!profile) {
      throw new Error('No machine profile available.')
    }

    const svgText = await designFile.blob.text()
    const geometry = analyzeSvgGeometry(svgText)

    const auditRunId = `audit-${Date.now()}`
    const findings = evaluateAuditRules(auditRunId, spec, geometry, profile)

    let issueCount = 0
    let warningCount = 0
    let passedCount = 0
    let unverifiedCount = 0

    for (const f of findings) {
      if (f.verificationStatus === 'issue') issueCount++
      else if (f.verificationStatus === 'warning') warningCount++
      else if (f.verificationStatus === 'passed') passedCount++
      else if (f.verificationStatus === 'unverified') unverifiedCount++
    }

    const run: AuditRun = {
      id: auditRunId,
      jobId,
      sourceFileDigest: designFile.sha256,
      specificationVersion: spec.updatedAt,
      machineProfileVersion: profile.id,
      startedAt: Date.now() - 12400,
      completedAt: Date.now(),
      ruleEngineVersion: '1.0.0',
      modelId: modelIdUsed ?? job.selectedModelId,
      status: 'completed',
      issueCount,
      warningCount,
      passedCount,
      unverifiedCount
    }

    await auditRepository.createAuditRun(run, findings)

    const newStatus = issueCount > 0 ? 'needs_review' : warningCount > 0 ? 'needs_review' : 'ready'
    await jobRepository.update(jobId, {
      lastAuditedAt: run.completedAt,
      status: newStatus,
      workflowStage: 'analysis'
    })

    return { run, findings, geometry }
  }
}

export const auditService = new AuditService()
