/**
 * Portada (`/`) — puerta de entrada a la demo.
 *
 * Su unico trabajo es que quien llega ELIJA UN ROL y entre. Todo lo demas
 * (que es el producto, con que datos corre, bajo que ley) es contexto para esa
 * decision, no contenido en si mismo.
 *
 * IDEA DE DISENO, y por que no son dos cards iguales:
 * `styles/index.css` declara que el flujo del cliente y la consola del closer
 * tienen registros visuales DELIBERADAMENTE distintos — blanco/amarillo/redondo
 * contra papel crema/tinta/mono. Las dos puertas de esta pagina estan pintadas
 * cada una en el registro de SU destino, con un fragmento real de la UI que hay
 * detras. Quien elige ya vio a donde va: la portada no describe la diferencia,
 * la muestra.
 *
 * La bifurcacion en SVG que baja del hero es la misma idea en una linea: una
 * conversacion que se parte en dos carriles. Es literalmente lo que hace
 * `client-flow.page.tsx` (el "switch de carril"), no un adorno.
 *
 * ACCESIBILIDAD: la aurora y la bifurcacion son `aria-hidden`; el bloque
 * @media de `prefers-reduced-motion` en index.css apaga la deriva, y
 * `<MotionConfig reducedMotion="user">` en app/providers apaga lo de Motion.
 */

import type { ReactElement, ReactNode } from 'react';
import { Link } from 'react-router';
import { motion, type Variants } from 'motion/react';
import { RUTA_POLITICA } from '@shared/ui';
import { AuroraViva } from '@app/ui/aurora-viva';
import { OndaDeClic } from '@app/ui/onda-de-clic';

/** Curva del DS (`--ease-out-soft`). */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const RUTA_CLIENTE = '/cliente';
/**
 * A `/closer` y no a `/closer/login`: si el comercial ya tiene sesion viva
 * entra directo al dashboard, y si no, `CloserGuard` lo manda al login solo.
 */
const RUTA_CLOSER = '/closer';

const NAV = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#roles', label: 'Roles' },
  { href: '#como', label: 'Cómo funciona' },
  { href: '#datos', label: 'Datos' },
] as const;

const contenedor: Variants = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const sube: Variants = {
  oculto: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/** Marcador de la referencia visual del hackaton: mono + triangulo. */
function EtiquetaMono({
  children,
  tono = 'ink',
}: {
  children: ReactNode;
  tono?: 'ink' | 'console';
}): ReactElement {
  return (
    <span
      className={
        tono === 'console'
          ? 'label-mono inline-flex items-center gap-1.5 text-console-mute'
          : 'label-mono inline-flex items-center gap-1.5 text-text-subtle'
      }
    >
      <span aria-hidden="true" className="text-brand-700">
        ▸
      </span>
      {children}
    </span>
  );
}

/* ==========================================================================
 *  Cabecera
 * ========================================================================== */

function Cabecera(): ReactElement {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-surface/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3.5 sm:px-6">
        <a href="#inicio" className="focus-ring flex shrink-0 items-center gap-3 rounded-sm">
          <img
            src="/colsubsidio-logo.png"
            alt="Colsubsidio"
            className="h-6 w-auto"
            width={125}
            height={24}
          />
          <span aria-hidden="true" className="text-xs text-text-subtle">
            ×
          </span>
          <span className="font-display text-base font-bold tracking-[-0.04em] text-text">
            Munin
          </span>
        </a>

        <nav aria-label="Secciones" className="ml-auto hidden items-center gap-6 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="focus-ring label-mono rounded-sm text-text-muted transition-colors hover:text-text"
            >
              <span aria-hidden="true" className="mr-1.5 text-brand-700">
                ▸
              </span>
              {item.label}
            </a>
          ))}
        </nav>

        <Link
          to={RUTA_CLOSER}
          className="focus-ring ml-auto rounded-pill border border-border-strong px-4 py-2 font-mono text-2xs font-bold tracking-[0.12em] text-text uppercase transition-colors hover:bg-surface-3 lg:ml-0"
        >
          Consola closer
        </Link>
      </div>
    </header>
  );
}

