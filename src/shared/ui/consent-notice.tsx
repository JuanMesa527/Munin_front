/**
 * ConsentNotice - gate legal de habeas data (capa shared).
 *
 * Es el PRIMER paso de la conversacion, antes de cualquier pregunta de
 * perfilamiento: la Ley 1581 de 2012 (y el Decreto 1377 de 2013) exigen
 * autorizacion previa, expresa e informada. "Informada" es la parte que casi
 * siempre se incumple, y por eso este componente enumera las finalidades una
 * por una, dice que NO se recoge, y enlaza la politica completa.
 *
 * El componente es presentacional: no guarda nada. Quien lo usa construye el
 * `ConsentRecord` y lo manda a `POST /api/leads/intake/consent`, que es el
 * unico lugar donde queda la evidencia.
 */

import { ExternalLink, ShieldCheck } from 'lucide-react';
import type { FinalidadTratamiento } from '@contracts';
import { useId, type ReactElement } from 'react';
import { cn } from '../lib/cn';
import { Button } from './button';

/**
 * Version del texto que el titular acepta. Debe quedar guardada junto al
 * consentimiento para poder demostrar QUE se acepto.
 * PROPUESTA AL EQUIPO: cuando el backend exponga la version vigente de la
 * politica, pasarla por prop y borrar este default.
 */
export const POLITICA_VERSION_DEFECTO = 'v1.0-2026-07';

export const RUTA_POLITICA = '/politica-de-datos';

const FINALIDADES_POR_DEFECTO: readonly FinalidadTratamiento[] = [
  'perfilamiento_vivienda',
  'contacto_comercial',
  'educacion_financiera',
];

const TEXTO_FINALIDAD: Record<FinalidadTratamiento, string> = {
  perfilamiento_vivienda:
    'Perfilar tu capacidad de compra para recomendarte proyectos de vivienda que sí te sirvan.',
  contacto_comercial:
    'Que un asesor te contacte por WhatsApp o teléfono para acompañarte en el proceso.',
  educacion_financiera:
    'Enviarte contenido y metas de educación financiera para acercarte a la compra.',
};

export interface ConsentNoticeProps {
  aceptado: boolean;
  onChange: (aceptado: boolean) => void;
  /** Finalidades que se autorizan. Deben ser explicitas y acotadas. */
  finalidades?: readonly FinalidadTratamiento[] | undefined;
  versionPolitica?: string | undefined;
  /** Si se pasa, se pinta el boton de continuar (bloqueado hasta aceptar). */
  onContinue?: (() => void) | undefined;
  continueLabel?: string | undefined;
  disabled?: boolean;
  className?: string | undefined;
}

export function ConsentNotice({
  aceptado,
  onChange,
  finalidades = FINALIDADES_POR_DEFECTO,
  versionPolitica = POLITICA_VERSION_DEFECTO,
  onContinue,
  continueLabel = 'Acepto y continúo',
  disabled = false,
  className,
}: ConsentNoticeProps): ReactElement {
  const idBase = useId();
  const idFinalidades = `${idBase}-finalidades`;
  const idCheckbox = `${idBase}-check`;

  return (
    <section
      aria-labelledby={`${idBase}-titulo`}
      className={cn(
        'flex flex-col gap-4 rounded-card border border-brand-200 bg-surface p-4 shadow-card dark:border-brand-800',
        className,
      )}
    >
      <header className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
        >
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <h2 id={`${idBase}-titulo`} className="text-base font-semibold text-text">
            Antes de empezar: tus datos
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Para perfilarte necesitamos tu autorización. Así lo exige la Ley 1581 de 2012 de
            protección de datos personales, y así queremos hacerlo.
          </p>
        </div>
      </header>

      <div>
        <p className="text-sm font-medium text-text">¿Para qué vamos a usar tus datos?</p>
        <ul id={idFinalidades} className="mt-2 flex flex-col gap-1.5">
          {finalidades.map((finalidad) => (
            <li key={finalidad} className="flex gap-2 text-sm text-text-muted">
              <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" />
              {TEXTO_FINALIDAD[finalidad]}
            </li>
          ))}
        </ul>
      </div>

      {/* Diferenciador real y verificable del producto: la minimizacion de datos
          es un requisito del reto, no un adorno. */}
      <div className="rounded-field bg-surface-3 p-3 text-sm text-text-muted">
        <p className="font-medium text-text">Qué NO te vamos a pedir</p>
        <p className="mt-1">
          Ni cédula, ni número de cuenta, ni documentos. Tampoco consultamos centrales de riesgo:
          tu capacidad se estima con lo que tú nos cuentas.
        </p>
      </div>

      <p className="text-sm text-text-muted">
        Como titular puedes <strong className="font-medium text-text">conocer, actualizar,
        rectificar y suprimir</strong> tus datos, y revocar esta autorización en cualquier momento.{' '}
        <a
          href={RUTA_POLITICA}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring inline-flex items-center gap-1 rounded-sm font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
        >
          Leer la política de tratamiento de datos
          <ExternalLink aria-hidden="true" className="size-3.5" />
          <span className="sr-only">(se abre en una pestaña nueva)</span>
        </a>
      </p>

      <div className="flex flex-col gap-3 border-t border-border pt-3">
        <div className="flex items-start gap-3">
          <input
            id={idCheckbox}
            type="checkbox"
            checked={aceptado}
            disabled={disabled}
            aria-describedby={idFinalidades}
            onChange={(evento) => {
              onChange(evento.currentTarget.checked);
            }}
            className="focus-ring mt-0.5 size-5 shrink-0 rounded-sm accent-brand-600 dark:accent-brand-400"
          />
          <label htmlFor={idCheckbox} className="text-sm text-text">
            Autorizo el tratamiento de mis datos personales para las finalidades descritas.
          </label>
        </div>

        <p className="text-[0.6875rem] text-text-subtle">
          Versión de la política: {versionPolitica}. Guardamos la fecha y el canal de tu
          autorización como evidencia; no guardamos tu dirección IP.
        </p>

        {onContinue !== undefined && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!aceptado || disabled}
            onClick={onContinue}
          >
            {continueLabel}
          </Button>
        )}
      </div>
    </section>
  );
}
