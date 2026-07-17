const syncedKeys = new Set([
  'common.langId',
  'common.sourceNameType',
  'player.togglePlayMethod',
  'player.playQuality',
  'player.playbackRate',
  'player.isSavePlayTime',
  'player.isShowLyricTranslation',
  'player.isShowLyricRoma',
  'search.isShowHotSearch',
  'search.isShowHistorySearch',
  'list.isClickPlayList',
  'list.isShowSource',
  'list.isSaveScrollLocation',
  'list.addMusicLocationType',
])

export const filterSettingsSyncData = (data: LX.Sync.SettingsSyncData): LX.Sync.SettingsSyncData => {
  const filtered: LX.Sync.SettingsSyncData = {}
  for (const key of Object.keys(data)) {
    if (syncedKeys.has(key)) filtered[key] = data[key]
  }
  return filtered
}