/* ==========================================================================
 *  Hero
 * ========================================================================== */

function Hero(): ReactElement {
  return (
    <section id="inicio" className="relative isolate scroll-mt-24">
      {/*
        Aurora: dos capas desfasadas, decorativa al 100%, que ademas siguen al
        raton con paralaje (ver `aurora-viva.tsx`; el `overflow-x-clip` del
        contenedor raiz es el que contiene su desborde lateral, y es `clip` y
        no `hidden` porque `hidden` rompe el `sticky` de la cabecera).

        `isolate` en la seccion mantiene el `-z-10` por encima del fondo de la
        pagina y por debajo del contenido; lo que viene despues en el DOM
        (bifurcacion, puertas) pinta encima, asi que el amarillo solo se
        derrama como luz de fondo.
      */}
      <AuroraViva />

      <motion.div
        initial="oculto"
        animate="visible"
        variants={contenedor}
        className="mx-auto max-w-6xl px-5 pt-16 pb-10 sm:px-6 sm:pt-24 md:pt-28"
      >
        <motion.p variants={sube}>
          <EtiquetaMono>Perfilador de vivienda · Colsubsidio × 30X</EtiquetaMono>
        </motion.p>

        <motion.h1
          variants={sube}
          className="mt-6 max-w-[15ch] font-display text-[clamp(2.5rem,8.5vw,6.75rem)] leading-[0.88] font-bold tracking-[-0.045em] text-text"
        >
          Nadie llega solo a su primera casa.
        </motion.h1>

        <motion.p
          variants={sube}
          className="mt-7 max-w-[52ch] text-base leading-relaxed text-text-muted sm:text-lg"
        >
          Dos minutos de conversación perfilan a quien quiere comprar y le ponen al frente al
          comercial correcto, con la ficha ya lista. Elige desde qué lado quieres ver el producto.
        </motion.p>

        <motion.div variants={sube} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="#roles"
            className="focus-ring inline-flex h-12 items-center justify-center rounded-pill bg-brand-500 px-7 text-base font-bold text-[#0d0d0d] shadow-sm transition-colors hover:bg-brand-600"
          >
            Elegir un rol
          </a>
          <p className="text-sm text-text-muted sm:ml-2">
            Demo funcional · sin registro · datos simulados
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ==========================================================================
 *  Bifurcacion
 * --------------------------------------------------------------------------
 *  Solo desde `md`: con las puertas apiladas en movil no hay dos carriles que
 *  dibujar, y una bifurcacion vertical de 40px seria ruido.
 *
 *  `preserveAspectRatio="none"` es a proposito: importa que las ramas terminen
 *  EXACTO en el centro de cada puerta mas que la fidelidad de la curva.
 *  `vector-effect` mantiene el trazo fino al estirarse.
 *
 *  De donde salen 294 y 906, y no 300/900: la rejilla es de dos columnas con
 *  `gap-6` (24px) dentro de un contenido de 1104px (max-w-6xl menos el padding),
 *  asi que cada puerta mide 540px y sus centros caen en 24.5% y 75.5% — no en
 *  25/75. Sobre el viewBox de 1200 eso es 294 y 906. Son 6px, pero son los 6px
 *  que hacen que la rama caiga al centro de la tarjeta o justo al lado.
 * ========================================================================== */

function Bifurcacion(): ReactElement {
  return (
    <div aria-hidden="true" className="mx-auto hidden max-w-6xl px-5 sm:px-6 md:block">
      <svg
        viewBox="0 0 1200 132"
        preserveAspectRatio="none"
        className="h-[132px] w-full overflow-visible"
      >
        <motion.path
          d="M600 0 V 36"
          fill="none"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          className="stroke-border-strong"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.45, ease: EASE }}
        />
        {/* Rama del cliente: amarilla y mas gruesa — es el carril por donde
            entra todo el mundo. */}
        <motion.path
          d="M600 36 C 600 90, 294 80, 294 132"
          fill="none"
          strokeWidth={2.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="stroke-brand-500"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.75, delay: 0.72, ease: EASE }}
        />
        {/* Rama del comercial: tinta y fina, como su propia consola. */}
        <motion.path
          d="M600 36 C 600 90, 906 80, 906 132"
          fill="none"
          strokeWidth={1.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="stroke-text"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.75, delay: 0.72, ease: EASE }}
        />
      </svg>
    </div>
  );
}

