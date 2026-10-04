import { useMemo, useState } from 'react'
import { PERMISOS, normalizarPermisos, type Permiso } from '@shared/constants/permisos'
import type { RolDTO } from '@shared/types/dto'
import { Input } from '../../../shared/components/Input'
import { Button } from '../../../shared/components/Button'

interface RolFormProps {
  initialData: RolDTO | null
  loading?: boolean
  onSubmit: (values: { nombre: string; descripcion: string; permisos: Permiso[] }) => void
  onCancel: () => void
}

export function RolForm({ initialData, loading, onSubmit, onCancel }: RolFormProps): JSX.Element {
  const [nombre, setNombre] = useState(initialData?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(initialData?.descripcion ?? '')
  const [permisos, setPermisos] = useState<Set<Permiso>>(new Set(initialData?.permisos ?? []))
  const [error, setError] = useState<string | null>(null)

  const grupos = useMemo(() => {
    const mapa = new Map<string, (typeof PERMISOS)[number][]>()
    for (const p of PERMISOS) mapa.set(p.grupo, [...(mapa.get(p.grupo) ?? []), p])
    return [...mapa.entries()]
  }, [])

  const alternar = (clave: Permiso, marcado: boolean): void => {
    setPermisos((actual) => {
      const siguiente = new Set(actual)
      if (marcado) {
        siguiente.add(clave)
        // Marca también los permisos de los que depende (p. ej. cambiar precios exige poder editar productos).
        normalizarPermisos([...siguiente]).forEach((p) => siguiente.add(p))
      } else {
        siguiente.delete(clave)
        // Y desmarca los que dependían de este.
        for (const def of PERMISOS) {
          if ('requiere' in def && (def.requiere as readonly string[]).includes(clave)) siguiente.delete(def.clave)
        }
      }
      return siguiente
    })
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (nombre.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres')
      return
    }
    if (permisos.size === 0) {
      setError('Selecciona al menos un permiso')
      return
    }
    setError(null)
    onSubmit({ nombre: nombre.trim(), descripcion: descripcion.trim(), permisos: [...permisos] })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Nombre del rol *" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Cajero, Bodeguero" />
        <Input label="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Qué hace este rol" />
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Permisos</p>
        <p className="-mt-3 text-xs text-slate-400">
          Ver productos, clientes y ventas está disponible para todos los roles; aquí eliges lo demás.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {grupos.map(([grupo, items]) => (
            <fieldset key={grupo} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{grupo}</legend>
              <div className="space-y-2">
                {items.map((p) => (
                  <label key={p.clave} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={permisos.has(p.clave)}
                      onChange={(e) => alternar(p.clave, e.target.checked)}
                    />
                    <span>{p.etiqueta}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          Guardar rol
        </Button>
      </div>
    </form>
  )
}
