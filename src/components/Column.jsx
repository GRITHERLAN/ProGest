// Una columna del tablero: cabecera editable, lista de tareas y zona de soltado (drop).
import { memo, useState } from 'react';
import Icon from './Icon';
import TaskCard from './TaskCard';
import { formatMinutes } from '../utils/formatTime';

// Se usa memo: si el tablero se vuelve a pintar (por ejemplo al abrir el modal) y esta columna
// no cambia, React se la salta. Por eso Board pasa callbacks estables.
function Column({
  column,
  columns,
  drag,
  onRename,
  onDeleteColumn,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  onDragStart,
  onDragEnd,
  onDragOverTarget,
  onDrop,
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(column.name);

  const totalMinutes = column.tasks.reduce((sum, task) => sum + task.minutes, 0);
  const isDropColumn = drag.taskId && drag.overColumnId === column.id;

  function handleRenameSubmit(event) {
    event.preventDefault();
    // Si el nombre queda vacío, se conserva el anterior.
    if (draftName.trim()) onRename(column.id, draftName.trim());
    else setDraftName(column.name);
    setIsRenaming(false);
  }

  return (
    <section
      className={`column glass${isDropColumn ? ' is-drop-column' : ''}`}
      aria-label={`Columna ${column.name}`}
      onDragOver={(event) => {
        // Soltar sobre un hueco de la columna coloca la tarea al final.
        event.preventDefault();
        onDragOverTarget(column.id, null);
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
    >
      <header className="column__header">
        {isRenaming ? (
          <form className="column__rename" onSubmit={handleRenameSubmit}>
            <input
              type="text"
              value={draftName}
              maxLength={40}
              autoFocus
              aria-label="Nombre de la columna"
              onChange={(event) => setDraftName(event.target.value)}
              onBlur={handleRenameSubmit}
            />
          </form>
        ) : (
          <h3 className="column__title">
            {column.name}
            <span className="column__count">{column.tasks.length}</span>
          </h3>
        )}

        <div className="column__actions">
          <button
            type="button"
            className="icon-button"
            onClick={() => {
              setDraftName(column.name);
              setIsRenaming(true);
            }}
            aria-label={`Renombrar la columna ${column.name}`}
          >
            <Icon name="edit" />
          </button>
          <button
            type="button"
            className="icon-button icon-button--danger"
            onClick={() => onDeleteColumn(column)}
            aria-label={`Eliminar la columna ${column.name}`}
          >
            <Icon name="trash" />
          </button>
        </div>
      </header>

      <p className="column__total">
        <Icon name="clock" />
        {formatMinutes(totalMinutes)}
      </p>

      <ul className={`column__tasks${isDropColumn && !drag.overTaskId ? ' is-drop-end' : ''}`}>
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            columnId={column.id}
            columns={columns}
            isDragging={drag.taskId === task.id}
            isDropTarget={drag.overTaskId === task.id && drag.taskId !== task.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOverTask={onDragOverTarget}
            onEdit={() => onEditTask(column.id, task)}
            onDelete={() => onDeleteTask(task)}
            onMoveTo={(toColumnId) => onMoveTask(task.id, toColumnId)}
          />
        ))}
      </ul>

      <button type="button" className="button button--ghost column__add" onClick={() => onAddTask(column.id)}>
        <Icon name="plus" />
        Añadir tarea
      </button>
    </section>
  );
}

export default memo(Column);