/* ==========================================================================
 *  Las dos puertas
 * ========================================================================== */

const revelar: Variants = {
  oculto: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

/** Vinetas de cada puerta: qué se ve al entrar, no qué promete la marca. */
function Vinetas({
  items,
  tono,
}: {
  items: readonly string[];
  tono: 'cliente' | 'closer';
}): ReactElement {
  return (
    /* `flex-1`: la lista es lo que se estira cuando una puerta tiene mas texto
       que la otra, de modo que los dos CTA quedan a la misma altura sin fijar
       una altura de tarjeta a mano. */
    <ul className="mt-6 flex flex-1 flex-col gap-2.5">
      {items.map((texto) => (
        <li
          key={texto}
          className={
            tono === 'cliente'
              ? 'flex gap-2.5 text-sm leading-snug text-text-muted'
              : 'flex gap-2.5 text-sm leading-snug text-console-body'
          }
        >
          <span
            aria-hidden="true"
            className={
              tono === 'cliente'
                ? 'mt-[7px] size-1.5 shrink-0 rounded-full bg-brand-500'
                : 'mt-[7px] size-1.5 shrink-0 rounded-full bg-console-ink'
            }
          />
          {texto}
        </li>
      ))}
    </ul>
  );
}

/** Puerta A — pintada en el registro del flujo del cliente. */
function PuertaCliente(): ReactElement {
  return (
    <motion.article
      variants={revelar}
      className="group relative flex flex-col overflow-hidden rounded-[24px] border border-border bg-surface shadow-card transition-shadow duration-300 hover:shadow-pop"
    >
      <div aria-hidden="true" className="h-1.5 w-full bg-brand-500" />

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <EtiquetaMono>Carril cliente</EtiquetaMono>

        <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.035em] text-text">
          Quiero mi casa
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-text-muted sm:text-base">
          Entras al chat como entraría cualquier persona: sin cuenta, sin cédula y sin documentos.
        </p>

        {/* Fragmento del hilo real: dos burbujas y el indicador de escritura. */}
        <div className="mt-7 rounded-bubble border border-border bg-surface-3 p-3.5">
          {/* Los anchos maximos son distintos y bajos a proposito: una burbuja
              que ocupa toda la linea se lee como pildora, no como mensaje.
              El hilo tiene que parecer una conversacion de un vistazo. */}
          <p className="ml-auto w-fit max-w-[64%] rounded-bubble rounded-br-sm bg-brand-500 px-3.5 py-2 text-xs leading-snug font-medium text-[#0d0d0d] shadow-bubble">
            Gano 2.400.000 y tengo 6 millones ahorrados
          </p>
          <p className="mt-2 w-fit max-w-[78%] rounded-bubble rounded-bl-sm bg-surface px-3.5 py-2 text-xs leading-snug text-text-muted shadow-bubble">
            Con eso tu capacidad estimada alcanza para VIS. Te muestro tres proyectos.
          </p>
          <span
            aria-hidden="true"
            className="mt-2 inline-flex gap-1 rounded-bubble bg-surface px-3 py-2.5 shadow-bubble"
          >
            <i className="animate-typing size-1.5 rounded-full bg-text-subtle" />
            <i
              className="animate-typing size-1.5 rounded-full bg-text-subtle"
              style={{ animationDelay: '0.2s' }}
            />
            <i
              className="animate-typing size-1.5 rounded-full bg-text-subtle"
              style={{ animationDelay: '0.4s' }}
            />
          </span>
        </div>

        <Vinetas
          tono="cliente"
          items={[
            'Capacidad de compra estimada en la conversación, sin consultar centrales de riesgo.',
            'Proyectos reales filtrados por lo que sí alcanzas.',
            'Si todavía no alcanzas: camino de ahorro con metas, lecciones y logros.',
          ]}
        />

        <Link
          to={RUTA_CLIENTE}
          className="focus-ring mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-pill bg-brand-500 px-6 text-base font-bold text-[#0d0d0d] shadow-sm transition-colors hover:bg-brand-600"
        >
          Empezar la conversación
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>
    </motion.article>
  );
}

