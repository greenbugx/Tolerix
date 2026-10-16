import { db, TolerixDatabase } from '../database'
import type { DesignFile } from '../../validation/schemas'

export class FileRepository {
  private database: TolerixDatabase

  constructor(database: TolerixDatabase = db) {
    this.database = database
  }

  async create(file: DesignFile): Promise<DesignFile> {
    await this.database.files.add(file)
    return file
  }

  async getById(id: string): Promise<DesignFile | undefined> {
    return this.database.files.get(id)
  }

  async getByJobId(jobId: string): Promise<DesignFile | undefined> {
    return this.database.files.where('jobId').equals(jobId).first()
  }

  async deleteByJobId(jobId: string): Promise<number> {
    return this.database.files.where('jobId').equals(jobId).delete()
  }

  async delete(id: string): Promise<void> {
    await this.database.files.delete(id)
  }
}

export const fileRepository = new FileRepository()
