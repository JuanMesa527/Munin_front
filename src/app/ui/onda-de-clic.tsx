/**
 * Onda de choque al hacer clic — capa: app, 100% decorativa.
 *
 * Un canvas a pantalla completa, `pointer-events-none`, que al recibir un clic
 * en cualquier punto de la portada emite un frente de onda que se expande desde
 * ahi. No es el ripple de Material: el anillo NO es un circulo, su radio va
 * modulado por dos senos de distinta frecuencia, asi que sale como una gota
 * deformada que se redondea a medida que se expande. Ademas van tres anillos
 * desfasados en radio y color (ambar claro / amarillo de marca / azul de
 * acento): aberracion cromatica hecha con los dos colores del logo, mas un
 * destello central y esquirlas que salen del frente.
 *
 * POR QUE `multiply` EN CLARO Y `screen` EN OSCURO, y no alfa normal: el canvas
 * se pinta ENCIMA de todo el contenido, titulares incluidos. Con `multiply`
 * sobre el tema claro, el amarillo tine el blanco pero deja la tinta intacta
 * (negro x amarillo = negro), asi que la onda jamas baja el contraste de un
 * texto. `screen` hace lo simetrico en oscuro. Con `source-over` y alfa habria
 * que elegir entre verse poco o velar la tipografia.
 *
 * COSTE: el bucle de `requestAnimationFrame` NO corre en reposo — arranca en el
 * `pointerdown` y se detiene solo cuando la ultima onda muere. Una portada
 * quieta consume exactamente cero.
 *
 * ACCESIBILIDAD: `aria-hidden`, y con `prefers-reduced-motion` el componente no
 * monta nada (ni canvas ni listener). WCAG 2.3.3.
 */

import { useEffect, useRef, type ReactElement } from 'react';
import { useReducedMotion } from 'motion/react';

/** Vida de una onda, en ms. Mas alla de ~1s deja de leerse como impacto. */
const DURACION = 900;
/** El eco sale despues y mas pequeno: es lo que le da cuerpo al golpe. */
const RETRASO_ECO = 110;
const ESCALA_ECO = 0.5;
/** Tope de ondas simultaneas: alguien machacando el raton no debe fundir la CPU. */
const MAX_ONDAS = 8;
const PUNTOS_ANILLO = 96;
const ESQUIRLAS = 12;
/** En pantallas 3x el coste se triplica y la diferencia visual, con blur, es nula. */
const DPR_MAX = 2;

/** Deformacion del anillo: dos armonicos que se apagan al expandirse. */
const AMPLITUD_1 = 0.055;
const LOBULOS_1 = 5;
const AMPLITUD_2 = 0.03;
const LOBULOS_2 = 9;

/** Reparte las esquirlas sin que se agrupen (mismo truco que las semillas de girasol). */
const ANGULO_AUREO = Math.PI * (3 - Math.sqrt(5));

/** Si `getComputedStyle` no devuelve el token (tests con happy-dom, canvas
 *  montado antes de la hoja de estilos) se usa el valor del DS. */
const RESPALDO = {
  '--color-brand-300': '#ffdf47',
  '--color-brand-500': '#ffd000',
  '--color-accent-400': '#3494cd',
} as const;

type TokenColor = keyof typeof RESPALDO;

interface CapaAnillo {
  /** Token del design system: ningun hex suelto en el .tsx. */
  token: TokenColor;
  /** Desfase de radio en px — es lo que produce la franja cromatica. */
  desfase: number;
  grosor: number;
  alfa: number;
  /** Solo el anillo principal lleva halo: `shadowBlur` es lo caro del frame. */
  halo: boolean;
}

const ANILLOS: readonly CapaAnillo[] = [
  { token: '--color-brand-300', desfase: 15, grosor: 1.4, alfa: 0.5, halo: false },
  { token: '--color-brand-500', desfase: 0, grosor: 2.6, alfa: 0.85, halo: true },
  { token: '--color-accent-400', desfase: -17, grosor: 1.2, alfa: 0.34, halo: false },
];

