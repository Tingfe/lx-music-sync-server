import fs from 'node:fs/promises'
import path from 'node:path'
import { File } from '@/constants'
import type { UserDataManage } from '@/user'
import { filterSettingsSyncData } from './keys'

export class SettingsManage {
  private readonly filePath: string
  private data: LX.Sync.SettingsSyncData | null = null

  constructor(userDataManage: UserDataManage) {
    this.filePath = path.join(userDataManage.userDir, File.settingsJSON)
  }

  async getData(): Promise<LX.Sync.SettingsSyncData> {
    if (this.data) return { ...this.data }
    try {
      const data = JSON.parse(await fs.readFile(this.filePath, 'utf8')) as LX.Sync.SettingsSyncData
      this.data = filterSettingsSyncData(data)
      if (Object.keys(this.data).length != Object.keys(data).length) await fs.writeFile(this.filePath, JSON.stringify(this.data), 'utf8')
    } catch {
      this.data = {}
    }
    return this.getData()
  }

  async setData(data: LX.Sync.SettingsSyncData) {
    this.data = filterSettingsSyncData(data)
    await fs.writeFile(this.filePath, JSON.stringify(this.data), 'utf8')
    return this.getData()
  }
}
