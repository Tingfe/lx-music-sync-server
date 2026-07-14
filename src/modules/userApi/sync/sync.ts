import { getUserSpace } from '@/user'

export const sync = async(socket: LX.Socket) => {
  const userSpace = getUserSpace(socket.userInfo.name)
  const [serverData, clientData] = await Promise.all([
    userSpace.userApiManage.getData(),
    socket.remoteQueueUserApi.user_api_sync_get_data(),
  ])

  // On a new server, preserve the first device's sources. Afterwards the server
  // is authoritative so reconnecting an old device cannot silently overwrite it.
  if (serverData.length) await socket.remoteQueueUserApi.user_api_sync_set_data(serverData)
  else if (clientData.length) await userSpace.userApiManage.setData(clientData)

  await socket.remoteQueueUserApi.user_api_sync_finished()
  socket.moduleReadys.userApi = true
}
