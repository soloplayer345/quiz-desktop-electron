const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('appInfo', {
  name: 'Quiz Desktop',
})

contextBridge.exposeInMainWorld('quizStorage', {
  load: () => ipcRenderer.invoke('storage:load'),
  save: (data) => ipcRenderer.invoke('storage:save', data),
})

contextBridge.exposeInMainWorld('updater', {
  check: () => ipcRenderer.invoke('updater:check'),
  install: () => ipcRenderer.send('updater:install'),
  onUpdateAvailable: (cb) => {
    ipcRenderer.on('updater:update-available', (_e, info) => cb(info))
  },
  onDownloadProgress: (cb) => {
    ipcRenderer.on('updater:download-progress', (_e, progress) => cb(progress))
  },
  onUpdateDownloaded: (cb) => {
    ipcRenderer.on('updater:update-downloaded', (_e, info) => cb(info))
  },
  onError: (cb) => {
    ipcRenderer.on('updater:error', (_e, msg) => cb(msg))
  },
})
