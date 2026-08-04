# Propuesta MVP: Gestor financiero operativo para pet-shop

**Estado**: Propuesta pulida para ejecución | **Alcance**: 2 días de implementación | **Stack**: React + TypeScript + Vite + Supabase + Netlify (free tier) | **Arquitectura**: monolito modular, clean architecture pragmática, feature-based

## Qué entrega este MVP

Un panel financiero operativo que reemplaza planillas sueltas. Permite:

- Gestionar un **catálogo de proveedores** (con soft delete) y un **catálogo de categorías de gasto** pre-cargadas y editables.
- Registrar **facturas de compra y gasto** de proveedores (cuentas por pagar) con líneas detalladas (doble identificador de producto: interno + opcional externo).
- Registrar **pagos de egreso** contra esas facturas, inmutables, con flujo de anulación controlada.
- Visualizar en el **dashboard**: ingresos, gastos pagados, deuda pendiente, resultado de caja estimado, desglose por categoría y alerta de vencimientos.
- **Importar y exportar** datos con validación, normalización, prevención de duplicados, y plantilla descargable.
- Control de acceso por **usuario autenticado** con aislamiento total entre usuarios (RLS).

Todo con moneda única del negocio (ARS o USD) configurable por usuario.

## Autoridad del modelo de dominio

El MVP gestiona **facturas de compra/gasto de proveedores**, no facturas de venta a clientes ni cuentas por cobrar. Los pagos son eventos de salida de caja (egresos). Los ingresos por ventas se registran como un registro diario agregado independiente, sin depender de pagos ni facturas de clientes.

## Lo que NO incluye (no-goals explícitos)

| No-goal | Motivo |
|---|---|
| Integración con POS (Alfapp u otro) | El POS no expone API. Toda carga es manual o por archivo. |
| Control de inventario ni rotación | Aunque el MVP modela `quantity` y `product_ref` en líneas de compra, no hay stock de apertura, ni ventas emparejadas. Calcular rotación sin eso es engañoso. |
| Facturas de venta a clientes / cuentas por cobrar | El MVP gestiona egresos (compras y gastos). Las cuentas por cobrar quedan post-MVP. |
| Múltiples monedas por factura | El MVP opera con una moneda única por negocio (ARS o USD). Sin conversiones ni tipo de cambio. USD por factura para tracking de inflación queda post-MVP. |
| Múltiples sucursales o tenants | Alcance limitado a una operación. Multitenant queda post-MVP. |
| Notificaciones por Telegram, email ni push | El MVP usa solo indicadores visuales (alerta de vencimientos en la página de facturas). Los canales externos se evalúan después. |
| Conciliación bancaria | Fuera de alcance. Los pagos se registran sin vincular a extractos bancarios. |
| Sell-through ni márgenes por producto | Sin ventas emparejadas y stock de apertura, el sell-through no es calculable de forma seria. |
| Restauración formal de respaldos | La exportación descargable no constituye una restauración probada. La restauración automatizada queda post-MVP. |

## Qué queda post-MVP (nice-to-have confirmado)

1. **Sell-through y rotación de productos** — requiere emparejar compras con ventas reales y establecer stock de apertura. El MVP ya tiene `quantity` y `product_ref` en líneas; falta el emparejamiento con ventas y el stock inicial.
2. **Notificaciones multicanal** (Telegram, email) — cuando el MVP esté operativo y el usuario defina qué eventos quiere notificar. La alerta visual de vencimientos queda en MVP.
3. **USD por factura para tracking de inflación** — registrar el monto en USD por factura con tipo de cambio y calcular ajuste por inflación. Hoy el MVP es moneda única por negocio.
4. **Restauración automatizada** — probar y validar la recuperación completa desde un archivo de respaldo. La exportación descargable del MVP es solo el primer paso.
5. **Cuentas por cobrar** — si en el futuro se incorporan ventas a crédito, se agregará el módulo de facturación a clientes.
6. **Catálogo maestro de productos** — vinculado a SKU real del proveedor, con histórico de precios de compra. Hoy el MVP tiene `product_ref` (interno) + `external_sku` (opcional), pero sin catálogo maestro.

