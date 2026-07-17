import { FeaturesList } from '@/constants'
import { featureVersion, modules } from '@/modules'
import { getUserSpace } from '@/user'


export const sync = async(socket: LX.Socket) => {
  let disconnected = false
  socket.onClose(() => {
    disconnected = true
  })
  const enabledFeatures = await socket.remote.getEnabledFeatures('server', featureVersion)

  if (disconnected) throw new Error('disconnected')
  for (const moduleName of FeaturesList) {
    if (enabledFeatures[moduleName]) {
      socket.feature[moduleName] = enabledFeatures[moduleName]
      await modules[moduleName].sync(socket).catch(_ => _)
    }
    if (disconnected) throw new Error('disconnected')
  }
  await socket.remote.finished()
  socket.keyInfo.lastSyncDate = Date.now()
  getUserSpace(socket.userInfo.name).dataManage.saveClientKeyInfo(socket.keyInfo)
}
