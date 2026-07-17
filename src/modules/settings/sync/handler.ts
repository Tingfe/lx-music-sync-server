import { getUserSpace } from '@/user'
import { SYNC_CLOSE_CODE } from '@/constants'
import { filterSettingsSyncData } from '../keys'

const handler: Pick<LX.Sync.ClientSyncHandlerSettingsActions<LX.Socket>, 'onSettingsSyncData'> = {
  async onSettingsSyncData(socket, data) {
    if (!socket.moduleReadys.settings) return
    const userSpace = getUserSpace(socket.userInfo.name)
    const nextData = await userSpace.settingsManage.setData(filterSettingsSyncData(data))
    socket.broadcast(client => {
      if (client.keyInfo.clientId == socket.keyInfo.clientId || client.userInfo.name != socket.userInfo.name || !client.moduleReadys.settings) return
      void client.remoteQueueSettings.onSettingsSyncData(nextData).catch(() => client.close(SYNC_CLOSE_CODE.failed))
    })
  },
}

export default handler
