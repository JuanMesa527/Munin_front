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
import { Alert, PageHeader } from '@shared/ui';

const FINALIDADES = [
  {
    titulo: 'Perfilamiento de vivienda',
    detalle: 'Perfilar tu capacidad de compra para recomendarte proyectos de vivienda que sí te sirvan.',
  },
  {
    titulo: 'Contacto comercial',
    detalle: 'Que un asesor te contacte por WhatsApp o teléfono para acompañarte en el proceso.',
  },
  {
    titulo: 'Educación financiera',
    detalle: 'Enviarte contenido y metas de educación financiera para acercarte a la compra.',
  },
] as const;

export function PrivacyPolicyPage(): ReactElement {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-4 sm:p-6">
      <Alert tone="warning" title="Esto es una demo">
        Esta página es una divulgación informativa de una demo de hackathon, no es un aviso legal
        vigente de Colsubsidio.
      </Alert>

      <PageHeader
        eyebrow="Habeas data — Ley 1581 de 2012"
        title="Política de tratamiento de datos"
        description="Qué hacemos con tu información, para qué, y qué derechos tienes sobre ella."
      />

      <section aria-labelledby="finalidades-titulo" className="flex flex-col gap-3">
        <h2 id="finalidades-titulo" className="text-lg font-semibold text-text">
          ¿Para qué usamos tus datos?
        </h2>
        <ul className="flex flex-col gap-2">
          {FINALIDADES.map((finalidad) => (
            <li key={finalidad.titulo} className="rounded-card border border-border p-3 text-sm">
              <p className="font-medium text-text">{finalidad.titulo}</p>
              <p className="mt-1 text-text-muted">{finalidad.detalle}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="derechos-titulo" className="flex flex-col gap-3">
        <h2 id="derechos-titulo" className="text-lg font-semibold text-text">
          Tus derechos como titular
        </h2>
        <ul className="flex flex-col gap-1.5 text-sm text-text-muted">
          <li>
            <strong className="font-medium text-text">Conocer</strong> qué datos tuyos tenemos.
          </li>
          <li>
            <strong className="font-medium text-text">Actualizar</strong> tus datos cuando cambien.
          </li>
          <li>
            <strong className="font-medium text-text">Rectificar</strong> datos que estén
            incompletos o sean inexactos.
          </li>
          <li>
            <strong className="font-medium text-text">Suprimir</strong> tus datos —{' '}
            <span className="text-text">
              en esta demo la eliminación aún no está automatizada: si pides que borremos tu
              información, la solicitud se atiende manualmente, no con un botón de autogestión.
            </span>
          </li>
          <li>
            <strong className="font-medium text-text">Revocar</strong> esta autorización en
            cualquier momento.
          </li>
        </ul>
      </section>

      <section aria-labelledby="no-pedimos-titulo" className="rounded-card bg-surface-3 p-3">
        <h2 id="no-pedimos-titulo" className="text-sm font-semibold text-text">
          Qué NO te pedimos
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Ni cédula real, ni número de cuenta, ni documentos. Tampoco consultamos centrales de
          riesgo (DataCrédito ni similares): tu capacidad se estima solo con lo que tú nos
          cuentas en el chat.
        </p>
      </section>

      <section aria-labelledby="ia-titulo" className="flex flex-col gap-2">
        <h2 id="ia-titulo" className="text-sm font-semibold text-text">
          Procesamiento con inteligencia artificial
        </h2>
        <p className="text-sm text-text-muted">
          Las respuestas de texto libre que escribes en el chat pueden ser procesadas por un
          proveedor externo de inteligencia artificial ubicado fuera de Colombia, únicamente para
          entender tu respuesta y redactar la conversación. La decisión de viabilidad, el puntaje
          y el enrutamiento <strong className="font-medium text-text">nunca</strong> los toma ese
          proveedor: son cálculos determinísticos de nuestro backend.
        </p>
      </section>

      <p className="text-xs text-text-subtle">
        Versión de este documento: v1.0-2026-07. Ante cualquier duda sobre tus datos, puedes
        volver al chat y usar la opción de revocar tu autorización.
      </p>
    </main>
  );
}
