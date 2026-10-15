// Constantes compartidas por toda la aplicación.

// Clave única de LocalStorage. El sufijo "v1" permite migrar el formato en el futuro.
export const STORAGE_KEY = 'progest:v1';

// Estados posibles de una tarea. "id" se guarda en los datos, "label" se muestra al usuario.
export const TASK_STATUSES = [
  { id: 'pending', label: 'Pendiente' },
  { id: 'progress', label: 'En progreso' },
  { id: 'review', label: 'En revisión' },
  { id: 'done', label: 'Completada' },
];

// Nombres de las columnas que se crean junto con un proyecto nuevo.
export const DEFAULT_COLUMNS = ['Por hacer', 'En curso', 'Hecho'];
