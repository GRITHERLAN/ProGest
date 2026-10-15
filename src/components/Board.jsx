// Tablero del proyecto activo: columnas, formulario de nueva columna y diálogos.
import { useState } from 'react';
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

  function handleMoveTask(taskId, toColumnId, beforeTaskId = null) {
    dispatch({ type: 'MOVE_TASK', projectId: project.id, taskId, toColumnId, beforeTaskId });
  }

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

  // ---------- Drag and drop ----------
  function handleDrop() {
    if (drag.taskId && drag.overColumnId) {
      handleMoveTask(drag.taskId, drag.overColumnId, drag.overTaskId);
    }
    setDrag(NO_DRAG);
  }

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
              onRename={(name) =>
                dispatch({ type: 'RENAME_COLUMN', projectId: project.id, columnId: column.id, name })
              }
              onDeleteColumn={() => setDialog({ kind: 'column', column })}
              onAddTask={() => setDialog({ kind: 'form', columnId: column.id })}
              onEditTask={(task) => setDialog({ kind: 'form', columnId: column.id, task })}
              onDeleteTask={(task) => setDialog({ kind: 'task', task })}
              onMoveTask={handleMoveTask}
              onDragStart={(taskId) => setDrag({ ...NO_DRAG, taskId })}
              onDragEnd={() => setDrag(NO_DRAG)}
              onDragOverTarget={(overColumnId, overTaskId) =>
                setDrag((current) => ({ ...current, overColumnId, overTaskId }))
              }
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
