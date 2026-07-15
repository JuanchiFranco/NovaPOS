import toast from 'react-hot-toast'
import { Download, Printer } from 'lucide-react'
import type { FacturaDTO } from '@shared/types/dto'
import { Modal } from '../../../shared/components/Modal'
import { Button } from '../../../shared/components/Button'
import { Spinner } from '../../../shared/components/Spinner'
import { useConfiguracion } from '../../configuracion/hooks/useConfiguracion'
import { FacturaDocumento } from './FacturaDocumento'

interface FacturaDetalleModalProps {
  factura: FacturaDTO | null
  onClose: () => void
}

export function FacturaDetalleModal({ factura, onClose }: FacturaDetalleModalProps): JSX.Element {
  const { data: config } = useConfiguracion()

  return (
    <Modal open={Boolean(factura)} title={factura ? `Factura ${factura.numero}` : ''} onClose={onClose} size="xl">
      {!factura || !config ? (
        <Spinner />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                const path = await window.api.facturas.exportPdf(factura.id)
                if (path) toast.success('Factura exportada a PDF')
              }}
            >
              <Download className="h-4 w-4" /> Exportar PDF
            </Button>
            <Button variant="secondary" size="sm" onClick={() => window.api.facturas.print(factura.id)}>
              <Printer className="h-4 w-4" /> Imprimir
            </Button>
          </div>
          <div className="max-h-[65vh] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <FacturaDocumento factura={factura} config={config} />
          </div>
        </div>
      )}
    </Modal>
  )
}
