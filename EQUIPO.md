# EQUIPO.md — Perfilador de Leads de Vivienda · Frontend

> **Hackathon Colsubsidio × 30X · Reto Vivienda** · 22–26 jul 2026, Bogotá
> Documento vivo del equipo. Si algo aquí está desactualizado, **arréglalo en el mismo PR**.
> El repo del backend tiene su propio `EQUIPO.md`; las secciones 1–4 y 7–9 son idénticas.

---

## 1. Qué estamos construyendo

**Un perfilador que hace que el lead se perfile solo antes de llegar al comercial.**

Hoy los leads de pauta pagada llegan crudos al asesor: sin perfilar, sin capacidad validada,
muchos no afiliados o sin poder de compra. El asesor pierde horas persiguiendo leads que no
cierran. Nosotros hacemos que al asesor **solo le lleguen leads viables y listos para cerrar**,
y que **los no viables no se descarten, sino que se nutran**.

**El objetivo es ganar.** Hay un solo podio para los 4 retos y las soluciones ganadoras por
reto pasan a evaluación de producto de Colsubsidio. O sea: **Colsubsidio es el usuario real
que va a aplicar e invertir en esto.** Todo lo que construyamos tiene que ser algo que una
caja de compensación pueda implementar de verdad (ver §8).

### Por qué elegimos Vivienda

Es el **único reto con datos de resultado real etiquetado**: 4.142 compradores de los últimos
3–4 años con **fecha de desistimiento** (quién se cayó). Eso nos permite **calibrar el scoring
contra conversiones reales** en vez de inventar heurísticas. Ningún otro reto puede decir eso.

### Rúbrica — optimizamos en este orden

| Peso | Criterio | Dónde se gana |
|---|---|---|
| **30%** | Perfilamiento (calidad de la clasificación) | F1 · scoring calibrado + glass-box |
| **20%** | Reducción de ruido al comercial | F3 · dashboard solo con viables, ordenado por cierre |
| **20%** | Innovación / escalabilidad | Arquitectura desacoplada + slide de integración |
| **15%** | Lead nutrible (no descartar al no viable) | F2.2 · nutrición gamificada con SFV |
| **15%** | UX (sin sentirse un interrogatorio; autogestionado) | F1 chat + F2.2 progreso |

**Dos de los cinco criterios se juegan en este repo.** El 15% de UX y buena parte del 20% de
reducción de ruido dependen de que estas pantallas se sostengan solas.

### Principio glass-box — la regla dura del proyecto

> **La lógica decide; el LLM solo parsea y redacta.**

El scoring, la validación de capacidad y el enrutamiento son **funciones deterministas y
explicables** que viven en el backend. **Prohibida cualquier caja negra: cada clasificación debe
poder explicarse con sus factores y pesos.**

**Qué significa esto para el frontend:** `<FactorBars />` no es un adorno, es la **prueba
visual** del principio. Cuando la UI muestra un score, tiene que poder mostrar **por qué**.
Si recibes un `ScoreResult` sin `factores`, eso es un bug del backend — repórtalo, no lo pintes
igual.

### Restricciones del reto

- **Autogestionado:** un jurado desconocido debe recorrer el flujo **solo**, sin que lo guiemos.
  **Este es el requisito más duro para nosotros.** Si una pantalla necesita que alguien diga
  "ahora dale acá", la pantalla está mal.
- **Regla 90/10:** por regulación, ~90% de las ventas de vivienda de la caja deben ir a
  **afiliados** → la afiliación es el primer discriminante y se ve en la UI.
- **Fuera de alcance (todo se mockea):** CRM real, DataCrédito real, aprobación de crédito,
  promesa de compraventa, documentos legales.
- **Canal:** WhatsApp es el canal nombrado, pero lo **mockeamos con una UI estilo WhatsApp en
  web** con URL pública. **No integramos la WhatsApp Business API real** (trampa de tiempo).
  El look de WhatsApp es **solo presentación**: ni un import de una librería de WhatsApp.

---

## 2. El flujo

