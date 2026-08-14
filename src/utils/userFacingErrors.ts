export function userFacingError(reason: unknown, fallback: string): string {
  const message = reason instanceof Error ? reason.message : ''
  const translations: Record<string, string> = {
    'Date must be a valid ISO YYYY-MM-DD calendar date': 'Elegí una fecha válida',
    'Date must not be in the future': 'La fecha no puede ser futura',
    'Quantity must be a positive finite number': 'La cantidad debe ser mayor que cero',
    'Quantity must have at most three decimal places': 'La cantidad puede tener hasta tres decimales',
    'Money minor amount must be a non-negative safe integer': 'El costo debe ser un número entero igual o mayor que cero',
    'Value must not be empty': 'Completá este campo',
    'duplicate supplier name': 'Ya existe un proveedor con ese nombre',
    'duplicate category name': 'Ya existe una categoría con ese nombre',
  }
  return translations[message] ?? (message || fallback)
}
