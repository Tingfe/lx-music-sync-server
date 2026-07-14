import fs from 'node:fs/promises'
import path from 'node:path'
import { File } from '@/constants'
import type { UserDataManage } from '@/user'

export class UserApiManage {
  private readonly filePath: string
  private data: LX.Sync.UserApiSyncData | null = null

  constructor(userDataManage: UserDataManage) {
    this.filePath = path.join(userDataManage.userDir, File.userApiJSON)
  }

  async getData(): Promise<LX.Sync.UserApiSyncData> {
    if (this.data) return this.data.map(item => ({ info: { ...item.info }, script: item.script }))
    try {
      this.data = JSON.parse(await fs.readFile(this.filePath, 'utf8')) as LX.Sync.UserApiSyncData
    } catch {
      this.data = []
    }
    return this.getData()
  }

  async setData(data: LX.Sync.UserApiSyncData) {
    this.data = data.map(item => ({ info: { ...item.info }, script: item.script }))
    await fs.writeFile(this.filePath, JSON.stringify(this.data), 'utf8')
    return this.getData()
  }
}
