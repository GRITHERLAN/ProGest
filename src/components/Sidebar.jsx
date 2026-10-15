// Barra lateral: lista de proyectos, selección, creación y eliminación.
import { useState } from 'react';
import { useProGest } from '../context/ProGestContext';
import ConfirmDialog from './ConfirmDialog';
import Icon from './Icon';
import { createId } from '../utils/ids';

export default function Sidebar({ isOpen, onNavigate }) {
  const { state, dispatch, notify } = useProGest();
  const [name, setName] = useState('');
  const [projectToDelete, setProjectToDelete] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      notify('Escribe un nombre para el proyecto.', 'error');
      return;
    }
    dispatch({ type: 'ADD_PROJECT', id: createId(), name: trimmed });
    setName('');
    notify(`Proyecto «${trimmed}» creado.`);
    onNavigate();
  }

  function handleConfirmDelete() {
    dispatch({ type: 'DELETE_PROJECT', projectId: projectToDelete.id });
    notify(`Proyecto «${projectToDelete.name}» eliminado.`);
    setProjectToDelete(null);
  }

  return (
    <aside className={`sidebar glass${isOpen ? ' is-open' : ''}`} aria-label="Proyectos">
      <h2 className="sidebar__title">Proyectos</h2>

      <form className="sidebar__form" onSubmit={handleSubmit}>
        <label htmlFor="new-project-name" className="visually-hidden">
          Nombre del nuevo proyecto
        </label>
        <input
          id="new-project-name"
          type="text"
          value={name}
          maxLength={50}
          placeholder="Nuevo proyecto"
          onChange={(event) => setName(event.target.value)}
        />
        <button type="submit" className="button button--primary button--square" aria-label="Crear proyecto">
          <Icon name="plus" />
        </button>
      </form>

      {state.projects.length === 0 ? (
        <p className="sidebar__empty">Aún no hay proyectos. Escribe un nombre arriba para crear el primero.</p>
      ) : (
        <ul className="project-list">
          {state.projects.map((project) => {
            const isActive = project.id === state.activeProjectId;
            return (
              <li key={project.id} className={`project-list__item${isActive ? ' is-active' : ''}`}>
                <button
                  type="button"
                  className="project-list__select"
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => {
                    dispatch({ type: 'SELECT_PROJECT', projectId: project.id });
                    onNavigate();
                  }}
                >
                  {project.name}
                </button>
                <button
                  type="button"
                  className="icon-button icon-button--danger"
                  onClick={() => setProjectToDelete(project)}
                  aria-label={`Eliminar el proyecto ${project.name}`}
                >
                  <Icon name="trash" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {projectToDelete && (
        <ConfirmDialog
          title="Eliminar proyecto"
          message={`Se eliminará «${projectToDelete.name}» con todas sus columnas y tareas. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar proyecto"
          onConfirm={handleConfirmDelete}
          onCancel={() => setProjectToDelete(null)}
        />
      )}
    </aside>
  );
}