interface Onda {
  x: number;
  y: number;
  /** `performance.now()` del disparo; el eco nace con el retraso ya sumado. */
  inicio: number;
  escala: number;
  radio: number;
  semilla: number;
}

/** Hex del token a la terna `r, g, b` que necesita `rgba()` en canvas. */
function hexARgb(hex: string): string {
  const limpio = hex.trim().replace('#', '');
  const largo =
    limpio.length === 3
      ? limpio
          .split('')
          .map((c) => c + c)
          .join('')
      : limpio;
  const n = Number.parseInt(largo.slice(0, 6), 16);
  if (Number.isNaN(n)) return hexARgb(RESPALDO['--color-brand-500']);
  return `${String((n >> 16) & 255)}, ${String((n >> 8) & 255)}, ${String(n & 255)}`;
}

function rgba(rgb: string, alfa: number): string {
  return `rgba(${rgb}, ${alfa.toFixed(3)})`;
}

/** Los colores se resuelven UNA vez por montaje leyendo las custom properties
 *  del DS: si manana cambia el amarillo de marca, cambia tambien la onda. */
function leerTokens(): Record<TokenColor, string> {
  const estilo = getComputedStyle(document.documentElement);
  const lee = (token: TokenColor): string =>
    hexARgb(estilo.getPropertyValue(token).trim() || RESPALDO[token]);
  return {
    '--color-brand-300': lee('--color-brand-300'),
    '--color-brand-500': lee('--color-brand-500'),
    '--color-accent-400': lee('--color-accent-400'),
  };
}

/** Contorno cerrado de radio modulado. La deformacion se apaga con `p` para que
 *  la onda nazca organica y muera como un circulo limpio. */
