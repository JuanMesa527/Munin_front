/**
 * 404. Siempre ofrece una salida: una pantalla sin salida es una demo muerta.
 */

import type { ReactElement } from 'react';
import { Link } from 'react-router';

export function NotFoundPage(): ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-console-paper px-4 font-display text-console-ink">
      <div className="max-w-[440px] text-center">
        <p className="mb-3 font-mono text-[12px] font-bold tracking-[0.16em] text-console-signal-text uppercase">
          Error 404
        </p>
        <h1 className="mb-3 text-[32px] leading-none font-bold tracking-[-0.03em]">
          Esta página no existe
        </h1>
        <p className="mb-7 text-[15px] text-console-body">
          Revisa el enlace o vuelve al inicio.
        </p>
        <Link
          to="/"
          className="focus-ring inline-block rounded-full bg-console-ink px-6 py-3.5 text-[15px] font-bold text-console-signal transition-colors hover:bg-console-ink-3"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