```
                 ┌──────────────── APP CLIENTE (usuario final, SIN login) ─────────────────┐
                 │                                                                          │
   Usuario ─────▶│  F1 · lead-intake                                                        │
                 │  chat WhatsApp → llena LeadProfile → consentimiento + gate afiliado       │
                 │  + capacidad + score + matching                                           │
                 │                                  │                                        │
                 │                      decide carril│                                       │
                 │                ┌─────────────────┴──────────────────┐                     │
                 │           viable│                                    │no viable            │
                 │                 ▼                                    ▼                     │
                 │     F2.1 · lead-enrichment              F2.2 · lead-education (gamificado) │
                 │     expande info + intereses            educa y convierte (SFV + reloj)    │
                 │                 │                                    │ (si progresa→viable)│
                 └─────────────────┼────────────────────────────────────┼────────────────────┘
                                   │ persiste lead viable                │
                                   ▼                                     │
                 ┌──────────────── APP CLOSER (rol closer, CON cuenta) ──┼────────────────────┐
                 │                                                       │                    │
                 │  F3 · closer-dashboard  ◀──── repositorio de leads viables ◀───────────────┘
                 │  lista todos los viables, filtra/prioriza, "llamar"                        │
                 │                 │ al dar "llamar"                                          │
                 │                 ▼                                                          │
                 │  F4 · closer-briefing                                                       │
                 │  ficha técnica del cliente para preparar/acompañar la llamada en vivo       │
                 └─────────────────────────────────────────────────────────────────────────────┘
```

### Ciclo de vida de un lead

1. **F1 – Intake.** El usuario entra al chat. Primero **acepta el tratamiento de datos**
   (requisito legal, no es un paso opcional). Se llena el `LeadProfile` y se decide
   `carril: 'viable' | 'no_viable'`.
2. **Si viable → F2.1 – Enrichment.** Se expande toda la info posible del cliente y sus
   intereses. Se persiste como **lead viable** → aparece en el dashboard del closer.
3. **Si no viable → F2.2 – Education.** Módulo gamificado de educación y conversión
   (plan SFV + reloj de meses + metas). Si progresa, **se reclasifica a viable**.
4. **F3 – Closer dashboard.** El closer (con cuenta) ve todos los leads viables y contacta
   uno a uno.
5. **F4 – Closer briefing.** Al dar "llamar", se abre la ficha técnica para preparar y
   acompañar la llamada en vivo.

### Roles y acceso — el mapa de rutas

| Rol | Rutas | Auth |
|---|---|---|
| **Usuario final** | `/` (F1 → F2.1 / F2.2), `/politica-de-datos` | **Sin login** (autogestionado) |
| **Closer** | `/closer/login`, `/closer` (F3), `/closer/leads/:leadId` (F4) | **Con cuenta** (cookie `httpOnly`) |

**El switch de carril vive en `src/app/routes/client-flow.page.tsx`, no dentro de las features.**
Eso es lo que permite que F1, F2.1 y F2.2 se desarrollen en paralelo sin conocerse.

---

## 3. Features y dueños

Cada feature es un **vertical slice**. **Un dev = una feature.**

| # | Feature | Componente de entrada | Rol | Dueño |
|---|---|---|---|---|
| **F1** | `lead-intake` | `LeadIntakeScreen` | usuario final | _(asignar)_ |
| **F2.1** | `lead-enrichment` | `LeadEnrichmentScreen` | usuario final (viable) | _(asignar)_ |
| **F2.2** | `lead-education` | `LeadEducationScreen` | usuario final (no viable) | _(asignar)_ |
| **F3** | `closer-dashboard` | `CloserDashboardPage`, `CloserLoginPage` | closer | _(asignar)_ |
| **F4** | `closer-briefing` | `CloserBriefingPage` | closer | _(asignar)_ |
| — | `shared/ui` + `app/` | design system, routing, providers | — | _(asignar)_ |

> **Llena la columna "Dueño" antes de empezar a codear.** Dos personas en la misma feature es
> la forma más rápida de perder una hora en conflictos de merge.

### Qué tiene que lograr cada pantalla

**F1 · `lead-intake`** — La primera pantalla que ve el jurado; tiene que sostenerse sola.
Chat estilo WhatsApp: header con avatar y "en línea", burbujas con cola, timestamps, indicador
de escritura, chips de respuesta rápida, **barra de progreso del perfilamiento** (clave para
que no se sienta un interrogatorio). El **primer paso es el `ConsentNotice`**: sin aceptar, no
avanza. **Regla UX:** máx. ~5–6 preguntas, opciones tappables + texto libre.

