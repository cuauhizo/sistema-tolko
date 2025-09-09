/**
 * Formatea un texto de estado (ej. 'en_progreso') a un formato legible (ej. 'En progreso').
 * @param {string} status - El estado crudo desde la base de datos.
 * @returns {string} El estado formateado.
 */
export function formatStatus(status) {
  if (!status) return 'N/A';
  
  // 1. Reemplaza guiones bajos con espacios
  const withSpaces = status.replace(/_/g, ' ');
  // 2. Pone la primera letra en mayúscula
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

/**
 * Formatea el ID de una orden de trabajo a un formato de folio (ej. OT-0001).
 * @param {number} id - El ID numérico de la orden.
 * @returns {string} El ID formateado como folio.
 */
export function formatWorkOrderId(id) {
  if (!id) return 'N/A';
  // Rellena el número con ceros a la izquierda hasta tener 4 dígitos.
  // Ej. 1 -> "0001", 12 -> "0012", 123 -> "0123"
  const paddedId = String(id).padStart(4, '0');
  return `OT-${paddedId}`;
}

/**
 * Formatea el ID de una tarea a un formato de folio (ej. TA-0001).
 * @param {number} id - El ID numérico de la tarea.
 * @returns {string} El ID formateado como folio.
 */
export function formatTaskId(id) {
  if (!id) return 'N/A';
  const paddedId = String(id).padStart(4, '0');
  return `TA-${paddedId}`;
}