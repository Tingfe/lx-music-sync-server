const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

function load(file) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } })
  const module = { exports: {} }
  vm.runInNewContext(outputText, { module, exports: module.exports }, { filename: file })
  return module.exports
}

test('settings schema rejects local fields, malformed values and invalid ranges', () => {
  const { filterSettingsSyncData } = load('src/modules/settings/keys.ts')
  const result = filterSettingsSyncData({
    'theme.id': 'desktop-only', 'common.langId': 'bad', 'sync.enable': true,
    'player.playbackRate': -99, 'list.isClickPlayList': 'false', 'player.playQuality': 'unknown',
    'search.isShowHotSearch': false, 'list.addMusicLocationType': 'bottom',
  })
  assert.deepEqual(JSON.parse(JSON.stringify(result)), { 'search.isShowHotSearch': false, 'list.addMusicLocationType': 'bottom' })
  for (const data of [null, [], 'invalid']) assert.equal(Object.keys(filterSettingsSyncData(data)).length, 0)
  for (const value of [NaN, Infinity, 0.59, 2.01, '1']) assert.equal(Object.keys(filterSettingsSyncData({ 'player.playbackRate': value })).length, 0)
  for (const value of [0.6, 1, 2]) assert.equal(filterSettingsSyncData({ 'player.playbackRate': value })['player.playbackRate'], value)
})

test('online car recovers after a status timeout or command failure without reconnecting', async() => {
  const handler = load('src/modules/remoteControl/handler.ts').default
  let statusFails = true
  let commandFails = true
  let close
  const status = { isPlaying: false, musicInfo: null }
  const car = {
    keyInfo: { clientId: 'car', deviceName: 'VV5' }, userInfo: { name: 'owner' }, isReady: true,
    onClose(callback) { close = callback },
    remoteQueueRemoteControl: {
      async getStatus() { if (statusFails) throw new Error('timeout'); return status },
      async onCommand() { if (commandFails) throw new Error('play failed'); return status },
    },
  }
  const phone = { userInfo: { name: 'owner' } }
  const otherUser = { userInfo: { name: 'other' } }
  await handler.registerCar(car)
  assert.equal((await handler.getCars(phone)).length, 0)
  statusFails = false
  assert.equal((await handler.getCars(phone)).length, 1)
  await assert.rejects(handler.sendCommand(phone, 'car', { action: 'next' }), /car_command_failed/)
  assert.equal((await handler.getCars(phone)).length, 1)
  commandFails = false
  assert.equal(await handler.sendCommand(phone, 'car', { action: 'next' }), status)
  assert.equal((await handler.getCars(otherUser)).length, 0)
  await assert.rejects(handler.sendCommand(otherUser, 'car', { action: 'next' }), /car_offline/)
  close()
  assert.equal((await handler.getCars(phone)).length, 0)
  await assert.rejects(handler.sendCommand(phone, 'car', { action: 'next' }), /car_offline/)
})

test('closing an older car socket does not unregister a newer session', async() => {
  const handler = load('src/modules/remoteControl/handler.ts').default
  let closeOld
  const car = {
    keyInfo: { clientId: 'car', deviceName: 'VV5' }, userInfo: { name: 'owner' }, isReady: true,
    onClose(callback) { closeOld = callback },
    remoteQueueRemoteControl: { async getStatus() { return { isPlaying: false } } },
  }
  await handler.registerCar(car)
  await handler.registerCar({ ...car, onClose() {} })
  closeOld()
  assert.equal((await handler.getCars({ userInfo: { name: 'owner' } })).length, 1)
})
