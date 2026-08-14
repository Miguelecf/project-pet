# MVP cerrado

Documento conceptual y agnóstico de tecnología para definir el MVP de Project Pet.
Cada nueva necesidad se registrará acá antes de pasarla a diseño y desarrollo.
El equipo deberá poder entender el producto sin depender de un framework,
lenguaje, librería, gestor de paquetes o decisión de infraestructura.

## Estado del documento

| Campo | Valor |
|---|---|
| Producto | Project Pet |
| Alcance | MVP conceptual, demostrable y de una sola persona usuaria |
| Nivel | Producto, dominio, clases conceptuales, pantallas y flujos |
| Idioma de la interfaz | Español rioplatense claro |
| Tecnología | No definida en este documento |
| Estado | Base inicial creada; nuevas modificaciones pendientes de definición |
| Regla de trabajo | Primero se define el producto, luego se decide cómo construirlo |

## Objetivo del MVP

Permitir que una persona gestione de forma simple los datos básicos de su
negocio, registre facturas y pagos, anote ingresos diarios y entienda su estado
de caja desde un resumen claro.

## Personas usuarias

### Persona principal

Persona dueña o responsable de un pequeño negocio que necesita cargar y consultar
información operativa sin conocimientos contables ni técnicos.

### Criterio de lenguaje

- Usar español claro y directo.
- Nombrar lo que la persona reconoce, no cómo funciona el sistema.
- Preferir acciones concretas: `Guardar`, `Editar`, `Eliminar`, `Volver`.
- Evitar términos técnicos salvo que sean indispensables.
- Mantener el voseo de forma consistente.

## Alcance actual del producto

El MVP existente incluye estas áreas:

- Resumen del negocio.
- Proveedores.
- Categorías de gasto.
- Facturas.
- Pagos y anulaciones.
- Ingresos diarios.
- Configuración de moneda y avisos de vencimiento.
- Persistencia local y recuperación de datos de ejemplo.

## Páginas del frontend

La cantidad de páginas se define por las necesidades del producto, no por la
estructura de un framework o una aplicación concreta.

| Página | Objetivo | Acciones principales |
|---|---|---|
| Resumen del negocio | Entender rápidamente el estado de caja y las tareas pendientes | Consultar período, revisar métricas y vencimientos |
| Proveedores | Consultar y administrar proveedores | Crear, editar, eliminar y restaurar |
| Categorías | Organizar los gastos | Crear, editar, eliminar y restaurar |
| Facturas | Consultar compromisos de pago | Filtrar, crear, editar, eliminar, restaurar y abrir detalle |
| Nueva factura | Registrar una compra | Seleccionar proveedor, agregar líneas y guardar |
| Detalle de factura | Consultar una factura completa | Revisar líneas, saldo y pagos |
| Edición de factura | Corregir una factura sin pagos activos | Modificar datos y líneas |
| Ingresos diarios | Registrar dinero ingresado | Crear, editar y eliminar ingresos |
| Configuración | Definir preferencias del negocio | Elegir moneda y avisos de vencimiento |

## Entidades del dominio

| Entidad | Propósito | Relaciones principales |
|---|---|---|
| Proveedor | Persona o empresa a la que se le compra | Una factura pertenece a un proveedor |
| Categoría | Forma de agrupar gastos de una factura | Una línea de factura pertenece a una categoría |
| Factura | Compra o compromiso de pago | Tiene proveedor, líneas y pagos |
| Línea de factura | Detalle de un producto o servicio comprado | Pertenece a una factura y una categoría |
| Pago | Dinero abonado de una factura | Pertenece a una factura; puede anularse |
| Ingreso diario | Dinero ingresado en una fecha | Se usa en el resumen de caja |
| Configuración | Preferencias generales del negocio | Define moneda y días de aviso |

## Clases conceptuales

Estas clases representan conceptos del dominio. No indican clases de un lenguaje
de programación ni obligan a usar programación orientada a objetos.

