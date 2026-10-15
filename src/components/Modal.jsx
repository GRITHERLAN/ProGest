// Ventana modal propia con el mismo estilo "glass" que el resto de la web.
// Sustituye a alert/confirm/prompt, que nunca se usan en ProGest.
import { useEffect, useId } from 'react';
import Icon from './Icon';

export default function Modal({ title, onClose, children }) {
  const titleId = useId();

  // Cierra la ventana al pulsar Escape y bloquea el scroll de la página mientras está abierta.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    // Pulsar sobre el fondo oscuro cierra la ventana; pulsar dentro del panel no.
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="modal glass"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal__header">
          <h2 id={titleId} className="modal__title">
            {title}
          </h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar ventana">
            <Icon name="close" />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
