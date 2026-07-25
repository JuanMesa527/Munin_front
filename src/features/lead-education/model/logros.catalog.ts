/**
 * Catálogo de logros (capa model, F2.2).
 *
 * PRESENTACIÓN: el contrato solo trae `Badge[]` del journey. Esta pantalla
 * necesita categorías, XP por logro y un set más amplio que eso. Se modela
 * aquí (icono/categoría/xp/nombre/descripción), sin tocar `contracts.ts`.
 *
 * `obtenido` es solo un valor por defecto/de referencia: en pantalla se
 * reemplaza siempre por el resultado de `logrosDesdeJourney(journey)` (ver
 * `logros-desde-journey.ts`), que lo calcula en vivo a partir del
 * `EducationJourney` real del lead (metas completadas, ahorro, progreso,
 * plan). Los totales que se ven (obtenidos/total, XP, categorías completas)
 * salen de `resumenLogros()` aplicado sobre ese resultado computado, no de
 * una cifra fija de este archivo.
 */

import {
  Award,
  BarChart3,
  BookOpen,
  Calculator,
  CheckCircle2,
  Compass,
  FileText,
  GraduationCap,
  Handshake,
  Home,
  Landmark,
  Lightbulb,
  Map,
  MessageCircle,
  Mountain,
  PhoneCall,
  PiggyBank,
  Puzzle,
  Search,
  Sparkles,
  Star,
  Target,
  type LucideIcon,
} from 'lucide-react';

export type LogroCategoria =
  | 'explorador'
  | 'financiero'
  | 'preparado'
  | 'decidido'
  | 'especiales';

export interface LogroCatalogItem {
  id: string;
  nombre: string;
  descripcion: string;
  icono: LucideIcon;
  categoria: LogroCategoria;
  xp: number;
  obtenido: boolean;
  nuevo?: boolean;
}

export interface CategoriaFiltro {
  id: LogroCategoria | 'todos';
  label: string;
  icono: LucideIcon;
}

export const CATEGORIAS_FILTRO: readonly CategoriaFiltro[] = [
  { id: 'todos', label: 'Todos', icono: Award },
  { id: 'explorador', label: 'Explorador', icono: Compass },
  { id: 'financiero', label: 'Financiero', icono: PiggyBank },
  { id: 'preparado', label: 'Preparado', icono: FileText },
  { id: 'decidido', label: 'Decidido', icono: Target },
  { id: 'especiales', label: 'Especiales', icono: Sparkles },
];

