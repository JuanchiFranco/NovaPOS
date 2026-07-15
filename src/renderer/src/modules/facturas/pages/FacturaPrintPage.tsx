import { useParams } from 'react-router-dom'
import { useFactura } from '../hooks/useFacturas'
import { useConfiguracion } from '../../configuracion/hooks/useConfiguracion'
import { FacturaDocumento } from '../components/FacturaDocumento'
import { Spinner } from '../../../shared/components/Spinner'

/**
 * Vista dedicada para impresión / exportación a PDF.
 * Se carga en una ventana oculta de Electron (ver main/modules/facturas/print-window.ts)
 * reutilizando el mismo componente visual que la vista previa en pantalla.
 */
export default function FacturaPrintPage(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const facturaId = id ? Number(id) : null
  const { data: factura, isLoading } = useFactura(facturaId)
  const { data: config } = useConfiguracion()

  if (isLoading || !factura || !config) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <FacturaDocumento factura={factura} config={config} />
    </div>
  )
}
