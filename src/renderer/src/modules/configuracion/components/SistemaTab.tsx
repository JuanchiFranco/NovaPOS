import { useState } from 'react'
import { CheckCircle2, DatabaseBackup, HardDriveDownload, Printer, RotateCcw } from 'lucide-react'
import type { BackupInfo } from '@shared/types/dto'
import { Card } from '../../../shared/components/Card'
import { Button } from '../../../shared/components/Button'
import { Table, type Column } from '../../../shared/components/Table'
import { Badge } from '../../../shared/components/Badge'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { formatDateTime } from '../../../shared/lib/format'
import { useConfiguracion } from '../hooks/useConfiguracion'
import { useBackups, useCrearBackup, useImpresoras, useRestaurarBackup, useSetImpresora } from '../hooks/useSistema'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export function SistemaTab(): JSX.Element {
  const { data: backups = [], isLoading: cargandoBackups } = useBackups()
  const { data: impresoras = [], isLoading: cargandoImpresoras } = useImpresoras()
  const { data: config } = useConfiguracion()
  const crearBackup = useCrearBackup()
  const restaurarBackup = useRestaurarBackup()
  const setImpresora = useSetImpresora()
  const [aRestaurar, setARestaurar] = useState<BackupInfo | null>(null)

  const columns: Column<BackupInfo>[] = [
    { header: 'Archivo', key: 'fileName', render: (b) => <span className="font-mono text-xs">{b.fileName}</span> },
    { header: 'Fecha', key: 'createdAt', render: (b) => formatDateTime(b.createdAt) },
    { header: 'Tamaño', key: 'sizeBytes', render: (b) => formatBytes(b.sizeBytes) },
    {
      header: '',
      key: 'acciones',
      className: 'text-right',
      render: (b) => (
        <Button variant="secondary" size="sm" onClick={() => setARestaurar(b)}>
          <RotateCcw className="h-3.5 w-3.5" /> Restaurar
        </Button>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
              <DatabaseBackup className="h-4 w-4" /> Respaldos de la base de datos
            </h2>
            <p className="text-sm text-slate-400">
              Se crea un respaldo automático al iniciar la app y cada 6 horas. Se conservan los últimos 20.
            </p>
          </div>
          <Button variant="secondary" loading={crearBackup.isPending} onClick={() => crearBackup.mutate()}>
            <HardDriveDownload className="h-4 w-4" /> Crear backup ahora
          </Button>
        </div>

        <Table
          columns={columns}
          data={backups}
          rowKey={(b) => b.fileName}
          loading={cargandoBackups}
          emptyTitle="Sin respaldos todavía"
          emptyDescription="Se generará uno automáticamente la próxima vez que abras la app."
        />
      </Card>

      <Card>
        <h2 className="mb-1 flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
          <Printer className="h-4 w-4" /> Impresora predeterminada
        </h2>
        <p className="mb-4 text-sm text-slate-400">Se usará al imprimir facturas directamente sin mostrar el diálogo del sistema.</p>

        {cargandoImpresoras ? (
          <p className="text-sm text-slate-400">Buscando impresoras…</p>
        ) : impresoras.length === 0 ? (
          <p className="text-sm text-slate-400">No se detectaron impresoras conectadas.</p>
        ) : (
          <div className="space-y-2">
            {impresoras.map((imp) => {
              const esActual = config?.impresoraPredeterminada === imp.nombre
              return (
                <div
                  key={imp.nombre}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{imp.descripcion}</p>
                    {imp.predeterminadaDelSistema && <p className="text-xs text-slate-400">Predeterminada del sistema operativo</p>}
                  </div>
                  {esActual ? (
                    <Badge tone="green">
                      <CheckCircle2 className="mr-1 inline h-3 w-3" /> En uso
                    </Badge>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={setImpresora.isPending}
                      onClick={() => setImpresora.mutate(imp.nombre)}
                    >
                      Usar esta
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(aRestaurar)}
        title="Restaurar backup"
        message={`Esto reemplazará la base de datos actual con el respaldo "${aRestaurar?.fileName}". Se creará un backup del estado actual antes de restaurar. Deberás reiniciar la aplicación después.`}
        danger
        confirmLabel="Restaurar"
        loading={restaurarBackup.isPending}
        onCancel={() => setARestaurar(null)}
        onConfirm={() => {
          if (aRestaurar) restaurarBackup.mutate(aRestaurar.fileName, { onSuccess: () => setARestaurar(null) })
        }}
      />
    </div>
  )
}