/** Puerta B — pintada en el registro de la consola comercial. */
function PuertaCloser(): ReactElement {
  return (
    <motion.article
      variants={revelar}
      className="group relative flex flex-col overflow-hidden rounded-[24px] border border-console-line bg-console-paper shadow-console-card transition-shadow duration-300 hover:shadow-console-card-hover"
    >
      <div aria-hidden="true" className="h-1.5 w-full bg-console-ink" />

      <div className="flex flex-1 flex-col p-6 font-display sm:p-8">
        <EtiquetaMono tono="console">Carril comercial</EtiquetaMono>

        <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.035em] text-console-ink">
          Soy closer
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-console-body sm:text-base">
          Entras a la consola con la cola ya ordenada. No es un CRM: es la lista de a quién llamar
          ahora y qué decirle. Pide usuario y contraseña.
        </p>

        {/* Fragmento de la cola: dos filas, la segunda atenuada. */}
        <div className="mt-7 flex flex-col gap-2">
          <div className="flex items-center gap-3 rounded-card border border-console-line bg-console-surface px-3 py-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-console-signal font-mono text-xs font-bold text-console-ink">
              87
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold text-console-ink">
                C. Ramírez ·······
              </span>
              <span className="block font-mono text-[10px] tracking-[0.14em] text-console-mute uppercase">
                VIS · Soacha · 6–8 p. m.
              </span>
            </span>
            <span className="shrink-0 rounded-pill bg-console-green-soft px-2 py-0.5 font-mono text-[10px] font-bold text-console-green-deep">
              Afiliado
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-card border border-console-line bg-console-surface px-3 py-2.5 opacity-55">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-console-track font-mono text-xs font-bold text-console-body">
              71
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold text-console-ink">
                M. Quintero ·······
              </span>
              <span className="block font-mono text-[10px] tracking-[0.14em] text-console-mute uppercase">
                No VIS · Bogotá · 12–2 p. m.
              </span>
            </span>
          </div>
        </div>

        <Vinetas
          tono="closer"
          items={[
            'Cola de leads viables ordenada por afinidad, con el ruido ya filtrado.',
            'Ficha de llamada: guion, objeciones esperadas y mejor horario para marcar.',
            'El teléfono se revela con auditoría, no queda a la vista en la lista.',
          ]}
        />

        <Link
          to={RUTA_CLOSER}
          className="focus-ring mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-pill bg-console-ink px-6 text-base font-bold text-console-signal transition-colors hover:bg-console-ink-3"
        >
          Abrir la consola
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>
    </motion.article>
  );
}

function Puertas(): ReactElement {
  return (
    <motion.section
      id="roles"
      aria-label="Elige un rol"
      initial="oculto"
      /*
        `animate` y NO `whileInView`. Las dos puertas son el unico trabajo de
        esta pagina: si el IntersectionObserver no dispara (headless, un
        navegador raro, la pestana abierta en segundo plano), con `whileInView`
        se quedan en `opacity: 0` y la portada queda literalmente sin puertas —
        pasó en la primera captura de movil de esta misma sesion.

        Ademas estan a un scroll corto del hero, asi que casi siempre entran ya
        visibles: el reveal por scroll no estaba comprando nada.
      */
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.9 } } }}
      className="mx-auto grid max-w-6xl scroll-mt-24 gap-6 px-5 pb-24 sm:px-6 md:grid-cols-2"
    >
      <PuertaCliente />
      <PuertaCloser />
    </motion.section>
  );
}