**F2.1 · `lead-enrichment`** — Sigue conversacional pero más ligero y celebratorio: el usuario
acaba de saber que es viable. Chips multi-selección para intereses, zona, timing, motivación.
Cierra con un resumen **"esto es lo que sabemos de ti" editable** — da control al usuario y es
buena práctica de habeas data (el titular puede rectificar).

**F2.2 · `lead-education`** — **La pantalla más visual y nuestro diferenciador competitivo.**
El mensaje emocional es *"todavía no, pero aquí está tu camino"*, **nunca "no calificas"**.
Anillo de progreso, tarjeta del plan SFV (precio objetivo, subsidio, gap, meses), timeline de
metas, badges desbloqueables, contenido educativo (qué es VIS, qué es el SFV, cómo aplicar).

**F3 · `closer-dashboard`** — Cambio de registro total: herramienta de trabajo densa, no
experiencia de consumo. Aquí se demuestra la reducción de ruido. `Stat` de resumen, gráfico,
filtros, orden, y lista de leads con `ScoreGauge`, badge de afiliado, badge "viene de
nutrición" y botón "Llamar" prominente.

**F4 · `closer-briefing`** — Se mira **durante una llamada en vivo**, con el cliente al
teléfono: densa pero **escaneable en 3 segundos**. Quién es / capacidad y afiliación /
proyectos afines con su razón / `FactorBars` del score / intereses / mejor horario / talking
points / controles de llamada mock.

---

## 4. Cómo se comunican las features

**Solo por `src/shared/contracts.ts` y por la API pública de cada feature (`index.ts`).
Nunca importando internals de otra feature.**

```
✅ import type { LeadProfile } from '@contracts';
✅ import { LeadIntakeScreen } from '@features/lead-intake';
✅ import { Button, ChatBubble, FactorBars } from '@shared/ui';
❌ import { ChatShell } from '@features/lead-intake/ui/chat-shell';   // ESLint lo bloquea
```

**ESLint hace cumplir esto, no solo lo sugiere.** Si tu import falla el lint con un mensaje que
cita una regla de este documento, **el import está mal, no la regla**.

### `contracts.ts` es la fuente de verdad — y vive en el backend

`src/shared/contracts.ts` de este repo es una **copia sincronizada**. La fuente de verdad es
`perfilador-vivienda-backend/src/shared/contracts.ts`.

> ⚠️ **Nunca edites `src/shared/contracts.ts` de este repo.** Se sobrescribe.
> Si necesitas un cambio: hazlo en el backend, corre `npm run contracts:sync` allá, y
> **anúncialo al equipo** — un cambio de contrato rompe a todos.

Las **adendas al contrato original del brief** están documentadas con su justificación en la
cabecera de `contracts.ts`. Léela una vez antes de empezar.

### No inventes URLs

Usa siempre `API_ROUTES` de `@contracts`:

```ts
import { API_ROUTES } from '@contracts';
await apiPost<ConversationTurn>(API_ROUTES.intake.turn, body);   // ✅
await apiPost('/api/leads/intake/turn', body);                    // ❌
```

---

## 5. Estructura del repo (frontend)

Feature-Sliced. Cada feature expone su API pública por `index.ts`.

```
src/
  features/
    lead-intake/         # F1 · chat estilo WhatsApp
      ui/                # componentes (presentacionales, datos por props)
      model/             # estado, hooks, fixtures de demo
      api/              # llamadas al backend usando API_ROUTES
      index.ts           # ← ÚNICA superficie pública de la feature
    lead-enrichment/     # F2.1
    lead-education/      # F2.2 (gamificado)
    closer-dashboard/    # F3 (+ login)
    closer-briefing/     # F4 · ficha técnica
  shared/
    contracts.ts         # copia sincronizada — NO editar
    ui/                  # design system + primitivos de chat WhatsApp
    api/                 # http client, query keys
    lib/                 # cn, formatters (money, SMMLV, fechas, máscaras)
    auth/                # useCloserSession + CloserGuard
    config/              # env (recuerda: VITE_* es público)
  app/
    routes/              # / (cliente) · /closer/* (protegido) · /politica-de-datos
    providers/           # QueryClient, ErrorBoundary, MotionConfig
    App.tsx
  styles/index.css       # Tailwind v4 CSS-first: @theme con los tokens
  main.tsx
```

