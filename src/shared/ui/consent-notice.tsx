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
 *
 * Debe coincidir EXACTO con `PRIVACY_POLICY_VERSION` de `Munin_back/.env`
 * (ver `.env.example`): `SubmitConsentUseCase` compara este valor contra
 * `env.privacyPolicyVersion` y rechaza el consentimiento si no matchean
 * (confirmado en vivo: con el valor viejo, ningun usuario real pasaba de
 * esta pantalla — CONSENT_REQUIRED en el 100% de los intentos).
 * PROPUESTA AL EQUIPO: cuando el backend exponga la version vigente de la
 * politica en la respuesta de `/start`, pasarla por prop y borrar este
 * default hardcodeado — dos strings duplicados en dos repos es fragil.
 */
export const POLITICA_VERSION_DEFECTO = '2026-07-24.v1';

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
        'animate-rise relative flex flex-col overflow-hidden rounded-card border border-border bg-surface shadow-card',
        className,
      )}
    >
      <div aria-hidden="true" className="h-1 w-full bg-brand" />

      <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6">
        {/*
          Logo oficial de Colsubsidio. No lo cambies sin confirmar con producto.
        */}
        <header className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <img
            src="/colsubsidio-logo.png"
            alt="Colsubsidio"
            className="h-7 w-auto"
            width={146}
            height={28}
          />
          <span aria-hidden="true" className="hidden h-8 w-px bg-border sm:block" />
          <div className="flex min-w-0 flex-1 items-start gap-2.5">
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-text"
            >
              <ShieldCheck className="size-4" strokeWidth={2.25} />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[0.625rem] tracking-widest text-text-subtle uppercase">
                Asistente de vivienda
              </p>
              <h2
                id={`${idBase}-titulo`}
                className="font-display text-lg font-bold tracking-tight text-text sm:text-xl"
              >
                Antes de empezar: tus datos
              </h2>
              <p className="mt-1 text-sm leading-snug text-text-muted">
                Para perfilarte necesitamos tu autorización (Ley 1581 de 2012).
              </p>
            </div>
          </div>
        </header>

        {/* Dos columnas en desktop: menos altura, menos scroll */}
        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          <div>
            <p className="font-display text-sm font-bold text-text">
              ¿Para qué vamos a usar tus datos?
            </p>
            <ul id={idFinalidades} className="mt-2 flex flex-col gap-1.5">
              {finalidades.map((finalidad) => (
                <li key={finalidad} className="flex gap-2 text-sm leading-snug text-text-muted">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand"
                  />
                  {TEXTO_FINALIDAD[finalidad]}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-field border border-border bg-surface-3 px-3.5 py-3">
            <p className="font-display text-sm font-bold text-text">Qué NO te vamos a pedir</p>
            <p className="mt-1 text-sm leading-snug text-text-muted">
              Ni cédula, ni número de cuenta, ni documentos. Tampoco consultamos centrales de
              riesgo: tu capacidad se estima con lo que tú nos cuentas.
            </p>
          </div>
        </div>

        <div className="grid gap-2 text-xs leading-snug text-text-muted sm:text-sm md:grid-cols-2 md:gap-4">
          <p>
            Tus respuestas de texto libre pueden ser procesadas por un proveedor externo de
            inteligencia artificial fuera de Colombia, solo para entender y redactar la
            conversación: la decisión sobre tu perfil siempre es de nuestro sistema, nunca del
            proveedor.
          </p>
          <p>
            Como titular puedes{' '}
            <strong className="font-semibold text-text">conocer, actualizar y rectificar</strong>{' '}
            tus datos, <strong className="font-semibold text-text">revocar</strong> esta
            autorización y{' '}
            <strong className="font-semibold text-text">solicitar su supresión</strong> (hoy de
            forma manual).{' '}
            <a
              href={RUTA_POLITICA}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-1 rounded-sm font-semibold text-accent-700 underline underline-offset-2 hover:text-accent-800"
            >
              Leer la política
              <ExternalLink aria-hidden="true" className="size-3.5" />
              <span className="sr-only">(se abre en una pestaña nueva)</span>
            </a>
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-2.5 rounded-field bg-brand-50 px-3 py-2.5">
            <input
              id={idCheckbox}
              type="checkbox"
              checked={aceptado}
              disabled={disabled}
              aria-describedby={idFinalidades}
              onChange={(evento) => {
                onChange(evento.currentTarget.checked);
              }}
              className="focus-ring mt-0.5 size-5 shrink-0 rounded-sm accent-brand-600"
            />
            <label htmlFor={idCheckbox} className="text-sm leading-snug font-medium text-text">
              Autorizo el tratamiento de mis datos personales para las finalidades descritas.
              <span className="mt-0.5 block text-[0.625rem] font-normal text-text-subtle">
                Política {versionPolitica} · no guardamos tu IP
              </span>
            </label>
          </div>

          {onContinue !== undefined && (
            <Button
              variant="primary"
              size="lg"
              disabled={!aceptado || disabled}
              onClick={onContinue}
              className="w-full shrink-0 sm:w-auto sm:min-w-[11rem]"
            >
              {continueLabel}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
