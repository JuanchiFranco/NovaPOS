# NovaPOS — App de escritorio

Aplicación de escritorio offline para gestión de ventas e inventario, construida con Electron + React + TypeScript + Prisma (SQLite) + TailwindCSS, siguiendo una arquitectura modular por dominios (feature-based) con capas de repository / service / IPC.

## Requisitos

- Node.js 18 o superior
- pnpm (`npm install -g pnpm`)
- Conexión a internet **solo la primera vez**, para `pnpm install` (la app funciona 100% offline después)

## Puesta en marcha

```bash
pnpm install   # instala dependencias, compila el cliente de Prisma y prepara Electron
pnpm dev       # levanta la app en modo desarrollo con hot-reload
```

No se requiere ningún paso manual adicional: al iniciar, la app crea automáticamente la base de datos SQLite (`prisma/dev.db` en desarrollo) y su esquema completo si no existen.

### Build de producción

```bash
pnpm build         # compila main/preload/renderer (sin empaquetar instalador)
pnpm build:win     # genera instalador para Windows (requiere electron-builder)
pnpm build:mac     # genera .dmg para macOS
pnpm build:linux   # genera AppImage para Linux
```

> Antes de generar un instalador real, reemplaza `resources/icon.png` por el logo definitivo del negocio (mínimo 256×256).

### Otros comandos útiles

```bash
pnpm prisma:studio   # explorador visual de la base de datos
pnpm prisma:migrate  # crear una nueva migración si modificas prisma/schema.prisma
pnpm typecheck       # verificación de tipos de todo el proyecto
pnpm lint            # ESLint
```

## Arquitectura

```
src/
  main/               Proceso principal de Electron
    database/         Cliente Prisma, bootstrap del esquema SQLite, backups automáticos
    modules/<dominio>/ repository.ts (acceso a datos) · service.ts (reglas de negocio) · ipc.ts (handlers)
    ipc/               Composition root: cablea repository → service → ipc por módulo
    shared/            Logger, manejo de errores, wrapper de ipcMain.handle
  preload/            Puente contextBridge (API tipada window.api.*)
  renderer/           Aplicación React
    src/modules/<dominio>/  components · pages · hooks (React Query) · utils
    src/shared/             componentes UI, layout, router, stores (Zustand), lib
  shared/             Código compartido entre main y renderer (sin dependencias de Node)
    schemas/          Validaciones Zod (usadas en formularios Y en el backend)
    types/             DTOs e inputs tipados
    constants/         Nombres de canales IPC
prisma/
  schema.prisma       Esquema completo (clientes, productos, ventas, facturas, inventario, usuarios, roles, auditoría, configuración)
  init.sql            Bootstrap idempotente ejecutado al iniciar la app
```

Cada módulo de negocio sigue **Repository Pattern + Service Layer**: el repository solo hace consultas Prisma, el service aplica las reglas de negocio y validación (Zod), y el archivo `.ipc.ts` expone esas operaciones al renderer via `ipcMain.handle`, siempre devolviendo un `ApiResult<T>` uniforme (nunca lanza errores crudos hacia la UI).

## Qué incluye esta primera fase

- **Dashboard** con KPIs (ventas de hoy/mes, total facturado, productos más vendidos, últimas ventas, alertas de stock bajo) y gráficos.
- **Clientes**: CRUD completo con búsqueda por nombre/documento/teléfono.
- **Productos**: CRUD completo, categorías dinámicas, control de stock y alertas de stock bajo.
- **Ventas**: carrito con selección de cliente, búsqueda de productos, cantidades, descuentos por línea y globales, cálculo automático de subtotal/IVA/descuento/total, métodos de pago (efectivo, tarjeta, transferencia, mixto). Al confirmar, actualiza el inventario y genera la factura en una única transacción de base de datos.
- **Facturas**: numeración consecutiva configurable, código QR y código de barras, vista previa, exportación a PDF, impresión vía diálogo del sistema, historial con filtros (fecha, cliente, número, producto, método de pago) y "duplicar venta".
- **Configuración**: datos del negocio, logo, % de IVA, moneda, prefijo y numeración de facturas.
- **Backups automáticos** de la base de datos SQLite (al iniciar y cada 6 horas) con posibilidad de restaurar desde el main process.

## Próximas fases (no incluidas todavía)

- Módulo de **Inventario** completo (entradas/salidas manuales, historial de movimientos, ajustes) — hoy el stock ya se actualiza automáticamente con cada venta y se muestran alertas, pero falta la pantalla de movimientos detallada.
- Módulo de **Reportes** (por día/semana/mes/año/cliente/producto/categoría/método de pago) con exportación a PDF/Excel/CSV.
- **Autenticación** con usuarios y roles (las tablas ya existen en el esquema de base de datos).
- **Registro de auditoría** expuesto en la interfaz (la tabla y el mecanismo de registro ya existen a nivel de base de datos).
- Restauración de backups y gestión de impresoras desde la pantalla de Configuración.

## Nota sobre la instalación de dependencias

Este proyecto se generó y revisó en un entorno sin acceso a la red, por lo que **no fue posible ejecutar `pnpm install` ni compilar el proyecto** en ese entorno. El código fue escrito y revisado cuidadosamente a mano (incluyendo una revisión manual de tipos e imports), pero se recomienda ejecutar `pnpm install`, `pnpm dev` y `pnpm build` en tu máquina como primer paso para detectar cualquier ajuste menor de versiones de dependencias.
