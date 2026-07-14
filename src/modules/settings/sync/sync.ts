import { getUserSpace } from '@/user'

export const sync = async(socket: LX.Socket) => {
  const userSpace = getUserSpace(socket.userInfo.name)
  const [serverData, clientData] = await Promise.all([
    userSpace.settingsManage.getData(),
    socket.remoteQueueSettings.settings_sync_get_data(),
  ])

  if (Object.keys(serverData).length) await socket.remoteQueueSettings.settings_sync_set_data(serverData)
  else if (Object.keys(clientData).length) await userSpace.settingsManage.setData(clientData)

  await socket.remoteQueueSettings.settings_sync_finished()
  socket.moduleReadys.settings = true
}
