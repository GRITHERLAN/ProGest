// Tablero del proyecto activo: columnas, formulario de nueva columna y diálogos.
import { useCallback, useState } from 'react';
import { useProGest } from '../context/ProGestContext';
import Column from './Column';
import TaskForm from './TaskForm';
import ConfirmDialog from './ConfirmDialog';
import Icon from './Icon';
import { createId } from '../utils/ids';
import { formatMinutes } from '../utils/formatTime';

// Estado inicial del arrastre: qué tarea se mueve y sobre qué columna/tarea está el cursor.
const NO_DRAG = { taskId: null, overColumnId: null, overTaskId: null };

export default function Board({ project }) {
  const { dispatch, notify } = useProGest();

  const [newColumnName, setNewColumnName] = useState('');
  const [drag, setDrag] = useState(NO_DRAG);
  // "dialog" describe qué ventana está abierta: formulario de tarea o confirmación de borrado.
  const [dialog, setDialog] = useState(null);

  const allTasks = project.columns.flatMap((column) => column.tasks);
  const totalMinutes = allTasks.reduce((sum, task) => sum + task.minutes, 0);
  const doneTasks = allTasks.filter((task) => task.status === 'done').length;

  // ---------- Columnas ----------
  function handleAddColumn(event) {
    event.preventDefault();
    const name = newColumnName.trim();
    if (!name) {
      notify('Escribe un nombre para la columna.', 'error');
      return;
    }
    dispatch({ type: 'ADD_COLUMN', projectId: project.id, id: createId(), name });
    setNewColumnName('');
    notify(`Columna «${name}» creada.`);
  }

  // ---------- Tareas ----------
  function handleSaveTask(values) {
    const { columnId, ...fields } = values;

    if (dialog.task) {
      // Edición: actualizamos los campos y, si cambió la columna, movemos la tarea al final de la nueva.
      dispatch({ type: 'UPDATE_TASK', projectId: project.id, taskId: dialog.task.id, changes: fields });
      if (columnId !== dialog.columnId) {
        dispatch({
          type: 'MOVE_TASK',
          projectId: project.id,
          taskId: dialog.task.id,
          toColumnId: columnId,
          beforeTaskId: null,
        });
      }
      notify('Tarea actualizada.');
    } else {
      dispatch({
        type: 'ADD_TASK',
        projectId: project.id,
        columnId,
        task: { id: createId(), ...fields },
      });
      notify('Tarea creada.');
    }
    setDialog(null);
  }

  // Los manejadores que se pasan a las columnas usan useCallback: así su referencia no cambia
  // en cada render y las columnas memorizadas (React.memo) no se vuelven a pintar sin motivo.
  const handleMoveTask = useCallback(
    (taskId, toColumnId, beforeTaskId = null) => {
      dispatch({ type: 'MOVE_TASK', projectId: project.id, taskId, toColumnId, beforeTaskId });
    },
    [dispatch, project.id],
  );

  function handleConfirmDelete() {
    if (dialog.kind === 'task') {
      dispatch({ type: 'DELETE_TASK', projectId: project.id, taskId: dialog.task.id });
      notify('Tarea eliminada.');
    } else {
      dispatch({ type: 'DELETE_COLUMN', projectId: project.id, columnId: dialog.column.id });
      notify('Columna eliminada.');
    }
    setDialog(null);
  }

  // ---------- Callbacks estables para las columnas ----------
  // Cada columna recibe su id como argumento en lugar de un callback nuevo por columna.
  const handleRenameColumn = useCallback(
    (columnId, name) => dispatch({ type: 'RENAME_COLUMN', projectId: project.id, columnId, name }),
    [dispatch, project.id],
  );
  const handleRequestDeleteColumn = useCallback((column) => setDialog({ kind: 'column', column }), []);
  const handleRequestAddTask = useCallback((columnId) => setDialog({ kind: 'form', columnId }), []);
  const handleRequestEditTask = useCallback(
    (columnId, task) => setDialog({ kind: 'form', columnId, task }),
    [],
  );
  const handleRequestDeleteTask = useCallback((task) => setDialog({ kind: 'task', task }), []);

  // ---------- Drag and drop ----------
  const handleDragStart = useCallback((taskId) => setDrag({ ...NO_DRAG, taskId }), []);
  const handleDragEnd = useCallback(() => setDrag(NO_DRAG), []);
  const handleDragOverTarget = useCallback(
    (overColumnId, overTaskId) => setDrag((current) => ({ ...current, overColumnId, overTaskId })),
    [],
  );

  const handleDrop = useCallback(() => {
    if (drag.taskId && drag.overColumnId) {
      handleMoveTask(drag.taskId, drag.overColumnId, drag.overTaskId);
    }
    setDrag(NO_DRAG);
  }, [drag, handleMoveTask]);

  return (
    <div className="board">
      <header className="board__header">
        <h2 className="board__title">{project.name}</h2>
        <p className="board__stats">
          <span>
            {doneTasks} de {allTasks.length} {allTasks.length === 1 ? 'tarea completada' : 'tareas completadas'}
          </span>
          <span className="board__time">
            <Icon name="clock" />
            {formatMinutes(totalMinutes)} estimadas
          </span>
        </p>
      </header>

      {/* Cuerpo del tablero: panel con scroll lateral (columnas) + formulario fijo a la derecha. */}
      <div className="board__body">
        <div className="board__columns glass-soft">
          {project.columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              columns={project.columns}
              drag={drag}
              onRename={handleRenameColumn}
              onDeleteColumn={handleRequestDeleteColumn}
              onAddTask={handleRequestAddTask}
              onEditTask={handleRequestEditTask}
              onDeleteTask={handleRequestDeleteTask}
              onMoveTask={handleMoveTask}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOverTarget={handleDragOverTarget}
              onDrop={handleDrop}
            />
          ))}
        </div>

        {/* Fuera del panel con scroll: se queda fijo en el lateral aunque haya muchas columnas. */}
        <form className="new-column glass" onSubmit={handleAddColumn}>
          <label htmlFor="new-column-name">Nueva columna</label>
          <input
            id="new-column-name"
            type="text"
            value={newColumnName}
            maxLength={40}
            placeholder="Por ejemplo: Bloqueadas"
            onChange={(event) => setNewColumnName(event.target.value)}
          />
          <button type="submit" className="button button--primary">
            <Icon name="plus" />
            Crear columna
          </button>
        </form>
      </div>

      {dialog?.kind === 'form' && (
        <TaskForm
          task={dialog.task}
          columns={project.columns}
          initialColumnId={dialog.columnId}
          onSave={handleSaveTask}
          onClose={() => setDialog(null)}
        />
      )}

      {dialog?.kind === 'task' && (
        <ConfirmDialog
          title="Eliminar tarea"
          message={`Se eliminará «${dialog.task.title}». Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar tarea"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDialog(null)}
        />
      )}

      {dialog?.kind === 'column' && (
        <ConfirmDialog
          title="Eliminar columna"
          message={`Se eliminará la columna «${dialog.column.name}» y sus ${dialog.column.tasks.length} tareas. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar columna"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDialog(null)}
        />
      )}
    </div>
  );
}