### Reglas del design system

- **No dupliques primitivos.** Si te falta uno, agrégalo a `shared/ui` (y avisa) o resuélvelo
  localmente con un `// PROPUESTA AL EQUIPO:`. Cinco botones distintos en cinco features es
  exactamente cómo se ve una demo de hackathon.
- **Tokens, no valores mágicos.** Los colores salen del `@theme` de `styles/index.css`. Nada de
  `#25D366` suelto en un componente.
- **Light y dark.** Las variables semánticas (`--color-surface`, `--color-text`, …) ya lo
  manejan. No hardcodees colores absolutos.
- **Accesibilidad AA no es opcional:** contraste, foco visible, `aria-label` en iconos, orden de
  tabulación sensato, modal que atrapa el foco y cierra con `Escape`. El jurado puede navegar
  con teclado.
- **Toda animación respeta `prefers-reduced-motion`.** `MotionConfig` está en
  `reducedMotion: 'user'`; no lo pises.

### Formateo de dinero — leer esto una vez

```ts
formatCOP(523_620_000)         // "$523.620.000"
formatCOPCompact(523_620_000)  // "$523,6 M"
```

**Los montos llegan del backend YA normalizados, en pesos enteros.** El frontend **nunca**
multiplica ni divide por 1000 (ver §7, trampa 1). Si un monto se ve raro en pantalla, el bug
está en el pipeline de datos, no en el formatter.

---

## 6. Instalar, correr, desplegar

### Requisitos
Node **≥ 22**, npm ≥ 10. El backend corriendo en `http://localhost:3000` para datos reales
(sin él, cada feature tiene sus `fixtures.ts` y las pantallas se ven igual).

### Arranque
```bash
npm install
cp .env.example .env.local
npm run dev
```
Levanta en `http://localhost:5173`. El proxy de Vite manda `/api` al backend en el puerto 3000,
así que en dev todo es **mismo origen** y la cookie `httpOnly` del closer viaja bien.

