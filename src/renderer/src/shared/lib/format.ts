let currencyFormatter: Intl.NumberFormat | null = null
let currentCurrency = 'COP'

export function configureCurrency(currency: string): void {
  currentCurrency = currency
  currencyFormatter = null
}

export function formatCurrency(value: number): string {
  if (!currencyFormatter) {
    try {
      currencyFormatter = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: currentCurrency,
        maximumFractionDigits: 0
      })
    } catch {
      currencyFormatter = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })
    }
  }
  return currencyFormatter.format(value)
}

export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(date)
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

/** Formato largo en español, ej: "miércoles, 15 de julio de 2026". */
export function formatDateLong(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  const formatted = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
  return formatted.charAt(0).toLowerCase() + formatted.slice(1)
}
