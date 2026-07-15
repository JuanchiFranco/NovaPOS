import { IPC } from '@shared/constants/ipc-channels'
import { handle } from '../../shared/ipc-handler'
import { createBackup, listBackups, restoreBackup } from '../../database/backup.service'

export function registerSistemaIpc(): void {
  handle(IPC.sistema.backupNow, () => createBackup())
  handle(IPC.sistema.listBackups, () => listBackups())
  handle(IPC.sistema.restoreBackup, (fileName: string) => {
    restoreBackup(fileName)
    return true
  })
}
