/**
 * Datos de demo del "Camino a Mi Hogar" (capa model, F2.2).
 *
 * Espejan el mock del equipo: ~65% de progreso, etapas 1–2 completas, etapa
 * "financiar" en curso (3 de 6 lecciones), XP 1.250. Con esto la pantalla se
 * ve completa SIN backend.
 */

import type { ContenidoEducativo, EducationJourney } from '@contracts';
import { ETAPAS_CAMINO } from '@contracts';

export const JOURNEY_FIXTURE: EducationJourney = {
  leadId: 'demo-lead-1',
  plan: {
    precioObjetivo: 146_115_000,
    subsidioEstimado: 32_470_000,
    gap: 105_645_000,
    mesesParaCalificar: 151,
    proyectoObjetivoId: 'vis-referencia',
    aplicaSubsidio: true,
  },
  metas: [
    {
      id: 'meta-edu-descubrir',
      titulo: 'Descubrí si podés comprar',
      descripcion: 'Aprendé lo clave de esta etapa en pocos minutos.',
      tipo: 'educacion',
      objetivo: 1,
      alcanzado: 1,
      completada: true,
      puntos: 30,
      badgeId: null,
      etapa: 'descubrir',
    },
    {
      id: 'meta-edu-capacidad',
      titulo: 'Entendé tu capacidad financiera',
      descripcion: 'Simulá tu ahorro y tu cuota estimada.',
      tipo: 'educacion',
      objetivo: 1,
      alcanzado: 1,
      completada: true,
      puntos: 30,
      badgeId: null,
      etapa: 'capacidad',
    },
    {
      id: 'meta-ahorro',
      titulo: 'Cerrá tu brecha de ahorro',
      descripcion: 'Registrá tus aportes hasta alcanzar la meta de ahorro.',
      tipo: 'ahorro',
      objetivo: 105_645_000,
      alcanzado: 30_000_000,
      completada: true,
      puntos: 100,
      badgeId: 'badge-ahorrador',
      etapa: 'capacidad',
    },
    {
      id: 'meta-fin-1',
      titulo: '¿Qué es un crédito hipotecario?',
      descripcion: 'Conceptos básicos del crédito de vivienda.',
      tipo: 'educacion',
      objetivo: 1,
      alcanzado: 1,
      completada: true,
      puntos: 20,
      badgeId: null,
      etapa: 'financiar',
    },
    {
      id: 'meta-fin-2',
      titulo: '¿Qué es el SFV?',
      descripcion: 'Subsidio Familiar de Vivienda, estimado.',
      tipo: 'educacion',
      objetivo: 1,
      alcanzado: 1,
      completada: true,
      puntos: 20,
      badgeId: null,
      etapa: 'financiar',
    },
    {
      id: 'meta-fin-3',
      titulo: 'Alternativas de financiamiento',
      descripcion: 'Opciones además del crédito tradicional.',
      tipo: 'educacion',
      objetivo: 1,
      alcanzado: 1,
      completada: true,
      puntos: 20,
      badgeId: null,
      etapa: 'financiar',
    },
    {
      id: 'meta-fin-4',
      titulo: 'Tasa fija vs. variable',
      descripcion: 'Cómo impacta la tasa en tu cuota.',
      tipo: 'educacion',
      objetivo: 1,
      alcanzado: 0,
      completada: false,
      puntos: 20,
      badgeId: null,
      etapa: 'financiar',
    },
    {
      id: 'meta-fin-5',
      titulo: 'Cuota vs. ingreso',
      descripcion: 'La regla práctica para no sobreendeudarte.',
      tipo: 'educacion',
      objetivo: 1,
      alcanzado: 0,
      completada: false,
      puntos: 20,
      badgeId: null,
      etapa: 'financiar',
    },
    {
      id: 'meta-fin-6',
      titulo: 'Armá tu plan de financiamiento',
      descripcion: 'Juntá crédito + subsidio + ahorro.',
      tipo: 'educacion',
      objetivo: 1,
      alcanzado: 0,
      completada: false,
      puntos: 30,
      badgeId: null,
      etapa: 'financiar',
    },
    {
      id: 'meta-doc',
      titulo: 'Reuní tus documentos',
      descripcion: 'Tené listo lo que te van a pedir para comprar.',
      tipo: 'documentacion',
      objetivo: 1,
      alcanzado: 0,
      completada: false,
      puntos: 50,
      badgeId: 'badge-preparado',
      etapa: 'prepararse',
    },
    {
      id: 'meta-edu-llegar',
      titulo: 'Preparate para hablar con un asesor',
      descripcion: 'Aprendé lo clave de esta etapa en pocos minutos.',
      tipo: 'educacion',
      objetivo: 1,
      alcanzado: 0,
      completada: false,
      puntos: 30,
      badgeId: null,
      etapa: 'llegar',
    },
  ],
  progreso: 0.65,
  puntosTotales: 1250,
  badges: [
    {
      id: 'badge-ahorrador',
      nombre: 'Ahorrador',
      descripcion: 'Cerraste la brecha de ahorro hacia tu meta',
      icono: 'piggy-bank',
      desbloqueadoEn: '2026-07-24T12:00:00.000Z',
    },
    {
      id: 'badge-preparado',
      nombre: 'Preparado',
      descripcion: 'Reuniste los documentos para comprar',
      icono: 'file-text',
      desbloqueadoEn: null,
    },
  ],
  reclasificadoAViable: false,
  razonesIngreso: ['ahorro_insuficiente'],
  etapas: [...ETAPAS_CAMINO],
  actualizadoEn: '2026-07-25T00:00:00.000Z',
};

