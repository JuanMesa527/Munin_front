# perfilador-vivienda-frontend

Experiencia de cliente (chat) y de closer (dashboard + ficha técnica) —
**Hackathon Colsubsidio × 30X, Reto Vivienda**.

React 19 + Vite 8 + TypeScript + Tailwind 4 + Motion, **Feature-Sliced**. Cinco features
aisladas que solo se hablan por su `index.ts` y por el contrato compartido.

> 📖 **Antes de escribir código, lee [`CLAUDE.md`](./CLAUDE.md).** Tiene el flujo completo, las
> reglas de arquitectura y seguridad, los límites legales y qué puede/no puede hacer Colsubsidio.
> No es documentación decorativa: ESLint hace cumplir buena parte de ella.

---

## Arranque en 3 comandos

```bash
npm install
cp .env.example .env.local
npm run dev
```

Levanta en **http://localhost:5173**. El proxy de Vite manda `/api` al backend en el puerto 3000,
así que en dev todo es mismo origen y la cookie de sesión del closer viaja bien.

**Sin backend también funciona:** con `VITE_DEMO_MODE=true` la consola del closer se alimenta de
`src/shared/demo` (6 leads ficticios) y el header muestra "demo · datos simulados".

## Rutas

| Ruta | Qué | Auth | Estado |
|---|---|---|---|
| `/` | F1 chat → F2.1 / F2.2 según carril | **Sin login** | ⬜ portada provisional |
| `/closer/login` | Login del comercial | — | ✅ |
| `/closer` | **F3** · cola de leads viables | **Closer** | ✅ |
| `/closer/leads/:leadId` | **F4** · ficha de la llamada | **Closer** | ✅ |

Prueba rápida: **http://localhost:5173/closer**

El **switch de carril** vive en `src/app/routes/client-flow.page.tsx`, no dentro de las
features: por eso F1, F2.1 y F2.2 se desarrollan en paralelo sin conocerse.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Vite con HMR |
| `npm run build` / `preview` | Build de producción y previsualización |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm run lint` / `lint:fix` | ESLint |
| `npm test` / `test:watch` | Vitest + happy-dom |
| **`npm run verify`** | **typecheck + lint + test + build — corre esto antes de cada PR** |

## Estructura

```
src/
  features/
    lead-intake/           F1 · chat estilo WhatsApp  → LeadIntakeScreen
    lead-enrichment/       F2.1 · expansión de perfil → LeadEnrichmentScreen
    lead-education/        F2.2 · gamificación SFV    → LeadEducationScreen
    closer-dashboard/      F3 · dashboard + login     → CloserDashboardPage
    closer-briefing/       F4 · ficha técnica         → CloserBriefingPage
      ui/ model/ api/ index.ts     # index.ts = ÚNICA superficie pública
  shared/
    contracts.ts         # copia sincronizada del backend — NO editar
    ui/                  # design system + primitivos de chat
    api/ lib/ auth/ config/
  app/
    routes/ providers/ App.tsx
  styles/index.css       # Tailwind v4 CSS-first: @theme con los tokens
  main.tsx
```

## Estado actual

**✅ F3 y F4 implementadas** contra el diseño aprobado (proyecto Claude Design *"F3 y F4
Colsubsidio"*), funcionando de punta a punta: filtros, búsqueda, orden, revelado auditado del
teléfono, cronómetro de llamada y checklist del guion. Se pueden mostrar al jurado ya.

**✅ Listo también:** design system (`shared/ui`, incluidos los primitivos de consola),
formatters, http client, guard del closer, routing por rol, providers y app shell.

**⬜ Pendiente:** F1 `lead-intake`, F2.1 `lead-enrichment`, F2.2 `lead-education`, y la ruta
`/politica-de-datos` (va con F1, porque es el destino del `ConsentNotice`). La ruta `/` es hoy
una portada provisional que explica eso y deja entrar a la consola.

**Cada dev implementa su feature.** Empieza por el `index.ts` y la pantalla de entrada, y usa
F3/F4 como referencia de estructura (`ui/` presentacional, `model/` estado, `api/` I/O).

## Las cinco cosas que se olvidan

1. **`shared/ui` primero.** Antes de crear un botón, mira si ya existe. Cinco botones distintos
   en cinco features es exactamente cómo se ve una demo de hackathon.
2. **`VITE_*` es PÚBLICO.** Queda incrustado en el bundle. **Ninguna API key ni secreto aquí,
   jamás** — viven solo en el backend.
3. **El token no va en `localStorage`.** La sesión del closer es una cookie `httpOnly` que el JS
   no puede leer: eso es a propósito. Y el `CloserGuard` es **UX, no seguridad** — la
   autorización real la impone el backend en cada request.
4. **Los montos llegan normalizados.** `formatCOP` / `formatCOPCompact` solo formatean; el
   frontend **nunca** multiplica ni divide por 1000.
5. **La UI dice "estimado", nunca "aprobado".** No prometemos subsidio ni crédito. Es un límite
   legal, no una preferencia de copy.

## Deploy

SPA estática → Vercel o Netlify. Build `npm run build`, output `dist`.

- **Rewrite de SPA obligatorio:** todas las rutas a `/index.html`, o `/closer/leads/abc` da 404
  al recargar.
  Vercel: `{"rewrites":[{"source":"/(.*)","destination":"/index.html"}]}`
- `VITE_API_BASE_URL` = URL pública del backend, **con HTTPS** (la cookie va `Secure` en
  producción).
- Dominios distintos ⇒ cookie cross-site: el backend necesita ese origen en `CORS_ORIGINS`.
  Si el login funciona en local y no en producción, empieza a mirar por aquí.
