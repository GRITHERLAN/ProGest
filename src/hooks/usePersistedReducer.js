// Hook que une useReducer con LocalStorage:
//  - Al arrancar lee los datos guardados (inicialización perezosa, solo una vez).
//  - Cada vez que el estado cambia lo vuelve a guardar.
import { useEffect, useReducer } from 'react';
import { STORAGE_KEY } from '../utils/constants';

// Lee y valida los datos guardados. Si no existen o están corruptos, usa el estado inicial.
function loadState(initialState) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.projects)) return initialState;
    return parsed;
  } catch {
    // LocalStorage bloqueado o JSON inválido: arrancamos vacíos sin romper la app.
    return initialState;
  }
}

export function usePersistedReducer(reducer, initialState) {
  const [state, dispatch] = useReducer(reducer, initialState, loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Si no se puede guardar (cuota llena o modo privado), la app sigue funcionando en memoria.
    }
  }, [state]);

  return [state, dispatch];
}