## Disciplina de datos sin acceso al POS

La realidad es que Alfapp no expone API y exporta filas encapsuladas en una sola celda CSV. Esto impone cuatro reglas de diseño:

1. **Toda entrada de datos es manual o por importación de archivo.** No hay sincronización automática con el POS.
2. **El CSV de importación debe seguir un esquema fijo y validado.** El sistema rechaza archivos con columnas faltantes, tipos incorrectos o filas ya existentes. La **normalización** (trim, mayúsculas, fechas ISO) se aplica en el frontend antes de cualquier validación para reducir errores humanos.
3. **Los importes se manejan en la moneda única del negocio.** Definida en la tabla `settings` por usuario (ARS o USD). El sistema no permite elegir moneda por factura ni convierte entre monedas en el MVP.
4. **Plantilla descargable**: el sistema ofrece una plantilla XLSX con headers, fila de ejemplo y hoja de referencia con los nombres exactos de proveedores y categorías cargados. Esto reduce el error humano al importar.

> **Advertencia de integridad**: este MVP no garantiza que los datos del sistema reflejen fielmente la operación real del negocio. Depende exclusivamente de la disciplina del usuario al cargar facturas y pagos. No hay reconciliación automática con el POS.

## Stack tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend | React 18 + TypeScript | Tipado estricto, ecosistema maduro, componentes reutilizables |
| Bundler | Vite | Build rápido, HMR, configuración mínima |
| Backend / DB | Supabase (Postgres) | Base relacional con Row Level Security, API autogenerada, sin servidor propio |
| Autenticación | Supabase Auth | Email/password, magic link, OAuth. Incluido en el plan gratuito. |
| Almacenamiento | Supabase Storage | Para archivos de importación/exportación y respaldos |
| Hosting | Netlify | Deploy continuo desde Git, HTTPS, funciones serverless si se necesitan |
| Exportación XLSX | ExcelJS | Generación de libros Excel con formato desde el frontend. Se selecciona ExcelJS sobre SheetJS por su API de estilos y formato de celdas más expresiva para reportes financieros. |
| Importación CSV | PapaParse | Parseo robusto de CSV con detección de delimitadores |

## Límites de seguridad

| Frontera | Regla |
|---|---|
| Autenticación | Toda ruta de la aplicación requiere sesión activa. Sin login, no hay acceso. |
| Row Level Security (RLS) | Cada fila en la base de datos pertenece a un `user_id`. Un usuario no puede leer ni modificar datos de otro. Las políticas RLS se aplican en todas las tablas. Los hijos (`invoice_lines`, `payments`) validan pertenencia a través del `user_id` de la factura padre. No se duplica `user_id` en tablas hijas cuando la fuente de pertenencia es el padre. `daily_income`, `suppliers`, `categories`, `settings` tienen `user_id` directo. |
| API | El frontend consume exclusivamente la API de Supabase con el token JWT del usuario autenticado. No hay endpoints públicos sin autenticación. El cliente Supabase vive aislado en `src/lib/supabase/` (ver arquitectura). |
| Variables de entorno | Las claves de Supabase (URL y anon key) se exponen solo como variables de build en Netlify. La service role key nunca llega al frontend. `.env` está en `.gitignore`; `.env.example` documenta las claves esperadas. |
| Respaldos | La exportación descargable de datos está disponible como funcionalidad stretch. No constituye restauración probada. El indicador de último respaldo es opcional y no bloquea el despliegue. |

## Arquitectura frontend

Monolito modular con clean architecture pragmática y organización feature-based:

