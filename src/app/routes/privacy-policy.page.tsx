/**
 * Pagina de politica de tratamiento de datos (capa app) — tasks.md 4.4.
 *
 * Existe para que el consentimiento de `ConsentNotice` sea realmente
 * "informado" (Ley 1581 de 2012): sin esta pagina el enlace de la primera
 * pantalla del chat da 404 y el consentimiento pedido ahi no es valido.
 *
 * Alcance deliberadamente minimo (proposal.md, no-goals): esto NO es un aviso
 * legal vigente de Colsubsidio, es una divulgacion honesta de demo de
 * hackathon. El texto legal completo queda fuera de alcance.
 */

import type { ReactElement } from 'react';
import { ArrowLeft } from 'lucide-react';

const FINALIDADES = [
  {
    titulo: 'Perfilamiento de vivienda',
    detalle:
      'Perfilar tu capacidad de compra para recomendarte proyectos de vivienda que sí te sirvan.',
  },
  {
    titulo: 'Contacto comercial',
    detalle:
      'Que un asesor te contacte por WhatsApp o teléfono para acompañarte en el proceso.',
  },
  {
    titulo: 'Educación financiera',
    detalle:
      'Enviarte contenido y metas de educación financiera para acercarte a la compra.',
  },
] as const;

const DERECHOS = [
  {
    titulo: 'Conocer',
    detalle: 'qué datos tuyos tenemos.',
  },
  {
    titulo: 'Actualizar',
    detalle: 'tus datos cuando cambien.',
  },
  {
    titulo: 'Rectificar',
    detalle: 'datos incompletos o inexactos.',
  },
  {
    titulo: 'Revocar',
    detalle: 'esta autorización en cualquier momento.',
  },
] as const;

export function PrivacyPolicyPage(): ReactElement {
  return (
    <div className="min-h-dvh bg-surface-3">
      <div aria-hidden="true" className="h-1 w-full bg-brand" />

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-5 sm:gap-5 sm:px-6 sm:py-6">
        <header className="animate-rise flex flex-wrap items-center gap-x-4 gap-y-3 rounded-card border border-border bg-surface px-4 py-3 shadow-card sm:px-5">
          {/*
            Logo oficial de Colsubsidio. No lo cambies sin confirmar con producto.
          */}
          <img
            src="/colsubsidio-logo.png"
            alt="Colsubsidio"
            className="h-7 w-auto"
            width={146}
            height={28}
          />
          <span aria-hidden="true" className="hidden h-8 w-px bg-border sm:block" />
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[0.625rem] tracking-widest text-text-subtle uppercase">
              Habeas data · Ley 1581 de 2012
            </p>
            <h1 className="font-display text-lg font-bold tracking-tight text-text sm:text-xl">
              Política de tratamiento de datos
            </h1>
            <p className="mt-0.5 text-sm leading-snug text-text-muted">
              Qué hacemos con tu información, para qué, y qué derechos tienes.
            </p>
          </div>
          <a
            href="/cliente"
            className="focus-ring inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-muted hover:bg-surface-3 hover:text-text"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            Volver al chat
          </a>
        </header>

        <div className="animate-rise grid gap-4 rounded-card border border-border bg-surface p-4 shadow-card sm:p-5 md:grid-cols-2 md:gap-5">
          <section aria-labelledby="finalidades-titulo">
            <h2
              id="finalidades-titulo"
              className="font-display text-sm font-bold text-text"
            >
              ¿Para qué usamos tus datos?
            </h2>
            <ul className="mt-2 flex flex-col gap-2">
              {FINALIDADES.map((finalidad) => (
                <li key={finalidad.titulo} className="flex gap-2 text-sm leading-snug">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand"
                  />
                  <span>
                    <strong className="font-semibold text-text">{finalidad.titulo}.</strong>{' '}
                    <span className="text-text-muted">{finalidad.detalle}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="derechos-titulo">
            <h2 id="derechos-titulo" className="font-display text-sm font-bold text-text">
              Tus derechos como titular
            </h2>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm leading-snug text-text-muted">
              {DERECHOS.map((derecho) => (
                <li key={derecho.titulo}>
                  <strong className="font-semibold text-text">{derecho.titulo}</strong>{' '}
                  {derecho.detalle}
                </li>
              ))}
              <li>
                <strong className="font-semibold text-text">Suprimir</strong> tus datos — la
                eliminación aún no está automatizada: si pides que borremos tu
                información, la solicitud se atiende manualmente.
              </li>
            </ul>
          </section>

          <section
            aria-labelledby="no-pedimos-titulo"
            className="rounded-field border border-border bg-surface-3 px-3.5 py-3"
          >
            <h2 id="no-pedimos-titulo" className="font-display text-sm font-bold text-text">
              Qué NO te pedimos
            </h2>
            <p className="mt-1 text-sm leading-snug text-text-muted">
              Ni cédula real, ni número de cuenta, ni documentos. Tampoco consultamos centrales
              de riesgo (DataCrédito ni similares): tu capacidad se estima solo con lo que tú
              nos cuentas en el chat.
            </p>
          </section>

          <section aria-labelledby="ia-titulo" className="rounded-field bg-brand-50 px-3.5 py-3">
            <h2 id="ia-titulo" className="font-display text-sm font-bold text-text">
              Procesamiento con inteligencia artificial
            </h2>
            <p className="mt-1 text-sm leading-snug text-text-muted">
              Las respuestas de texto libre pueden ser procesadas por un proveedor externo de IA
              fuera de Colombia, solo para entender y redactar la conversación. La viabilidad, el
              puntaje y el enrutamiento{' '}
              <strong className="font-semibold text-text">nunca</strong> los toma ese proveedor:
              son cálculos determinísticos de nuestro backend.
            </p>
          </section>
        </div>

        <p className="text-center text-[0.6875rem] text-text-subtle">
          Versión v1.0-2026-07 · Ante dudas, vuelve al chat y revoca tu autorización.
        </p>
      </main>
    </div>
  );
}
