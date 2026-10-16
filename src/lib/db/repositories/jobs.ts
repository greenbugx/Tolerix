import { db, TolerixDatabase } from '../database'
import type { Job, JobSpecification, JobStatus } from '../../validation/schemas'

export class JobRepository {
  private database: TolerixDatabase

  constructor(database: TolerixDatabase = db) {
    this.database = database
  }

  async create(job: Job): Promise<Job> {
    await this.database.jobs.add(job)
    return job
  }

  async getById(id: string): Promise<Job | undefined> {
    return this.database.jobs.get(id)
  }

  async update(id: string, changes: Partial<Job>): Promise<Job | undefined> {
    const updatedChanges = { ...changes, updatedAt: Date.now() }
    await this.database.jobs.update(id, updatedChanges)
    return this.database.jobs.get(id)
  }

  async delete(id: string): Promise<boolean> {
    return this.database.transaction(
      'rw',
      [
        this.database.jobs,
        this.database.specifications,
        this.database.files,
        this.database.auditRuns,
        this.database.findings
      ],
      async () => {
        const auditRuns = await this.database.auditRuns.where('jobId').equals(id).toArray()
        const auditRunIds = auditRuns.map((r) => r.id)

        for (const auditId of auditRunIds) {
          await this.database.findings.where('auditRunId').equals(auditId).delete()
        }
        await this.database.auditRuns.where('jobId').equals(id).delete()
        await this.database.files.where('jobId').equals(id).delete()
        await this.database.specifications.where('jobId').equals(id).delete()
        await this.database.jobs.delete(id)
        return true
      }
    )
  }

  async list(): Promise<Job[]> {
    return this.database.jobs.orderBy('createdAt').reverse().toArray()
  }

  async listRecent(limit = 10): Promise<Job[]> {
    return this.database.jobs.orderBy('updatedAt').reverse().limit(limit).toArray()
  }

  async getCounts(): Promise<{
    total: number
    ready: number
    needsReview: number
    inProgress: number
    draft: number
  }> {
    const all = await this.database.jobs.toArray()
    let ready = 0
    let needsReview = 0
    let inProgress = 0
    let draft = 0

    for (const j of all) {
      if (j.status === 'ready') ready++
      else if (j.status === 'needs_review') needsReview++
      else if (j.status === 'in_progress') inProgress++
      else if (j.status === 'draft') draft++
    }

    return {
      total: all.length,
      ready,
      needsReview,
      inProgress,
      draft
    }
  }

  async getSpecification(jobId: string): Promise<JobSpecification | undefined> {
    return this.database.specifications.where('jobId').equals(jobId).first()
  }

  async upsertSpecification(spec: JobSpecification): Promise<JobSpecification> {
    const existing = await this.getSpecification(spec.jobId)
    if (existing) {
      await this.database.specifications.update(existing.id, {
        ...spec,
        id: existing.id,
        updatedAt: Date.now()
      })
      return (await this.database.specifications.get(existing.id)) ?? spec
    }
    await this.database.specifications.add(spec)
    return spec
  }

  async updateStatus(id: string, status: JobStatus): Promise<Job | undefined> {
    return this.update(id, { status })
  }
}

export const jobRepository = new JobRepository()