function trazarAnillo(
  ctx: CanvasRenderingContext2D,
  onda: Onda,
  radio: number,
  p: number,
): void {
  ctx.beginPath();
  for (let i = 0; i <= PUNTOS_ANILLO; i += 1) {
    const t = (i / PUNTOS_ANILLO) * Math.PI * 2;
    const rizo =
      1 +
      AMPLITUD_1 * (1 - p) * Math.sin(LOBULOS_1 * t + onda.semilla + p * 5.5) +
      AMPLITUD_2 * (1 - p) * Math.sin(LOBULOS_2 * t - onda.semilla * 1.7 - p * 3.2);
    const r = radio * rizo;
    const x = onda.x + Math.cos(t) * r;
    const y = onda.y + Math.sin(t) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}

function dibujarOnda(
  ctx: CanvasRenderingContext2D,
  onda: Onda,
  p: number,
  colores: Record<TokenColor, string>,
): void {
  // Salida rapida y frenada al final: asi se lee como impacto y no como globo.
  const avance = 1 - (1 - p) ** 3;
  const radio = onda.radio * onda.escala * avance;
  const desvanece = (1 - p) ** 1.7;
  const amarillo = colores['--color-brand-500'];

  // Destello del punto de impacto: vive el primer tercio y se come el resto.
  if (p < 0.35) {
    const q = p / 0.35;
    const r = 26 + 120 * onda.escala * q;
    const grad = ctx.createRadialGradient(onda.x, onda.y, 0, onda.x, onda.y, r);
    grad.addColorStop(0, rgba(amarillo, 0.55 * (1 - q) * onda.escala));
    grad.addColorStop(1, rgba(amarillo, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(onda.x, onda.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const anillo of ANILLOS) {
    const r = radio + anillo.desfase * (1 - p) * onda.escala;
    if (r <= 0) continue;
    const rgb = colores[anillo.token];
    ctx.strokeStyle = rgba(rgb, anillo.alfa * desvanece);
    ctx.lineWidth = anillo.grosor * (0.35 + 0.65 * (1 - p));
    ctx.shadowBlur = anillo.halo ? 18 * (1 - p) : 0;
    ctx.shadowColor = anillo.halo ? rgba(rgb, 0.6 * desvanece) : 'transparent';
    trazarAnillo(ctx, onda, r, p);
  }
  ctx.shadowBlur = 0;

  // Esquirlas: trazos radiales que se despegan del frente de onda. Son lo que
  // impide que el efecto se lea como el ripple de un boton.
  ctx.strokeStyle = rgba(amarillo, 0.5 * desvanece);
  ctx.lineWidth = 1.5 * (1 - p);
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i < ESQUIRLAS; i += 1) {
    const ang = onda.semilla + i * ANGULO_AUREO;
    const largo = 30 * onda.escala * (1 - p);
    const desde = radio * 1.02;
    ctx.moveTo(onda.x + Math.cos(ang) * desde, onda.y + Math.sin(ang) * desde);
    ctx.lineTo(onda.x + Math.cos(ang) * (desde + largo), onda.y + Math.sin(ang) * (desde + largo));
  }
  ctx.stroke();
}

export function OndaDeClic(): ReactElement | null {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const reducir = useReducedMotion() ?? false;

  useEffect(() => {
    if (reducir) return;
    const canvas = lienzo.current;
    if (!canvas) return;

    // happy-dom y navegadores sin 2d devuelven null (o lanzan): sin contexto el
    // efecto simplemente no existe, nunca rompe la portada.
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      return;
    }
    if (!ctx) return;
    const dibujo = ctx;

    const colores = leerTokens();
    const ondas: Onda[] = [];
    let raf = 0;
    let ancho = 0;
    let alto = 0;

    const medir = (): void => {
      ancho = window.innerWidth;
      alto = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX);
      canvas.width = Math.round(ancho * dpr);
      canvas.height = Math.round(alto * dpr);
      canvas.style.width = `${String(ancho)}px`;
      canvas.style.height = `${String(alto)}px`;
      dibujo.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const frame = (ahora: number): void => {
      dibujo.clearRect(0, 0, ancho, alto);
      // El tema es opt-in por atributo y puede cambiar entre clics.
      dibujo.globalCompositeOperation =
        document.documentElement.dataset.theme === 'dark' ? 'screen' : 'multiply';

      let vivas = 0;
      for (const onda of ondas) {
        const p = (ahora - onda.inicio) / DURACION;
        if (p >= 1) continue;
        vivas += 1;
        if (p < 0) continue; // eco todavia en la recamara
        dibujarOnda(dibujo, onda, p, colores);
      }

      if (vivas === 0) {
        ondas.length = 0;
        raf = 0;
        dibujo.clearRect(0, 0, ancho, alto);
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const emitir = (e: PointerEvent): void => {
      if (e.button !== 0) return;
      const ahora = performance.now();
      const semilla = Math.random() * Math.PI * 2;
      // Radio proporcional al viewport: la misma onda en un portatil y en un
      // proyector tiene que ocupar lo mismo en pantalla, no en pixeles.
      const radio = Math.max(ancho, alto) * 0.42;
      ondas.push({ x: e.clientX, y: e.clientY, inicio: ahora, escala: 1, radio, semilla });
      ondas.push({
        x: e.clientX,
        y: e.clientY,
        inicio: ahora + RETRASO_ECO,
        escala: ESCALA_ECO,
        radio,
        semilla: semilla + 1.9,
      });
      if (ondas.length > MAX_ONDAS) ondas.splice(0, ondas.length - MAX_ONDAS);
      if (!raf) raf = requestAnimationFrame(frame);
    };

    medir();
    window.addEventListener('resize', medir);
    window.addEventListener('pointerdown', emitir, { passive: true });

    return () => {
      window.removeEventListener('resize', medir);
      window.removeEventListener('pointerdown', emitir);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reducir]);

  if (reducir) return null;

  return (
    <canvas
      ref={lienzo}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100]"
    />
  );
}
