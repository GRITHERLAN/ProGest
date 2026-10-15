// Componente raíz: cabecera, barra lateral de proyectos y tablero del proyecto activo.
import { useState } from 'react';
import { useProGest } from './context/ProGestContext';
import Sidebar from './components/Sidebar';
import Board from './components/Board';
import ToastStack from './components/ToastStack';
import Icon from './components/Icon';

export default function App() {
  const { state } = useProGest();
  // En móvil la barra lateral se despliega con un botón; en escritorio siempre está visible.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeProject = state.projects.find((project) => project.id === state.activeProjectId);

  return (
    <div className="app">
      {/* Fondo decorativo: manchas de color difuminadas que dan profundidad al cristal. */}
      <div className="aurora" aria-hidden="true">
        <span className="aurora__blob aurora__blob--one" />
        <span className="aurora__blob aurora__blob--two" />
        <span className="aurora__blob aurora__blob--three" />
      </div>

      <header className="topbar">
        <button
          type="button"
          className="icon-button topbar__toggle"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-expanded={sidebarOpen}
          aria-label="Mostrar u ocultar la lista de proyectos"
        >
          <Icon name="menu" />
        </button>
        <h1 className="topbar__brand">ProGest</h1>
        <p className="topbar__tagline">Tus proyectos, columna a columna.</p>
      </header>

      <Sidebar isOpen={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      <main className="main">
        {activeProject ? (
          <Board key={activeProject.id} project={activeProject} />
        ) : (
          <section className="empty glass">
            <h2 className="empty__title">Empieza creando un proyecto</h2>
            <p className="empty__text">
              Cada proyecto tiene su propio tablero con columnas y tareas. Escribe un nombre en la lista de
              proyectos para crear el primero.
            </p>
          </section>
        )}
      </main>

      <ToastStack />
    </div>
  );
}