### Comandos
| Comando | Qué hace |
|---|---|
| `npm run dev` | Vite con HMR |
| `npm run build` / `preview` | Build de producción y previsualización local |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm run lint` / `lint:fix` | ESLint (hace cumplir las reglas de este documento) |
| `npm test` / `test:watch` | Vitest + happy-dom |
| **`npm run verify`** | **typecheck + lint + test + build. Corre esto antes de cada PR.** |

### Deploy
SPA estática → Vercel o Netlify.
1. Build command `npm run build`, output `dist`.
2. **Rewrite de SPA obligatorio:** todas las rutas a `/index.html`, o `/closer/leads/abc` da 404
   al recargar. En Vercel: `{"rewrites":[{"source":"/(.*)","destination":"/index.html"}]}`.
3. `VITE_API_BASE_URL` = URL pública del backend, **con HTTPS**. En producción la cookie de
   sesión va `Secure`, así que sin HTTPS el login del closer no funciona.
4. Backend y frontend en dominios distintos ⇒ la cookie es **cross-site**: el backend necesita
   ese origen en `CORS_ORIGINS` y `credentials: true`. Si el login funciona en local y no en
   producción, **empieza a mirar por aquí**.

> **Ten la URL viva en la primera hora.** Un deploy roto a las 11 de la noche es la forma
> clásica de perder una hackathon con el producto ya terminado.

---

## 7. Trampas de datos y datos del reto

### Insumos
- **Base de compradores (Excel):** 4.142 compradores anonimizados, **sin cédulas**. Trae
  proyecto/etapa, fecha de opción, **fecha de desistimiento** (vacía = compra vigente), entidad
  financiera, medio por el que se enteró, valor de vivienda, afiliado sí/no, segmento, rango
  salarial, personas a cargo, empresa/pirámide, marca 'foco'.
- **Buyer personas por proyecto (PPT)** y **brochure** de proyectos con mapa 360.

### ⚠️ Trampa 1 — el valor de vivienda trae ceros de más
`523.620` significa **~523 millones**. **Se normaliza UNA sola vez, en el pipeline de
`analysis/` del backend.** Todo lo que cruza `contracts.ts` ya viene en **pesos enteros**
(`type COP`). **El frontend solo formatea.**

### ⚠️ Trampa 2 — el estrato está incompleto
Los porcentajes de estrato **no suman 100%**. **No se usa como variable dura del score**, así
que **no lo muestres como un factor de decisión** en la UI. Si un revisor pregunta "¿y el
estrato?", esa es una respuesta que nos da puntos.

### Target del scoring
```
target = compró Y fecha_desistimiento vacía   (compra vigente)
```
Calibrado sobre los 4.142 reales. Cuando la UI diga "según compradores reales de Colsubsidio",
está diciendo la verdad — y ese es nuestro flex.

---

## 8. Marco legal y qué puede (y no puede) hacer Colsubsidio

> **Esto no es letra chica: es el filtro de viabilidad de la solución.** Colsubsidio es una
> caja de compensación familiar **Vigilada Supersubsidio**. Si una funcionalidad no es
> implementable por una caja, no sirve que sea brillante.
>
> Nosotros diseñamos **dentro** de estos lineamientos; la validación jurídica final es de
> Colsubsidio, no nuestra. Cuando algo quede en zona gris, **anótalo y pregunta** en vez de
> asumir.

### Leyes que nos aplican

| Norma | Qué exige | Cómo lo cumplimos |
|---|---|---|
| **Ley 1581 de 2012** (habeas data) + **Decreto 1377 de 2013** | Consentimiento **previo, expreso e informado**. Finalidades explícitas. Derechos del titular: conocer, actualizar, rectificar, suprimir y **revocar**. | `ConsentNotice` es el **primer paso** del chat y un gate real. Ruta `/politica-de-datos` con las finalidades y los derechos — sin ella el consentimiento no es "informado". El resumen editable de F2.1 materializa el derecho de rectificación. |
| **Ley 1266 de 2008** (habeas data financiero) | Consultar centrales de riesgo exige autorización previa y expresa. | **No consultamos ninguna.** La UI dice **"capacidad estimada"**, nunca "capacidad verificada". |
| **Ley 21 de 1982** y **Ley 920 de 2004** | Las cajas sirven a **afiliados**; crédito social y planes de vivienda son para afiliados. | Fundamenta la **regla 90/10**: la afiliación es el primer discriminante y se ve en la UI. |
| **Subsidio Familiar de Vivienda (SFV)** | Aporte de la caja a hogares con ingresos **≤ 4 SMMLV**. | Es la palanca de F2.2. `TOPE_SFV_SMMLV = 4` en `contracts.ts`. |
| **Vigilancia de la SIC** | Las bases de datos personales pueden requerir registro en el **RNBD**. | Requisito de integración a producto: va en el slide, no se simula. |

### 🚫 Prohibiciones duras — no negociables, en ningún PR

- **Nada de PII real, ni en fixtures.** Nombres claramente ficticios, teléfonos siempre
  enmascarados (`+57 3•• ••• ••42`). Nunca uses tu número real ni el de un compañero para
  probar.
- **Nunca cédulas.** Ni como campo, ni como placeholder, ni de ejemplo.
- **Prohibido scrapear datos a partir de cédulas.** Es exactamente lo que la Ley 1581 prohíbe.
- **La UI dice "estimado", nunca "aprobado".** No prometemos subsidio ni crédito: prometer un
  subsidio que no se otorga es un riesgo reputacional y legal para la caja. Revisa tus textos.
- **El teléfono llega enmascarado.** Revelarlo es una acción explícita del closer que el backend
  **audita**. La UI debe avisar que la acción queda registrada — es una feature de confianza, no
  un detalle.
- **No guardes datos del lead en `localStorage`/`sessionStorage`.** Ni el perfil, ni la sesión.
- **Sin analytics de terceros ni fuentes/CDN externos** en la demo: mandan datos del titular a
  un tercero sin que esté en las finalidades consentidas.
- **El aviso de privacidad de la demo dice que es una demo.** No publicamos un documento que se
  lea como un aviso legal vigente de Colsubsidio: no somos Colsubsidio.
- **No usamos el logo ni la identidad oficial de Colsubsidio** como si fuera un producto suyo
  aprobado. Inspiración de marca sí; suplantación no.

### Qué SÍ puede hacer Colsubsidio (y por eso lo construimos)

Otorgar el SFV a afiliados que califiquen · ofrecer crédito social y ahorro programado a
afiliados · comercializar sus propios proyectos de vivienda · hacer educación financiera y
acompañamiento · perfilar y contactar leads **con consentimiento** · vender a no afiliados
**dentro del margen de la regla 90/10**.

### Qué NO puede hacer (y por eso lo dejamos fuera)

Operar como banco pleno ni sustituir el análisis de riesgo de la entidad financiera · consultar
centrales de riesgo sin autorización expresa · tratar datos sin consentimiento · ignorar el
margen 90/10 · discriminar en el acceso a sus servicios.

> **Regla práctica:** antes de agregar una funcionalidad, pregúntate *"¿podría Colsubsidio
> encender esto el lunes sin llamar a un abogado?"* Si la respuesta es no, va al slide de
> "qué necesitamos de Colsubsidio", no al código.

---

## 9. Reglas de iteración y construcción con IA

**Obligatorias para cualquier código, humano o generado por IA.** ESLint hace cumplir varias
automáticamente.

### Clean Architecture (reglas duras)

1. **Regla de dependencia:** las dependencias apuntan **hacia adentro**.
   `app/` → `features/` → `shared/`. **Nunca al revés:** `shared/` no importa de `features/`, y
   una feature no importa de `app/`.
2. **Capas dentro de la feature:** `ui/` es presentación, `model/` es estado y lógica de vista,
   `api/` es I/O. `ui/` no llama `fetch` directo; pasa por `api/` a través de `model/`.
3. **Puertos y adaptadores:** todo I/O va por `shared/api/http-client`. Ningún componente hace
   `fetch` a mano.
4. **Aislamiento de features:** una feature **no importa internals de otra**. Solo `index.ts`.
5. **Nada de lógica de negocio en componentes.** El score, la capacidad y el carril los decide
   el **backend**. Si te ves calculando si un lead es viable en un `.tsx`, para: eso rompe el
   glass-box y duplica la fuente de verdad.

### Clean Code

6. **Componentes pequeños,** una responsabilidad. Si un `.tsx` pasa de ~150 líneas, probablemente
   son dos componentes.
7. **Nombres con intención:** identificadores en inglés; términos del dominio en español cuando
   son el lenguaje ubicuo (`afiliado`, `subsidio`, `segmento`, `carril`).
8. **Tipado estricto:** `strict: true`, **prohibido `any`**, prohibido `@ts-ignore`. Props
   explícitas, nada de `props: any`.
9. **Sin código muerto**, sin comentarios que narran lo obvio. **Comenta el *porqué*.**
10. **Tests de lo que puede romperse en silencio:** formatters de dinero, máscaras, y el switch
    de carril. Son deterministas y son justo lo que un jurado va a ver primero.
11. **Estados de carga, vacío y error en toda pantalla que pida datos.** `Skeleton`,
    `EmptyState` y `Alert` ya existen en `shared/ui`. Una pantalla que se queda en blanco
    mientras carga es una pantalla que el jurado va a ver rota.

### Seguridad — OWASP, siempre

12. **El guard de ruta es UX, NO seguridad.** `CloserGuard` mejora la experiencia; la
    autorización real la impone el backend **en cada request** (**A01**). Nunca esconder un
    botón es un control de acceso.
13. **Nunca guardes tokens de sesión en `localStorage` o `sessionStorage`** (**A07**). La sesión
    del closer vive en una cookie `httpOnly` que el JS **no puede leer** — eso es a propósito:
    un XSS no se lleva la sesión. `apiGet`/`apiPost` ya mandan `credentials: 'include'`.
14. **Trata la respuesta del backend como entrada no confiable.** Valida forma antes de asumir
    campos; usa la envoltura `ApiResponse<T>` y maneja la rama `ok: false`.
15. **Nunca `dangerouslySetInnerHTML`** con contenido que venga del backend o del usuario
    (**A03**, XSS). Si de verdad necesitas HTML, discútelo con el equipo primero.
16. **Secretos: `VITE_*` es PÚBLICO.** Todo lo que empiece por `VITE_` queda incrustado en el
    bundle y cualquiera lo lee con "ver código fuente". **Ninguna API key, ningún secreto,
    ninguna llave de LLM en este repo, jamás** (**A05**). Los secretos viven solo en el backend.
17. **No expongas errores internos al usuario.** El `ErrorBoundary` muestra un mensaje amable;
    los detalles van a la consola, no a la pantalla (**A09**).
18. **Minimización de datos:** no pintes en pantalla más datos personales de los necesarios
    para la tarea. En F4 el teléfono va enmascarado hasta que el closer lo revele explícitamente.
19. **Dependencias:** no metas una librería por una función de 10 líneas (**A06**), y nada de
    scripts o fuentes desde CDN externo. Si agregas una dependencia, dilo en el PR.

### Reglas específicas del proyecto

20. **Glass-box, no caja negra:** el scoring y el enrutamiento son deterministas y del backend.
    El LLM **solo** parsea texto libre y redacta el "por qué". **Prohibido que un modelo tome la
    decisión.**
21. **Explicabilidad obligatoria:** si muestras un score, muestra sus factores. `FactorBars` es
    la prueba visual del principio. Si no se puede explicar, **no se muestra**.
22. **Cada texto de UI que hable de dinero, subsidio o capacidad se revisa dos veces.** "Estimado"
    vs. "aprobado" es la diferencia entre una demo defendible y un problema legal.
23. **Desacople del canal:** el look de WhatsApp es **presentación**. Cero dependencias de
    WhatsApp, cero lógica que asuma ese canal. Mañana esto es un widget web o un IVR.
24. **Datos:** los montos llegan normalizados (no los toques); **no muestres estrato** como
    factor de decisión; **nunca** cédulas ni PII.

### Trabajando con IA (Claude Code y asistentes)

25. **Respeta el límite de tu feature.** La IA solo modifica la carpeta de la feature en la que
    estás trabajando. Cambios a `shared/ui` o a `contracts.ts` se **marcan y anuncian**: rompen
    a todos.
26. **No inventar el contrato.** Si falta un dato en `LeadProfile`/`EnrichedLead`, propón el
    cambio en el backend. Nada de campos silenciosos ni de `as unknown as` para forzarlo.
27. **Stubs primero, lógica después.** Firmas tipadas con
    `throw new Error('TODO: not implemented')`, no implementaciones a medias que parecen listas.
28. **Revisa lo que genera la IA con los ojos de esta lista.** Los modelos generan código que
    compila y olvidan que `VITE_*` es público, que el token no va en `localStorage`, que el
    estrato no se usa y que la UI dice "estimado". **El código generado que viole §8 o §9 no
    entra**, por bonito que se vea.
29. **Pídele el *porqué*, no solo el código.** Si no puedes explicar en una frase por qué un
    bloque generado hace lo que hace, todavía no está listo para mergear.
30. **La IA no juzga el diseño; el jurado sí.** Abre la pantalla en el navegador, en móvil y en
    dark mode antes de decir que está lista.

### Git

31. Ramas por feature: `feat/lead-intake`, `feat/closer-dashboard`, …
32. Commits convencionales: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
33. **`main` siempre desplegable.** Corre `npm run verify` antes de abrir el PR.
34. No comitees `.env.local`, `node_modules/` ni `dist/`. El `.gitignore` ya los cubre.

---

## 10. Roadmap del día (referencia)

| Hora | Qué |
|---|---|
| 0–1h | Análisis offline · scaffolding · **deploy con URL viva ya** |
| 1–4h | F1 intake (conversación + scoring conectado) |
| 3–6h | F2.1 enrichment + F2.2 education + persistencia de viables |
| 4–7h | F3 dashboard + F4 ficha técnica |
| 6–8h | Pulir UI WhatsApp, señales de confianza, 3 personas semilla |
| 8–9h | **Test autogestionado: que lo maneje alguien que no lo construyó** |
| 9–10h | 5 slides (Problema → Solución → Demo → Impacto → **Integración a producto**) + ensayo |

**Roles sugeridos:** 1 data/análisis · 2 front/UX · 1 backend/motor · 1 pitch + QA.

### La prueba que de verdad importa

A las 8 horas, **siéntale el producto a alguien que no lo construyó y no digas una palabra.**
Si tiene que preguntar "¿y ahora qué hago?", eso es exactamente lo que va a pasar con el jurado.
Esta prueba vale más que la última hora de pulido de CSS.
