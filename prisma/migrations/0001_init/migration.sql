-- Bootstrap idempotente de la base de datos SQLite.
-- Se ejecuta al iniciar la app (main/database/migrate.ts) para garantizar que el
-- esquema exista sin depender de tener el CLI de Prisma disponible en producción.
-- Este mismo archivo es compatible como base para `prisma migrate`.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS "roles" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "nombre" TEXT NOT NULL UNIQUE,
  "descripcion" TEXT,
  "permisos" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "usuarios" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "nombre" TEXT NOT NULL,
  "usuario" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "activo" BOOLEAN NOT NULL DEFAULT 1,
  "rolId" INTEGER NOT NULL REFERENCES "roles"("id"),
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "auditoria" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "entidad" TEXT NOT NULL,
  "entidadId" INTEGER NOT NULL,
  "accion" TEXT NOT NULL,
  "detalle" TEXT,
  "usuarioId" INTEGER REFERENCES "usuarios"("id"),
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "auditoria_entidad_entidadId_idx" ON "auditoria" ("entidad", "entidadId");

CREATE TABLE IF NOT EXISTS "configuracion" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "nombreComercial" TEXT NOT NULL DEFAULT 'VARIEDADES J&A',
  "eslogan" TEXT,
  "mensajePie" TEXT,
  "nit" TEXT,
  "direccion" TEXT,
  "telefono" TEXT,
  "correo" TEXT,
  "logoPath" TEXT,
  "porcentajeIva" REAL NOT NULL DEFAULT 19,
  "moneda" TEXT NOT NULL DEFAULT 'COP',
  "simboloMoneda" TEXT NOT NULL DEFAULT '$',
  "prefijoFactura" TEXT NOT NULL DEFAULT 'FAC',
  "numeroInicialFactura" INTEGER NOT NULL DEFAULT 1,
  "siguienteNumeroFactura" INTEGER NOT NULL DEFAULT 1,
  "impresoraPredeterminada" TEXT,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "clientes" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "nombre" TEXT NOT NULL,
  "documento" TEXT UNIQUE,
  "telefono" TEXT,
  "direccion" TEXT,
  "correo" TEXT,
  "observaciones" TEXT,
  "activo" BOOLEAN NOT NULL DEFAULT 1,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "clientes_nombre_idx" ON "clientes" ("nombre");
CREATE INDEX IF NOT EXISTS "clientes_telefono_idx" ON "clientes" ("telefono");

CREATE TABLE IF NOT EXISTS "categorias" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "nombre" TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "productos" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "codigo" TEXT NOT NULL UNIQUE,
  "nombre" TEXT NOT NULL,
  "categoriaId" INTEGER REFERENCES "categorias"("id"),
  "precioCompra" REAL NOT NULL DEFAULT 0,
  "precioVenta" REAL NOT NULL,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "stockMinimo" INTEGER NOT NULL DEFAULT 5,
  "descripcion" TEXT,
  "activo" BOOLEAN NOT NULL DEFAULT 1,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "productos_nombre_idx" ON "productos" ("nombre");
CREATE INDEX IF NOT EXISTS "productos_codigo_idx" ON "productos" ("codigo");

CREATE TABLE IF NOT EXISTS "ventas" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "clienteId" INTEGER REFERENCES "clientes"("id"),
  "usuarioId" INTEGER REFERENCES "usuarios"("id"),
  "subtotal" REAL NOT NULL,
  "descuento" REAL NOT NULL DEFAULT 0,
  "iva" REAL NOT NULL,
  "total" REAL NOT NULL,
  "metodoPago" TEXT NOT NULL CHECK ("metodoPago" IN ('EFECTIVO','TARJETA','TRANSFERENCIA','MIXTO')),
  "montoEfectivo" REAL,
  "montoTarjeta" REAL,
  "montoTransferencia" REAL,
  "estado" TEXT NOT NULL DEFAULT 'COMPLETADA' CHECK ("estado" IN ('COMPLETADA','ANULADA')),
  "notas" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "ventas_createdAt_idx" ON "ventas" ("createdAt");
