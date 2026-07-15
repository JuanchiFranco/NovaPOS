import { useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import JsBarcode from 'jsbarcode'
import type { ConfiguracionDTO, FacturaDTO } from '@shared/types/dto'
import { formatCurrency, formatDateLong } from '../../../shared/lib/format'

interface FacturaDocumentoProps {
  factura: FacturaDTO
  config: ConfiguracionDTO
}

export function FacturaDocumento({ factura, config }: FacturaDocumentoProps): JSX.Element {
  const barcodeRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, factura.numero, {
        format: 'CODE128',
        displayValue: false,
        height: 32,
        width: 1.2,
        margin: 0
      })
    }
  }, [factura.numero])

  const mensajeParrafos = (config.mensajePie ?? '').split(/\n\s*\n/).filter((p) => p.trim().length > 0)

  return (
    <div className="mx-auto w-full max-w-[720px] bg-white p-4 text-black" id="factura-documento">
      <table className="w-full table-fixed border-collapse text-sm">
        <colgroup>
          <col className="w-[28%]" />
          <col className="w-[24%]" />
          <col className="w-[24%]" />
          <col className="w-[24%]" />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={4} className="border-2 border-black bg-gradient-to-b from-green-50/60 to-white p-4 text-center">
              <div className="flex items-center justify-center gap-4">
                {config.logoDataUrl && (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-green-700/25 bg-white p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
                    <img src={config.logoDataUrl} alt="Logo" className="h-full w-full rounded-lg object-contain" />
                  </div>
                )}
                <div className="text-left">
                  <h1
                    className="text-3xl font-extrabold italic tracking-tight text-green-700"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                  >
                    {config.nombreComercial}
                  </h1>
                  <div className="mt-1.5 h-[3px] w-full rounded-full bg-gradient-to-r from-green-700 via-green-400 to-transparent" />
                </div>
              </div>
              <p className="mt-2 text-right text-[10px] text-slate-400">
                {factura.numero}
                {factura.estado === 'ANULADA' && <span className="ml-2 font-bold text-red-600">ANULADA</span>}
              </p>
            </td>
          </tr>

          {config.eslogan && (
            <tr>
              <td colSpan={4} className="border-2 border-black p-2 text-center font-bold uppercase">
                {config.eslogan}
              </td>
            </tr>
          )}

          <tr>
            <td colSpan={4} className="border-2 border-black p-2">
              <p className="font-bold">
                CLIENTE: <span className="font-normal">{factura.cliente?.nombre ?? 'Consumidor final'}</span>
              </p>
              <p className="font-bold">
                DIRECCION: <span className="font-normal">{factura.cliente?.direccion ?? ''}</span>
              </p>
            </td>
          </tr>

          <tr>
            <td className="border-2 border-black p-2 font-bold">FECHA</td>
            <td colSpan={3} className="border-2 border-black p-2 text-center font-bold">
              {formatDateLong(factura.fechaEmision)}
            </td>
          </tr>

          <tr className="bg-primary-600 text-white">
            <th className="border-2 border-black p-2 text-left">REFERENCIA</th>
            <th className="border-2 border-black p-2 text-center">CANTIDAD</th>
            <th className="border-2 border-black p-2 text-right">VALOR UND</th>
            <th className="border-2 border-black p-2 text-right">VALOR TOTAL</th>
          </tr>

          {factura.detalle.map((d) => (
            <tr key={d.id}>
              <td className="border-2 border-black p-2">{d.productoCodigo}</td>
              <td className="border-2 border-black p-2 text-center">{d.cantidad}</td>
              <td className="border-2 border-black p-2 text-right">{formatCurrency(d.precioUnitario)}</td>
              <td className="border-2 border-black p-2 text-right">{formatCurrency(d.subtotal)}</td>
            </tr>
          ))}

          <tr>
            <td colSpan={2} rowSpan={2} className="border-2 border-black p-3 align-top">
              {mensajeParrafos[0] && <p className="font-bold">{mensajeParrafos[0]}</p>}
              {config.telefono && <p className="mt-2 font-bold">CEL:{config.telefono}</p>}
              {mensajeParrafos.length > 1 && (
                <p className="mt-4 font-bold">{mensajeParrafos.slice(1).join('\n\n')}</p>
              )}
            </td>
            <td className="border-2 border-black p-2 text-center text-lg font-bold">TOTAL</td>
            <td className="border-2 border-black p-2 text-right text-lg font-bold">
              {formatCurrency(factura.total)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-4 flex items-end justify-between">
        <svg ref={barcodeRef} />
        <QRCodeSVG value={`${factura.numero}|${factura.total}|${factura.fechaEmision}`} size={56} />
      </div>
    </div>
  )
}
