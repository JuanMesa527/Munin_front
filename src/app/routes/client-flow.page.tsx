/**
 * Orquestador del flujo del cliente (`/`).
 *
 * ESTADO ACTUAL: F1 (intake), F2.1 (enrichment) y F2.2 (education) todavia no
 * estan implementadas, asi que esta ruta es una portada honesta que dice que
 * falta y deja entrar a la consola del closer, que si esta lista.
 *
 * CUANDO F1/F2 EXISTAN, aqui va el SWITCH DE CARRIL y en ningun otro lado:
 *
 *   const { profile } = useLeadIntake();
 *   if (profile.carril === null)        return <LeadIntakeScreen />;
 *   if (profile.carril === 'viable')    return <LeadEnrichmentScreen />;
 *   return <LeadEducationScreen />;
 *
 * Vive en `app/` y no dentro de una feature a proposito: es lo que permite que
 * las tres features del cliente se desarrollen en paralelo sin conocerse
 * (regla 4 de aislamiento).
 */

import type { ReactElement } from 'react';
import { Link } from 'react-router';

interface PendienteProps {
  codigo: string;
  nombre: string;
  detalle: string;
}

const PENDIENTES: readonly PendienteProps[] = [
  {
    codigo: 'F1',
    nombre: 'lead-intake',
    detalle: 'Chat estilo WhatsApp que perfila al lead y decide su carril.',
  },
  {
    codigo: 'F2.1',
    nombre: 'lead-enrichment',
    detalle: 'Expande intereses y preferencias del lead viable.',
  },
  {
    codigo: 'F2.2',
    nombre: 'lead-education',
    detalle: 'Nutrición gamificada con plan SFV para el lead no viable.',
  },
];

export function ClientFlowPage(): ReactElement {
  return (
    <div className="min-h-screen bg-console-paper px-4 py-16 font-display text-console-ink sm:px-8">
      <div className="mx-auto max-w-[720px]">
        <p className="mb-2.5 font-mono text-[12px] font-bold tracking-[0.16em] text-console-signal-text uppercase">
          Perfilador de leads de vivienda
        </p>
        <h1 className="mb-4 text-[clamp(2rem,6vw,44px)] leading-none font-bold tracking-[-0.03em]">
          Flujo del cliente en construcción
        </h1>
        <p className="mb-10 max-w-[58ch] text-[16px] text-console-body">
          La experiencia del usuario final todavía no está implementada. La consola del comercial
          (F3 y F4) sí está lista y se puede recorrer completa con datos simulados.
        </p>

        <Link
          to="/closer"
          className="focus-ring mb-12 inline-flex items-center gap-2.5 rounded-full bg-console-signal px-6 py-[14px] text-[15px] font-bold text-console-ink transition-colors hover:bg-console-ink hover:text-console-signal"
        >
          <span aria-hidden="true" className="inline-block size-[9px] rounded-full bg-current" />
          Entrar a la consola del closer
        </Link>

        <ul className="flex list-none flex-col gap-3">
          {PENDIENTES.map((f) => (
            <li
              key={f.codigo}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-2xl border border-console-line bg-console-surface px-5 py-4"
            >
              <span className="font-mono text-[11px] font-bold tracking-[0.12em] text-console-mute uppercase">
                {f.codigo}
              </span>
              <span className="text-[15px] font-bold">{f.nombre}</span>
              <span className="w-full text-[14px] text-console-body sm:w-auto">{f.detalle}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