| Clase conceptual | Responsabilidad |
|---|---|
| Negocio | Representar el contexto operativo de la persona usuaria |
| Proveedor | Identificar a quién se le compra |
| Categoría de gasto | Clasificar una compra |
| Factura | Representar una compra y su compromiso de pago |
| Línea de factura | Representar un producto o servicio dentro de una factura |
| Pago | Representar dinero abonado a una factura |
| Ingreso | Representar dinero recibido en una fecha |
| Resumen de caja | Explicar ingresos, pagos, saldo y compromisos |
| Configuración del negocio | Definir preferencias que afectan la operación |

## Relaciones conceptuales

- Un negocio puede tener muchos proveedores.
- Un negocio puede tener muchas categorías de gasto.
- Un proveedor puede tener muchas facturas.
- Una factura tiene una o más líneas.
- Cada línea pertenece a una categoría de gasto.
- Una factura puede tener cero o muchos pagos.
- Un pago pertenece a una única factura.
- Un negocio puede registrar muchos ingresos.
- El resumen de caja combina ingresos, pagos y facturas.

## Reglas de negocio vigentes

- Una factura debe tener al menos una línea.
- Cada línea debe tener categoría, descripción, cantidad y costo unitario.
- La fecha de emisión no puede ser futura.
- La fecha de pago no puede ser futura.
- Un pago no puede superar el saldo pendiente.
- Un pago se anula, no se elimina físicamente.
- Una factura con pagos activos no se puede eliminar ni editar.
- Una categoría usada por una línea no se puede eliminar.
- Las facturas pueden restaurarse luego de ser eliminadas.
- El resultado de caja es una estimación y no representa la ganancia final.
- La interfaz no debe exponer decisiones técnicas a la persona usuaria.

## Flujos principales

### Registrar una compra

1. La persona abre `Nueva factura`.
2. Selecciona un proveedor.
3. Agrega una o más líneas de compra.
4. Revisa el total calculado.
5. Guarda la factura.
6. La factura aparece como pendiente en `Facturas` y en el `Resumen del negocio`.

### Pagar una compra

1. La persona abre el detalle de una factura.
2. Consulta el saldo pendiente.
3. Registra un pago total o parcial.
4. El estado y el saldo de la factura se actualizan.
5. Si corresponde, puede anular el pago mediante confirmación.

### Consultar el estado del negocio

1. La persona abre `Resumen del negocio`.
2. Selecciona día, semana o mes.
3. Consulta cuánto ingresó y cuánto pagó.
4. Revisa qué facturas siguen pendientes.
5. Atiende los vencimientos cercanos o vencidos.

## Formato para nuevas modificaciones

Cada modificación nueva debe agregarse como una historia de usuario usando esta
estructura:

### US-XXX: Título breve de la historia

**Estado:** Pendiente  
**Prioridad:** Alta | Media | Baja  
**Área:** Resumen | Proveedores | Categorías | Facturas | Pagos | Ingresos | Configuración  

#### Historia

Como [tipo de persona usuaria],
quiero [acción o capacidad],
para [beneficio concreto].

#### Entidades involucradas

- [Entidad nueva o existente]
- [Relación o dato que cambia]

#### Criterios de aceptación

- [ ] Dado [contexto], cuando [acción], entonces [resultado esperado].
- [ ] Dado [contexto alternativo], cuando [acción], entonces [resultado esperado].
- [ ] El texto visible y accesible está en español claro.
- [ ] El comportamiento funciona correctamente en escritorio y móvil.
- [ ] Los estados de carga, error y vacío están definidos cuando corresponda.

#### Reglas y validaciones

- [Regla de negocio]
- [Validación de datos]

#### Fuera de alcance

- [Qué no debe implementarse como parte de esta historia]

#### Notas para diseño y desarrollo

- [Decisión funcional, conceptual o de experiencia relevante]

#### Notas para QA

- [Flujo manual o caso límite que debe probarse]

## Nuevas entidades

Cuando una modificación requiera una entidad nueva, documentarla antes de la
historia con esta ficha:

### ENT-XXX: Nombre de la entidad

| Campo | Definición |
|---|---|
| Propósito | Qué representa en el negocio |
| Identificador | Tipo y regla de generación |
| Campos obligatorios | Lista de campos requeridos |
| Campos opcionales | Lista de campos opcionales |
| Relaciones | Entidades relacionadas |
| Estados | Estados válidos y significado |
| Eliminación | Si se elimina, archiva o restaura |
| Reglas | Restricciones de negocio |

## Backlog de modificaciones

> Esta sección se completa con las modificaciones que la persona usuaria vaya
> señalando. No se implementa una historia hasta que tenga criterios de
> aceptación suficientes.

### US-001: Mejorar formularios y mensajes de validación

**Estado:** Implementada en demo
**Prioridad:** Alta
**Área:** Formularios y experiencia de demo

#### Historia

Como persona que está probando la demo,
quiero saber exactamente qué campo debo completar cuando falta información,
para poder corregir el formulario sin adivinar.

#### Entidades involucradas

- Formularios de proveedores, categorías, facturas, líneas, pagos e ingresos.
- Mensajes de validación.

#### Criterios de aceptación

- [ ] Cada campo obligatorio vacío muestra un mensaje asociado a ese campo.
- [ ] El mensaje indica qué falta, por ejemplo: `Completá el nombre del proveedor`.
- [ ] El formulario conserva los datos ya ingresados cuando existe un error.
- [ ] Los campos se presentan en un orden natural para una demo.
- [ ] La validación permite avanzar con datos mínimos de demostración sin exigir información innecesaria.
- [ ] El error general sólo se usa cuando el problema no pertenece a un campo específico.

### US-002: Definir el vencimiento habitual por proveedor

**Estado:** Implementada en demo
**Prioridad:** Alta
**Área:** Proveedores y facturas

#### Historia

Como persona que registra compras,
quiero definir cuántos días de plazo suele dar cada proveedor,
para que ese dato me ayude a completar nuevas facturas sin quitarme la posibilidad
de corregir la fecha de vencimiento.

#### Entidades involucradas

- Proveedor.
- Factura.
- Fecha de vencimiento.
- Plazo habitual de pago del proveedor.

#### Criterios de aceptación

- [ ] El proveedor puede tener un plazo habitual de pago expresado en días.
- [ ] El plazo del proveedor es opcional.
- [ ] Al crear una factura, si el proveedor tiene plazo habitual, se propone una fecha de vencimiento a partir de la fecha de emisión.
- [ ] La persona puede modificar la fecha propuesta en la factura.
- [ ] La fecha guardada en la factura es la que se usa para mostrar vencimientos.
- [ ] Cambiar el plazo del proveedor no modifica facturas ya creadas.
- [ ] Si el proveedor no tiene plazo configurado, la factura permite completar manualmente la fecha de vencimiento.

#### Fuera de alcance

- No modificar automáticamente facturas existentes.
- No agregar una pantalla general de configuración de vencimientos.

### US-003: Retirar la configuración general del MVP demo

**Estado:** Implementada en demo
**Prioridad:** Alta
**Área:** Navegación y resumen

#### Historia

Como persona que recorre la demo,
quiero encontrar sólo las secciones necesarias para operar,
para no distraerme con una pantalla de configuración que todavía no aporta valor.

#### Criterios de aceptación

- [ ] `Configuración` no aparece en la navegación principal.
- [ ] La pantalla de configuración general deja de formar parte del flujo demo.
- [ ] El resumen no muestra controles ni referencias a configuración general.
- [ ] Los avisos de vencimiento se basan en las fechas de las facturas.
- [ ] Las preferencias que ya no tienen una pantalla visible no bloquean la navegación principal.

### US-004: Mejorar tablas de categorías y facturas

**Estado:** Implementada en demo
**Prioridad:** Alta
**Área:** Categorías y facturas

#### Historia

Como persona que recorre la demo,
quiero leer categorías y facturas en tablas claras,
para encontrar rápidamente la información y distinguir sus acciones.