- **Feature modules** en `src/modules/`: cada bounded context vive en su propia carpeta y contiene sus componentes, hooks, tipos y servicios. Los módulos son: `auth/`, `suppliers/`, `categories/`, `invoices/` (incluye pagos, líneas y alerta de vencimientos), `daily-income/`, `dashboard/`, `import/`, `export/`. Los pagos **no** son módulo independiente: viven dentro de `invoices/` como subcomponente de `InvoiceDetail`.
- **Aislamiento de Supabase** en `src/lib/supabase/`: el cliente, los tipos de respuesta y los servicios de acceso a datos viven en un solo lugar. Los módulos consumen Supabase **a través de estos servicios**, nunca importan `@supabase/supabase-js` directamente. Si cambia el backend, se cambia solo este directorio.
- **Utilidades puras** en `src/utils/`: cálculos financieros (`financial.ts`), canonicalización de CSV (`csvCanonical.ts`), exportación XLSX/CSV. Funciones puras, testeables con Vitest.
- **Tipos compartidos** en `src/types/`: tipos de dominio que cruzan módulos (Invoice, Payment, Supplier, Category, Settings, etc.).

## Entidades del modelo de datos

```
┌──────────────────┐
│    Supplier      │ ← Tabla normalizada (evita errores ortográficos)
│──────────────────│
│ id               │
│ user_id          │
│ name (UNIQUE x user) │
│ default_due_days?│ ← ej. 15 = facturas vencen a 15 días
│ created_at       │
│ updated_at       │
│ deleted_at       │ ← soft delete
└──────────────────┘
        │
        │ 1:N
        ↓
┌──────────────────┐       ┌──────────────────┐       ┌──────────────┐
│     Invoice      │──1:N──│   InvoiceLine    │       │   Payment    │
│──────────────────│       │──────────────────│       │──────────────│
│ id               │       │ id               │       │ id           │
│ user_id          │       │ invoice_id (FK)  │       │ invoice_id   │
│ supplier_id (FK) │       │ product_ref      │       │ amount       │
│ doc_ref (opc.)   │       │ external_sku?    │       │ payment_date │
│ issue_date       │       │ description      │       │ method       │
│ due_date (opc.)  │       │ quantity         │       │ notes        │
│ currency         │       │ unit_cost        │       │ is_void      │
│ category_id (FK) │       │ line_total       │       │ voided_at    │
│ total_amount     │       └──────────────────┘       │ void_reason  │
│ status           │                                  │ created_at   │
│ notes            │       ┌──────────────────┐       └──────────────┘
│ content_hash     │       │   DailyIncome    │
│ created_at       │       │──────────────────│
│ updated_at       │       │ id               │
│ deleted_at       │       │ user_id          │
└──────────────────┘       │ amount           │
        │                  │ sale_date        │
        │ FK                │ source_note      │
        ↓                  │ created_at       │
┌──────────────────┐       └──────────────────┘
│    Category      │ ← Pre-seedeadas, editables
│──────────────────│
│ id               │
│ user_id          │
│ name (UNIQUE x user) │
│ created_at       │
└──────────────────┘

┌──────────────────┐
│    Settings      │ ← Una fila por usuario
│──────────────────│
│ user_id (PK)     │
│ currency ('ARS'  │
│   o 'USD')       │
│ due_alert_days   │ ← default 7, configurable
│ created_at       │
│ updated_at       │
└──────────────────┘
```

**Decisiones clave del modelo:**

- **Doble identificador en `invoice_lines`**: `product_ref` (mandatorio) es la numeración interna sintética que vos generás; `external_sku` (opcional) es el SKU real del proveedor. No son combinación: cada producto tiene al menos `product_ref`, y opcionalmente `external_sku`. Esto soporta proveedores sin SKU normalizado sin obligar a inventar uno.
- **`supplier_name` libre → FK a `suppliers`**: elimina "Coca-Cola" vs "Cocacola". El nombre del supplier es único por usuario (case-insensitive) y se normaliza (trim + uppercase) en la inserción.
- **`category` libre → FK a `categories`**: las 6 categorías del análisis de Alfapp (Alimento, Medicina, Accesorios, Higiene, Consulta, Peluquería) vienen pre-seedeadas. El usuario puede agregar más pero no dejar texto libre.
- **`due_date` autocompletable**: si el supplier tiene `default_due_days`, se sugiere `due_date = issue_date + default_due_days` en el formulario. El usuario puede sobreescribirlo.
- **Convención de auditoría**: todas las tablas de negocio tienen `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`. Un trigger genérico los llena automáticamente. Esto evita "clase base" en TS y es idiomático de Postgres.
- **Soft delete selectivo**: solo `suppliers` e `invoices` usan `deleted_at`. `payments` ya tiene anulación controlada (no necesita soft delete). `daily_income` y `categories` no se soft-eliminan; en su lugar, `daily_income` se puede eliminar con un trigger que verifica que no pertenece a un período cerrado, y `categories` no se puede eliminar si tiene facturas asociadas (solo se desactiva visualmente o se restringe la FK).

