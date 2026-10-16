import { db, TolerixDatabase } from '../database'
import type { AuditRun, Finding, ReviewStatus } from '../../validation/schemas'

export class AuditRepository {
  private database: TolerixDatabase

  constructor(database: TolerixDatabase = db) {
    this.database = database
  }

  async createAuditRun(run: AuditRun, findings: Finding[]): Promise<AuditRun> {
    await this.database.transaction('rw', [this.database.auditRuns, this.database.findings], async () => {
      await this.database.auditRuns.add(run)
      if (findings.length > 0) {
        await this.database.findings.bulkAdd(findings)
      }
    })
    return run
  }

  async getLatestByJobId(jobId: string): Promise<AuditRun | undefined> {
    return this.database.auditRuns
      .where('jobId')
      .equals(jobId)
      .reverse()
      .sortBy('startedAt')
      .then((runs) => runs[0])
  }

  async listByJobId(jobId: string): Promise<AuditRun[]> {
    return this.database.auditRuns
      .where('jobId')
      .equals(jobId)
      .reverse()
      .sortBy('startedAt')
  }

  async getFindings(auditRunId: string): Promise<Finding[]> {
    return this.database.findings
      .where('auditRunId')
      .equals(auditRunId)
      .toArray()
  }

  async updateFindingReviewStatus(
    findingId: string,
    reviewStatus: ReviewStatus,
    resolutionNotes?: string
  ): Promise<Finding | undefined> {
    await this.database.findings.update(findingId, {
      reviewStatus,
      resolutionNotes
    })
    return this.database.findings.get(findingId)
  }
}

export const auditRepository = new AuditRepository()
