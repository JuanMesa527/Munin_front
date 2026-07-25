/**
 * RED (tasks.md 4.3): la tabla de rutas monta solo `/` -> `LeadIntakeScreen`
 * y `/politica-de-datos`. Ningun `/closer/*` existe todavia (F3/F4, fuera de
 * alcance de este cambio) — spec `app-bootstrap-front`, escenario
 * "No closer routes exist yet".
 */
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { LeadIntakeScreen } from '@features/lead-intake';
import { routes } from './index';
import { PrivacyPolicyPage } from './privacy-policy.page';

describe('app routes', () => {
  it('define exactamente "/" y "/politica-de-datos", en ese orden', () => {
    expect(routes.map((route) => route.path)).toEqual(['/', '/politica-de-datos']);
  });

  it('"/" renderiza LeadIntakeScreen', () => {
    const root = routes.find((route) => route.path === '/');
    const element = root?.element as ReactElement | null;
    expect(element?.type).toBe(LeadIntakeScreen);
  });

  it('"/politica-de-datos" renderiza PrivacyPolicyPage', () => {
    const politica = routes.find((route) => route.path === '/politica-de-datos');
    const element = politica?.element as ReactElement | null;
    expect(element?.type).toBe(PrivacyPolicyPage);
  });

  it('no define ninguna ruta /closer/* (F3/F4, fuera de alcance)', () => {
    const tieneRutaCloser = routes.some((route) => route.path?.startsWith('/closer') ?? false);
    expect(tieneRutaCloser).toBe(false);
  });
});