**Reglas de negocio**:

| Regla | Detalle |
|---|---|
| **Supplier** | Catálogo por usuario. Nombre único por usuario (case-insensitive). `default_due_days` opcional (entero positivo, ej. 15). Soft delete: `deleted_at` se setea en la baja; las RLS filtran `deleted_at IS NULL` en SELECT, pero permiten restaurar. Al crear cuenta, se seedean automáticamente 2 suppliers de prueba ("Proveedor de prueba 1" y "Proveedor de prueba 2"), ambos con `is_active = true` y borrables por el usuario. |
| **Categoría** | Pre-seedeadas al crear cuenta: Alimento, Medicina, Accesorios, Higiene, Consulta, Peluquería. El usuario puede crear nuevas. Una categoría con facturas asociadas **no se elimina** (FK en uso); la UI debe advertir y bloquear el delete. |
| **Factura** | Pertenece a un `supplier_id` (FK). Referencia de documento opcional (`doc_ref`). Fecha de emisión (`issue_date`) obligatoria. Fecha de vencimiento (`due_date`) opcional, se autocompleta con `issue_date + supplier.default_due_days` si existe. Moneda única del negocio (de `settings`). `category_id` FK a `categories`. |
| **Líneas de compra** | Una factura tiene una o más líneas. Cada línea: `product_ref` (obligatorio, texto que identifica el producto internamente), `external_sku` (opcional, SKU real del proveedor), `description`, `quantity` (> 0), `unit_cost` (> 0), `line_total` (= `quantity × unit_cost`, calculado por trigger). |
| **total_amount** | Suma de `line_total` de todas las líneas de la factura. Se desnormaliza en `Invoice` para consultas rápidas; la fuente de verdad son las líneas. |
| **Integridad de líneas (base de datos)** | Al insertar, actualizar o eliminar líneas (`invoice_lines`), un trigger bloquea la fila padre (`SELECT ... FOR UPDATE`), recalcula `total_amount`, y **rechaza la operación si el nuevo total es menor que la suma de pagos no anulados**. Recalcula el `status` de la factura tras cada mutación de líneas. |
| **Estado** | `pending` (sin pagos), `partially_paid` (pagos parciales), `paid` (suma de pagos no anulados ≥ total). Se recalcula por trigger al insertar/actualizar/anular pagos, y también al mutar líneas. |
| **Pagos** | Eventos de salida de caja contra una factura. **Inmutables tras creación**: `amount`, `invoice_id` no pueden modificarse. La única operación permitida es la anulación controlada: `is_void: false → true` con `voided_at` y `void_reason` obligatorios, vía RPC `security definer`. Los triggers excluyen pagos anulados del cálculo de estado. **Sin DELETE físico** (sin política DELETE en payments) para preservar la auditabilidad. |
| **Integridad de pago (base de datos)** | Trigger `BEFORE INSERT OR UPDATE` en `payments` valida que la suma de pagos no anulados no exceda `invoices.total_amount`. Para concurrencia, el trigger bloquea la factura padre con `SELECT ... FOR UPDATE` antes de recomputar. |
| **Restricción de UPDATE en pagos (RLS + trigger)** | Las políticas RLS de `payments` solo permiten la operación controlada de anulación. Se revoca el permiso UPDATE directo y se expone solo la RPC `void_payment(invoice_payment_id, void_reason)`. |
| **Sobrepago** | Rechazado en el MVP. Si un pago haría que la suma supere el total de la factura, la operación se rechaza a nivel de aplicación y base de datos. |
| **Eliminación de factura (soft)** | Soft delete por defecto: se setea `deleted_at` y la factura desaparece de listados y del dashboard. **Hard delete solo permitido** si la factura NO tiene pagos no anulados: un trigger `BEFORE DELETE` en `invoices` rechaza la operación si `EXISTS (SELECT 1 FROM payments WHERE invoice_id = OLD.id AND is_void = false)`. Las líneas (`invoice_lines`) usan `ON DELETE CASCADE`; los pagos (`payments`) usan `ON DELETE RESTRICT` (inmutables). |
| **Re-check de eliminación** | Para eliminar (soft o hard) una factura, la UI muestra un modal de confirmación destructiva que pide al usuario tipear el nombre del supplier **o** el `doc_ref` (case-insensitive, normalizado con trim). El botón "Eliminar" solo se habilita si el texto tipeado coincide. Esto previene eliminaciones accidentales. |
| **Restauración de soft-deleted** | La UI de suppliers y facturas incluye un filtro "Mostrar eliminados" que permite ver registros con `deleted_at` no nulo y ofrece un botón "Restaurar" (setea `deleted_at = NULL`). |
| **Ingreso diario** | Registro agregado independiente de ventas/ingresos del día. No depende de pagos ni de facturas de clientes. Campos: monto, fecha de venta, fuente o nota. |
| **Pertenencia RLS** | `Invoice`, `Supplier`, `Category`, `DailyIncome`, `Settings` tienen `user_id` directo. `InvoiceLine` y `Payment` validan pertenencia a través del `user_id` de la factura padre (sin columna `user_id` propia en hijos). Las políticas RLS en `suppliers`, `invoices`, `categories` filtran `deleted_at IS NULL` en SELECT por defecto. |




