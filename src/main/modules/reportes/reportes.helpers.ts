import type { MetodoPago, ReporteAgrupacion, ReporteComprasAgrupacion } from '@shared/types/dto'

export const metodoPagoLabel: Record<MetodoPago, string> = {
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta',
  TRANSFERENCIA: 'Transferencia',
  MIXTO: 'Mixto'
}

const mesFormatter = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' })
const diaFormatter = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' })

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Calcula la semana ISO-8601 (lunes a domingo) de una fecha. */
export function isoWeekKeyLabel(date: Date): { key: string; label: string } {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNumber = (target.getUTCDay() + 6) % 7 // lunes = 0
  target.setUTCDate(target.getUTCDate() - dayNumber + 3) // jueves de esa semana
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4))
  const firstDayNumber = (firstThursday.getUTCDay() + 6) % 7
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNumber + 3)
  const week = 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 86400000))
  const year = target.getUTCFullYear()
  return { key: `${year}-W${String(week).padStart(2, '0')}`, label: `Semana ${week} · ${year}` }
}

export function diaKeyLabel(date: Date): { key: string; label: string } {
  const key = date.toISOString().slice(0, 10)
  return { key, label: capitalize(diaFormatter.format(date)) }
}

export function mesKeyLabel(date: Date): { key: string; label: string } {
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  return { key, label: capitalize(mesFormatter.format(date)) }
}

export function anioKeyLabel(date: Date): { key: string; label: string } {
  const key = String(date.getFullYear())
  return { key, label: key }
}

/** true si la agrupación es temporal y por lo tanto debe ordenarse cronológicamente. */
export function esAgrupacionTemporal(agrupacion: ReporteAgrupacion | ReporteComprasAgrupacion): boolean {
  return agrupacion === 'dia' || agrupacion === 'semana' || agrupacion === 'mes' || agrupacion === 'anio'
}

/** Convierte una fecha (yyyy-mm-dd) al final del día para incluir todos los registros de esa fecha. */
export function endOfDay(dateStr: string): Date {
  const date = new Date(dateStr)
  date.setHours(23, 59, 59, 999)
  return date
}

/** Formatea una fecha (ISO o yyyy-mm-dd) para mostrarla en encabezados de reportes exportados. */
export function formatDateEs(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return diaFormatter.format(date)
}

/** Formato de moneda simple usando el símbolo configurado por el negocio (no depende de códigos ISO 4217). */
export function formatCurrencySimple(value: number, simbolo: string): string {
  return `${simbolo}${Math.round(value).toLocaleString('es-CO')}`
}
