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