## Dashboard — vista principal

| Sección | Contenido |
|---|---|
| **Ingresos** | Suma de `daily_income.amount` del período (día/semana/mes). Proviene de la tabla `daily_income`, no de pagos. |
| **Gastos pagados** | Suma de pagos no anulados del período (egresos ya ejecutados). |
| **Deuda pendiente** | Suma de `total_amount` de facturas con estado `pending` o `partially_paid`, menos pagos ya realizados. |
| **Resultado de caja estimado** | Ingresos − Gastos pagados. **No es ganancia neta**: no incluye costos no pagados, depreciación ni impuestos. Se muestra con una nota aclaratoria visible. |
| **Categorías de gasto** | Desglose de gastos pagados por categoría (desglose numérico en tarjetas de métrica). El gráfico de barras o torta queda como stretch post-MVP. |
| **Días desde último registro** | Cantidad de días transcurridos desde la fecha de emisión de la factura más reciente. Alerta si > N días (N configurable en `settings.due_alert_days`, default 7). |
| **Tabla de últimas facturas** | Últimas 10 facturas registradas con proveedor, estado, total y fecha. Click para ver detalle. |
| **Indicador de respaldo** (stretch) | Fecha del último respaldo descargable. Si > 7 días, badge de advertencia. No bloquea funcionalidad core. |

## Pantalla de Facturas — alerta de vencimientos

La página principal de facturas (`/invoices`) muestra, en la esquina superior derecha, una **alerta de vencimientos** que:

- Lista las facturas con `due_date <= today + settings.due_alert_days` y estado `pending` o `partially_paid`.
- Agrupa y suma el monto por supplier: "Coca-Cola: 3 facturas próximas, $150.000 ARS".
- Permite filtrar y hacer click en cada item para ir al detalle de la factura.
- Si no hay vencimientos próximos, la alerta se colapsa / muestra estado verde "Sin vencimientos próximos".
- **No es un módulo separado** ni un canal externo: es un componente de UI dentro de la página de facturas.

## Contrato de importación CSV

### Plantilla descargable

La página de Importación (`/import`) ofrece un botón **"Descargar plantilla"** que genera un XLSX con:

- **Hoja "Plantilla"**: headers + 1 fila de ejemplo con valores válidos, formato claro y notas inline.
- **Hoja "Proveedores"**: lista de los suppliers activos del usuario con su nombre exacto. Esto le permite copiar-pegar sin errores ortográficos.
- **Hoja "Categorías"**: lista de las categorías activas del usuario con su nombre exacto.
- **Hoja "Instrucciones"**: notas sobre formato de fechas, valores numéricos, qué columnas son obligatorias.

