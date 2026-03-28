const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('appInfo', {
  name: 'Quiz Desktop',
})

contextBridge.exposeInMainWorld('quizStorage', {
  load: () => ipcRenderer.invoke('storage:load'),
  save: (data) => ipcRenderer.invoke('storage:save', data),
})
