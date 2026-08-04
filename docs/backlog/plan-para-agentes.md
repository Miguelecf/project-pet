# Plan para agentes de implementación — MVP Pet-shop (2 días)

**Objetivo**: construir el gestor financiero operativo de egresos definido en [propuesta-mvp.md](./propuesta-mvp.md). Cada tarea es atómica, tiene dependencias explícitas y criterios de verificación no ambiguos.

---

## Primer slice ejecutable y demoable

Al completar **T-08** (registro de pagos con rechazo de sobrepago), la aplicación ya es funcional de punta a punta: un usuario puede autenticarse, crear facturas de compra con líneas detalladas (SKU, cantidad, costo unitario), listarlas, ver detalle y registrar pagos. Este es el hito mínimo para una demo.

---

## Día 1 — Setup, base de datos, autenticación, facturas y pagos

---

### T-01: Scaffolding del proyecto

| Campo | Valor |
|---|---|
| **ID** | T-01 |
| **Objetivo** | Crear el proyecto React + TypeScript + Vite, instalar dependencias, configurar estructura de carpetas inicial. |
| **Dependencias** | Ninguna |
| **Pasos** | 1. Ejecutar `npm create vite@latest project-pet -- --template react-ts`. 2. Instalar dependencias: `@supabase/supabase-js`, `react-router-dom`, `recharts`, `papaparse`, `exceljs`, `file-saver`, `@types/papaparse`. 3. Crear estructura de carpetas: `src/components/`, `src/pages/`, `src/hooks/`, `src/lib/`, `src/types/`, `src/utils/`. 4. Crear `src/lib/supabase.ts` con el cliente de Supabase usando variables de entorno. 5. Crear `.env.example` con las claves necesarias. 6. Verificar que `npm run dev` levanta sin errores. |
| **Archivos / áreas** | `src/`, `package.json`, `.env.example`, `vite.config.ts` |
| **Criterios de aceptación** | Proyecto compila y levanta en localhost sin errores de TypeScript. Estructura de carpetas creada. Cliente Supabase exportado desde `src/lib/supabase.ts`. Variables de entorno documentadas en `.env.example`. |
| **Verificación** | `npm run build` termina sin errores. `npm run dev` muestra la página de bienvenida de Vite. |

---

### T-02: Proyecto Supabase

| Campo | Valor |
|---|---|
| **ID** | T-02 |
| **Objetivo** | Crear proyecto Supabase, obtener credenciales, configurar variables de entorno locales. |
| **Dependencias** | T-01 |
| **Pasos** | 1. Crear proyecto en Supabase (supabase.com). 2. Anotar `SUPABASE_URL` y `SUPABASE_ANON_KEY`. 3. Crear archivo `.env` local con esas variables. 4. Verificar que `src/lib/supabase.ts` levanta el cliente sin errores de conexión (probar con `supabase.auth.getSession()`). |
| **Archivos / áreas** | `.env`, `src/lib/supabase.ts` |
| **Criterios de aceptación** | Cliente Supabase inicializado correctamente. Conexión verificada. `.env` agregado a `.gitignore`. |
| **Verificación** | Ejecutar en consola del navegador: `await supabase.auth.getSession()` retorna `{ data: { session: null }, error: null }`. |

---

### T-03a: Esquema de tablas

