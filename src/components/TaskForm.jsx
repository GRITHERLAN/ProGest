// Formulario (dentro de una modal) para crear o editar una tarea.
// Si recibe "task" estamos editando; si no, creando.
import { useId, useState } from 'react';
import Modal from './Modal';
import Select from './Select';
import { TASK_STATUSES } from '../utils/constants';

export default function TaskForm({ task, columns, initialColumnId, onSave, onClose }) {
  const formId = useId();
  const isEditing = Boolean(task);

  // Estado local de cada campo. El tiempo se guarda en minutos y aquí se separa en horas + minutos.
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [hours, setHours] = useState(task ? Math.floor(task.minutes / 60) : 0);
  const [minutes, setMinutes] = useState(task ? task.minutes % 60 : 0);
  const [status, setStatus] = useState(task?.status ?? 'pending');
  const [columnId, setColumnId] = useState(initialColumnId);
  const [error, setError] = useState('');

  function handleSubmit(event) {
    // Evita que el navegador recargue la página al enviar el formulario.
    event.preventDefault();

    if (!title.trim()) {
      setError('Escribe un título para la tarea.');
      return;
    }

    const totalMinutes = Math.max(0, Number(hours) || 0) * 60 + Math.max(0, Number(minutes) || 0);
    onSave({
      title: title.trim(),
      description: description.trim(),
      minutes: totalMinutes,
      status,
      columnId,
    });
  }

  return (
    <Modal title={isEditing ? 'Editar tarea' : 'Nueva tarea'} onClose={onClose}>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor={`${formId}-title`}>Título</label>
          <input
            id={`${formId}-title`}
            type="text"
            value={title}
            maxLength={120}
            autoFocus
            onChange={(event) => {
              setTitle(event.target.value);
              setError('');
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${formId}-error` : undefined}
          />
          {error && (
            <p id={`${formId}-error`} className="field__error" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor={`${formId}-description`}>Descripción</label>
          <textarea
            id={`${formId}-description`}
            rows="3"
            value={description}
            maxLength={500}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <fieldset className="field field--group">
          <legend>Tiempo estimado</legend>
          <div className="field__row">
            <label className="field__inline">
              <input
                type="number"
                min="0"
                max="999"
                value={hours}
                onChange={(event) => setHours(event.target.value)}
              />
              horas
            </label>
            <label className="field__inline">
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
              />
              minutos
            </label>
          </div>
        </fieldset>

        <div className="field__row field__row--split">
          <div className="field">
            <label htmlFor={`${formId}-status`}>Estado</label>
            {/* Desplegable propio (ver Select.jsx): su lista se anima igual que el resto de la web. */}
            <Select
              id={`${formId}-status`}
              value={status}
              options={TASK_STATUSES.map((item) => ({ id: item.id, label: item.label }))}
              onChange={setStatus}
            />
          </div>

          <div className="field">
            <label htmlFor={`${formId}-column`}>Columna</label>
            <Select
              id={`${formId}-column`}
              value={columnId}
              options={columns.map((column) => ({ id: column.id, label: column.name }))}
              onChange={setColumnId}
            />
          </div>
        </div>

        <div className="modal__actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="button button--primary">
            {isEditing ? 'Guardar cambios' : 'Crear tarea'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
