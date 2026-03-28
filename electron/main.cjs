const { app, BrowserWindow, protocol, net, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const { pathToFileURL } = require('url')

// Must be called before app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: { standard: true, secure: true, supportFetchAPI: true },
  },
])

function getDataFile() {
  return path.join(app.getPath('userData'), 'subjects.json')
}

ipcMain.handle('storage:load', () => {
  try {
    const raw = fs.readFileSync(getDataFile(), 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
})

ipcMain.handle('storage:save', (_event, data) => {
  fs.writeFileSync(getDataFile(), JSON.stringify(data), 'utf-8')
})

function createMainWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 960,
    minHeight: 700,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  if (process.env.ELECTRON_START_URL) {
    win.loadURL(process.env.ELECTRON_START_URL)
  } else {
    win.loadURL('app://bundle/index.html')
  }
}

app.whenReady().then(() => {
  // Serve dist/ files under app://bundle/
  protocol.handle('app', (request) => {
    const { pathname } = new URL(request.url)
    const filePath = path.join(__dirname, '..', 'dist', pathname)
    return net.fetch(pathToFileURL(filePath).toString())
  })

  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
