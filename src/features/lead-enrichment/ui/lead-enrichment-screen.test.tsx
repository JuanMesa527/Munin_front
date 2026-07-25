/**
 * Tests de la pantalla de F2.1.
 *
 * Se cubren las cosas que pueden romperse EN SILENCIO y que ademas duelen:
 *  - que un precio estimado se muestre sin rotular (riesgo legal, seccion 8);
 *  - que la razon del match desaparezca de la tarjeta (glass-box, regla 21);
 *  - que el gesto sea la unica via de decidir (accesibilidad);
 *  - que los estados de carga y error queden sin pintar (regla 11).
 *
 * La API se dobla en el borde (`../api/enrichment.api`), no en `fetch`: es la
 * frontera real de la feature.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EnrichmentDeck, ProjectCard, ProjectMatchCard } from '@contracts';
import { LeadEnrichmentScreen } from './lead-enrichment-screen';

const fetchDeck = vi.fn();
const postSwipe = vi.fn();
const postSummary = vi.fn();

vi.mock('../api/enrichment.api', () => ({
  TARJETAS_POR_BARAJA: 12,
  fetchDeck: (leadId: string) => fetchDeck(leadId) as unknown,
  postSwipe: (leadId: string, proyectoId: string, accion: string) =>
    postSwipe(leadId, proyectoId, accion) as unknown,
  postSummary: (leadId: string) => postSummary(leadId) as unknown,
}));

function ficha(id: string, estimado: boolean): ProjectCard {
  return {
    proyectoId: id,
    nombre: `Proyecto ${id}`,
    ubicacion: 'Sector Prueba',
    ciudad: 'Bogota',
    zona: 'centro',
    esVIS: true,
    descripcion: 'Ficticio.',
    unidades: 100,
    torres: 2,
    pisos: '6 pisos',
    areaDesde: 45,
    areaHasta: null,
    habitacionesDesde: 2,
    habitacionesHasta: 2,
    tipologias: [
      {
        nombre: 'A',
        areaConstruida: 45,
        areaPrivada: 40,
        habitaciones: 2,
        banos: 1,
        precioSMMLV: estimado ? null : 150,
      },
    ],
    amenidades: ['Gimnasio'],
    lugaresCercanos: ['Estacion'],
    entrega: null,
    certificacionEdge: false,
    salaDeVentas: null,
    brochureUrl: 'https://example.com/b.html',
    imagen: `/proyectos/${id}.webp`,
    precio: {
      desde: 200_000_000,
      hasta: 240_000_000,
      esEstimado: estimado,
      metodo: estimado ? 'Estimado desde el tope VIS de 150 SMMLV.' : 'Precio publicado.',
    },
  };
}

function tarjeta(id: string, estimado = true): ProjectMatchCard {
  return {
    ficha: ficha(id, estimado),
    match: {
      proyectoId: id,
      similitud: 0.87,
      razon: 'Te lo mostramos porque cabe en tu techo estimado y queda en Bogota.',
    },
    factores: [
      {
        nombre: 'Capacidad estimada',
        peso: 0.4,
        valor: 'cabe en tu techo estimado',
        contribucion: 40,
      },
    ],
    cabeEnCapacidad: true,
  };
}

function deck(tarjetas: ProjectMatchCard[]): EnrichmentDeck {
  return {
    leadId: 'demo-lead',
    tarjetas,
    catalogoVersion: '1.0.0',
    generadoEn: '2026-07-25T10:00:00.000Z',
  };
}

function renderPantalla(): void {
  const cliente = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={cliente}>
      <LeadEnrichmentScreen leadId="demo-lead" />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  postSwipe.mockResolvedValue({
    decididas: 1,
    intentScore: 20,
    ultimo: { proyectoId: 'a', accion: 'like', decididoEn: '2026-07-25T10:00:00.000Z' },
  });
});

describe('LeadEnrichmentScreen', () => {
  it('rotula el precio como ESTIMADO: es obligacion legal, no decoracion', async () => {
    fetchDeck.mockResolvedValue(deck([tarjeta('a')]));
    renderPantalla();

    expect(await screen.findByText('Precio estimado')).toBeTruthy();
  });

  it('no rotula como estimado un precio que si publica el constructor', async () => {
    fetchDeck.mockResolvedValue(deck([tarjeta('a', false)]));
    renderPantalla();

    expect(await screen.findByText('Precio publicado')).toBeTruthy();
    expect(screen.queryByText('Precio estimado')).toBeNull();
  });

  it('muestra la razon del match en la tarjeta (glass-box, regla 21)', async () => {
    fetchDeck.mockResolvedValue(deck([tarjeta('a')]));
    renderPantalla();

    expect(
      await screen.findByText(/Te lo mostramos porque cabe en tu techo estimado/u),
    ).toBeTruthy();
  });

  it('se puede decidir sin arrastrar: el gesto no es la unica via', async () => {
    fetchDeck.mockResolvedValue(deck([tarjeta('a'), tarjeta('b')]));
    renderPantalla();

    const like = await screen.findByRole('button', { name: /Me sirve/u });
    like.click();

    await waitFor(() => {
      expect(postSwipe).toHaveBeenCalledWith('demo-lead', 'a', 'like');
    });
  });

  it('ofrece las tres decisiones con su atajo de teclado en el nombre accesible', async () => {
    fetchDeck.mockResolvedValue(deck([tarjeta('a')]));
    renderPantalla();

    expect(await screen.findByRole('button', { name: /No me sirve \(tecla ←\)/u })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Me encanta \(tecla ↑\)/u })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Me sirve \(tecla →\)/u })).toBeTruthy();
  });

  it('pinta un error entendible en vez de quedarse en blanco', async () => {
    fetchDeck.mockRejectedValue(new Error('No hay datos calibrados disponibles'));
    renderPantalla();

    expect(await screen.findByText('No pudimos cargar los proyectos')).toBeTruthy();
    expect(screen.getByText('No hay datos calibrados disponibles')).toBeTruthy();
  });

  it('al agotar la baraja ofrece cerrar, no deja al usuario sin salida', async () => {
    fetchDeck.mockResolvedValue(deck([tarjeta('a')]));
    renderPantalla();

    (await screen.findByRole('button', { name: /Me sirve \(tecla →\)/u })).click();

    expect(await screen.findByText('Ya viste todos los proyectos')).toBeTruthy();
  });

  it('el detalle del proyecto activo esta siempre en pantalla', async () => {
    fetchDeck.mockResolvedValue(deck([tarjeta('a')]));
    renderPantalla();

    // El panel de escritorio muestra secciones que la tarjeta no tiene.
    expect(await screen.findByText('Tipologias')).toBeTruthy();
    expect(screen.getByText('Por que te lo mostramos')).toBeTruthy();
  });

  it('NINGUN control vive dentro de la tarjeta arrastrable', async () => {
    fetchDeck.mockResolvedValue(deck([tarjeta('a')]));
    renderPantalla();

    // Motion captura el puntero mientras hay `drag`, asi que un boton dentro
    // de la superficie arrastrable no dispara su click en un navegador real:
    // se ve exactamente como un boton roto. happy-dom NO reproduce el pointer
    // capture, asi que un test de click pasaria en verde y el bug seguiria
    // vivo. Por eso se afirma sobre la ESTRUCTURA y no sobre el
    // comportamiento.
    await screen.findByRole('button', { name: /Me sirve \(tecla →\)/u });

    const tarjetaArrastrable = document.querySelector('article');
    expect(tarjetaArrastrable).not.toBeNull();
    expect(tarjetaArrastrable?.querySelectorAll('button, a, input, [tabindex]')).toHaveLength(0);
  });
});
