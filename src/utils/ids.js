// Genera un identificador único para proyectos, columnas y tareas.
// crypto.randomUUID existe en todos los navegadores modernos (contextos seguros y localhost).
export function createId() {
  return crypto.randomUUID();
}