/* ==========================================================================
 *  Cómo funciona
 * --------------------------------------------------------------------------
 *  Aqui SI van numerados: los tres momentos son una secuencia real y el orden
 *  es la informacion (no se clasifica antes de conversar). En cualquier otra
 *  seccion de esta pagina numerar seria decoracion.
 * ========================================================================== */

const PASOS = [
  {
    n: '01',
    titulo: 'Conversa',
    texto:
      'Un chat de dos minutos, en el tono de WhatsApp. Ni cédula, ni cuenta bancaria, ni documentos: la capacidad se estima con lo que la persona cuenta.',
  },
  {
    n: '02',
    titulo: 'Clasifica',
    texto:
      'El sistema separa dos carriles: quien ya puede comprar hoy y quien todavía no. Nadie sale de la conversación sin siguiente paso.',
  },
  {
    n: '03',
    titulo: 'Acompaña',
    texto:
      'Al primero lo llama un closer con la ficha lista. Al segundo lo lleva un camino de ahorro que lo devuelve al primer carril cuando cierra su brecha.',
  },
] as const;

function ComoFunciona(): ReactElement {
  return (
    <section id="como" className="scroll-mt-24 border-y border-border bg-surface-3">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
        <EtiquetaMono>Cómo funciona</EtiquetaMono>
        <h2 className="mt-5 max-w-[20ch] font-display text-[clamp(1.75rem,4.5vw,2.875rem)] leading-[0.95] font-bold tracking-[-0.04em] text-text">
          Una sola conversación, dos destinos.
        </h2>

        <ol className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-3">
          {PASOS.map((paso) => (
            <li key={paso.n} className="border-t border-border-strong pt-5">
              <p className="font-mono text-2xs font-bold tracking-[0.16em] text-brand-800">
                {paso.n}
              </p>
              <h3 className="mt-3 font-display text-xl font-bold tracking-[-0.03em] text-text">
                {paso.titulo}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-text-muted">{paso.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ==========================================================================
 *  Pie: la ficha tecnica de la demo
 * ========================================================================== */

function Pie(): ReactElement {
  return (
    <footer id="datos" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6">
        <div className="grid gap-8 border-t border-border pt-8 sm:grid-cols-3">
          <div>
            <p className="font-display text-sm font-bold text-text">Hackathon Colsubsidio × 30X</p>
            <p className="mt-1 text-sm text-text-muted">Reto Vivienda · Bogotá, Colombia</p>
          </div>
          <div>
            <p className="font-display text-sm font-bold text-text">Demo funcional</p>
            <p className="mt-1 text-sm text-text-muted">
              Datos simulados. Ningún titular real detrás de estos leads.
            </p>
          </div>
          <div>
            <p className="font-display text-sm font-bold text-text">Ley 1581 de 2012</p>
            <p className="mt-1 text-sm text-text-muted">
              La autorización se pide antes de la primera pregunta.{' '}
              <a
                href={RUTA_POLITICA}
                className="focus-ring rounded-sm font-semibold text-accent-700 underline underline-offset-2 hover:text-accent-800"
              >
                Leer la política
              </a>
            </p>
          </div>
        </div>

        <p className="mt-10 font-mono text-[10px] tracking-[0.16em] text-text-subtle uppercase">
          La UI dice estimado, nunca aprobado — esto no promete subsidio ni crédito
        </p>
      </div>
    </footer>
  );
}

/* ========================================================================== */

export function LandingPage(): ReactElement {
  return (
    <div className="min-h-screen overflow-x-clip bg-surface font-sans text-text antialiased">
      <Cabecera />
      <main>
        <Hero />
        <Bifurcacion />
        <Puertas />
        <ComoFunciona />
      </main>
      <Pie />
      {/*
        Fuera del hero y no dentro: el canvas va `fixed` y con z-100 para poder
        pintar por encima de la cabecera `sticky` (z-50). Dentro de la seccion
        del hero, su `isolate` lo encerraria por debajo de ella. No captura
        eventos, asi que ningun enlace pierde el clic.
      */}
      <OndaDeClic />
    </div>
  );
}
