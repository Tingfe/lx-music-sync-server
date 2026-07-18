const cars = new Map<string, LX.Socket>()

const unregisterCar = (socket: LX.Socket) => {
  if (cars.get(socket.keyInfo.clientId) === socket) cars.delete(socket.keyInfo.clientId)
}

const getCarInfo = async(socket: LX.Socket): Promise<LX.Sync.RemoteControl.CarInfo | null> => {
  try {
    const status = await socket.remoteQueueRemoteControl.getStatus()
    return {
      clientId: socket.keyInfo.clientId,
      deviceName: socket.keyInfo.deviceName,
      status,
    }
  } catch {
    unregisterCar(socket)
    return null
  }
}

const handler: LX.Sync.ServerSyncHandlerRemoteControlActions<LX.Socket> = {
  async registerCar(socket) {
    cars.set(socket.keyInfo.clientId, socket)
    socket.onClose(() => {
      unregisterCar(socket)
    })
  },

  async getCars(socket) {
    const infos = await Promise.all(
      [...cars.values()]
        .filter(car => car.userInfo.name === socket.userInfo.name && car.isReady)
        .map(getCarInfo),
    )
    return infos.filter((info): info is LX.Sync.RemoteControl.CarInfo => info != null)
  },

  async sendCommand(socket, clientId, command) {
    const car = cars.get(clientId)
    if (!car || !car.isReady || car.userInfo.name !== socket.userInfo.name) throw new Error('car_offline')
    try {
      return await car.remoteQueueRemoteControl.onCommand(command)
    } catch {
      unregisterCar(car)
      throw new Error('car_offline')
    }
  },
}

export default handler
