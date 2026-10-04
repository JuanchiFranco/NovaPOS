import { BrowserWindow } from 'electron'
import { IPC } from '@shared/constants/ipc-channels'
import { handle } from '../../shared/ipc-handler'
import { createBackup, listBackups, restoreBackup } from '../../database/backup.service'
import type { ImpresoraDTO } from '@shared/types/dto'

export function registerSistemaIpc(): void {
  handle(IPC.sistema.backupNow, () => createBackup(), 'admin')
  handle(IPC.sistema.listBackups, () => listBackups(), 'admin')
  handle(IPC.sistema.restoreBackup, (fileName: string) => {
    restoreBackup(fileName)
    return true
  }, 'admin')

  handle(IPC.sistema.listarImpresoras, async (): Promise<ImpresoraDTO[]> => {
    const win = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0]
    if (!win) return []
    const impresoras = await win.webContents.getPrintersAsync()
    return impresoras.map((p) => ({
      nombre: p.name,
      descripcion: p.displayName || p.name,
      predeterminadaDelSistema: p.isDefault
    }))
  })
}
