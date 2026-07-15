import type { ClienteDTO, PaginatedResult } from '@shared/types/dto'
import type { ClienteCreateInput, ClienteListParams, ClienteUpdateInput } from '@shared/types/requests'
import { clienteSchema } from '@shared/schemas/cliente.schema'
import { NotFoundError } from '../../shared/errors'
import type { ClientesRepository } from './clientes.repository'
import type { Cliente } from '@prisma/client'

function toDTO(cliente: Cliente): ClienteDTO {
  return {
    id: cliente.id,
    nombre: cliente.nombre,
    telefono: cliente.telefono,
    direccion: cliente.direccion,
    activo: cliente.activo,
    createdAt: cliente.createdAt.toISOString(),
    updatedAt: cliente.updatedAt.toISOString()
  }
}

export class ClientesService {
  constructor(private readonly repo: ClientesRepository) {}

  async list(params: ClienteListParams): Promise<PaginatedResult<ClienteDTO>> {
    const result = await this.repo.findMany(params)
    return { ...result, data: result.data.map(toDTO) }
  }

  async getById(id: number): Promise<ClienteDTO> {
    const cliente = await this.repo.findById(id)
    if (!cliente) throw new NotFoundError('Cliente', id)
    return toDTO(cliente)
  }

  async create(input: ClienteCreateInput): Promise<ClienteDTO> {
    const parsed = clienteSchema.parse(input)
    const created = await this.repo.create(parsed)
    return toDTO(created)
  }

  async update(id: number, input: ClienteUpdateInput): Promise<ClienteDTO> {
    const parsed = clienteSchema.partial().parse(input)
    const updated = await this.repo.update(id, { ...parsed, activo: input.activo })
    return toDTO(updated)
  }

  async remove(id: number): Promise<void> {
    await this.repo.remove(id)
  }
}
