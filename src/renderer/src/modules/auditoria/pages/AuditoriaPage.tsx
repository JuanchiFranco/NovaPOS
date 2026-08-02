import { useMemo, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import type { AuditoriaDTO } from '@shared/types/dto'
import { PageHeader } from '../../../shared/components/PageHeader'
import { Card } from '../../../shared/components/Card'
import { Select } from '../../../shared/components/Select'
import { Input } from '../../../shared/components/Input'
import { Badge } from '../../../shared/components/Badge'
import { Table, type Column } from '../../../shared/components/Table'
import { Pagination } from '../../../shared/components/Pagination'
import { formatDateTime } from '../../../shared/lib/format'
import { useAuditoria, useEntidadesAuditoria } from '../hooks/useAuditoria'

const PAGE_SIZE = 15

const accionTone: Record<string, 'green' | 'blue' | 'red'> = {
  CREATE: 'green',
  UPDATE: 'blue',
  DELETE: 'red'
}

const accionLabel: Record<string, string> = {
  CREATE: 'Creación',
  UPDATE: 'Actualización',
  DELETE: 'Eliminación'
}

export default function AuditoriaPage(): JSX.Element {
  const [entidad, setEntidad] = useState('')
  const [accion, setAccion] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [page, setPage] = useState(1)

  const { data: entidades = [] } = useEntidadesAuditoria()

  const params = useMemo(
    () => ({
      entidad: entidad || undefined,
      accion: accion || undefined,
      desde: desde || undefined,
      hasta: hasta || undefined,
      page,
      pageSize: PAGE_SIZE
    }),
    [entidad, accion, desde, hasta, page]
  )
  const { data, isLoading } = useAuditoria(params)

  const columns: Column<AuditoriaDTO>[] = [
    { header: 'Fecha', key: 'fecha', render: (a) => formatDateTime(a.createdAt) },
    { header: 'Usuario', key: 'usuario', render: (a) => a.usuarioNombre ?? 'Sistema' },
    { header: 'Entidad', key: 'entidad', render: (a) => <span className="capitalize">{a.entidad}</span> },
    { header: 'ID', key: 'entidadId', render: (a) => <span className="font-mono text-xs">{a.entidadId}</span> },
    {
      header: 'Acción',
      key: 'accion',
      render: (a) => <Badge tone={accionTone[a.accion] ?? 'slate'}>{accionLabel[a.accion] ?? a.accion}</Badge>
    },
    {
      header: 'Detalle',
      key: 'detalle',
      render: (a) => <span className="text-xs text-slate-400">{a.detalle ?? '—'}</span>
    }
  ]

  return (
    <div>
      <PageHeader
        title="Auditoría"
        description="Historial de creaciones, actualizaciones y eliminaciones realizadas en el sistema."
      />

      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Entidad"
            value={entidad}
            onChange={(e) => {
              setEntidad(e.target.value)
              setPage(1)
            }}
          >
            <option value="">Todas</option>
            {entidades.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </Select>
          <Select
            label="Acción"
            value={accion}
            onChange={(e) => {
              setAccion(e.target.value)
              setPage(1)
            }}
          >
            <option value="">Todas</option>
            <option value="CREATE">Creación</option>
            <option value="UPDATE">Actualización</option>
            <option value="DELETE">Eliminación</option>
          </Select>
          <Input
            label="Desde"
            type="date"
            value={desde}
            onChange={(e) => {
              setDesde(e.target.value)
              setPage(1)
            }}
          />
          <Input
            label="Hasta"
            type="date"
            value={hasta}
            onChange={(e) => {
              setHasta(e.target.value)
              setPage(1)
            }}
          />
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={data?.data ?? []}
          rowKey={(a) => a.id}
          loading={isLoading}
          emptyTitle="Sin registros de auditoría"
          emptyDescription="Las creaciones, ediciones y eliminaciones que hagas en el sistema aparecerán aquí."
          emptyIcon={<ShieldCheck className="h-6 w-6" />}
        />
        {data && <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />}
      </Card>
    </div>
  )
}
