/**
 * Barra superior de la consola del closer (capa shared).
 *
 * La comparten F3 (dashboard) y F4 (ficha de llamada). Vive en `shared/ui` y no
 * en una feature porque la prohibe que F4 importe internals de F3, y duplicarla
 * garantizaria que se desincronicen.
 */

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { cn } from '../lib/cn';

export interface ConsoleHeaderProps {
  closerName: string;
  className?: string;
  /**
   * Accion de cerrar sesion.
   *
   * Llega por prop y no se resuelve aqui adentro porque este componente vive en
   * `shared/ui`: la regla 4 prohibe que la capa compartida importe internals de
   * una feature, y `logoutCloser()` es I/O de F3. Quien conoce el endpoint, el
   * cache y la ruta de salida es la pagina, asi que la pagina cablea.
   *
   * Opcional a proposito: sin ella la burbuja se queda como estaba —
   * decorativa— y ningun consumidor existente cambia de comportamiento.
   */
  onCerrarSesion?: (() => void) | undefined;
}

/** `Sofía Marín` -> `SM`. Dos letras como maximo para que quepan en 32px. */
function initials(nombre: string): string {
  return nombre
    .split(' ')
    .map((palabra) => palabra.at(0) ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const COLSUBSIDIO_LOGO =
  'https://www.colsubsidio.com/campusvirtual/login-custom/img/colsubsidio1.png';

const BURBUJA =
  'inline-flex size-8 items-center justify-center rounded-full bg-console-signal text-[13px] font-bold text-console-ink';

const OPCION_MENU =
  'focus-ring flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-3 py-2.5 ' +
  'text-left text-[14px] font-bold text-console-red-deep transition-colors hover:bg-console-red-soft';

function BrandMark(): ReactElement {
  return (
    <img
      src={COLSUBSIDIO_LOGO}
      alt="Colsubsidio"
      className="h-6 w-auto"
    />
  );
}

export function ConsoleHeader({
  closerName,
  className,
  onCerrarSesion,
}: ConsoleHeaderProps): ReactElement {
  const contenedorRef = useRef<HTMLDivElement | null>(null);
  const disparadorRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const reducirMovimiento = useReducedMotion() ?? false;

  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    if (!abierto) return;

    // El foco entra a la opcion: un `role="menu"` que no recibe el foco obliga
    // al teclado a tabular por toda la pagina hasta alcanzarlo.
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();

    function alClickAfuera(evento: MouseEvent): void {
      if (contenedorRef.current !== null && !contenedorRef.current.contains(evento.target as Node)) {
        setAbierto(false);
      }
    }

    function alEscape(evento: KeyboardEvent): void {
      if (evento.key !== 'Escape') return;
      setAbierto(false);
      // WCAG 2.4.3: cancelar con el teclado no puede dejar el foco huerfano en
      // un nodo que acaba de salir del DOM; vuelve a quien abrio el menu.
      disparadorRef.current?.focus();
    }

    document.addEventListener('mousedown', alClickAfuera);
    document.addEventListener('keydown', alEscape);
    return () => {
      document.removeEventListener('mousedown', alClickAfuera);
      document.removeEventListener('keydown', alEscape);
    };
  }, [abierto]);

  const iniciales = initials(closerName);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3',
        'bg-console-ink px-4 py-[14px] sm:px-8',
        className,
      )}
    >
      <div className="flex items-center gap-[14px]">
        <BrandMark />
        <span className="text-[15px] font-bold text-white">Perfilador de leads</span>
        <span className="rounded-full border border-console-body px-[10px] py-[5px] font-mono text-[11px] font-bold tracking-[0.14em] text-console-signal uppercase">
          Consola closer
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[14px] font-bold text-console-paper">{closerName}</span>

        {onCerrarSesion === undefined ? (
          <span aria-hidden="true" className={BURBUJA}>
            {iniciales}
          </span>
        ) : (
          <div ref={contenedorRef} className="relative">
            <button
              ref={disparadorRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={abierto}
              aria-label={`Cuenta de ${closerName}`}
              onClick={() => {
                setAbierto((previo) => !previo);
              }}
              className="focus-ring flex cursor-pointer items-center gap-1.5 rounded-full"
            >
              <span
                aria-hidden="true"
                className={cn(BURBUJA, 'transition-colors', abierto && 'bg-console-signal-dim')}
              >
                {iniciales}
              </span>
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  'size-3.5 text-console-mute transition-transform',
                  abierto && 'rotate-180',
                )}
              />
            </button>

            <AnimatePresence>
              {abierto && (
                <motion.div
                  initial={reducirMovimiento ? false : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16 }}
                  className="absolute top-full right-0 z-50 mt-2 w-[230px] overflow-hidden rounded-[14px] border border-console-line bg-console-surface shadow-console-card"
                >
                  <div className="border-b border-console-line px-3.5 py-2.5">
                    <p className="font-mono text-[10px] font-bold tracking-[0.12em] text-console-mute uppercase">
                      Sesión
                    </p>
                    <p className="mt-1 truncate text-[13px] font-bold text-console-ink">
                      {closerName}
                    </p>
                  </div>

                  {/* El encabezado queda fuera del `role="menu"`: un menu solo
                      admite items, grupos y separadores como hijos. */}
                  <div ref={menuRef} role="menu" aria-label="Opciones de sesión" className="p-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAbierto(false);
                        onCerrarSesion();
                      }}
                      className={OPCION_MENU}
                    >
                      <LogOut aria-hidden="true" className="size-4 shrink-0" />
                      Cerrar sesión
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}