Esto reduce el error humano y centraliza la fuente de verdad de los nombres válidos.

### Formato de archivo para importación de facturas con líneas

El CSV debe incluir un identificador externo de factura para agrupación. Columnas requeridas:

| Columna | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `invoice_external_id` | string | Sí | Identificador único externo de la factura. Usado para agrupar líneas y detectar duplicados. |
| `supplier_name` | string | Sí | Nombre del proveedor. Debe existir en el catálogo del usuario (case-insensitive). |
| `issue_date` | date (YYYY-MM-DD) | Sí | Fecha de emisión de la factura. |
| `due_date` | date (YYYY-MM-DD) | No | Fecha de vencimiento. |
| `currency` | string | Sí | Debe coincidir con la moneda configurada del negocio (ARS o USD). |
| `category` | string | Sí | Nombre exacto de la categoría. Debe existir en el catálogo del usuario. |
| `product_ref` | string | Sí | Identificador interno del producto (sintético o autonumerado). |
| `external_sku` | string | No | SKU real del proveedor, si existe. |
| `description` | string | Sí | Descripción del producto o servicio. |
| `quantity` | number | Sí | Cantidad. Debe ser > 0. |
| `unit_cost` | number | Sí | Costo unitario. Debe ser > 0. |
| `notes` | string | No | Notas de la factura (opcional). |

### Normalización

Toda fila importada pasa por una normalización agresiva **antes** de la validación:

- Strings: `trim()` + `toUpperCase()` (supplier_name, category, product_ref, external_sku, description).
- Numéricos: dos decimales fijos, sin separadores de miles.
- Fechas: ISO 8601 estricto (`YYYY-MM-DD`).

### Agrupación y validación

- **`invoice_external_id` es obligatorio.** El sistema rechaza cualquier fila sin este campo.
- Las filas con el mismo `invoice_external_id` se agrupan en una única factura con múltiples líneas.
- **Validación de catálogos**: `supplier_name` debe existir en `suppliers` (no soft-deleted) del usuario; `category` debe existir en `categories` del usuario. Si no existe, el grupo se rechaza con mensaje claro: "_Supplier 'CocaCola' no existe en tu catálogo. Créalo primero o usa la plantilla para ver los nombres exactos._"
- **Consistencia de grupo**: si las filas del mismo `invoice_external_id` no coinciden en `supplier_name`, `issue_date`, `due_date`, `currency` y `category` a nivel factura, **se rechaza el grupo completo**.
- **Errores de validación editables**: la UI de Import muestra los grupos rechazados con detalle de errores. El usuario puede **editar las celdas problemáticas directamente en la tabla de preview** y reintentar la importación sin tener que rearmar el archivo. Esto preserva el `invoice_external_id` para que el hash canónico siga siendo válido entre corrección y reimportación.

### Deduplicación y manejo de colisiones de ID

Se separan dos casos que el plan anterior mezclaba:

1. **Duplicado real** (mismo contenido canónico): si el hash canónico del grupo ya existe en la base de datos, **el grupo se omite silenciosamente** y se reporta en el resumen: "X importadas, Y omitidas por duplicado". Cálculo del hash:
   1. Ordenar las líneas canónicamente por `(product_ref, external_sku, description, quantity, unit_cost, line_total)` normalizados.
   2. Serializar en formato explícito: `invoice_external_id|supplier|issue|due|currency|category|LINEAS{pref|extsku|desc|qty|ucost|ltotal;...}`.
   3. SHA-256 sobre esa representación, persistido como `content_hash` (UNIQUE) en `invoices`.

