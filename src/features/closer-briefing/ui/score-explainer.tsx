/**
 * "Por qué este score" (F4) — la prueba visual del principio glass-box.
 *
 * Es el bloque mas importante de la ficha y el argumento central del proyecto:
 * el score NO es una caja negra. Cada factor muestra su intensidad, su peso en el
 * modelo y su aporte con signo, y el rotulo dice contra que se calibro. Si algun
 * dia llega un `ScoreResult` sin `factores`, esta tarjeta tiene que verse rota:
 * eso es intencional, porque un score sin explicacion no se muestra (regla 21).
 */

import type { CSSProperties, ReactElement } from 'react';
import type { Factor, ScoreResult } from '@contracts';
import { CardEyebrow } from './briefing-card';

/** Mismos cortes que el anillo de score: la UI no inventa su propia escala. */
function colorDe(intensidad: number): string {
  if (intensidad >= 70) return 'text-console-signal';
  if (intensidad >= 40) return 'text-console-signal-dim';
  return 'text-console-red';
}

function rellenoDe(intensidad: number): string {
  if (intensidad >= 70) return 'bg-console-signal';
  if (intensidad >= 40) return 'bg-console-signal-dim';
  return 'bg-console-red';
}

/** `+25` / `0` / `-4`. El signo importa: muestra que factores restan. */
function formatearAporte(contribucion: number): string {
  return contribucion > 0 ? `+${String(contribucion)}` : String(contribucion);
}

function anchoDe(intensidad: number): CSSProperties {
  return { width: `${String(Math.max(0, Math.min(100, intensidad)))}%` };
}

interface FilaProps {
  factor: Factor;
}

function FilaFactor({ factor }: FilaProps): ReactElement {
  return (
    <li>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[15px] font-bold">{factor.nombre}</span>
        <span className={`font-mono text-[12px] font-bold ${colorDe(factor.intensidad)}`}>
          {formatearAporte(factor.contribucion)}
        </span>
      </div>

      <div className="mb-[7px] h-2.5 overflow-hidden rounded-full bg-console-body">
        <div
          className={`h-full rounded-full ${rellenoDe(factor.intensidad)}`}
          style={anchoDe(factor.intensidad)}
        />
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] text-console-mute">{factor.valor}</span>
        <span className="font-mono text-[11px] whitespace-nowrap text-console-mute">
          PESO {factor.peso}%
        </span>
      </div>
    </li>
  );
}

export interface ScoreExplainerProps {
  score: ScoreResult | null;
  resumen: string;
}

export function ScoreExplainer({ score, resumen }: ScoreExplainerProps): ReactElement {
  return (
    <section className="rounded-[20px] bg-console-ink p-[26px] text-console-paper">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-4">
        <CardEyebrow tone="signal">Por qué este score</CardEyebrow>
        <span className="font-mono text-[10px] tracking-[0.08em] text-console-mute">
          CALIBRADO · 4.142 COMPRAS REALES
        </span>
      </div>

      <p className="mt-3 mb-[22px] text-[14px] leading-[1.5] text-console-edge">{resumen}</p>

      {score === null || score.factores.length === 0 ? (
        <p className="text-[14px] font-bold text-console-red">
          Sin factores para explicar este score. No se muestra un score que no se puede sustentar.
        </p>
      ) : (
        <ul className="flex min-w-0 list-none flex-col gap-[18px]">
          {score.factores.map((factor) => (
            <FilaFactor key={factor.nombre} factor={factor} />
          ))}
        </ul>
      )}
    </section>
  );
}
