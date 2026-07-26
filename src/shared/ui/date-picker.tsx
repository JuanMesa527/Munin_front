/**
 * Selector de fecha propio (design system, capa shared).
 *
 * Reemplaza el `<input type="date">` nativo, cuyo popup lo dibuja el sistema
 * operativo/navegador y no se puede restylear: desentona con el resto del
 * lenguaje visual (`rounded-card`, tokens de color de marca). Se calcula acá
 * mismo con CSS (sin portal ni libreria de fechas nueva) porque el proyecto
 * no trae `react-day-picker`/`dayjs` y esto no justifica una dependencia.
 *
 * Contrato de datos: entra y sale `YYYY-MM-DD` (mismo formato que ya
 * entregaba el input nativo), para no tocar el resto de la cadena que arma
 * el ISO completo antes de mandarlo al backend.
 */

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useId, useRef, useState, type ReactElement } from 'react';
import { Calendar as IconoCalendario, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/cn';

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;

const formatoMesAno = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' });
const formatoLegible = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
/** Etiqueta completa y sin ambiguedad por dia — evita colisiones con el relleno de dias del mes vecino que muestra el mismo numero. */
const formatoDiaCompleto = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export interface DatePickerProps {
  label: string;
  /** `YYYY-MM-DD`, igual que el `value` de un `<input type="date">`. */
  value: string;
  onChange: (valor: string) => void;
  /** Deshabilita dias antes de hoy: no tiene sentido comprometerse a una fecha objetivo pasada. */
  soloFuturo?: boolean;
  hint?: string | undefined;
  disabled?: boolean;
}

function aClaveFecha(fecha: Date): string {
  const ano = String(fecha.getFullYear());
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function parsearClave(clave: string): Date | null {
  const [ano, mes, dia] = clave.split('-').map(Number);
  if (ano === undefined || mes === undefined || dia === undefined) return null;
  const fecha = new Date(ano, mes - 1, dia);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function inicioDeHoy(): Date {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return hoy;
}

/** Celdas del mes visible, incluyendo relleno de dias del mes anterior/siguiente para completar semanas (lunes primero). */
function construirGrilla(mesVisible: Date): { fecha: Date; delMes: boolean }[] {
  const primerDia = new Date(mesVisible.getFullYear(), mesVisible.getMonth(), 1);
  const ultimoDia = new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 0);

  // `getDay()` es 0=domingo; se convierte a offset lunes-primero (0=lunes).
  const offsetInicio = (primerDia.getDay() + 6) % 7;

  const celdas: { fecha: Date; delMes: boolean }[] = [];

  for (let i = offsetInicio; i > 0; i -= 1) {
    const fecha = new Date(primerDia);
    fecha.setDate(fecha.getDate() - i);
    celdas.push({ fecha, delMes: false });
  }

  for (let dia = 1; dia <= ultimoDia.getDate(); dia += 1) {
    celdas.push({ fecha: new Date(mesVisible.getFullYear(), mesVisible.getMonth(), dia), delMes: true });
  }

  while (celdas.length % 7 !== 0) {
    const anterior = celdas[celdas.length - 1]?.fecha ?? ultimoDia;
    const fecha = new Date(anterior);
    fecha.setDate(fecha.getDate() + 1);
    celdas.push({ fecha, delMes: false });
  }

  return celdas;
}

export function DatePicker({
  label,
  value,
  onChange,
  soloFuturo = false,
  hint,
  disabled = false,
}: DatePickerProps): ReactElement {
  const id = useId();
  const contenedorRef = useRef<HTMLDivElement | null>(null);
  const reducirMovimiento = useReducedMotion() ?? false;

  const seleccionada = value.length > 0 ? parsearClave(value) : null;
  const [abierto, setAbierto] = useState(false);
  const [mesVisible, setMesVisible] = useState(() => seleccionada ?? inicioDeHoy());

  const hoy = inicioDeHoy();
  const minimo = soloFuturo ? hoy : null;

  useEffect(() => {
    if (!abierto) return;

    function alClickAfuera(evento: MouseEvent): void {
      if (contenedorRef.current !== null && !contenedorRef.current.contains(evento.target as Node)) {
        setAbierto(false);
      }
    }

    function alEscape(evento: KeyboardEvent): void {
      if (evento.key === 'Escape') setAbierto(false);
    }

    document.addEventListener('mousedown', alClickAfuera);
    document.addEventListener('keydown', alEscape);
    return () => {
      document.removeEventListener('mousedown', alClickAfuera);
      document.removeEventListener('keydown', alEscape);
    };
  }, [abierto]);

  function abrir(): void {
    if (disabled) return;
    setMesVisible(seleccionada ?? hoy);
    setAbierto(true);
  }

  function elegir(fecha: Date): void {
    if (minimo !== null && fecha < minimo) return;
    onChange(aClaveFecha(fecha));
    setAbierto(false);
  }

  const celdas = construirGrilla(mesVisible);
  const tituloMes = formatoMesAno.format(mesVisible);

  return (
    <div className="flex flex-col gap-1.5" ref={contenedorRef}>
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
      </label>

      <div className="relative">
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={abierto}
          onClick={abrir}
          className={cn(
            'focus-ring flex w-full items-center gap-2 rounded-field border border-border bg-surface px-3 py-2',
            'text-left text-sm text-text disabled:cursor-not-allowed disabled:opacity-60',
          )}
        >
          <IconoCalendario aria-hidden="true" className="size-4 shrink-0 text-text-muted" />
          <span className={cn(seleccionada === null && 'text-text-subtle')}>
            {seleccionada !== null ? formatoLegible.format(seleccionada) : 'Elige una fecha'}
          </span>
        </button>

        <AnimatePresence>
          {abierto && (
            <motion.div
              role="dialog"
              aria-label={`Elegir ${label.toLowerCase()}`}
              initial={reducirMovimiento ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
              className={cn(
                'absolute top-full z-30 mt-2 w-72 rounded-card border border-border bg-surface p-3 shadow-pop',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  aria-label="Mes anterior"
                  onClick={() => {
                    setMesVisible(new Date(mesVisible.getFullYear(), mesVisible.getMonth() - 1, 1));
                  }}
                  className="focus-ring inline-flex size-8 items-center justify-center rounded-field text-text-muted hover:bg-surface-3 hover:text-text"
                >
                  <ChevronLeft aria-hidden="true" className="size-4" />
                </button>

                <p className="text-sm font-semibold text-text capitalize">{tituloMes}</p>

                <button
                  type="button"
                  aria-label="Mes siguiente"
                  onClick={() => {
                    setMesVisible(new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 1));
                  }}
                  className="focus-ring inline-flex size-8 items-center justify-center rounded-field text-text-muted hover:bg-surface-3 hover:text-text"
                >
                  <ChevronRight aria-hidden="true" className="size-4" />
                </button>
              </div>

              <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs text-text-subtle">
                {DIAS_SEMANA.map((letra) => (
                  <span key={letra} aria-hidden="true">
                    {letra}
                  </span>
                ))}
              </div>

              <div className="mt-1 grid grid-cols-7 gap-1">
                {celdas.map(({ fecha, delMes }) => {
                  const clave = aClaveFecha(fecha);
                  const esSeleccionado = seleccionada !== null && aClaveFecha(seleccionada) === clave;
                  const esHoy = aClaveFecha(hoy) === clave;
                  const deshabilitado = minimo !== null && fecha < minimo;

                  return (
                    <button
                      key={clave}
                      type="button"
                      disabled={deshabilitado}
                      aria-current={esHoy ? 'date' : undefined}
                      aria-pressed={esSeleccionado}
                      aria-label={formatoDiaCompleto.format(fecha)}
                      onClick={() => {
                        elegir(fecha);
                      }}
                      className={cn(
                        'focus-ring flex size-9 items-center justify-center rounded-field text-sm',
                        !delMes && 'text-text-subtle',
                        delMes && !esSeleccionado && 'text-text hover:bg-surface-3',
                        esSeleccionado && 'bg-accent-600 font-semibold text-white hover:bg-accent-600',
                        !esSeleccionado && esHoy && 'ring-1 ring-inset ring-accent-500',
                        deshabilitado && 'cursor-not-allowed opacity-40 hover:bg-transparent',
                      )}
                    >
                      {fecha.getDate()}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {hint !== undefined && (
        <p className="text-xs text-text-muted">{hint}</p>
      )}
    </div>
  );
}