2. **Colisión de ID externo con datos distintos** (mismo `invoice_external_id` pero contenido distinto a cualquier factura existente): el sistema **pregunta al usuario de manera agresiva** antes de continuar. El modal muestra:
   - "Ya existe una factura con ID externo `12345` pero con datos distintos (Supplier X, fecha Y)."
   - Dos opciones: **"Unir a factura existente"** (agrega las líneas nuevas a la factura existente, sin tocar las viejas — requiere que el resto de campos a nivel factura coincidan) o **"Crear nueva con ID modificado"** (sugiere un sufijo, ej. `12345-v2`, y crea una factura nueva).
   - Si el usuario cancela, el grupo queda en estado "pendiente de decisión" en la preview y no se importa.

Esto preserva la integridad del hash y maneja el caso real donde el usuario reusa accidentalmente un número de factura.

## Flujo de exportación

### Exportación XLSX (ExcelJS)

1. El usuario aplica filtros opcionales: rango de fechas (desde/hasta sobre `issue_date`), estado de factura, categoría.
2. El sistema consulta facturas con sus líneas y pagos usando filtros del lado del cliente (`.gte()`, `.lte()`, `.eq()` sobre columnas).
3. Genera workbook con dos hojas: "Facturas" (proveedor, fecha emisión, vencimiento, categoría, total, estado) y "Líneas" (factura#, SKU, descripción, cantidad, costo unitario, total línea).
4. Formato: anchos de columna calculados, encabezados en negrita, importes con formato de moneda.

### Exportación CSV

1. Mismos filtros que XLSX.
2. Generación con PapaParse (`unparse`), encabezados normalizados, codificación UTF-8 con BOM para compatibilidad Excel.
3. Descarga directa.

## Estrategia de testing para el MVP de 2 días

| Tipo | Alcance | Herramienta |
|---|---|---|
| **Tests unitarios** | Cálculos financieros: `line_total = quantity × unit_cost`, `total_amount = SUM(line_total)`, verificación de estado (pending/partially_paid/paid), rechazo de sobrepago. **Invariantes de mutación de líneas tras pago** (rechazo al reducir cantidad o eliminar línea con pagos registrados). **Flujo de anulación de pagos**: `is_void`, `voided_at` y `void_reason` obligatorios en la transición, pagos anulados no afectan estado. **Rechazo de eliminación de factura con pagos no anulados**. Validación de CSV (fechas, tipos, positividad). Canonicalización de grupos (normalización, orden, hash). | Vitest. Configuración: `forbidOnly: true`. Comando obligatorio: `npx vitest run` (sin watch). |
| **RLS — verificación manual** | Checklist documentada de 12 pasos que un humano ejecuta en 15 minutos: crear dos usuarios, insertar facturas con A, verificar que B no las ve, intentar insertar pago en factura de otro usuario (debe fallar), verificar que daily_income de A no es visible para B. | Checklist en `docs/rls-verification.md` |
| **Gate de invariantes de BD** | Script SQL de verificación versionado (`sql/003-verify-db-invariants.sql`) o procedimiento en proyecto Supabase local/test que ejecuta y asevera: (1) sobrepago rechazado, (2) mutación/eliminación de línea con pagos no anulados rechazada, (3) UPDATE inválido de pago rechazado, (4) flujo de anulación funciona (is_void + voided_at + void_reason), (5) eliminación de factura con pagos rechazada. **Gate obligatorio de pre-deploy: T-15 no se acepta sin este gate superado.** | SQL script versionado. Sin CI automatizado; ejecución manual antes de cada despliegue. |
| **Gate de despliegue** | `npx vitest run` sin fallos + checklist RLS ejecutada y verificada + gate de invariantes de BD superado, todo en entorno de producción. Sin los tres gates, no se despliega. | — |
| **CI/CD** | Post-MVP. No se configura pipeline de CI en los 2 días. Los tests y gates se ejecutan manualmente antes de cada despliegue. | — |

## Plan de implementación en 2 días

Ver [plan-para-agentes.md](./plan-para-agentes.md) con el desglose atómico de tareas, dependencias y criterios de verificación.

---

> **Principio rector**: este MVP es deliberadamente incompleto. No intenta cubrir todo el negocio — cubre lo mínimo que reemplaza planillas sueltas con una herramienta confiable, tipada y respaldable, enfocada en el control de egresos y la visibilidad de caja operativa. Cada decisión de "no incluir" está documentada con su motivo.
