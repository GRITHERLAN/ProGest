// Contexto global: reparte el estado, el dispatch y el sistema de avisos (toasts)
// a todos los componentes sin pasar props nivel a nivel.
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { initialState, progestReducer } from '../reducer/progestReducer';
import { usePersistedReducer } from '../hooks/usePersistedReducer';
import { createId } from '../utils/ids';

const ProGestContext = createContext(null);

export function ProGestProvider({ children }) {
  const [state, dispatch] = usePersistedReducer(progestReducer, initialState);
  const [toasts, setToasts] = useState([]);

  // Muestra un aviso visual que desaparece solo a los 3,5 segundos.
  const notify = useCallback((message, tone = 'success') => {
    const id = createId();
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 3500);
  }, []);

  const value = useMemo(() => ({ state, dispatch, toasts, notify }), [state, dispatch, toasts, notify]);

  return <ProGestContext.Provider value={value}>{children}</ProGestContext.Provider>;
}

// Hook de acceso rápido al contexto.
export function useProGest() {
  const context = useContext(ProGestContext);
  if (!context) throw new Error('useProGest debe usarse dentro de ProGestProvider');
  return context;
}
