import { dialog } from 'electron'
import { IPC } from '@shared/constants/ipc-channels'
import { handle } from '../../shared/ipc-handler'
import type { ConfiguracionService } from './configuracion.service'
import type { ConfiguracionUpdateInput } from '@shared/types/requests'

export function registerConfiguracionIpc(service: ConfiguracionService): void {
  handle(IPC.configuracion.get, () => service.get())
  handle(IPC.configuracion.update, (input: ConfiguracionUpdateInput) => service.update(input))
  handle(IPC.configuracion.seleccionarLogo, async () => {
    const result = await dialog.showOpenDialog({
      title: 'Seleccionar logo del negocio',
      filters: [{ name: 'Imágenes', extensions: ['png', 'jpg', 'jpeg', 'svg'] }],
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    const logoPath = result.filePaths[0]
    return service.updateLogoPath(logoPath)
  })
}
