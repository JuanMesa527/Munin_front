# perfilador-vivienda-frontend

Experiencia de cliente (chat) y de closer (dashboard + ficha técnica) —
**Hackathon Colsubsidio × 30X, Reto Vivienda**.

React 19 + Vite 8 + TypeScript + Tailwind 4 + Motion, **Feature-Sliced**. Cinco features
aisladas que solo se hablan por su `index.ts` y por el contrato compartido.

> 📖 **Antes de escribir código, lee [`EQUIPO.md`](./EQUIPO.md).** Tiene el flujo completo, las
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

**Sin backend también se ve todo:** cada feature trae `model/<feature>.fixtures.ts` con datos
ficticios tipados contra el contrato.

## Rutas

| Ruta | Qué | Auth |
|---|---|---|
| `/` | F1 chat → F2.1 enrichment / F2.2 education según carril | **Sin login** |
| `/politica-de-datos` | Aviso de tratamiento de datos (Ley 1581) | Público |
| `/closer/login` | Login del comercial | — |
| `/closer` | F3 dashboard de leads viables | **Closer** |
| `/closer/leads/:leadId` | F4 ficha técnica de la llamada | **Closer** |

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

## Estado actual: scaffolding

**Implementado de verdad:** el design system completo (`shared/ui`), los formatters, el http
client, el guard del closer, el routing por rol, los providers, el aviso de privacidad, y los
componentes visuales de cada feature con sus fixtures.

**Stubs tipados** (`throw new Error('TODO: not implemented')`): los hooks de `model/` y la
lógica de estado de cada feature.

**Cada dev implementa su feature.** Empieza por el `index.ts` y la pantalla de entrada.

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
