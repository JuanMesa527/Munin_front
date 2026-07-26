# Munin · Frontend

Experiencia de cliente (chat autogestionado) y de closer (consola comercial) — **Hackathon Colsubsidio × 30X, Reto Vivienda**.

React 19 + Vite 8 + TypeScript + Tailwind 4 + Motion, sobre **Feature-Sliced Design**: seis features que solo se hablan por su `index.ts` y por el contrato compartido con el backend.

> Contexto del producto y tesis glass-box: [`../README.md`](../README.md) · Cómo se lee cada número en pantalla: [`../Docs/glass-box-scoring.md`](../Docs/glass-box-scoring.md)

---

## Arranque

```bash
npm install
cp .env.example .env.local
npm run dev
```

**http://localhost:5173**. El proxy de Vite manda `/api` al backend en el puerto 3000, así que en desarrollo todo es **mismo origen** y la cookie de sesión viaja sin CORS de por medio.

**Sin backend también corre:** con `VITE_DEMO_MODE=true` la consola del closer se alimenta de `src/shared/demo` (6 leads ficticios). Sirve para trabajar la UI cuando el motor está caído — no para demostrar el producto.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Vite con HMR |
| `npm run build` · `preview` | Build de producción y previsualización |
| `npm test` · `test:watch` | Vitest + happy-dom — **107 tests en 19 archivos** |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm run lint` · `lint:fix` | ESLint |
| **`npm run verify`** | **typecheck + lint + test + build — corré esto antes de cada PR** |

---

## Rutas

| Ruta | Qué | Auth |
| --- | --- | --- |
| `/` | Portada: dos puertas, cada una en el registro visual de su destino | Sin login |
| `/cliente` | Flujo del cliente: F1 chat → F2.1 baraja o F2.2 nutrición según carril | Sin login |
| `/politica-de-datos` | Aviso de tratamiento de datos — destino del `ConsentNotice` | Sin login |
| `/closer/login` | Login del comercial | — |
| `/closer` | **F3** · cola priorizada de leads viables | Closer |
| `/closer/leads/:leadId` | **F4** · ficha de llamada + **F5** simulador por voz | Closer |

El **switch de carril** vive en `src/app/routes/client-flow.page.tsx`, no dentro de las features. Por eso F1, F2.1 y F2.2 se desarrollan en paralelo sin conocerse entre sí.

Las rutas del closer van con `lazy` + `Suspense`: el bundle del cliente no carga la consola.

---

## Arquitectura

```
src/
  features/
    lead-intake/        F1 · chat estilo WhatsApp        → LeadIntakeScreen
    lead-enrichment/    F2.1 · baraja de proyectos       → LeadEnrichmentScreen
    lead-education/     F2.2 · nutrición gamificada+OTP  → LeadEducationScreen
    closer-dashboard/   F3 · cola + login                → CloserDashboardPage
    closer-briefing/    F4 · ficha de llamada            → CloserBriefingPage
    call-simulation/    F5 · overlay de llamada simulada → CallOverlay
  shared/
    contracts.ts        copia sincronizada del backend — NO editar a mano
    ui/                 design system (24 primitivos)
    api/                http client, query keys
    auth/               sesión del closer
    lib/                formatters (COP, SMMLV, fechas), lectura de afinidad
    config/             lectura única de import.meta.env
    demo/               seed local para VITE_DEMO_MODE
  app/
    routes/ providers/ shell/ ui/
  styles/index.css      Tailwind 4 CSS-first: @theme con los tokens
  main.tsx
