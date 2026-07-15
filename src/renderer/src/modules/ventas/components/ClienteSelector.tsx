import { useCartStore } from '../../../shared/store/cart.store'
import { ClienteAutocomplete } from '../../../shared/components/ClienteAutocomplete'

export function ClienteSelector(): JSX.Element {
  const { clienteId, clienteNombre, setCliente } = useCartStore()
  return (
    <ClienteAutocomplete
      clienteId={clienteId}
      clienteNombre={clienteNombre}
      onChange={setCliente}
      placeholder="Buscar cliente (opcional para venta de mostrador)…"
    />
  )
}
