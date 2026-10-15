// Reducer: concentra TODA la lógica que modifica los datos de ProGest.
// Cada acción devuelve un estado nuevo (nunca se muta el anterior).
//
// Forma del estado:
// {
//   activeProjectId: string | null,
//   projects: [{ id, name, columns: [{ id, name, tasks: [{ id, title, description, minutes, status }] }] }]
// }
import { createId } from '../utils/ids';
import { DEFAULT_COLUMNS } from '../utils/constants';

export const initialState = { activeProjectId: null, projects: [] };

// Aplica una función de transformación solo al proyecto con el id indicado.
function updateProject(state, projectId, transform) {
  return {
    ...state,
    projects: state.projects.map((project) =>
      project.id === projectId ? transform(project) : project
    ),
  };
}

// Aplica una transformación solo a la columna indicada dentro de un proyecto.
function updateColumn(project, columnId, transform) {
  return {
    ...project,
    columns: project.columns.map((column) =>
      column.id === columnId ? transform(column) : column
    ),
  };
}

export function progestReducer(state, action) {
  switch (action.type) {
    // ---------- Proyectos ----------
    case 'ADD_PROJECT': {
      const project = {
        id: action.id,
        name: action.name,
        columns: DEFAULT_COLUMNS.map((name) => ({ id: createId(), name, tasks: [] })),
      };
      return { activeProjectId: project.id, projects: [...state.projects, project] };
    }

    case 'SELECT_PROJECT':
      return { ...state, activeProjectId: action.projectId };

    case 'DELETE_PROJECT': {
      const projects = state.projects.filter((p) => p.id !== action.projectId);
      // Si se borra el proyecto activo, pasamos al primero que quede (o a ninguno).
      const activeProjectId =
        state.activeProjectId === action.projectId ? projects[0]?.id ?? null : state.activeProjectId;
      return { activeProjectId, projects };
    }

    // ---------- Columnas ----------
    case 'ADD_COLUMN':
      return updateProject(state, action.projectId, (project) => ({
        ...project,
        columns: [...project.columns, { id: action.id, name: action.name, tasks: [] }],
      }));

    case 'RENAME_COLUMN':
      return updateProject(state, action.projectId, (project) =>
        updateColumn(project, action.columnId, (column) => ({ ...column, name: action.name }))
      );

    case 'DELETE_COLUMN':
      return updateProject(state, action.projectId, (project) => ({
        ...project,
        columns: project.columns.filter((column) => column.id !== action.columnId),
      }));

    // ---------- Tareas ----------
    case 'ADD_TASK':
      return updateProject(state, action.projectId, (project) =>
        updateColumn(project, action.columnId, (column) => ({
          ...column,
          tasks: [...column.tasks, action.task],
        }))
      );

    case 'UPDATE_TASK':
      // "changes" trae los campos editados (título, descripción, tiempo, estado).
      return updateProject(state, action.projectId, (project) => ({
        ...project,
        columns: project.columns.map((column) => ({
          ...column,
          tasks: column.tasks.map((task) =>
            task.id === action.taskId ? { ...task, ...action.changes } : task
          ),
        })),
      }));

    case 'DELETE_TASK':
      return updateProject(state, action.projectId, (project) => ({
        ...project,
        columns: project.columns.map((column) => ({
          ...column,
          tasks: column.tasks.filter((task) => task.id !== action.taskId),
        })),
      }));

    case 'MOVE_TASK':
      return updateProject(state, action.projectId, (project) => {
        // 1) Localizamos la tarea en cualquier columna.
        const task = project.columns.flatMap((c) => c.tasks).find((t) => t.id === action.taskId);
        if (!task) return project;
        // Una tarea no puede colocarse antes de sí misma.
        if (action.beforeTaskId === action.taskId) return project;

        // 2) La quitamos de su columna de origen.
        const withoutTask = project.columns.map((column) => ({
          ...column,
          tasks: column.tasks.filter((t) => t.id !== action.taskId),
        }));

        // 3) La insertamos en la columna destino, justo antes de "beforeTaskId" (o al final).
        return {
          ...project,
          columns: withoutTask.map((column) => {
            if (column.id !== action.toColumnId) return column;
            const index = column.tasks.findIndex((t) => t.id === action.beforeTaskId);
            const tasks = [...column.tasks];
            tasks.splice(index === -1 ? tasks.length : index, 0, task);
            return { ...column, tasks };
          }),
        };
      });

    default:
      return state;
  }
}