export const LOGROS_CATALOG: readonly LogroCatalogItem[] = [
  // —— Explorador ——
  {
    id: 'primer-paso',
    nombre: 'Primer paso',
    descripcion: 'Completaste tu primera lección del camino.',
    icono: Mountain,
    categoria: 'explorador',
    xp: 50,
    obtenido: true,
    nuevo: true,
  },
  {
    id: 'explorador',
    nombre: 'Explorador',
    descripcion: 'Descubriste si puedes comprar vivienda.',
    icono: Compass,
    categoria: 'explorador',
    xp: 80,
    obtenido: true,
  },
  // —— Financiero ——
  {
    id: 'calculador',
    nombre: 'Calculador',
    descripcion: 'Entendiste tu capacidad financiera estimada.',
    icono: Calculator,
    categoria: 'financiero',
    xp: 80,
    obtenido: true,
  },
  {
    id: 'ahorrador',
    nombre: 'Ahorrador',
    descripcion: 'Registraste tu primer aporte de ahorro.',
    icono: PiggyBank,
    categoria: 'financiero',
    xp: 100,
    obtenido: true,
  },
  {
    id: 'credito-claro',
    nombre: 'Crédito claro',
    descripcion: 'Entendiste qué es un crédito hipotecario.',
    icono: Landmark,
    categoria: 'financiero',
    xp: 60,
    obtenido: true,
  },
  // —— Preparado ——
  {
    id: 'mapa-completo',
    nombre: 'Recorrido revisado',
    descripcion: 'Revisaste las 5 etapas de tu camino a la vivienda.',
    icono: Map,
    categoria: 'preparado',
    xp: 40,
    obtenido: true,
  },
  {
    id: 'sabio-sfv',
    nombre: 'Sabio del SFV',
    descripcion: 'Aprendiste qué es el subsidio familiar estimado.',
    icono: BookOpen,
    categoria: 'preparado',
    xp: 60,
    obtenido: true,
  },
  // —— Decidido ——
  {
    id: 'meta-intermedio',
    nombre: 'Nivel intermedio',
    descripcion: 'Alcanzaste más del 50% de tu camino.',
    icono: Star,
    categoria: 'decidido',
    xp: 90,
    obtenido: true,
  },
  {
    id: 'preguntón',
    nombre: 'Preguntón',
    descripcion: 'Usaste el asistente para resolver una duda (próximamente).',
    icono: MessageCircle,
    categoria: 'decidido',
    xp: 40,
    obtenido: true,
  },
  // —— Especiales ——
  {
    id: 'aprendiz-constante',
    nombre: 'Aprendiz constante',
    descripcion: 'Completaste 3 lecciones en una misma etapa.',
    icono: GraduationCap,
    categoria: 'especiales',
    xp: 100,
    obtenido: true,
    nuevo: true,
  },
  // —— Bloqueados ——
  {
    id: 'documentalista',
    nombre: 'Documentalista',
    descripcion: 'Reúne el checklist de documentos para comprar.',
    icono: FileText,
    categoria: 'preparado',
    xp: 80,
    obtenido: false,
  },
  {
    id: 'hucha-llena',
    nombre: 'Brecha cerrada',
    descripcion: 'Cerraste la brecha de ahorro de tu plan estimado.',
    icono: PiggyBank,
    categoria: 'financiero',
    xp: 150,
    obtenido: false,
  },
  {
    id: 'rompecabezas',
    nombre: 'Financiar completo',
    descripcion: 'Termina las 6 lecciones de cómo financiar.',
    icono: Puzzle,
    categoria: 'financiero',
    xp: 120,
    obtenido: false,
  },
  {
    id: 'conversador',
    nombre: 'Listo para el asesor',
    descripcion: 'Completa la etapa final antes de la llamada.',
    icono: PhoneCall,
    categoria: 'decidido',
    xp: 100,
    obtenido: false,
  },
  {
    id: 'llaves-casa',
    nombre: 'Camino completado',
    descripcion: 'Llegaste al final del Camino a Mi Hogar.',
    icono: Home,
    categoria: 'decidido',
    xp: 200,
    obtenido: false,
  },
  {
    id: 'checklist-pro',
    nombre: 'Checklist pro',
    descripcion: 'Marca todos los documentos como listos.',
    icono: CheckCircle2,
    categoria: 'preparado',
    xp: 70,
    obtenido: false,
  },
  {
    id: 'simulador',
    nombre: 'Simulador',
    descripcion: 'Corre la simulación de ahorro de tu plan.',
    icono: BarChart3,
    categoria: 'financiero',
    xp: 50,
    obtenido: false,
  },
  {
    id: 'curiosidad',
    nombre: 'Curiosidad',
    descripcion: 'Lee 5 contenidos educativos del camino.',
    icono: Search,
    categoria: 'explorador',
    xp: 60,
    obtenido: false,
  },
  {
    id: 'mentor',
    nombre: 'Mentor',
    descripcion: 'Comparte un tip con tu asesor (próximamente).',
    icono: Handshake,
    categoria: 'especiales',
    xp: 80,
    obtenido: false,
  },
  {
    id: 'sin-dudas',
    nombre: 'Sin dudas',
    descripcion: 'Resuelve 10 preguntas del asistente (próximamente).',
    icono: Lightbulb,
    categoria: 'especiales',
    xp: 90,
    obtenido: false,
  },
  {
    id: 'plan-cerrado',
    nombre: 'Plan cerrado',
    descripcion: 'Tu plan SFV estimado llega a meses = 0.',
    icono: Target,
    categoria: 'decidido',
    xp: 180,
    obtenido: false,
  },
  {
    id: 'estrella-camino',
    nombre: 'Categoría dominada',
    descripcion: 'Desbloqueaste todos los logros de una categoría.',
    icono: Sparkles,
    categoria: 'especiales',
    xp: 300,
    obtenido: false,
  },
];

export function resumenLogros(catalogo: readonly LogroCatalogItem[] = LOGROS_CATALOG): {
  obtenidos: number;
  total: number;
  xpTotales: number;
  categoriasCompletas: number;
} {
  const obtenidos = catalogo.filter((l) => l.obtenido).length;
  const xpTotales = catalogo.filter((l) => l.obtenido).reduce((acc, l) => acc + l.xp, 0);

  const cats = new Set(catalogo.map((l) => l.categoria));
  let categoriasCompletas = 0;
  for (const cat of cats) {
    const deCat = catalogo.filter((l) => l.categoria === cat);
    const obtenidosCat = deCat.filter((l) => l.obtenido).length;
    // Mock: una categoría "completa" cuando ya desbloqueaste el núcleo (≥2).
    if (obtenidosCat >= 2) categoriasCompletas += 1;
  }

  return { obtenidos, total: catalogo.length, xpTotales, categoriasCompletas };
}
