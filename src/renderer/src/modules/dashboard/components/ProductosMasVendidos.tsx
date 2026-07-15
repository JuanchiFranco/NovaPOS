import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface ProductosMasVendidosProps {
  data: { nombre: string; cantidad: number }[]
}

export function ProductosMasVendidos({ data }: ProductosMasVendidosProps): JSX.Element {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-400">Aún no hay ventas registradas.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-slate-200 dark:stroke-slate-800" />
        <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
        <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11 }} width={120} />
        <Tooltip />
        <Bar dataKey="cantidad" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  )
}
