# Análisis de ventas exportadas por Alfapp

## Archivos

- `ventas_alfapp_analisis.xlsx`: libro con resumen, gráfico, detalle ordenado y criterios de revisión.
- `ventas_alfapp_categorizadas.csv`: las 330 filas normalizadas, enriquecidas y ordenadas por categoría y subcategoría.
- `resumen_categorias.csv`: agregado compacto por categoría principal.

## Resumen

| Categoría principal | Registros | Venta total | Participación |
|---|---:|---:|---:|
| Alimento balanceado y nutrición | 135 | 5.010.995,18 | 37,7% |
| Medicina veterinaria | 92 | 2.716.179,00 | 20,4% |
| Accesorios | 33 | 731.970,00 | 5,5% |
| Higiene y cuidado | 38 | 714.578,00 | 5,4% |
| Consulta veterinaria | 14 | 1.407.000,00 | 10,6% |
| Peluquería canina | 18 | 2.719.955,00 | 20,4% |
| **TOTAL** | **330** | **13.300.677,18** | **100,0%** |

El archivo fuente no declara la moneda. Se conservaron los importes tal como los exporta el POS. La suma de cantidades mezcla unidades y presentaciones, por lo que no representa un volumen homogéneo.

## Categorías principales propuestas

- **Alimento balanceado y nutrición:** Alimentos secos, húmedos, dietas veterinarias, snacks y alimentación natural.
- **Medicina veterinaria:** Medicamentos, antiparasitarios, suplementos e insumos de recuperación.
- **Accesorios:** Paseo, descanso, indumentaria, juguetes, comederos y accesorios sanitarios.
- **Higiene y cuidado:** Arenas, productos de baño, limpieza, cuidado dental y absorbentes.
- **Consulta veterinaria:** Consultas, controles, vacunación, diagnósticos y análisis clínicos.
- **Peluquería canina:** Baños, cortes, uñas y tratamientos complementarios de peluquería.

## Conceptos para validar con el cliente

- **Tubos** → Medicina veterinaria / Insumos clínicos. Descripción insuficiente: confirmar tipo de tubo y uso.
- **MOICES X 3 SAN ROQUE** → Accesorios / Descanso. Se interpretó 'MOICES' como 'moisés/cama'; validar el nombre original.
- **BIO CLIN 250 ML** → Higiene y cuidado / Baño y cuidado de piel/pelo. El nombre comercial no describe el uso; se infirió cuidado e higiene por la presentación.
- **Aplicación Perros Chicos** → Peluquería canina / Tratamientos complementarios. El concepto no indica qué producto o tratamiento se aplica; validar con el cliente.
- **Aplicación Perros Grandes** → Peluquería canina / Tratamientos complementarios. El concepto no indica qué producto o tratamiento se aplica; validar con el cliente.
- **Aplicación Perros Medianos** → Peluquería canina / Tratamientos complementarios. El concepto no indica qué producto o tratamiento se aplica; validar con el cliente.

## Observaciones sobre la exportación

- El POS encapsula la mayoría de las filas completas dentro de una sola celda CSV; el proceso realizó una segunda lectura para recuperar las siete columnas originales.
- Hay 4 filas con total 0,00. Se conservaron y pueden revisarse en el libro: EUK Adult Small Breed 15Kg; EUK Senior Large Breed 3 Kg; Satiety Canine 1,5 Kg; PAÑOPET ALFOMBRA SANITARIA MAX 60X90 X10U.
- La clasificación se hizo por el nombre del producto o servicio. Conviene convertirla luego en un catálogo maestro editable, asociado al código/SKU cuando exista.
