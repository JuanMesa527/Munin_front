/**
 * La aurora de la portada, viva: el punto amarillo del fondo sigue al puntero.
 * Capa: app, 100% decorativa.
 *
 * Son las mismas dos capas que ya declaraba `styles/index.css` (`hero-aurora` y
 * `hero-aurora-core`) — no se toca su pintura ni su deriva — envueltas cada una
 * en un `motion.div` que las desplaza hacia el raton. Lo que cambia es que
 * ahora el nucleo dorado PERSIGUE y la mancha grande apenas se deja arrastrar:
 * dos factores y dos muelles distintos producen paralaje, que es lo que hace
 * que el fondo se lea como profundidad y no como un sticker pegado al cursor.
 *
 * POR QUE ANIDADO Y NO TODO EN UNA CAPA: la deriva (`animate-aurora*`) es una
 * animacion CSS sobre `transform`, y una animacion CSS GANA sobre el estilo en
 * linea. Si Motion escribiera el transform en el mismo nodo, el seguimiento
 * simplemente no se veria. El nodo de fuera lleva el muelle, el de dentro la
 * deriva, y los transforms se componen.
 *
 * EL FACTOR ES < 1 A PROPOSITO: el nucleo insinua el movimiento del raton, no
 * se le pega. Pegado se lee como cursor personalizado (y hay que ocultar el
 * cursor real); al 60% con un muelle pesado se lee como luz que se derrama.
 *
 * SOLO CON RATON: `(any-hover: hover) and (any-pointer: fine)`. En un telefono
 * no hay puntero que seguir, y el listener seria bateria a cambio de nada.
 *
 * ACCESIBILIDAD: `aria-hidden`; con `prefers-reduced-motion` no se registra
 * ningun listener y las capas quedan exactamente como estaban (la deriva ya la
 * apaga el bloque @media de index.css). WCAG 2.3.3.
 */

import { useEffect, useRef, type ReactElement } from 'react';
import { motion, useReducedMotion, useSpring } from 'motion/react';

const PUNTERO_FINO = '(any-hover: hover) and (any-pointer: fine)';

/** Centro de reposo del nucleo, en fraccion del contenedor: es el mismo
 *  `background-position: 79% 78%` que declara `hero-aurora-core`. */
const REPOSO_X = 0.79;
const REPOSO_Y = 0.78;

/** Cuanto del recorrido del raton copia cada capa. */
const FACTOR_NUCLEO = 0.6;
const FACTOR_MANCHA = 0.22;

/** Tope de desplazamiento en px: sin el, un raton en la esquina se lleva la luz
 *  fuera de cuadro y el hero se queda sin fondo. */
const TOPE_X = 260;
const TOPE_Y = 190;

/** Pesado y con un rebote minimo: la luz llega tarde, como un liquido. */
const MUELLE_NUCLEO = { stiffness: 58, damping: 17, mass: 1.1, restDelta: 0.4 };
/** Aun mas perezoso: es el fondo, tiene que quedarse atras. */
const MUELLE_MANCHA = { stiffness: 24, damping: 20, mass: 1.6, restDelta: 0.4 };
/** Corto y elastico: el latido del clic dura menos que la onda que lo acompana. */
const MUELLE_PULSO = { stiffness: 320, damping: 14, mass: 0.7 };

function acotar(valor: number, tope: number): number {
  return Math.max(-tope, Math.min(tope, valor));
}

export function AuroraViva(): ReactElement {
  const contenedor = useRef<HTMLDivElement>(null);
  const reducir = useReducedMotion() ?? false;

  const nucleoX = useSpring(0, MUELLE_NUCLEO);
  const nucleoY = useSpring(0, MUELLE_NUCLEO);
  const manchaX = useSpring(0, MUELLE_MANCHA);
  const manchaY = useSpring(0, MUELLE_MANCHA);
  const pulso = useSpring(1, MUELLE_PULSO);

  useEffect(() => {
    if (reducir) return;
    const consulta = window.matchMedia(PUNTERO_FINO);
    if (!consulta.matches) return;

    let caja: DOMRect | null = null;
    let raf = 0;
    let pendiente: PointerEvent | null = null;
    let volverAlPulso = 0;

    // La caja se cachea y se invalida en scroll/resize en vez de medirse en cada
    // `pointermove`: leer `getBoundingClientRect()` por evento fuerza un layout
    // sincrono a 120 Hz sobre un hero con blur de 36px.
    const invalidar = (): void => {
      caja = null;
    };

    const aplicar = (e: PointerEvent): void => {
      const nodo = contenedor.current;
      if (!nodo) return;
      caja ??= nodo.getBoundingClientRect();
      if (caja.width === 0) return;

      const centroX = caja.left + caja.width * REPOSO_X;
      const centroY = caja.top + caja.height * REPOSO_Y;
      const dx = e.clientX - centroX;
      const dy = e.clientY - centroY;

      nucleoX.set(acotar(dx * FACTOR_NUCLEO, TOPE_X));
      nucleoY.set(acotar(dy * FACTOR_NUCLEO, TOPE_Y));
      manchaX.set(acotar(dx * FACTOR_MANCHA, TOPE_X));
      manchaY.set(acotar(dy * FACTOR_MANCHA, TOPE_Y));
    };

    const alMover = (e: PointerEvent): void => {
      if (e.pointerType === 'touch') return;
      pendiente = e;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (pendiente) aplicar(pendiente);
      });
    };

    // El raton sale de la ventana: la luz vuelve a su sitio en vez de quedarse
    // congelada apuntando al borde.
    const alSalir = (e: PointerEvent): void => {
      if (e.relatedTarget) return;
      nucleoX.set(0);
      nucleoY.set(0);
      manchaX.set(0);
      manchaY.set(0);
    };

    /** Latido que acompana a la onda de <OndaDeClic />: el fondo acusa el golpe. */
    const alPulsar = (e: PointerEvent): void => {
      if (e.button !== 0) return;
      pulso.set(1.13);
      window.clearTimeout(volverAlPulso);
      volverAlPulso = window.setTimeout(() => {
        pulso.set(1);
      }, 180);
    };

    window.addEventListener('pointermove', alMover, { passive: true });
    window.addEventListener('pointerout', alSalir, { passive: true });
    window.addEventListener('pointerdown', alPulsar, { passive: true });
    window.addEventListener('resize', invalidar);
    window.addEventListener('scroll', invalidar, { passive: true });

    return () => {
      window.removeEventListener('pointermove', alMover);
      window.removeEventListener('pointerout', alSalir);
      window.removeEventListener('pointerdown', alPulsar);
      window.removeEventListener('resize', invalidar);
      window.removeEventListener('scroll', invalidar);
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(volverAlPulso);
    };
  }, [reducir, nucleoX, nucleoY, manchaX, manchaY, pulso]);

  return (
    /*
      Se DESBORDA por abajo a proposito (`-bottom-40`): recortarla al borde del
      hero deja un corte duro justo donde arranca la bifurcacion, y una luz
      desenfocada con borde recto se ve como un error de render. El
      `overflow-x-clip` del contenedor raiz contiene el desborde lateral.
    */
    <div
      ref={contenedor}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 -top-32 -bottom-40 -z-10"
    >
      <motion.div style={{ x: manchaX, y: manchaY }} className="absolute inset-0">
        <div className="hero-aurora animate-aurora absolute inset-0" />
      </motion.div>
      <motion.div
        style={{ x: nucleoX, y: nucleoY, scale: pulso }}
        className="absolute inset-0 will-change-transform"
      >
        <div className="hero-aurora-core animate-aurora-slow absolute inset-0" />
      </motion.div>
    </div>
  );
}
