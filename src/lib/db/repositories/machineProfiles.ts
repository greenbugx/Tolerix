import { db, TolerixDatabase } from '../database'
import type { MachineProfile } from '../../validation/schemas'

export class MachineProfileRepository {
  private database: TolerixDatabase

  constructor(database: TolerixDatabase = db) {
    this.database = database
  }

  async list(): Promise<MachineProfile[]> {
    return this.database.machineProfiles.toArray()
  }

  async getById(id: string): Promise<MachineProfile | undefined> {
    return this.database.machineProfiles.get(id)
  }

  async getDefault(): Promise<MachineProfile | undefined> {
    const defaultProfile = await this.database.machineProfiles
      .filter((p) => Boolean(p.isDefault))
      .first()
    if (defaultProfile) return defaultProfile
    return this.database.machineProfiles.toCollection().first()
  }

  async create(profile: MachineProfile): Promise<MachineProfile> {
    if (profile.isDefault) {
      await this.clearDefault()
    }
    await this.database.machineProfiles.add(profile)
    return profile
  }

  async update(id: string, changes: Partial<MachineProfile>): Promise<MachineProfile | undefined> {
    if (changes.isDefault) {
      await this.clearDefault()
    }
    await this.database.machineProfiles.update(id, changes)
    return this.database.machineProfiles.get(id)
  }

  async delete(id: string): Promise<boolean> {
    const count = await this.database.machineProfiles.count()
    if (count <= 1) return false
    await this.database.machineProfiles.delete(id)
    return true
  }

  private async clearDefault(): Promise<void> {
    const all = await this.database.machineProfiles.toArray()
    for (const p of all) {
      if (p.isDefault) {
        await this.database.machineProfiles.update(p.id, { isDefault: false })
      }
    }
  }
}

export const machineProfileRepository = new MachineProfileRepository()
