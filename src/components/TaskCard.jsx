// Tarjeta de una tarea: arrastrable, con estado, tiempo estimado y acciones.
import Icon from './Icon';
import { TASK_STATUSES } from '../utils/constants';
import { formatMinutes } from '../utils/formatTime';

export default function TaskCard({
  task,
  columnId,
  columns,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragOverTask,
  onEdit,
  onDelete,
  onMoveTo,
}) {
  const status = TASK_STATUSES.find((item) => item.id === task.status);

  return (
    <li
      className={`task glass-soft${isDragging ? ' is-dragging' : ''}${isDropTarget ? ' is-drop-target' : ''}`}
      draggable
      onDragStart={(event) => {
        // Firefox exige guardar algún dato en dataTransfer para iniciar el arrastre.
        event.dataTransfer.setData('text/plain', task.id);
        event.dataTransfer.effectAllowed = 'move';
        onDragStart(task.id);
      }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        // preventDefault permite soltar aquí; stopPropagation evita que la columna lo sobrescriba.
        event.preventDefault();
        event.stopPropagation();
        onDragOverTask(columnId, task.id);
      }}
    >
      <div className="task__top">
        <span className={`badge badge--${task.status}`}>{status?.label}</span>
        <div className="task__actions">
          <button
            type="button"
            className="icon-button"
            onClick={onEdit}
            aria-label={`Editar la tarea ${task.title}`}
          >
            <Icon name="edit" />
          </button>
          <button
            type="button"
            className="icon-button icon-button--danger"
            onClick={onDelete}
            aria-label={`Eliminar la tarea ${task.title}`}
          >
            <Icon name="trash" />
          </button>
        </div>
      </div>

      <h4 className="task__title">{task.title}</h4>
      {task.description && <p className="task__description">{task.description}</p>}

      <div className="task__footer">
        <span className="task__time">
          <Icon name="clock" />
          {formatMinutes(task.minutes)}
        </span>

        {/* Alternativa al arrastre: útil con teclado y en pantallas táctiles. */}
        <label className="task__move">
          <span className="visually-hidden">Mover la tarea {task.title} a otra columna</span>
          <select value={columnId} onChange={(event) => onMoveTo(event.target.value)}>
            {columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </li>
  );
}
