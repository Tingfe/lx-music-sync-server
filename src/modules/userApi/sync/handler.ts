import { getUserSpace } from '@/user'
import { SYNC_CLOSE_CODE } from '@/constants'

const handler: Pick<LX.Sync.ClientSyncHandlerUserApiActions<LX.Socket>, 'onUserApiSyncData'> = {
  async onUserApiSyncData(socket, data) {
    if (!socket.moduleReadys.userApi) return
    const userSpace = getUserSpace(socket.userInfo.name)
    const nextData = await userSpace.userApiManage.setData(data)
    socket.broadcast(client => {
      if (client.keyInfo.clientId == socket.keyInfo.clientId || client.userInfo.name != socket.userInfo.name || !client.moduleReadys.userApi) return
      void client.remoteQueueUserApi.onUserApiSyncData(nextData).catch(() => {
        client.close(SYNC_CLOSE_CODE.failed)
      })
    })
  },
}

export default handler
