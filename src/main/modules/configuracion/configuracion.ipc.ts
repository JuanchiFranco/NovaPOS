import { dialog } from 'electron'
import { IPC } from '@shared/constants/ipc-channels'
import { handle } from '../../shared/ipc-handler'
import type { ConfiguracionService } from './configuracion.service'
import type { ConfiguracionUpdateInput } from '@shared/types/requests'

export function registerConfiguracionIpc(service: ConfiguracionService): void {
  // Público: la pantalla de login muestra el nombre y logo del negocio antes de autenticarse.
  handle(IPC.configuracion.get, () => service.get(), 'public')
  handle(IPC.configuracion.update, (input: ConfiguracionUpdateInput) => service.update(input), 'admin')
  handle(IPC.configuracion.seleccionarLogo, async () => {
    const result = await dialog.showOpenDialog({
      title: 'Seleccionar logo del negocio',
      filters: [{ name: 'Imágenes', extensions: ['png', 'jpg', 'jpeg', 'svg'] }],
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    const logoPath = result.filePaths[0]
    return service.updateLogoPath(logoPath)
  }, 'admin')
  handle(IPC.configuracion.setImpresora, (nombre: string) => service.setImpresora(nombre), 'admin')
}
