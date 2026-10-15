// Configuración mínima de Vite: solo activa el soporte de JSX de React.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
