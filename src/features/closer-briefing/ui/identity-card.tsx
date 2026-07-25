/**
 * "Quién es" + revelado del telefono (F4).
 *
 * El telefono llega ENMASCARADO del servidor y solo se destapa cuando el
 * comercial lo pide. El aviso de que la accion queda registrada es deliberado:
 * es una senal de confianza hacia el titular y hacia el auditor, no un detalle
 * legal escondido.
 */

import type { ReactElement } from 'react';
import type { EnrichedLead } from '@contracts';
import { describeSegmento } from '@shared/lib/describe-lead';
import { BriefingCard, CardEyebrow } from './briefing-card';
import { useContactReveal } from '../model/use-contact-reveal';

export interface IdentityCardProps {
  lead: EnrichedLead;
  /** Nombre del comercial en sesion, para el aviso de auditoria. */
  closerName: string;
}

interface Dato {
  readonly k: string;
  readonly v: string;
}

function datosDe(lead: EnrichedLead): Dato[] {
  return [
    { k: 'Edad', v: lead.edad === null ? '—' : `${String(lead.edad)} años` },
    { k: 'Ocupación', v: lead.ocupacion ?? '—' },
    { k: 'Ubicación', v: lead.ciudad ?? '—' },
    { k: 'Hogar', v: lead.hogar ?? '—' },
    {
      k: 'Segmento',
      v: describeSegmento({
        esAfiliado: lead.esAfiliado ?? false,
        segmento: lead.segmento,
        rangoSalarial: lead.rangoSalarial,
      }),
    },
  ];
}

export function IdentityCard({ lead, closerName }: IdentityCardProps): ReactElement {
  const contacto = useContactReveal({
    leadId: lead.id,
    telefonoEnmascarado: lead.identidad?.telefonoEnmascarado ?? '—',
  });

  const nota = contacto.revelado
    ? `Revelado por ${closerName}. Esta acción quedó registrada en la auditoría.`
    : 'Revelar el número es una acción auditada: queda registro de quién y cuándo.';

  return (
    <BriefingCard>
      <CardEyebrow className="mb-4">Quién es</CardEyebrow>

      <dl className="flex flex-col gap-[13px]">
        {datosDe(lead).map((dato) => (
          <div
            key={dato.k}
            className="flex items-baseline justify-between gap-[14px] border-b border-console-track pb-[11px]"
          >
            <dt className="text-[13px] text-console-mute">{dato.k}</dt>
            <dd className="text-right text-[15px] font-bold text-console-ink">{dato.v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-[18px] rounded-[14px] bg-console-paper p-4">
        <div className="mb-2 font-mono text-[10px] font-bold tracking-[0.12em] text-console-mute uppercase">
          Teléfono
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[17px] font-bold text-console-ink">
            {contacto.telefono}
          </span>
          <button
            type="button"
            onClick={contacto.toggle}
            disabled={contacto.cargando}
            aria-pressed={contacto.revelado}
            className="focus-ring cursor-pointer rounded-full border-[1.5px] border-console-ink bg-console-surface px-4 py-[9px] text-[13px] font-bold text-console-ink transition-colors hover:bg-console-ink hover:text-console-signal disabled:cursor-not-allowed disabled:opacity-60"
          >
            {contacto.cargando ? '…' : contacto.revelado ? 'Ocultar' : 'Revelar'}
          </button>
        </div>
        <p className="mt-2.5 text-[12px] leading-[1.45] text-console-mute">{nota}</p>
        {contacto.error !== null && (
          <p role="alert" className="mt-2 text-[12px] font-bold text-console-red-deep">
            {contacto.error}
          </p>
        )}
      </div>
    </BriefingCard>
  );
}