| Campo | Valor |
|---|---|
| **ID** | T-03a |
| **Objetivo** | Crear las tablas `invoices`, `invoice_lines`, `payments` y `daily_income` en Supabase con tipos, restricciones y claves foráneas. Sin triggers ni funciones. |
| **Dependencias** | T-02 |
| **Pasos** | 1. Ejecutar SQL en Supabase SQL Editor para crear: tabla `invoices` (id uuid PK DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, supplier_name text NOT NULL, doc_ref text, issue_date date NOT NULL, due_date date, currency text NOT NULL, category text NOT NULL, total_amount numeric(12,2) NOT NULL DEFAULT 0, status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','partially_paid','paid')), content_hash text UNIQUE, notes text, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()). 2. Tabla `invoice_lines` (id uuid PK DEFAULT gen_random_uuid(), invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE, sku text, description text NOT NULL, quantity numeric(12,2) NOT NULL CHECK(quantity > 0), unit_cost numeric(12,2) NOT NULL CHECK(unit_cost > 0), line_total numeric(12,2) NOT NULL DEFAULT 0, created_at timestamptz DEFAULT now()). Nota: sin columna user_id. La pertenencia se valida a través de la factura padre. 3. Tabla `payments` (id uuid PK DEFAULT gen_random_uuid(), invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT, amount numeric(12,2) NOT NULL CHECK(amount > 0), payment_date date NOT NULL DEFAULT CURRENT_DATE, method text NOT NULL CHECK(method IN ('cash','transfer','card','other')), notes text, is_void boolean DEFAULT false, voided_at timestamptz, void_reason text, created_at timestamptz DEFAULT now()). Nota: sin columna user_id. **`ON DELETE RESTRICT`**: los pagos no se eliminan en cascada al borrar una factura — son inmutables y auditables. `voided_at` y `void_reason` se completan únicamente al anular un pago (is_void → true). 4. Tabla `daily_income` (id uuid PK DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, amount numeric(12,2) NOT NULL CHECK(amount > 0), sale_date date NOT NULL, source_note text, created_at timestamptz DEFAULT now()). 5. Crear índices: `invoices(user_id, issue_date)`, `invoices(content_hash)`, `payments(invoice_id)`, `invoice_lines(invoice_id)`, `daily_income(user_id, sale_date)`. |
| **Archivos / áreas** | SQL Editor de Supabase. Opcional: `sql/001-schema.sql`. |
| **Criterios de aceptación** | Las cuatro tablas existen con los tipos, restricciones CHECK y foreign keys definidos. `invoice_lines` y `payments` no tienen columna `user_id`. Los índices están creados. |
| **Verificación** | En SQL Editor: `\dt` lista las cuatro tablas. `\d invoices` muestra columnas y restricciones. Intentar insertar una línea con `quantity = -1` falla con error de CHECK. |

---

### T-03b: Funciones y triggers

| Campo | Valor |
|---|---|
| **ID** | T-03b |
| **Objetivo** | Crear funciones PL/pgSQL y triggers para recálculo automático de `total_amount`, `line_total`, `status`, `updated_at`, validación de sobrepago con control de concurrencia, restricción de UPDATE en pagos a solo anulación controlada con `voided_at` y `void_reason` obligatorios, y prevención de eliminación de facturas con pagos no anulados. |
| **Dependencias** | T-03a |
| **Pasos** | 1. Función `calc_line_total()`: trigger BEFORE INSERT OR UPDATE en `invoice_lines` que setea `line_total = quantity * unit_cost`. 2. Función `update_invoice_total()`: trigger AFTER INSERT OR UPDATE OR DELETE en `invoice_lines` que recalcula `invoices.total_amount = SUM(invoice_lines.line_total)` para el `invoice_id` afectado. 3. Función `protect_invoice_lines()`: trigger BEFORE INSERT OR UPDATE OR DELETE en `invoice_lines` que **bloquea la fila padre** (`SELECT total_amount FROM invoices WHERE id = invoice_id FOR UPDATE`), recalcula el nuevo `total_amount` que resultaría tras la operación, y **rechaza la mutación si el nuevo total es menor que la suma de pagos no anulados** existentes. Esto evita reducir líneas por debajo de lo ya pagado. Tras una mutación exitosa, recalcula `invoices.status`. 4. Función `update_invoice_status()`: se dispara tras insertar/anular pagos y también es invocada por `protect_invoice_lines()` tras mutaciones de líneas. Recalcula `invoices.status`: si `SUM(payments.amount WHERE is_void = false) >= invoices.total_amount` → `paid`, si `SUM(...) > 0` → `partially_paid`, si `SUM(...) = 0` → `pending`. 5. Función `prevent_overpayment()`: trigger BEFORE INSERT OR UPDATE en `payments` que, **para manejar concurrencia de forma segura**, primero bloquea la factura padre con `SELECT total_amount FROM invoices WHERE id = NEW.invoice_id FOR UPDATE`, luego calcula `SUM(payments.amount WHERE is_void = false AND invoice_id = NEW.invoice_id) + NEW.amount` excluyendo el pago actual si es UPDATE, y si supera `invoices.total_amount`, levanta excepción. 6. Función `restrict_payment_update()`: trigger BEFORE UPDATE en `payments` que rechaza cualquier modificación que no sea la transición controlada `is_void: false → true` **con `voided_at` y `void_reason` obligatorios**. Si `is_void` pasa a `true`, `voided_at` debe ser no-null (se setea a `now()`) y `void_reason` debe ser no-null y no-vacío. Cualquier intento de modificar `amount`, `invoice_id`, `payment_date`, `method` o `notes` después de la creación levanta excepción. Esto garantiza la inmutabilidad de los pagos excepto por anulación controlada con trazabilidad. 7. Función `update_invoice_updated_at()`: trigger BEFORE UPDATE en `invoices` que setea `updated_at = now()`. 8. Función `prevent_invoice_deletion()`: trigger BEFORE DELETE en `invoices` que verifica `EXISTS (SELECT 1 FROM payments WHERE invoice_id = OLD.id AND is_void = false)`. Si hay pagos no anulados, levanta excepción: "No se puede eliminar esta factura: tiene pagos registrados. Anule los pagos primero." Esto garantiza que los pagos no se eliminan en cascada y preserva la auditabilidad. |
| **Archivos / áreas** | SQL Editor de Supabase. Opcional: `sql/002-functions.sql`. |
| **Criterios de aceptación** | `line_total` se calcula automáticamente al insertar línea. `total_amount` se recalcula al insertar/actualizar/eliminar líneas. `status` se recalcula al insertar/anular pagos y al mutar líneas. Insertar un pago que cause sobrepago lanza error. `updated_at` se actualiza al modificar la factura. **Reducir cantidad o eliminar una línea de una factura con pagos registrados se rechaza a nivel de base de datos si el nuevo total es menor que lo ya pagado.** **Anular un pago sin `voided_at` o con `void_reason` vacío se rechaza.** **Eliminar una factura que tiene pagos no anulados se rechaza a nivel de base de datos.** |
| **Verificación** | 1. Insertar factura + 2 líneas (qty=2, cost=100 y qty=1, cost=50). Verificar `total_amount = 250`. 2. Insertar pago de 200. Verificar `status = partially_paid`. 3. Insertar pago de 50. Verificar `status = paid`. 4. Intentar insertar pago de 10. Debe fallar (sobrepago). 5. Anular pago de 50 con `voided_at` y `void_reason`. Verificar `status = partially_paid`. 6. Intentar modificar `amount` de un pago existente. Debe fallar (inmutable). 7. Intentar modificar `invoice_id` de un pago existente. Debe fallar. 8. Intentar anular un pago sin proveer `void_reason` (o vacío). Debe fallar. 9. **Integridad de líneas:** con factura de $250 y pago de $200 registrado, intentar reducir `quantity` de la línea de $100 de 2 a 1 (nuevo total = $150 < $200 pagado). Debe fallar. 10. **Integridad de líneas:** con la misma factura y pago, intentar eliminar la línea de $100. Debe fallar (nuevo total = $50 < $200 pagado). 11. **Integridad de líneas:** con factura de $250 sin pagos, modificar una línea de $100 a $80. El total se actualiza correctamente a $210. Verificar `status = pending`. 12. **Eliminación de factura con pagos:** con factura de $250 y pago de $200 no anulado, intentar `DELETE FROM invoices WHERE id = ...`. Debe fallar con mensaje de error. 13. **Eliminación de factura sin pagos:** con factura nueva sin pagos, ejecutar `DELETE FROM invoices`. Debe funcionar y eliminar líneas en cascada. |

---

### T-04: Row Level Security y políticas

| Campo | Valor |
|---|---|
| **ID** | T-04 |
| **Objetivo** | Activar RLS en las cuatro tablas y crear políticas que aíslen datos por `user_id`. Las tablas hijas validan pertenencia a través del padre. |
| **Dependencias** | T-03a, T-03b |
| **Pasos** | 1. Activar RLS en las cuatro tablas. 2. `invoices`: políticas SELECT, INSERT, UPDATE, DELETE directas por `user_id = auth.uid()`. 3. `invoice_lines`: políticas SELECT, INSERT, UPDATE, DELETE que validan `invoice_id IN (SELECT id FROM invoices WHERE user_id = auth.uid())`. Esto garantiza que un usuario solo opera sobre líneas de sus propias facturas. 4. `payments`: políticas SELECT, INSERT que validan a través de `invoice_id IN (SELECT id FROM invoices WHERE user_id = auth.uid())`. DELETE físico no permitido. **UPDATE solo permitido mediante RPC `security definer`** que encapsula la anulación (`is_void: false → true` + `voided_at` + `void_reason` obligatorios como parámetros); el permiso UPDATE directo sobre la tabla se revoca. Esto asegura que ningún usuario pueda modificar `amount`, `invoice_id`, u otros campos de un pago fuera del flujo controlado de anulación con trazabilidad. 5. `daily_income`: políticas SELECT, INSERT, UPDATE, DELETE directas por `user_id = auth.uid()`. |
| **Archivos / áreas** | SQL Editor de Supabase. Opcional: `sql/003-rls.sql`. |
| **Criterios de aceptación** | RLS activado. Usuario A no ve facturas, líneas, pagos ni ingresos del usuario B. Intentar insertar un pago en una factura de otro usuario falla (la validación de pertenencia para INSERT en payments depende de que el invoice_id referencie una factura propia). |
| **Verificación** | 1. Crear usuario A y usuario B. 2. Insertar factura como A con líneas. 3. Insertar pago como A. 4. Insertar daily_income como A. 5. Autenticarse como B: todas las consultas retornan 0 filas. 6. Como B, intentar insertar pago con `invoice_id` de factura de A. Debe fallar con error de política RLS. 7. Como B, intentar insertar línea en factura de A. Debe fallar. 8. Como A, intentar ejecutar `UPDATE payments SET amount = 999` sobre su propio pago. Debe fallar: no hay permiso UPDATE directo. 9. Como A, ejecutar la RPC de anulación sobre su propio pago con `voided_at` y `void_reason`. Debe funcionar y marcar `is_void = true` con ambos metadatos. 10. Como A, intentar ejecutar la RPC de anulación sin `void_reason` (vacío). Debe fallar. 11. Como A, intentar `DELETE FROM payments`. Debe fallar: no hay política DELETE. |

---

### T-05: Autenticación (login y registro)

| Campo | Valor |
|---|---|
| **ID** | T-05 |
| **Objetivo** | Implementar pantalla de login y registro con Supabase Auth, flujo de sesión y redirección. |
| **Dependencias** | T-02, T-04 |
| **Pasos** | 1. Crear `src/pages/Login.tsx` con formulario de email + contraseña y opción de registro. 2. Crear `src/hooks/useAuth.ts` que exponga `session`, `user`, `signIn`, `signUp`, `signOut`. 3. Crear `src/components/AuthGuard.tsx` que redirija a `/login` si no hay sesión. 4. Configurar rutas en `src/App.tsx`: `/login` pública, el resto protegidas por `AuthGuard`. 5. Agregar botón de cierre de sesión en el layout. |
| **Archivos / áreas** | `src/pages/Login.tsx`, `src/hooks/useAuth.ts`, `src/components/AuthGuard.tsx`, `src/App.tsx` |
| **Criterios de aceptación** | Usuario puede registrarse con email y contraseña. Usuario puede iniciar sesión. Usuario puede cerrar sesión. Rutas protegidas redirigen a `/login` si no hay sesión activa. Al refrescar la página, la sesión persiste. |
| **Verificación** | 1. Acceder a `/` sin sesión → redirige a `/login`. 2. Registrarse con email nuevo → redirige a `/`. 3. Cerrar sesión → redirige a `/login`. 4. Refrescar la página estando autenticado → sigue en `/`. 5. Verificar en Supabase Dashboard que el usuario aparece en `auth.users`. |

---

### T-06: Layout protegido y navegación

| Campo | Valor |
|---|---|
| **ID** | T-06 |
| **Objetivo** | Construir el shell de la aplicación: layout con navegación lateral, rutas y placeholders de páginas. |
| **Dependencias** | T-05 |
| **Pasos** | 1. Crear `src/components/Layout.tsx` con sidebar y área de contenido. Sidebar con enlaces: Dashboard, Facturas, Ingresos diarios, Importar, Exportar. 2. Crear `src/pages/Dashboard.tsx` (placeholder). 3. Crear `src/pages/Invoices.tsx` (placeholder). 4. Crear `src/pages/InvoiceDetail.tsx` (placeholder con parámetro `:id`). 5. Crear `src/pages/Import.tsx` (placeholder). 6. Crear `src/pages/Export.tsx` (placeholder). 7. Configurar `react-router-dom` con rutas anidadas bajo `Layout`. 8. Agregar nombre del usuario autenticado y botón de logout en el header. |
| **Archivos / áreas** | `src/components/Layout.tsx`, `src/pages/*.tsx`, `src/App.tsx` |
| **Criterios de aceptación** | Navegación lateral funcional con 5 items. Cada ruta carga su página placeholder. Layout muestra email del usuario autenticado. Botón de logout visible y funcional. |
| **Verificación** | Navegar entre todas las rutas. Verificar que la URL cambia sin recarga completa. Verificar que el layout se mantiene al cambiar de página. |

---

### T-07a: Tipos y formulario de factura

| Campo | Valor |
|---|---|
| **ID** | T-07a |
| **Objetivo** | Definir tipos TypeScript e implementar el formulario de creación de factura de compra con líneas detalladas (SKU, cantidad, costo unitario). |
| **Dependencias** | T-06, T-03a |
| **Pasos** | 1. Definir tipos en `src/types/invoice.ts`: `Invoice`, `InvoiceLine`, `InvoiceWithLines`. `InvoiceLine` incluye `sku?: string`, `description`, `quantity`, `unit_cost`, `line_total`. `Invoice` incluye `supplier_name`, `doc_ref?`, `issue_date`, `due_date?`, `currency`, `category`. 2. Crear `src/components/InvoiceForm.tsx`: formulario con proveedor, referencia de documento (opcional), fecha de emisión, fecha de vencimiento (opcional), moneda (valor fijo de configuración), categoría de gasto, notas. Lista dinámica de líneas: SKU (opcional), descripción, cantidad, costo unitario, total de línea (calculado en frontend como `quantity × unit_cost`). Submit inserta `invoice` y luego `invoice_lines` en secuencia. 3. `line_total` se muestra calculado en tiempo real mientras el usuario completa cantidad y costo unitario. |
| **Archivos / áreas** | `src/types/invoice.ts`, `src/components/InvoiceForm.tsx` |
| **Criterios de aceptación** | Formulario renderiza todos los campos nuevos. Líneas dinámicas: agregar y quitar líneas funciona. `line_total` se calcula en frontend como `quantity × unit_cost` y se muestra en tiempo real. Submit crea factura con N líneas en la base de datos. |
| **Verificación** | 1. Crear factura con proveedor "Distribuidora X", 2 líneas (qty=2, cost=100 y qty=3, cost=50). 2. Verificar en BD: factura creada con `total_amount = 350` (calculado por trigger). 3. Verificar que `line_total` en cada línea es correcto (`2*100=200`, `3*50=150`). |

---

### T-07b: Listado, detalle y eliminación de facturas

| Campo | Valor |
|---|---|
| **ID** | T-07b |
| **Objetivo** | Implementar listado de facturas con filtros, vista de detalle y eliminación con confirmación. |
| **Dependencias** | T-07a |
| **Pasos** | 1. Crear `src/pages/Invoices.tsx` con tabla de facturas: fecha emisión, proveedor, categoría, total, estado (badge de color), acciones (ver, eliminar). Orden por fecha de emisión descendente. Filtro por estado. 2. Crear `src/pages/InvoiceDetail.tsx` que muestre: datos de la factura (proveedor, fechas, moneda, categoría, notas), tabla de líneas (SKU, descripción, cantidad, costo unitario, total línea), tabla de pagos (vacía por ahora, preparada para T-08). 3. Implementar eliminación de factura con confirmación modal. **Solo líneas en cascada** (`ON DELETE CASCADE` en `invoice_lines`). **Los pagos no se eliminan** (`ON DELETE RESTRICT` en `payments`): si la factura tiene pagos no anulados, el trigger `prevent_invoice_deletion()` de T-03b rechaza la operación. La UI debe capturar el error de la BD y mostrar: "No se puede eliminar esta factura: tiene pagos registrados. Anule los pagos primero." |
| **Archivos / áreas** | `src/pages/Invoices.tsx`, `src/pages/InvoiceDetail.tsx` |
| **Criterios de aceptación** | Listado muestra todas las facturas del usuario autenticado con los campos correctos. Detalle muestra datos completos de factura, líneas y totales. Eliminar factura sin pagos no anulados elimina líneas en cascada. Eliminar factura con pagos no anulados se rechaza con mensaje de error claro. |
| **Verificación** | 1. Listado muestra factura creada en T-07a con proveedor, categoría y estado `pending`. 2. Abrir detalle: líneas visibles con SKU, cantidad, costo unitario, total. 3. Eliminar factura sin pagos. 4. Verificar que no aparece en listado. 5. Verificar en BD que líneas también desaparecieron por CASCADE. 6. **Eliminación con pagos:** con una factura que tiene un pago no anulado, intentar eliminar desde la UI. Debe mostrarse mensaje de error claro. 7. **Integridad de líneas (UI):** con una factura que tiene pagos registrados, intentar reducir la cantidad de una línea. La UI debe impedir la operación o la BD debe rechazarla. Verificar que el mensaje de error es claro ("No se puede reducir la línea: hay pagos registrados que superarían el nuevo total"). |

> 🎯 **Hito de demo parcial**: al terminar T-07b, un usuario puede autenticarse, crear facturas de compra con líneas detalladas, listarlas y ver detalle.

---

### T-08: Registro de pagos con rechazo de sobrepago

| Campo | Valor |
|---|---|
| **ID** | T-08 |
| **Objetivo** | Permitir registrar pagos de egreso sobre una factura. El estado se recalcula automáticamente. El sobrepago se rechaza a nivel de base de datos y aplicación. |
| **Dependencias** | T-07b, T-03b |
| **Pasos** | 1. Definir tipo `Payment` en `src/types/payment.ts`. 2. Crear `src/components/PaymentForm.tsx`: formulario con importe, fecha, método de pago (select: efectivo, transferencia, tarjeta, otro), notas. Se renderiza dentro de `InvoiceDetail`. 3. Validación en frontend: si `suma de pagos no anulados + nuevo monto > invoice.total_amount`, mostrar error y no permitir submit. 4. Validación en backend: el trigger `prevent_overpayment()` de T-03b rechaza la inserción. 5. Mostrar pagos existentes y saldo pendiente en `InvoiceDetail`. 6. Badge de estado en `InvoiceDetail`: pending (gris), partially_paid (naranja), paid (verde). 7. Implementar anulación de pago vía RPC `security definer`: requiere `voided_at` (se setea a `now()`) y `void_reason` (texto obligatorio no vacío). La UI debe mostrar un campo de motivo de anulación antes de confirmar. |
| **Archivos / áreas** | `src/types/payment.ts`, `src/components/PaymentForm.tsx`, `src/pages/InvoiceDetail.tsx` |
| **Criterios de aceptación** | Se puede registrar un pago asociado a una factura. Saldo pendiente se muestra correctamente. Estado cambia al registrar/anular pagos. Intentar pagar más que el saldo pendiente muestra error en frontend y es rechazado por la BD. Anular pago revierte el estado correctamente y registra `voided_at` + `void_reason`. **Los pagos son inmutables después de creados**: no se puede modificar `amount`, `invoice_id` ni ningún campo excepto `is_void`, `voided_at` y `void_reason` vía RPC de anulación. La anulación se realiza mediante RPC dedicada, no con UPDATE directo. Anular sin `void_reason` se rechaza. |
| **Verificación** | 1. Crear factura de $1000. 2. Registrar pago de $400. Verificar `partially_paid`, saldo $600. 3. Registrar pago de $600. Verificar `paid`. 4. Intentar registrar pago de $100 (sobrepago). Debe fallar con mensaje de error. 5. Anular pago de $600 vía RPC de anulación con `void_reason = "Error en monto"`. Verificar `partially_paid`, saldo $600, `is_void = true`, `voided_at` no nulo, `void_reason = "Error en monto"`. 6. Intentar anular un pago sin proveer `void_reason` (vacío). Debe fallar. 7. Intentar modificar el monto de un pago existente desde el frontend. La UI no debe ofrecer esa opción; la BD debe rechazar cualquier UPDATE directo. |

> 🎯 **Hito de demo principal**: la app es funcional de punta a punta. Autenticación, facturas de compra con líneas, pagos de egreso y control de sobrepago.

---

## Día 2 — Ingresos diarios, dashboard, importación, exportación, tests y deploy

(Las tareas marcadas STRETCH quedan post-MVP.)

---

### T-08b: CRUD de ingresos diarios

| Campo | Valor |
|---|---|
| **ID** | T-08b |
| **Objetivo** | Implementar registro de ingresos diarios agregados (ventas del día). Entidad independiente de facturas y pagos. |
| **Dependencias** | T-06 |
| **Pasos** | 1. Definir tipo `DailyIncome` en `src/types/dailyIncome.ts`. 2. Crear `src/components/DailyIncomeForm.tsx`: formulario con monto, fecha de venta, fuente o nota. 3. Crear `src/pages/DailyIncome.tsx`: tabla con registros del mes actual, ordenados por fecha descendente. Botón para nuevo registro (modal o inline). Posibilidad de eliminar. 4. Agregar ruta `/ingresos` en el router y enlace en sidebar. |
| **Archivos / áreas** | `src/types/dailyIncome.ts`, `src/components/DailyIncomeForm.tsx`, `src/pages/DailyIncome.tsx`, `src/App.tsx` |
| **Criterios de aceptación** | Usuario puede registrar ingresos diarios con monto, fecha y nota. Listado muestra registros del mes. No hay dependencia con facturas ni pagos: los ingresos diarios existen por sí mismos. |
| **Verificación** | 1. Registrar ingreso de $5000 con fecha hoy, nota "Ventas del día". 2. Registrar ingreso de $3000 con fecha ayer. 3. Verificar que ambos aparecen en el listado. 4. Eliminar uno y verificar que desaparece. |

---

### T-09: Dashboard de caja operativa

| Campo | Valor |
|---|---|
| **ID** | T-09 |
| **Objetivo** | Implementar el dashboard con indicadores financieros reales: ingresos, gastos pagados, deuda pendiente, resultado de caja estimado, y días desde último registro. |
| **Dependencias** | T-08, T-08b |
| **Pasos** | 1. Crear `src/hooks/useDashboardMetrics.ts` que calcule usando queries del lado del cliente (`.gte()`, `.lte()`) sin RPC: (a) ingresos del período = `SUM(daily_income.amount)` para día/semana/mes filtrando por `sale_date`. (b) gastos pagados del período = `SUM(payments.amount)` con `is_void = false` filtrando por `payment_date`. (c) deuda pendiente = `SUM(invoices.total_amount)` para facturas con `status IN ('pending','partially_paid')` menos `SUM(payments.amount)` de esas facturas. (d) resultado de caja = ingresos − gastos pagados. (e) días desde último registro = `CURRENT_DATE - MAX(invoices.issue_date)`. (f) desglose de gastos por categoría = `SUM(payments.amount)` agrupado por `invoices.category` para el mes actual, excluyendo pagos anulados. 2. Crear tarjetas de métricas (`MetricCard.tsx`): Ingresos, Gastos pagados, Deuda pendiente, Resultado de caja estimado. 3. Sección de desglose por categorías de gasto como tabla o lista simple (sin gráfico — el gráfico queda en T-10 stretch). 4. El resultado de caja incluye nota aclaratoria visible: "Estimado — no es ganancia neta". 5. Mostrar alerta si días desde último registro > 7. 6. Tabla de últimas 10 facturas con proveedor, categoría, total y estado. |
| **Archivos / áreas** | `src/hooks/useDashboardMetrics.ts`, `src/components/MetricCard.tsx`, `src/pages/Dashboard.tsx` |
| **Criterios de aceptación** | Las cuatro métricas se calculan correctamente. Los filtros de período (día/semana/mes) aplican sobre las fechas correctas (`sale_date` para ingresos, `payment_date` para gastos, `issue_date` para facturas). Resultado de caja muestra nota aclaratoria. Alerta de inactividad aparece si > 7 días sin facturas. |
| **Verificación** | 1. Registrar daily_income de $5000 hoy. 2. Crear factura de $800 (cat. "alimento") y pagarla completa. 3. Crear factura de $400 (cat. "limpieza") sin pagos. 4. Dashboard: Ingresos = $5000, Gastos pagados = $800, Deuda = $400, Resultado = $4200. 5. Verificar nota "no es ganancia neta" visible. 6. Desglose por categoría: alimento $800, limpieza $0 (pendiente). 7. Cambiar fecha de última factura a 8 días atrás → alerta visible. |

---

### T-10 (STRETCH): Gráfico de categorías de gasto

| Campo | Valor |
|---|---|
| **ID** | T-10 |
| **Objetivo** | Agregar un gráfico al dashboard que muestre el desglose de gastos pagados por categoría en el mes actual. **Stretch post-MVP: no bloquea el despliegue ni la completitud del MVP.** El desglose numérico por categoría ya está cubierto en T-09. |
| **Dependencias** | T-09 |
| **Pasos** | 1. Crear `src/hooks/useExpenseCategories.ts` que agrupe `SUM(payments.amount)` por `invoices.category` (JOIN payments → invoices) para el mes actual, excluyendo pagos anulados. Usar queries del lado del cliente. 2. Usar `recharts` (`PieChart` o `BarChart`) para visualizar la distribución. 3. Crear `src/components/CategoryChart.tsx`. 4. Integrar en `Dashboard.tsx` debajo de las tarjetas de métricas. |
| **Archivos / áreas** | `src/hooks/useExpenseCategories.ts`, `src/components/CategoryChart.tsx`, `src/pages/Dashboard.tsx` |
| **Criterios de aceptación** | Gráfico visible en dashboard. Muestra distribución de gastos por categoría para el mes actual. Tooltip al hover muestra categoría y monto. Responsive. |
| **Verificación** | 1. Crear facturas con categorías "alimento" ($200), "limpieza" ($150), "veterinario" ($300). 2. Pagarlas todas. 3. Verificar gráfico: tres categorías con los montos correctos. 4. Agregar otra factura "alimento" ($100) pagada → categoría "alimento" ahora suma $300. |

---

### T-11a: Parseo y preview de CSV

| Campo | Valor |
|---|---|
| **ID** | T-11a |
| **Objetivo** | Parsear archivo CSV de facturas con líneas, mostrar vista previa y validar columnas, tipos y reglas de negocio. |
| **Dependencias** | T-07b |
| **Pasos** | 1. Crear `src/utils/csvImport.ts`: función que usa `papaparse` para parsear el archivo. Validar columnas requeridas según el contrato de importación definido en propuesta-mvp.md: `invoice_external_id`, `supplier_name`, `issue_date`, `currency`, `category`, `description`, `quantity`, `unit_cost`. Columnas opcionales: `due_date`, `sku`, `notes`. 2. Validaciones por fila: `issue_date` y `due_date` en formato ISO YYYY-MM-DD y fechas válidas, `quantity > 0`, `unit_cost > 0`, `currency` coincide con la moneda configurada del negocio. 3. Agrupar filas por `invoice_external_id`. **Si alguna fila del grupo es inválida o los campos a nivel factura (`supplier_name`, `issue_date`, `due_date`, `currency`, `category`) no coinciden entre filas del mismo grupo, se rechaza el grupo completo** y se reportan todos sus errores. 4. Crear `src/components/CsvPreview.tsx`: muestra tabla con primeras 5 filas parseadas, columnas detectadas, badges de validación (✓ OK, ✗ error con mensaje), y agrupación por `invoice_external_id` con conteo de grupos válidos y rechazados. |
| **Archivos / áreas** | `src/utils/csvImport.ts`, `src/components/CsvPreview.tsx` |
| **Criterios de aceptación** | CSV se parsea correctamente. Vista previa muestra datos agrupados por `invoice_external_id`. Validación detecta columnas faltantes, fechas inválidas, cantidades/costos negativos o cero, moneda incorrecta. |
| **Verificación** | 1. Preparar CSV válido con 2 facturas (3 líneas cada una, mismo `invoice_external_id` por factura). 2. Verificar preview: 2 grupos válidos, 3 líneas cada uno. 3. Preparar CSV con `unit_cost = -10` en una línea de un grupo de 3 líneas: verificar que **todo el grupo** se marca como rechazado con el error de la fila inválida. 4. Preparar CSV sin columna `invoice_external_id`: verificar que se rechaza el archivo completo con mensaje claro. 5. Preparar CSV con `supplier_name` inconsistente entre filas del mismo `invoice_external_id`: verificar que el grupo completo se rechaza con mensaje de inconsistencia de grupo. |

---

### T-11b: Deduplicación e inserción de CSV con hash canónico de factura

| Campo | Valor |
|---|---|
| **ID** | T-11b |
| **Objetivo** | Insertar facturas y líneas desde CSV con detección de duplicados por hash canónico de grupo (factura completa), **usando una única RPC atómica por grupo**. Resumen final de importación. El cliente solo previsualiza; la escritura es atómica en el servidor. |
| **Dependencias** | T-11a, T-03b |
| **Pasos** | 1. Crear RPC `import_invoice_group` en Supabase (`security definer`): recibe los datos de una factura completa (cabecera + array de líneas) como JSON. **En una única transacción atómica**: (a) valida que el grupo es consistente (supplier, issue_date, currency, category, due_date coinciden), (b) calcula el hash canónico del grupo, (c) adquiere guarda de deduplicación: verifica `content_hash` en `invoices` con `FOR UPDATE` para serializar intentos concurrentes sobre el mismo grupo, (d) si el hash ya existe → retorna `{ status: "duplicate" }` sin insertar, (e) si no existe → inserta la factura con `content_hash` e inserta todas las líneas, o hace ROLLBACK completo si alguna inserción falla. Retorna `{ status: "imported", invoice_id }` o `{ status: "error", message }`. 2. Actualizar `src/utils/csvCanonical.ts` (de T-11a) para que el cliente genere el payload canónico que se envía a la RPC. La canonicalización (normalización, orden, serialización, hash) puede ejecutarse del lado del cliente para el preview, pero la RPC recalcula y verifica el hash del lado del servidor antes de insertar. 3. Crear `src/lib/importRpc.ts`: función que invoca `rpc('import_invoice_group', { payload })` desde el frontend. El cliente **no hace escrituras secuenciales** — llama a la RPC una vez por grupo válido. 4. Crear `src/components/CsvImportFlow.tsx`: orquesta arrastrar/seleccionar → preview (T-11a) → confirmación → para cada grupo válido: llama a `import_invoice_group` → resumen (X facturas importadas, Y omitidas por duplicado, Z filas rechazadas). 5. Reemplazar placeholder de `src/pages/Import.tsx`. |
| **Archivos / áreas** | `src/utils/csvCanonical.ts`, `src/lib/importRpc.ts`, `src/components/CsvImportFlow.tsx`, `src/pages/Import.tsx`, SQL: RPC `import_invoice_group` |
| **Criterios de aceptación** | Facturas se insertan con líneas en una única transacción atómica: o todo el grupo se inserta, o nada. Hash canónico de grupo previene re-importación del mismo archivo o del mismo grupo lógico con variaciones de whitespace/mayúsculas. Resumen informa importadas, duplicadas y rechazadas con detalle. Grupos con inconsistencias en supplier/issue/currency/category se rechazan completos. **El cliente nunca hace escrituras secuenciales sobre `invoices` + `invoice_lines`**; toda inserción de grupo pasa por la RPC atómica. |
| **Verificación** | 1. CSV con 3 facturas (2 líneas cada una). Importar: 3 importadas, 0 duplicadas. 2. Re-importar mismo CSV: 0 importadas, 3 duplicadas. 3. Modificar solo mayúsculas de un supplier: re-importar → debe detectarse como duplicado (normalización). 4. CSV con 2 facturas: una completamente válida, otra con una fila con `unit_cost = -10` dentro del grupo. Resultado: 1 importada (la válida), 1 rechazada (el grupo entero con la fila inválida). 5. CSV con 2 facturas: una válida, otra con `supplier_name` inconsistente entre sus líneas. Resultado: 1 importada, 1 rechazada (grupo inconsistente completo). 6. CSV con `invoice_external_id` repetido en dos archivos distintos con mismo contenido canónico → segundo archivo detecta duplicado. 7. **Atomicidad**: verificar en BD que no existen inserciones parciales (factura sin líneas o líneas sin factura) tras una importación. |

---

### T-12: Exportación XLSX con ExcelJS

| Campo | Valor |
|---|---|
| **ID** | T-12 |
| **Objetivo** | Permitir al usuario exportar facturas y sus líneas a un archivo Excel (.xlsx) con filtros opcionales, usando ExcelJS. |
| **Dependencias** | T-07b |
| **Pasos** | 1. Crear `src/utils/xlsxExport.ts`: función que recibe datos de facturas con líneas, crea un workbook con ExcelJS con dos hojas: "Facturas" (proveedor, doc_ref, fecha emisión, vencimiento, categoría, total, estado) y "Líneas" (factura#, SKU, descripción, cantidad, costo unitario, total línea). Aplicar formato: anchos de columna, formato de moneda, encabezados en negrita. 2. Crear `src/components/ExportForm.tsx` con filtros: rango de fechas (date picker desde/hasta sobre `issue_date`), estado (select múltiple), categoría (select). Usar filtros del lado del cliente (`.gte()`, `.lte()`, `.in()`). 3. Reemplazar placeholder de `src/pages/Export.tsx` con `ExportForm` + botones de descarga XLSX y CSV. |
| **Archivos / áreas** | `src/utils/xlsxExport.ts`, `src/components/ExportForm.tsx`, `src/pages/Export.tsx` |
| **Criterios de aceptación** | Usuario aplica filtros y descarga .xlsx con dos hojas. Celdas de importe con formato moneda. Encabezados en negrita. Columnas reflejan el modelo de dominio (proveedor, no cliente). |
| **Verificación** | 1. Crear 3 facturas con distintos estados, proveedores y fechas. 2. Exportar sin filtros: XLSX contiene 3 facturas y todas sus líneas. 3. Exportar con filtro `status = paid`: solo facturas pagadas. 4. Exportar con rango de fechas: solo facturas en el rango. |

---

### T-13: Exportación CSV

| Campo | Valor |
|---|---|
| **ID** | T-13 |
| **Objetivo** | Permitir al usuario exportar facturas a CSV con encoding UTF-8 BOM para compatibilidad con Excel. |
| **Dependencias** | T-07b, T-12 |
| **Pasos** | 1. Crear `src/utils/csvExport.ts`: toma los mismos datos filtrados que T-12, genera CSV con `papaparse.unparse()`, agrega BOM (`\uFEFF`), crea Blob y descarga con `file-saver`. 2. Botón "Exportar CSV" en `ExportForm.tsx` junto al de XLSX. |
| **Archivos / áreas** | `src/utils/csvExport.ts`, `src/components/ExportForm.tsx` |
| **Criterios de aceptación** | Descarga CSV con BOM. Se abre correctamente en Excel con caracteres especiales preservados. Mismas columnas que hoja "Facturas" del XLSX de T-12. |
| **Verificación** | 1. Exportar CSV con datos que incluyan tildes. 2. Abrir en Excel: caracteres correctos. 3. Verificar que columnas coinciden con exportación XLSX. |

---

### T-14 (STRETCH): Indicador de respaldo descargable

| Campo | Valor |
|---|---|
| **ID** | T-14 |
| **Objetivo** | Mostrar fecha de último respaldo descargable y permitir generar uno nuevo. **No bloquea el despliegue.** La exportación NO constituye restauración probada. |
| **Dependencias** | T-09 |
| **Pasos** | 1. Tabla `backups` (id uuid PK, user_id uuid FK, created_at timestamptz). Activar RLS. 2. `src/hooks/useBackupStatus.ts`: consulta fecha del último backup. 3. `src/components/BackupIndicator.tsx`: badge en dashboard. Verde si ≤ 7 días, naranja si > 7 días. 4. `src/utils/backupCreate.ts`: descarga JSON con facturas + líneas + pagos + daily_income del usuario. Registra en `backups`. |
| **Archivos / áreas** | `src/hooks/useBackupStatus.ts`, `src/components/BackupIndicator.tsx`, `src/utils/backupCreate.ts`, `src/pages/Dashboard.tsx` |
| **Criterios de aceptación** | Indicador muestra fecha. Botón descarga JSON con todos los datos. Indicador se actualiza. |
| **Verificación** | Sin respaldos → advertencia. Crear respaldo → JSON descargado con facturas, líneas, pagos e ingresos. Indicador muestra fecha actual. |

---

### T-15: Deploy a Netlify

| Campo | Valor |
|---|---|
| **ID** | T-15 |
| **Objetivo** | Desplegar la aplicación en Netlify con deploy continuo desde Git, variables de entorno y configuración de Supabase Auth para producción. |
| **Dependencias** | T-08, T-08b, T-09, T-11a, T-11b, T-12, T-13, T-17, T-18, T-19. **Gates de despliegue obligatorios**: (1) `npm run test:run` sin fallos con `forbidOnly: true` (T-17), (2) checklist RLS ejecutada y verificada en entorno productivo (T-18), (3) gate de invariantes de BD superado (T-19), (4) dashboard con métricas reales operativo (T-09), (5) importación CSV funcional con RPC atómica (T-11a, T-11b), (6) exportación XLSX y CSV funcionales (T-12, T-13). **Sin los seis gates, no se acepta el despliegue.** T-10 y T-14 NO son dependencias (stretch). |
| **Pasos** | 1. Conectar repositorio a Netlify. 2. Build command: `npm run build`. Publish directory: `dist`. 3. Variables de entorno en Netlify: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. 4. `netlify.toml` con redirects SPA: `[[redirects]] from = "/*" to = "/index.html" status = 200`. 5. **Gate pre-deploy**: ejecutar `npm run test:run` (debe pasar con 0 fallos, `forbidOnly: true` activo). 6. Verificar checklist RLS (T-18) ejecutada en entorno de producción. 7. Verificar gate de invariantes de BD (T-19) ejecutado y superado. 8. Verificar importación CSV funcional (T-11b). 9. Verificar exportación XLSX y CSV funcionales (T-12, T-13). 10. Desplegar. 11. En Supabase Dashboard → Authentication → URL Configuration: agregar Site URL (URL de Netlify) y Redirect URLs (misma URL + `/login`). Esto es necesario para que los redirects de Supabase Auth funcionen en producción. 12. Verificar login, CRUD, dashboard con métricas reales, importación y exportación. |
| **Archivos / áreas** | `netlify.toml`, Netlify UI, Supabase Auth URL Configuration |
| **Criterios de aceptación** | App accesible desde URL pública. Login funcional. CRUD opera contra Supabase producción. RLS aísla usuarios. Importación CSV funcional con RPC atómica. Exportación XLSX y CSV funcionales con filtros. |
| **Verificación** | 1. Abrir URL en incógnito. 2. Registrar usuario A. 3. Crear factura + líneas + pago + daily_income. 4. Dashboard muestra métricas correctas. 5. Incógnito nuevo: registrar usuario B. 6. Usuario B no ve datos de A. 7. Probar importación CSV con archivo de prueba: facturas importadas correctamente. 8. Probar exportación XLSX y CSV: archivos descargados con datos correctos. |

---

### T-16 (STRETCH): Documentación de uso

| Campo | Valor |
|---|---|
| **ID** | T-16 |
| **Objetivo** | Escribir documentación mínima de uso para el usuario final. |
| **Dependencias** | T-09 |
| **Pasos** | 1. Crear `docs/uso-mvp.md` en español neutro profesional. 2. Quick path (3 pasos para empezar). Detalles por funcionalidad: facturas de compra, líneas, pagos de egreso, ingresos diarios, dashboard, importación, exportación. 3. FAQ: errores comunes de importación, diferencia entre resultado de caja y ganancia neta, cómo corregir un pago erróneo (anular + nuevo), formato requerido del CSV. |
| **Archivos / áreas** | `docs/uso-mvp.md` |
| **Criterios de aceptación** | Documento cubre todas las funcionalidades del MVP. Lenguaje claro para usuario no técnico. Explica la diferencia entre resultado de caja estimado y ganancia neta. |
| **Verificación** | Leer documento completo. Cada funcionalidad tiene instrucciones. FAQ cubre errores de importación, diferencia caja vs. ganancia, formato CSV, y corrección de pagos. |

---

### T-17: Tests unitarios de cálculos financieros y canonicalización de importación

| Campo | Valor |
|---|---|
| **ID** | T-17 |
| **Objetivo** | Escribir tests unitarios para funciones puras de cálculo financiero, invariantes de línea-pago, flujo de anulación de pagos con metadatos, y canonicalización de importación usando Vitest. **Esta tarea es parte del gate de despliegue: T-15 no se acepta sin que T-17, T-18 y T-19 pasen.** |
| **Dependencias** | T-08, T-11b |
| **Pasos** | 1. Configurar Vitest con `forbidOnly: true` en `vitest.config.ts`. Agregar script `"test:run": "vitest run"` en `package.json`. 2. Extraer lógica de cálculo a funciones puras en `src/utils/financial.ts`: `calcLineTotal(quantity, unitCost) → number`, `calcInvoiceTotal(lines) → number`, `calcInvoiceStatus(total, paidAmount) → 'pending'|'partially_paid'|'paid'`, `canAddPayment(existingPayments, newAmount, invoiceTotal) → boolean`, `canMutateLine(newInvoiceTotal, totalNonVoidPayments) → boolean`, `canDeleteInvoice(nonVoidPaymentCount) → boolean`, `validateVoidParams(voidReason) → boolean`. 3. Crear `src/utils/__tests__/financial.test.ts` con casos: (a) `lineTotal`: cantidad 0 lanza error, costo negativo lanza error, 2 × 100 = 200, decimales (1.5 × 3.33). (b) `invoiceTotal`: array vacío = 0, dos líneas suman correctamente. (c) `status`: 0 pagado = pending, pago parcial = partially_paid, pago total = paid, pagos anulados no afectan estado. (d) `canAddPayment`: permite pago exacto, permite pago parcial, rechaza sobrepago, rechaza monto negativo. (e) `canMutateLine`: rechaza si nuevo total < pagos no anulados, permite si nuevo total ≥ pagos no anulados, rechaza si total quedaría en 0 con pagos existentes. (f) `canDeleteInvoice`: permite si 0 pagos no anulados, rechaza si > 0 pagos no anulados. (g) `validateVoidParams`: rechaza voidReason vacío, rechaza voidReason solo espacios, acepta texto válido. 4. Extraer lógica de canonicalización de `csvCanonical.ts` a funciones puras testeables: `normalizeString(s) → string`, `normalizeNumeric(n) → string`, `canonicalLineSort(lines) → lines[]`, `buildCanonicalPayload(group) → string`, `validateGroupConsistency(rows) → { valid: boolean, errors: string[] }`. 5. Crear `src/utils/__tests__/csvCanonical.test.ts`: (a) normalización de strings: trim + case, (b) normalización numérica: dos decimales fijos, (c) orden canónico de líneas, (d) serialización produce mismo hash para datos equivalentes con distinta capitalización/espaciado, (e) grupos con supplier inconsistente se rechazan, (f) grupos sin `invoice_external_id` se rechazan, (g) una fila inválida dentro de un grupo válido → grupo completo rechazado. 6. Ejecutar `npm run test:run` y verificar 0 fallos. |
| **Archivos / áreas** | `src/utils/financial.ts`, `src/utils/__tests__/financial.test.ts`, `src/utils/csvCanonical.ts`, `src/utils/__tests__/csvCanonical.test.ts`, `vitest.config.ts`, `package.json` |
| **Criterios de aceptación** | Al menos 30 tests entre ambos archivos. Todos pasan con `npm run test:run`. Cubren casos edge: cero, negativo, decimales, sobrepago, normalización de strings, orden canónico, consistencia de grupo, invariante línea-pago, validación de void_reason, rechazo de eliminación con pagos no anulados. **CI automatizado es post-MVP; cada despliegue requiere ejecución manual de `npm run test:run` sin fallos.** |
| **Verificación** | `npm run test:run` termina con 0 fallos. Modificar una función de cálculo: al menos un test falla. Modificar la normalización de strings: el test de canonicalización falla. |

---

### T-18: Checklist de verificación manual de RLS (gate de despliegue)

| Campo | Valor |
|---|---|
| **ID** | T-18 |
| **Objetivo** | Documentar una checklist de verificación manual de RLS que un humano pueda ejecutar en 15 minutos. **Esta tarea es parte del gate mínimo de despliegue: T-15 no puede aceptarse sin que T-17, T-18 y T-19 pasen.** La checklist debe ejecutarse en un entorno lo más parecido a producción (proyecto Supabase de producción o staging con RLS activado). |
| **Dependencias** | T-04, T-08 |
| **Pasos** | 1. Crear `docs/rls-verification.md`. 2. Checklist paso a paso: (1) crear usuario A, (2) crear usuario B, (3) como A: insertar factura + líneas, (4) como A: insertar pago, (5) como A: insertar daily_income, (6) como B: verificar que SELECT en invoices/lines/payments/daily_income retorna 0 filas, (7) como B: intentar INSERT en invoice_lines con invoice_id de factura de A → debe fallar, (8) como B: intentar INSERT en payments con invoice_id de factura de A → debe fallar, (9) como B: intentar UPDATE en invoice de A → debe fallar, (10) como A: intentar UPDATE directo en payments.amount → debe fallar (sin permiso UPDATE directo), (11) como A: ejecutar RPC de anulación de pago → debe funcionar, (12) como B: verificar que sus propias inserciones son visibles solo para B. 3. Incluir queries SQL exactas para cada paso (copiar y pegar en SQL Editor). |
| **Archivos / áreas** | `docs/rls-verification.md` |
| **Criterios de aceptación** | Documento con 12 pasos. Cada paso incluye query SQL exacta. Un humano sin conocimiento previo de RLS puede ejecutarlo. La checklist fue ejecutada exitosamente en el entorno de despliegue antes de aceptar T-15. |
| **Verificación** | Entregar el documento a otra persona. Confirmar que completa los 12 pasos sin ayuda. |

---

### T-19: Gate de verificación de invariantes de base de datos (gate de despliegue)

| Campo | Valor |
|---|---|
| **ID** | T-19 |
| **Objetivo** | Crear y ejecutar un script SQL de verificación versionado que asevere todas las invariantes de base de datos antes del despliegue. **Gate obligatorio de pre-deploy: T-15 no se acepta sin que T-19 se haya ejecutado y superado.** No es CI automatizado; se ejecuta manualmente en el proyecto Supabase de producción o staging antes de cada despliegue. |
| **Dependencias** | T-03b, T-04, T-08 |
| **Pasos** | 1. Crear `sql/003-verify-db-invariants.sql` con transacciones de verificación. Cada verificación usa `DO $$ ... RAISE EXCEPTION ... END $$` para fallar ruidosamente si la invariante no se cumple. 2. Verificaciones requeridas: (a) **Sobrepago rechazado**: insertar factura de $100, insertar pago de $60, intentar insertar pago de $50 → debe fallar con excepción. (b) **Mutación de línea con pagos no anulados**: insertar factura de $200 (2 líneas de $100), insertar pago de $150, intentar reducir una línea a $30 → debe fallar (nuevo total $130 < $150). (c) **Eliminación de línea con pagos no anulados**: con la misma factura, intentar eliminar una línea → debe fallar. (d) **UPDATE inválido de pago**: intentar modificar `amount` de un pago existente → debe fallar. (e) **Flujo de anulación**: anular pago con `voided_at` y `void_reason` → debe funcionar y verificar metadatos. Intentar anular sin `void_reason` → debe fallar. (f) **Eliminación de factura con pagos**: intentar eliminar factura con pago no anulado → debe fallar. (g) **Eliminación de factura sin pagos**: eliminar factura sin pagos → debe funcionar, líneas eliminadas en cascada. 3. Cada verificación usa `BEGIN ... ROLLBACK` (o bloques `DO` anidados) para no dejar datos residuales. El script debe poder ejecutarse repetidamente en el mismo entorno sin efectos secundarios. 4. Documentar en el script: versión, fecha, invariantes cubiertas, y comando de ejecución (`psql` o SQL Editor de Supabase). |
| **Archivos / áreas** | `sql/003-verify-db-invariants.sql` |
| **Criterios de aceptación** | El script se ejecuta completo sin errores en un entorno con triggers y RLS activos. Cada invariante está cubierta por al menos una verificación con aserción explícita. El script no deja datos residuales (usa ROLLBACK). El script está versionado en el repositorio. |
| **Verificación** | 1. Ejecutar `sql/003-verify-db-invariants.sql` en SQL Editor de Supabase en el entorno de staging/producción. 2. Verificar que todas las verificaciones pasan (sin errores de RAISE EXCEPTION). 3. Modificar temporalmente un trigger (ej. comentar `prevent_overpayment`) → re-ejecutar script → debe fallar en la verificación correspondiente. 4. Restaurar trigger → script vuelve a pasar. |

---

## Resumen de dependencias

| Tarea | Depende de | Desbloquea |
|-------|-----------|------------|
| T-01 | — | T-02 |
| T-02 | T-01 | T-03a |
| T-03a | T-02 | T-03b, T-07a |
| T-03b | T-03a | T-04, T-08, T-11b, T-19 |
| T-04 | T-03a, T-03b | T-05, T-18, T-19 |
| T-05 | T-02, T-04 | T-06 |
| T-06 | T-05 | T-07a, T-08b |
| T-07a | T-03a, T-06 | T-07b |
| T-07b | T-07a | T-08, T-11a, T-12, T-13 |
| T-08 | T-07b, T-03b | T-09, T-17, T-18, T-19, T-15 |
| T-08b | T-06 | T-09, T-15 |
| T-09 | T-08, T-08b | T-10, T-14, T-15, T-16 |
| T-10 | T-09 | — (stretch) |
| T-11a | T-07b | T-11b |
| T-11b | T-11a, T-03b | T-15, T-17 |
| T-12 | T-07b | T-13 |
| T-13 | T-07b, T-12 | T-15 |
| T-14 | T-09 | — (stretch) |
| T-15 | T-08, T-08b, T-09, T-11a, T-11b, T-12, T-13, T-17, T-18, T-19 | — |
| T-16 | T-09 | — (stretch) |
| T-17 | T-08, T-11b | T-15 |
| T-18 | T-04, T-08 | T-15 |
| T-19 | T-03b, T-04, T-08 | T-15 |

---

## Orden de ejecución recomendado

> **Importante**: este cronograma asume **2 agentes trabajando en paralelo**. Con 1 solo agente, el MVP completo no es entregable en 2 días. Ver sección "Escenario con 1 agente" abajo.

| Día | Orden | Tareas |
|---|---|---|
| Día 1 mañana | 1-5 | T-01, T-02, T-03a, T-03b, T-04 |
| Día 1 tarde | 6-10 | T-05, T-06, T-07a, T-07b, T-08 |
| Día 2 mañana | 11-14 | Agente A: T-08b, T-09 ║ Agente B: T-11a, T-11b ║ Agente A/B (quien termine antes): T-12 |
| Día 2 tarde | 15-19 | Agente A: T-12 (si pendiente), T-13, T-15 ║ Agente B: T-17, T-18, T-19 |
| Post-MVP / stretch | — | T-10, T-14, T-16 |

### Paralelización (2 agentes)

| Fase | Agente A | Agente B |
|---|---|---|
| Día 2 mañana | T-08b → T-09 (secuencial: T-09 depende de T-08b) | T-11a → T-11b (secuencial: T-11b depende de T-11a) |
| Si A termina T-09 antes que B termine T-11b | T-12 (independiente: depende de T-07b) | — |
| Día 2 tarde | T-12 (si quedó pendiente) → T-13 → T-15 | T-17 → T-18 → T-19 |
| Verificación final | Ejecutar T-15 con todos los gates | — |

**Dependencias no paralelizables**: T-03a→T-03b→T-04→T-05→T-06 (secuencia fija). T-07a→T-07b→T-08 (secuencia fija). T-09 depende de T-08 y T-08b (ambos deben estar completos). T-17 depende de T-08 y T-11b (ambos deben estar completos). T-13 depende de T-12 y T-07b.

### Escenario con 1 agente

Con 1 solo agente, **el MVP completo NO es entregable en 2 días**. Las siguientes tareas se trasladan a un **Día 3 / siguiente incremento**:

| Trasladado | Motivo |
|---|---|
| T-12 (exportación XLSX) + T-13 (exportación CSV) | Dependen de T-07b pero T-11a/T-11b/T-17/T-18/T-19 consumen todo el Día 2 |
| T-19 (gate de invariantes de BD) | Se ejecuta como verificación manual ad-hoc (no versionada) en el Día 2 |
| T-15 (deploy) | Se ejecuta al cierre del Día 3 con todos los gates completos |

**Lo que SÍ se entrega en 2 días con 1 agente**: autenticación, facturas con líneas, pagos con anulación y metadatos, ingresos diarios, dashboard con métricas reales, importación CSV con RPC atómica, tests unitarios, y checklist RLS ejecutada. La exportación (XLSX/CSV) y el gate de invariantes versionado quedan para el Día 3.

---

> **Nota para el agente**: cada tarea debe producir commits atómicos. Verificar los criterios de aceptación antes de marcar una tarea como completada. Si una verificación falla, la tarea no está terminada. El sobrepago se rechaza tanto en frontend como en base de datos — ambas validaciones deben funcionar.