export const CONTENIDOS_FIXTURE: ContenidoEducativo[] = [
  {
    id: 'cont-descubrir-comprar-vs-arrendar',
    etapa: 'descubrir',
    titulo: 'Comprar vs. arrendar',
    cuerpo:
      'Arrendar es de otro; la cuota de un crédito construye tu patrimonio. La pregunta no es "¿puedo?", sino "¿por dónde empiezo?". Este camino te lo muestra.',
    tipoContenido: 'concepto',
  },
  {
    id: 'cont-descubrir-que-es-vis',
    etapa: 'descubrir',
    titulo: '¿Qué es una vivienda VIS?',
    cuerpo:
      'La Vivienda de Interés Social tiene precio topado por ley y acceso preferente a subsidios. Es la puerta de entrada más común a la vivienda propia.',
    tipoContenido: 'concepto',
  },
  {
    id: 'cont-descubrir-senales-listo',
    etapa: 'descubrir',
    titulo: '¿Cuándo estoy listo para empezar?',
    cuerpo:
      'No necesitás el 100% ahorrado para arrancar: alcanza con un ingreso estable y algo de ahorro, aunque sea pequeño. El resto (subsidio, crédito, tiempo) lo va armando el camino con vos.',
    tipoContenido: 'concepto',
  },
  {
    id: 'cont-capacidad-cuota-inicial',
    etapa: 'capacidad',
    titulo: 'Tu cuota inicial',
    cuerpo:
      'La cuota inicial suele ser el 20-30% del valor. Tu ahorro y el subsidio estimado suman para cubrirla: por eso ahorrar mueve tu meta más rápido de lo que crees.',
    tipoContenido: 'concepto',
  },
  {
    id: 'cont-capacidad-endeudamiento',
    etapa: 'capacidad',
    titulo: 'Cuánto crédito podés pagar',
    cuerpo:
      'Los bancos usan una regla práctica: la cuota mensual no debería superar el 30% de tu ingreso neto familiar. Si ganás $3.000.000, tu cuota estimada cómoda ronda los $900.000 — eso, no el precio de la vivienda, define cuánto podés pedir prestado.',
    tipoContenido: 'concepto',
  },
  {
    id: 'cont-capacidad-simulacion',
    etapa: 'capacidad',
    titulo: 'Simulá tu ahorro',
    cuerpo:
      'Con lo que declaraste, cada mes de ahorro te acerca a cerrar la brecha. El plan te muestra cuántos meses faltan: es un estimado, y baja si aumentás el aporte.',
    tipoContenido: 'simulacion',
  },
  {
    id: 'cont-financiar-credito',
    etapa: 'financiar',
    titulo: '¿Qué es un crédito hipotecario?',
    cuerpo:
      'Es un préstamo a largo plazo (típicamente 15-20 años) respaldado por la vivienda que comprás: si dejás de pagar, el banco puede recuperarla. Es la forma más común de financiar vivienda en Colombia, y se combina con tu ahorro y el subsidio estimado.',
    tipoContenido: 'concepto',
  },
  {
    id: 'cont-financiar-que-es-sfv',
    etapa: 'financiar',
    titulo: '¿Qué es el Subsidio Familiar de Vivienda?',
    cuerpo:
      'El SFV es un aporte no reembolsable de la caja de compensación para hogares con ingresos de hasta 4 SMMLV: hasta 30 SMMLV si ganás menos de 2 SMMLV, hasta 20 SMMLV si ganás entre 2 y 4. Complementa tu ahorro y tu crédito. Acá lo calculamos como estimado, no como aprobado.',
    tipoContenido: 'concepto',
  },
  {
    id: 'cont-financiar-credito-vs-leasing',
    etapa: 'financiar',
    titulo: 'Crédito hipotecario y leasing',
    cuerpo:
      'Son dos formas de financiar: en el crédito la vivienda es tuya desde el inicio; en el leasing habitacional la habitás y la compras al final del contrato, ejerciendo una opción de compra. La aprobación y las condiciones siempre las define la entidad financiera.',
    tipoContenido: 'concepto',
  },
  {
    id: 'cont-financiar-alternativas',
    etapa: 'financiar',
    titulo: 'Alternativas de financiamiento',
    cuerpo:
      'Además del crédito bancario tradicional existen cooperativas y fondos de empleados (suelen tener tasas más flexibles), el ahorro programado en tu caja de compensación, y tus cesantías, que podés destinar directamente a la compra de vivienda.',
    tipoContenido: 'concepto',
  },
  {
    id: 'cont-financiar-tasa-fija-variable',
    etapa: 'financiar',
    titulo: 'Tasa fija vs. variable',
    cuerpo:
      'Con tasa fija tu cuota no cambia durante todo el crédito: previsibilidad total. Con tasa variable (indexada a la UVR) la cuota puede subir o bajar con la inflación, arrancando más baja pero con menos certeza a largo plazo. A mayor plazo del crédito, más pesa esa diferencia.',
    tipoContenido: 'concepto',
  },
  {
    id: 'cont-financiar-cuota-vs-ingreso',
    etapa: 'financiar',
    titulo: 'Cuota vs. ingreso',
    cuerpo:
      'La regla del 30% no es un capricho del banco: es lo que te deja margen para vivir sin ahogarte cada mes. Antes de fijar el precio objetivo de tu vivienda, calculá primero cuánto podés pagar cómodo — el precio se ajusta a tu cuota, no al revés.',
    tipoContenido: 'concepto',
  },
  {
    id: 'cont-financiar-plan',
    etapa: 'financiar',
    titulo: 'Armá tu plan de financiamiento',
    cuerpo:
      'Tu plan es la suma de tres piezas: lo que ya ahorraste, el subsidio estimado que te corresponde, y el crédito que cubre el resto. Ver los tres números juntos es lo que convierte "quiero comprar" en una meta con fecha.',
    tipoContenido: 'concepto',
  },
  {
    id: 'cont-prepararse-checklist-documentos',
    etapa: 'prepararse',
    titulo: 'Tus documentos, listos',
    cuerpo:
      'Cédula, certificado laboral o de ingresos, extractos bancarios de los últimos 3-6 meses, declaración de renta (si aplica) y tu historia de ahorro programado. Tenerlos a mano acelera todo cuando hables con el asesor.',
    tipoContenido: 'checklist',
  },
  {
    id: 'cont-prepararse-avaluo-estudio-titulo',
    etapa: 'prepararse',
    titulo: 'Avalúo y estudio de título',
    cuerpo:
      'Antes de firmar, el banco pide un avalúo (confirma que el precio es justo) y un estudio de título (confirma que el inmueble no tiene deudas ni líos legales pendientes). Son pasos normales del proceso, no un obstáculo.',
    tipoContenido: 'concepto',
  },
  {
    id: 'cont-llegar-que-esperar-asesor',
    etapa: 'llegar',
    titulo: 'Qué esperar del asesor',
    cuerpo:
      'Llegás informado: sabés tu capacidad estimada, tu subsidio estimado y qué proyecto te encaja. El asesor te ayuda a concretar, no a empezar de cero.',
    tipoContenido: 'concepto',
  },
];