```

**Tres capas dentro de cada feature**, y la separación importa:

| Capa | Responsabilidad | Regla |
| --- | --- | --- |
| `ui/` | Presentacional | Recibe props, no sabe de red |
| `model/` | Estado y lógica de pantalla | Hooks, reducers, derivaciones |
| `api/` | I/O contra el backend | Único lugar que hace fetch |
| `index.ts` | **Única superficie pública** | Nadie importa por dentro de otra feature |

**Estado del servidor: TanStack Query.** No hay store global de estado remoto — las claves viven centralizadas en `shared/api/query-keys.ts` para que invalidar sea explícito y no un `refetch()` suelto.

---

## Contrato compartido

`src/shared/contracts.ts` es una **copia sincronizada** del backend. No se edita acá: se cambia en `Munin_back/src/shared/contracts.ts` y se corre `npm run contracts:sync` allá. El backend tiene un `contracts:check` que falla el `verify` si los dos archivos divergen.

De ahí salen los tipos **y** las rutas (`API_ROUTES`): el frontend nunca escribe una URL a mano.

---

## Design system

`shared/ui` trae 24 primitivos, incluidos los de consola y los de chat:

`button` `card` `badge` `alert` `modal` `field` `date-picker` `tooltip` `stat` `progress-bar` `skeleton` `spinner` `empty-state` `page-header` · **chat:** `chat-bubble` `quick-replies` `typing-indicator` · **glass-box:** `factor-bars` `score-dial` `score-gauge` `consent-notice` `console-header` `console-badges`

Tailwind 4 en modo **CSS-first**: los tokens (color, radio, sombra, tipografía) se declaran con `@theme` en `styles/index.css`, no en un `tailwind.config.js`. Cambiar la paleta es tocar un solo archivo.

Los dos carriles tienen registro visual distinto a propósito: **blanco/amarillo** para el cliente, **papel crema/tinta** para la consola. No es decoración — le dice al usuario en qué producto está parado.

---

## Cómo se muestran los números

Esta parte es el producto, no un detalle de UI. `shared/lib/afinidad.ts` es el **único** lugar que decide cómo se lee un porcentaje de afinidad, para que las tres pantallas que lo muestran (baraja F2.1, cola F3, ficha F4) digan exactamente lo mismo.

Un porcentaje nunca aparece solo si no se lo ganó:

| Confianza | Cómo se muestra |
| --- | --- |
| ≥ 0.9 | El número solo |
| entre 0 y 0.9 | Número + **"parcial"** + qué dato falta |
| 0 | Número + **"sin calcular"** + *"sirve para ordenar la lista, no para decidir"* |

Y si el proyecto no cabe en la capacidad estimada, **se dice**, aunque conserve 81 % de afinidad. Cuando *no sabemos* si alcanza, no se advierte nada: "no sabemos" no autoriza a insinuar que no.

---

## Seguridad en el cliente

- **`VITE_*` es PÚBLICO.** Queda incrustado en el bundle. Ninguna API key ni secreto acá, jamás — viven solo en el backend. Solo hay dos variables: `VITE_API_BASE_URL` y `VITE_DEMO_MODE`.
- **El token no va en `localStorage`.** La sesión es una cookie `httpOnly` que el JS no puede leer, a propósito: con un XSS, cualquier token en storage se va con el atacante.
- **`CloserGuard` es UX, no seguridad.** La autorización real la impone el backend en cada request. Un 401 o un 403 **siempre** ganan sobre el modo demo.
- **Los montos llegan normalizados.** `formatCOP` / `formatCOPCompact` solo formatean: el frontend **nunca** multiplica ni divide por 1000.

---

## Deploy

SPA estática → Vercel o Netlify. Build `npm run build`, output `dist/`.

- **Rewrite de SPA obligatorio:** todas las rutas a `/index.html`, o `/closer/leads/abc` da 404 al recargar.
  Vercel: `{"rewrites":[{"source":"/(.*)","destination":"/index.html"}]}`
- `VITE_API_BASE_URL` = URL pública del backend, **con HTTPS** (la cookie va `Secure` en producción).
- Dominios distintos ⇒ cookie cross-site: el backend necesita ese origen exacto en `CORS_ORIGINS`. **Si el login anda en local y no en producción, empezá a mirar por acá.**
- **Fijá `VITE_DEMO_MODE=false` explícitamente** en el build de producción. No lo dejes al default.

## Las cinco cosas que se olvidan

1. **`shared/ui` primero.** Antes de crear un botón, mirá si ya existe. Cinco botones distintos en cinco features es exactamente como se ve una demo de hackathon.
2. **`contracts.ts` no se edita acá.** Se cambia en el backend y se sincroniza.
3. **La UI dice "estimado", nunca "aprobado".** No prometemos subsidio ni crédito: es un límite legal, no una preferencia de copy.
4. **Un número sin contexto miente.** Si mostrás una afinidad, mostrá también su confianza y lo que falta. Para eso existe `leerAfinidad`.
5. **`index.ts` es la frontera.** Importar por dentro de otra feature funciona hoy y rompe el aislamiento mañana.
