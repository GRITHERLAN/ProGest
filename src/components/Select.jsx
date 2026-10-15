// Desplegable propio con el estilo de ProGest.
// Sustituye al <select> nativo porque su lista la dibuja el sistema operativo: no se puede
// animar con CSS y tarda en aparecer. Esta lista sí se anima con la misma transición del resto
// de la web. Se maneja con teclado (flechas, Inicio, Fin, Enter, Escape) como un select normal.
//
// La lista se dibuja en <body> (con un portal) y no dentro de la ventana modal. Así no la recorta
// el scroll de la ventana y puede salir por fuera de ella.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

// Altura aproximada que se reserva para la lista al decidir si se abre hacia abajo o hacia arriba.
const MENU_ESTIMATED_HEIGHT = 240;

// "id" es el id del botón (el <label htmlFor> apunta a él), "value" el id de la opción elegida,
// "options" una lista de { id, label } y "onChange" recibe el id de la nueva opción.
export default function Select({ id, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  // Posición de la lista en pantalla (calculada a partir del botón al abrirla).
  const [menuPosition, setMenuPosition] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  // Referencias a cada opción, para poder mover el foco entre ellas con las flechas.
  const optionRefs = useRef([]);

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.id === value),
  );
  const selectedLabel = options[selectedIndex]?.label ?? '';

  // Calcula dónde colocar la lista justo antes de pintarla: debajo del botón, o encima
  // si debajo no hay sitio. useLayoutEffect evita que se vea un salto en la primera pintura.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < MENU_ESTIMATED_HEIGHT && rect.top > spaceBelow;

    setMenuPosition({
      left: rect.left,
      width: rect.width,
      // Hacia abajo: se ancla por arriba. Hacia arriba: se ancla por abajo.
      ...(openUpwards
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  }, [isOpen]);

  // Al abrir, el foco salta a la opción elegida para poder usar el teclado de inmediato.
  // Depende de menuPosition porque la lista solo existe en pantalla cuando ya tiene posición.
  useEffect(() => {
    if (isOpen && menuPosition) optionRefs.current[selectedIndex]?.focus();
  }, [isOpen, menuPosition, selectedIndex]);

  // Como la lista está fuera de la ventana, al mover el scroll o cambiar el tamaño
  // de la pantalla se cierra: así no queda flotando en una posición equivocada.
  useEffect(() => {
    if (!isOpen) return undefined;
    function closeMenu() {
      setIsOpen(false);
    }
    // El scroll se escucha en fase de captura para detectar también el de la ventana modal.
    window.addEventListener('scroll', closeMenu, true);
    window.addEventListener('resize', closeMenu);
    return () => {
      window.removeEventListener('scroll', closeMenu, true);
      window.removeEventListener('resize', closeMenu);
    };
  }, [isOpen]);

  // Si el foco sale del componente (clic fuera, Tab...), cerramos la lista.
  // La lista no es hija del componente en el DOM, así que también miramos si el foco está en ella.
  function handleBlur(event) {
    const next = event.relatedTarget;
    const insideTrigger = rootRef.current.contains(next);
    const insideMenu = menuRef.current?.contains(next);
    if (!insideTrigger && !insideMenu) setIsOpen(false);
  }

  // Elegir una opción: se guarda, se cierra y el foco vuelve al botón principal.
  function chooseOption(optionId) {
    onChange(optionId);
    setIsOpen(false);
    triggerRef.current.focus();
  }

  // Teclado sobre la lista abierta: flechas, Inicio/Fin, Enter/Espacio y Escape.
  function handleMenuKeyDown(event) {
    const lastIndex = options.length - 1;
    const currentIndex = optionRefs.current.indexOf(document.activeElement);

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      // Evita que la página se desplace mientras se navega por la lista.
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      // Al llegar al final vuelve al principio (y viceversa).
      const nextIndex = (currentIndex + step + options.length) % options.length;
      optionRefs.current[nextIndex]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      optionRefs.current[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      optionRefs.current[lastIndex]?.focus();
    } else if (event.key === 'Escape') {
      // Cierra solo la lista, no la ventana modal que la contiene.
      event.preventDefault();
      event.stopPropagation();
      setIsOpen(false);
      triggerRef.current.focus();
    }
  }

  // Con el botón principal enfocado, las flechas abren la lista.
  function handleTriggerKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
    }
  }

  // La lista se pinta en <body>, fuera de la ventana modal.
  const menu = isOpen && menuPosition && (
    <ul
      ref={menuRef}
      className="select__menu"
      role="listbox"
      style={menuPosition}
      onKeyDown={handleMenuKeyDown}
    >
      {options.map((option, index) => (
        <li key={option.id} role="presentation">
          <button
            type="button"
            role="option"
            ref={(element) => {
              optionRefs.current[index] = element;
            }}
            className="select__option"
            aria-selected={option.id === value}
            onClick={() => chooseOption(option.id)}
          >
            {option.label}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="select" ref={rootRef} onBlur={handleBlur}>
      <button
        id={id}
        type="button"
        ref={triggerRef}
        className="select__trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={handleTriggerKeyDown}
      >
        <span>{selectedLabel}</span>
        <Icon name="chevron" />
      </button>

      {/* La lista solo existe mientras está abierta; al montarse se anima su aparición. */}
      {menu && createPortal(menu, document.body)}
    </div>
  );
}
