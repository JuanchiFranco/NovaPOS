import { BrowserWindow } from 'electron'
import * as XLSX from 'xlsx'

export type CellValue = string | number

/** Escapa un valor para CSV (RFC 4180): comillas dobles si contiene coma, comillas o salto de línea. */
function escapeCsvValue(value: CellValue): string {
  const text = String(value)
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export function buildCsv(headers: string[], rows: CellValue[][]): string {
  const lines = [headers.map(escapeCsvValue).join(','), ...rows.map((row) => row.map(escapeCsvValue).join(','))]
  // BOM UTF-8 para que Excel en Windows reconozca tildes y ñ correctamente.
  return '﻿' + lines.join('\r\n')
}

export function buildXlsxBuffer(sheetName: string, headers: string[], rows: CellValue[][]): Buffer {
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31))
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}

function escapeHtml(value: CellValue): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function buildReportHtml(options: {
  empresa: string
  titulo: string
  subtitulo?: string
  headers: string[]
  rows: CellValue[][]
  filaTotales?: CellValue[]
}): string {
  const { empresa, titulo, subtitulo, headers, rows, filaTotales } = options
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1e293b; padding: 32px; }
  h1 { font-size: 18px; margin: 0 0 2px; }
  h2 { font-size: 13px; font-weight: 500; margin: 0 0 4px; color: #475569; }
  p.meta { font-size: 11px; color: #64748b; margin: 0 0 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: left; }
  th { background: #f1f5f9; text-transform: uppercase; letter-spacing: 0.03em; font-size: 9px; color: #475569; }
  tfoot td { font-weight: 700; border-top: 2px solid #94a3b8; border-bottom: none; }
  td.num, th.num { text-align: right; }
</style>
</head>
<body>
  <h1>${escapeHtml(empresa)}</h1>
  <h2>${escapeHtml(titulo)}</h2>
  ${subtitulo ? `<p class="meta">${escapeHtml(subtitulo)}</p>` : ''}
  <table>
    <thead>
      <tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${rows
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td class="${typeof cell === 'number' ? 'num' : ''}">${escapeHtml(cell)}</td>`).join('')}</tr>`
        )
        .join('')}
    </tbody>
    ${
      filaTotales
        ? `<tfoot><tr>${filaTotales
            .map((cell) => `<td class="${typeof cell === 'number' ? 'num' : ''}">${escapeHtml(cell)}</td>`)
            .join('')}</tr></tfoot>`
        : ''
    }
  </table>
</body>
</html>`
}

export async function renderHtmlToPdf(html: string): Promise<Buffer> {
  const win = new BrowserWindow({
    show: false,
    webPreferences: { sandbox: false }
  })
  try {
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
    const pdfBuffer = await win.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      margins: { marginType: 'default' }
    })
    return pdfBuffer
  } finally {
    win.destroy()
  }
}
