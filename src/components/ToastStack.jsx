// Avisos visuales temporales (confirmaciones y errores) en la esquina de la pantalla.
// aria-live="polite" hace que los lectores de pantalla anuncien cada mensaje nuevo.
import { useProGest } from '../context/ProGestContext';

export default function ToastStack() {
  const { toasts } = useProGest();

  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((toast) => (
        <p key={toast.id} className={`toast glass toast--${toast.tone}`}>
          {toast.message}
        </p>
      ))}
    </div>
  );
}
