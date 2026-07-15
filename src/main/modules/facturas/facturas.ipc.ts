import { BrowserWindow, dialog } from 'electron'
import { writeFileSync } from 'fs'
import { IPC } from '@shared/constants/ipc-channels'
import { handle } from '../../shared/ipc-handler'
import { AppError } from '../../shared/errors'
import { logger } from '../../shared/logger'
import type { FacturasService } from './facturas.service'
import type { FacturaListParams } from '@shared/types/requests'
import { createFacturaPrintWindow } from './print-window'

export function registerFacturasIpc(service: FacturasService): void {
  handle(IPC.facturas.list, (params: FacturaListParams) => service.list(params ?? {}))
  handle(IPC.facturas.getById, (id: number) => service.getById(id))
  handle(IPC.facturas.getByVentaId, (ventaId: number) => service.getByVentaId(ventaId))

  handle(IPC.facturas.exportPdf, async (id: number) => {
    const factura = await service.getById(id)
    const result = await dialog.showSaveDialog({
      title: 'Exportar factura a PDF',
      defaultPath: `${factura.numero}.pdf`,
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    })
    if (result.canceled || !result.filePath) return null

    let win: BrowserWindow | null = null
    try {
      win = await createFacturaPrintWindow(id)
      const pdfBuffer = await win.webContents.printToPDF({
        printBackground: true,
        pageSize: 'A4',
        margins: { marginType: 'none' }
      })
      writeFileSync(result.filePath, pdfBuffer)
      logger.info('Factura exportada a PDF', { id, path: result.filePath })
      return result.filePath
    } catch (error) {
      logger.error('Error exportando factura a PDF', error)
      throw new AppError('No se pudo exportar la factura a PDF.')
    } finally {
      win?.destroy()
    }
  })

  handle(IPC.facturas.print, async (id: number) => {
    let win: BrowserWindow | null = null
    try {
      win = await createFacturaPrintWindow(id, { visible: true })
      await new Promise<void>((resolve, reject) => {
        win!.webContents.print({ silent: false, printBackground: true }, (success, errorType) => {
          if (success) resolve()
          else reject(new AppError(errorType || 'No se pudo imprimir la factura.'))
        })
      })
      return true
    } finally {
      win?.destroy()
    }
  })
}
