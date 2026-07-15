import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency } from '../../../shared/lib/format'

interface VentasChartProps {
  data: { fecha: string; total: number }[]
}

export function VentasChart({ data }: VentasChartProps): JSX.Element {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="ventasGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-slate-800" />
        <XAxis dataKey="fecha" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
        <YAxis tick={{ fontSize: 11 }} width={70} tickFormatter={(v) => formatCurrency(Number(v))} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={(label) => `Fecha: ${label}`} />
        <Area type="monotone" dataKey="total" stroke="#2563eb" fill="url(#ventasGradient)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