#### Criterios de aceptación

- [ ] Categorías se muestran con encabezado, nombre y acciones.
- [ ] Facturas se muestran con referencia, proveedor, fecha, vencimiento, estado, total y saldo.
- [ ] Las acciones de cada fila son distinguibles y fáciles de encontrar.
- [ ] Las tablas se adaptan a pantallas pequeñas sin perder información esencial.
- [ ] Las tablas tienen nombres accesibles y estados vacíos claros.

### US-005: Restaurar datos de ejemplo de una veterinaria

**Estado:** Implementada en demo
**Prioridad:** Alta
**Área:** Datos de ejemplo y demo

#### Historia

Como persona que quiere mostrar la demo,
quiero restaurar datos realistas de una veterinaria,
para recorrer el producto con un negocio reconocible y suficientemente completo.

#### Criterios de aceptación

- [ ] Restaurar datos reemplaza el estado actual por un conjunto coherente de una veterinaria.
- [ ] El conjunto contiene aproximadamente 100 registros distribuidos entre proveedores, categorías, facturas, líneas, pagos e ingresos diarios.
- [ ] Los nombres, referencias y notas corresponden a una veterinaria.
- [ ] Existen facturas pendientes, con pago parcial y pagadas.
- [ ] Existen vencimientos próximos y vencidos.
- [ ] Los totales, saldos, estados y resumen se calculan sin contradicciones.
- [ ] La restauración sigue siendo reversible mediante el mismo botón de datos de ejemplo.

### US-006: Mejorar la tabla de ingresos diarios

**Estado:** Implementada en demo
**Prioridad:** Alta
**Área:** Ingresos diarios

#### Historia

Como persona que revisa la operación de la veterinaria,
quiero consultar los ingresos diarios en una tabla ordenada,
para entender rápidamente cuándo ingresó el dinero, cuánto fue y de dónde vino.

#### Criterios de aceptación

- [ ] Los ingresos se muestran en una tabla con fecha, monto, moneda, nota y acciones.
- [ ] La tabla mantiene el orden más reciente primero.
- [ ] La moneda y la nota se distinguen visualmente del monto.
- [ ] Las acciones de editar y eliminar siguen el patrón de las tablas de categorías y facturas.
- [ ] La tabla se adapta a pantallas pequeñas sin perder la información principal.

## Decisiones excluidas

Este documento no define:

- Framework frontend o backend.
- Lenguaje de programación.
- Gestor de paquetes o herramientas de build.
- Base de datos o mecanismo de persistencia.
- Proveedor de hosting o infraestructura.
- API, endpoints, contratos técnicos o estructura de carpetas.
- Librerías visuales o componentes concretos.

## Flujo de trabajo del equipo

1. La persona usuaria describe una modificación.
2. Se transforma la necesidad en una historia dentro de este documento.
3. Se identifican entidades, relaciones, reglas y criterios de aceptación.
4. La persona usuaria valida que la historia representa lo que necesita.
5. Se diseña la experiencia y el modelo conceptual.
6. Se decide la solución técnica fuera de este documento.
7. Se implementa la historia junto con sus pruebas.
8. Se verifica el comportamiento y la interfaz.
9. Se marca la historia como `Completada` y se registra la evidencia.

## Definición de terminado

Una historia se considera terminada cuando:

- [ ] La implementación cumple todos sus criterios de aceptación.
- [ ] Las reglas de negocio tienen pruebas automatizadas cuando corresponda.
- [ ] La interfaz está completamente en español.
- [ ] La interfaz es usable en escritorio y móvil.
- [ ] Los estados de carga, error y vacío son comprensibles.
- [ ] La navegación por teclado conserva foco visible.
- [ ] Las reglas de negocio están verificadas.
- [ ] Los flujos principales están verificados de punta a punta.
- [ ] La solución técnica elegida cumple esta definición sin alterar el alcance.
- [ ] La modificación queda reflejada en este documento.
