import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

/**
 * Crea una ventana oculta que carga la vista de impresión de una factura
 * (misma app React, ruta /imprimir/factura/:id) para poder reutilizar
 * exactamente los mismos componentes visuales (QR, código de barras, totales)
 * al exportar a PDF o enviar a impresora.
 */
export async function createFacturaPrintWindow(facturaId: number): Promise<BrowserWindow> {
  const win = new BrowserWindow({
    show: false,
    width: 800,
    height: 1120,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  const hash = `#/imprimir/factura/${facturaId}`

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    await win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/${hash}`)
  } else {
    await win.loadFile(join(__dirname, '../renderer/index.html'), { hash })
  }

  // Da tiempo a que React monte el componente y se rendericen QR/código de barras.
  await new Promise((resolve) => setTimeout(resolve, 500))

  return win
}
