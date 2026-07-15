import { readFileSync } from 'fs'
import { extname } from 'path'
import type { ConfiguracionDTO } from '@shared/types/dto'
import type { ConfiguracionUpdateInput } from '@shared/types/requests'
import { configuracionSchema } from '@shared/schemas/configuracion.schema'
import type { ConfiguracionRepository } from './configuracion.repository'

const MIME_BY_EXTENSION: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
}

/**
 * Convierte el logo a data URI para que el renderer pueda mostrarlo sin depender
 * de URLs `file://`, que Chromium bloquea como subrecurso cuando la página no
 * fue cargada ella misma por `file://` (p. ej. en desarrollo, servida por Vite).
 */
function readLogoAsDataUrl(logoPath: string | null): string | null {
  if (!logoPath) return null
  const mime = MIME_BY_EXTENSION[extname(logoPath).toLowerCase()]
  if (!mime) return null
  try {
    const buffer = readFileSync(logoPath)
    return `data:${mime};base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
}

function toDTO(config: NonNullable<Awaited<ReturnType<ConfiguracionRepository['get']>>>): ConfiguracionDTO {
  return {
    id: config.id,
    nombreComercial: config.nombreComercial,
    eslogan: config.eslogan,
    mensajePie: config.mensajePie,
    nit: config.nit,
    direccion: config.direccion,
    telefono: config.telefono,
    correo: config.correo,
    logoPath: config.logoPath,
    logoDataUrl: readLogoAsDataUrl(config.logoPath),
    porcentajeIva: config.porcentajeIva,
    moneda: config.moneda,
    simboloMoneda: config.simboloMoneda,
    prefijoFactura: config.prefijoFactura,
    numeroInicialFactura: config.numeroInicialFactura,
    siguienteNumeroFactura: config.siguienteNumeroFactura,
    impresoraPredeterminada: config.impresoraPredeterminada
  }
}

export class ConfiguracionService {
  constructor(private readonly repo: ConfiguracionRepository) {}

  async get(): Promise<ConfiguracionDTO> {
    const config = await this.repo.get()
    return toDTO(config)
  }

  async update(input: ConfiguracionUpdateInput): Promise<ConfiguracionDTO> {
    const parsed = configuracionSchema.parse(input)
    const updated = await this.repo.update(parsed)
    return toDTO(updated)
  }

  async updateLogoPath(logoPath: string): Promise<ConfiguracionDTO> {
    const updated = await this.repo.updateLogoPath(logoPath)
    return toDTO(updated)
  }
}
