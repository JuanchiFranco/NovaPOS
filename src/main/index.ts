import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { getPrismaClient, disconnectPrisma } from './database/client'
import { startAutoBackup, stopAutoBackup, createBackup } from './database/backup.service'
import { registerAllIpcHandlers } from './ipc/register-ipc'
import { logger } from './shared/logger'

function createMainWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.juanfranco.novapos')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  try {
    const prisma = getPrismaClient()
    registerAllIpcHandlers(prisma)

    // Backup de seguridad al iniciar (además del automático periódico).
    try {
      createBackup()
    } catch {
      // La primera vez que se abre la app aún no hay base de datos que respaldar.
    }
    startAutoBackup()

    logger.info('Aplicación inicializada correctamente')
  } catch (error) {
    logger.error('Error crítico al inicializar la aplicación', error)
  }

  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', async (event) => {
  event.preventDefault()
  stopAutoBackup()
  await disconnectPrisma()
  app.exit(0)
})