CREATE INDEX IF NOT EXISTS "ventas_clienteId_idx" ON "ventas" ("clienteId");

CREATE TABLE IF NOT EXISTS "detalle_venta" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "ventaId" INTEGER NOT NULL REFERENCES "ventas"("id"),
  "productoId" INTEGER NOT NULL REFERENCES "productos"("id"),
  "cantidad" INTEGER NOT NULL,
  "precioUnitario" REAL NOT NULL,
  "descuento" REAL NOT NULL DEFAULT 0,
  "subtotal" REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS "detalle_venta_ventaId_idx" ON "detalle_venta" ("ventaId");

CREATE TABLE IF NOT EXISTS "movimientos_inventario" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "productoId" INTEGER NOT NULL REFERENCES "productos"("id"),
  "tipo" TEXT NOT NULL CHECK ("tipo" IN ('ENTRADA','SALIDA','AJUSTE')),
  "cantidad" INTEGER NOT NULL,
  "stockAnterior" INTEGER NOT NULL,
  "stockNuevo" INTEGER NOT NULL,
  "motivo" TEXT,
  "ventaId" INTEGER REFERENCES "ventas"("id"),
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "movimientos_inventario_productoId_idx" ON "movimientos_inventario" ("productoId");
CREATE INDEX IF NOT EXISTS "movimientos_inventario_tipo_idx" ON "movimientos_inventario" ("tipo");

CREATE TABLE IF NOT EXISTS "facturas" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "numero" TEXT NOT NULL UNIQUE,
  "consecutivo" INTEGER NOT NULL,
  "ventaId" INTEGER NOT NULL UNIQUE REFERENCES "ventas"("id"),
  "clienteId" INTEGER REFERENCES "clientes"("id"),
  "subtotal" REAL NOT NULL,
  "descuento" REAL NOT NULL,
  "iva" REAL NOT NULL,
  "total" REAL NOT NULL,
  "metodoPago" TEXT NOT NULL CHECK ("metodoPago" IN ('EFECTIVO','TARJETA','TRANSFERENCIA','MIXTO')),
  "estado" TEXT NOT NULL DEFAULT 'EMITIDA' CHECK ("estado" IN ('EMITIDA','ANULADA')),
  "fechaEmision" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "facturas_numero_idx" ON "facturas" ("numero");
CREATE INDEX IF NOT EXISTS "facturas_fechaEmision_idx" ON "facturas" ("fechaEmision");

CREATE TABLE IF NOT EXISTS "detalle_factura" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "facturaId" INTEGER NOT NULL REFERENCES "facturas"("id"),
  "productoNombre" TEXT NOT NULL,
  "productoCodigo" TEXT NOT NULL,
  "cantidad" INTEGER NOT NULL,
  "precioUnitario" REAL NOT NULL,
  "descuento" REAL NOT NULL DEFAULT 0,
  "subtotal" REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS "detalle_factura_facturaId_idx" ON "detalle_factura" ("facturaId");

-- Datos iniciales (idempotentes)
INSERT INTO "configuracion" ("id", "nombreComercial", "eslogan", "mensajePie")
SELECT 1, 'VARIEDADES J&A', 'VENTA DE: VELAS, VELADORAS Y MUCHO MAS',
  'HACERCATE PARA TENER EL GUSTO DE ATENDERTE

TODO LO PUEDO EN CRISTO QUE ME FORTALECE'
WHERE NOT EXISTS (SELECT 1 FROM "configuracion" WHERE "id" = 1);

INSERT INTO "roles" ("nombre", "descripcion", "permisos")
SELECT 'Administrador', 'Acceso total al sistema', '{"all":true}'
WHERE NOT EXISTS (SELECT 1 FROM "roles" WHERE "nombre" = 'Administrador');
