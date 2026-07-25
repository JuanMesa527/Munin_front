/**
 * Traduce la semilla de demo a los tipos del contrato.
 *
 * Existe para que F3 y F4 consuman EXACTAMENTE los mismos tipos que van a
 * llegar del backend (`ViableLeadListItem`, `BriefingSheet`). Cuando los
 * endpoints existan, se borra el fallback y no se toca ni una linea de UI:
 * ese es el punto de tener un contrato.
 *
 * Lo que arma `buildTalkingPoints` es un espejo de `GetTalkingPointsUseCase`
 * del backend. Es DETERMINISTA a proposito: la seleccion y el orden de los
 * puntos son logica, no generacion de un modelo (regla 12, glass-box). Un LLM
 * podria despues reescribir el texto, nunca decidir cuales aparecen.
 */

import {
  SLOTS,
  TOPE_SFV_SMMLV,
  type Banda,
  type BriefingSheet,
  type CapacityBand,
  type ConsentRecord,
  type EnrichedLead,
  type Factor,
  type ProjectMatch,
  type ScoreResult,
  type TalkingPoint,
  type ViableLeadListItem,
} from '@contracts';
import { formatCOPCompact } from '../lib/format-money';
import { SEED_LEADS, type SeedLead } from './leads.seed';

/** Version ficticia de pesos: la real sale del pipeline de `analysis/`. */
const WEIGHTS_VERSION_DEMO = '2026-07-24.demo';
const POLITICA_VERSION_DEMO = '2026-07-24.v1';

function toFactores(seed: SeedLead): Factor[] {
  return seed.factores.map((f) => ({
    nombre: f.nombre,
    peso: f.peso,
    valor: f.nota,
    contribucion: f.contribucion,
    intensidad: f.intensidad,
  }));
}

function toScoreResult(seed: SeedLead): ScoreResult {
  return {
    valor: seed.score,
    factores: toFactores(seed),
    weightsVersion: WEIGHTS_VERSION_DEMO,
    calculadoEn: seed.updatedAt,
  };
}

/**
 * La banda sale del factor de capacidad, no del score global: un lead puede
 * puntuar bajo por no ser afiliado y tener el bolsillo de sobra (caso Julian).
 */
function toBanda(seed: SeedLead): Banda {
  const capacidad = seed.factores.find((f) => f.nombre === 'Capacidad vs. cuota');
  const intensidad = capacidad?.intensidad ?? 0;
  if (intensidad >= 80) return 'alta';
  if (intensidad >= 55) return 'media';
  return 'baja';
}

function toCapacityBand(seed: SeedLead): CapacityBand {
  return {
    banda: toBanda(seed),
    // Semilla de leads ya enriquecidos: no les falta ningun slot.
    faltantes: [],
    cuotaMensualEstimada: seed.cuota,
    precioMaximoEstimado: seed.capacidad,
  };
}

function toProyectos(seed: SeedLead): ProjectMatch[] {
  return seed.proyectos.map((p) => ({
    proyectoId: p.proyectoId,
    similitud: p.match / 100,
    razon: p.razon,
    nombre: p.nombre,
    etapa: p.etapa,
    precioDesde: p.precioDesde,
    tipologia: p.tipologia,
  }));
}

function toConsentimiento(seed: SeedLead): ConsentRecord {
  return {
    otorgado: true,
    versionPolitica: POLITICA_VERSION_DEMO,
    finalidades: ['perfilamiento_vivienda', 'contacto_comercial', 'educacion_financiera'],
    otorgadoEn: seed.createdAt,
    canal: 'web-chat',
  };
}

export function toEnrichedLead(seed: SeedLead): EnrichedLead {
  return {
    id: seed.id,
    consentimiento: toConsentimiento(seed),

    // Identidad de contacto declarada (LeadProfile) + tokenizada (closer).
    nombre: seed.nombre,
    email: null,
    telefono: null,
    estadoCivil: null,

    esAfiliado: seed.esAfiliado,
    rangoSalarial: seed.rangoSalarial,
    segmento: seed.segmento,
    personasACargo: seed.personasACargo,
    ciudad: seed.ciudad,
    segmentoFamiliar: seed.segmentoFamiliar,
    ahorroDeclarado: seed.ahorro,
    capacidadAhorroMensual: seed.capacidadAhorroMensual,
    slotsLlenos: [...SLOTS],

    capacidad: toCapacityBand(seed),
    score: toScoreResult(seed),
    proyectos: toProyectos(seed),
    carril: 'viable',

    createdAt: seed.createdAt,
    updatedAt: seed.updatedAt,

    // El numero real NO va aqui: solo el enmascarado y un token opaco (adenda A2).
    identidad: {
      nombre: seed.nombre,
      telefonoEnmascarado: seed.telefonoEnmascarado,
      contactoTokenId: `tok_${seed.id}`,
    },
    intereses: [...seed.intereses],
    zonaPreferida: seed.zonaPreferida,
    timingCompra: seed.timingCompra,
    motivacion: seed.motivacion,
    contacto: { canalPreferido: 'Llamada', mejorHorario: seed.mejorHorario },
    intentScore: seed.intentScore,
    enriquecidoEn: seed.updatedAt,

    edad: seed.edad,
    ocupacion: seed.ocupacion,
    hogar: seed.hogar,
    ingresosSmmlv: seed.ingresosSmmlv,
    subsidioEstimado: seed.subsidio > 0 ? seed.subsidio : null,
    citaTextual: seed.cita,
    contactabilidad: seed.contactabilidad.map((intensidad, i) => ({
      dia: (['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const)[i] ?? 'L',
      intensidad,
    })),
    horarioRazon: seed.horarioRazon,
    timeline: seed.timeline.map((t) => ({ label: t.label, fecha: t.fecha, hito: t.hito })),
  };
}

export function toListItem(seed: SeedLead): ViableLeadListItem {
  const factores = toFactores(seed);
  return {
    leadId: seed.id,
    nombre: seed.nombre,
    esAfiliado: seed.esAfiliado,
    segmento: seed.segmento,
    ciudad: seed.ciudad,
    score: seed.score,
    intentScore: seed.intentScore,
    banda: toBanda(seed),
    // Top-3 por impacto real en el score, no por orden de declaracion.
    topFactores: [...factores].sort((a, b) => b.contribucion - a.contribucion).slice(0, 3),
    vieneDeNutricion: seed.vieneDeNutricion,
    actualizadoEn: seed.updatedAt,
    edad: seed.edad,
    ocupacion: seed.ocupacion,
    capacidadEstimada: seed.capacidad,
    cuotaEstimada: seed.cuota,
    proyectoTop: toProyectos(seed)[0] ?? null,
  };
}

/** Espejo de `GetTalkingPointsUseCase`. Determinista (regla 12). */
export function buildTalkingPoints(seed: SeedLead): TalkingPoint[] {
  const interesPrincipal = seed.intereses[0]?.toLowerCase() ?? 'vivienda propia';
  const municipio = seed.ciudad.split(' · ')[0] ?? seed.ciudad;
  const top = seed.proyectos[0];

  const subsidio: TalkingPoint =
    seed.subsidio > 0
      ? {
          titulo: 'Explica el subsidio como estimado',
          detalle: `SFV estimado de ${formatCOPCompact(seed.subsidio)}, sujeto a asignación. No lo prometas.`,
          origen: 'capacidad',
          prioridad: 4,
        }
      : {
          titulo: 'Aclara por qué no aplica subsidio',
          detalle: `El SFV llega hasta ${String(TOPE_SFV_SMMLV)} SMMLV. Redirige la conversación a crédito y plazo.`,
          origen: 'capacidad',
          prioridad: 4,
        };

  return [
    {
      titulo: 'Abre reconociendo lo que ya nos dijo',
      detalle: `“Vi que buscas ${interesPrincipal} en ${municipio}.” Evita repetir preguntas del chat.`,
      origen: 'intereses',
      prioridad: 1,
    },
    {
      titulo: 'Confirma capacidad, no la asumas',
      detalle: `Habla de capacidad estimada de ${formatCOPCompact(seed.capacidad)}. Nunca digas aprobado ni preaprobado.`,
      origen: 'capacidad',
      prioridad: 2,
    },
    {
      titulo: 'Presenta el match #1 con su razón',
      detalle: top === undefined ? 'Sin proyectos afines aún.' : `${top.nombre}: ${top.razon}`,
      origen: 'matching',
      prioridad: 3,
    },
    subsidio,
    {
      titulo: 'Cierra con un siguiente paso concreto',
      detalle: 'Agenda visita a sala de ventas o llamada de seguimiento con fecha en firme.',
      origen: 'score',
      prioridad: 5,
    },
  ];
}

/**
 * Alertas duras del contrato. El diseno aprobado NO tiene un bloque de alertas
 * separado a proposito: estas dos senales ya viajan en el badge de afiliacion
 * ("NO AFILIADO · 90/10") y en el resumen del score, asi que renderizarlas otra
 * vez seria ruido en una pantalla que se lee durante una llamada. Se llenan de
 * todos modos porque el backend las va a enviar y porque una alerta futura
 * (p. ej. consentimiento revocado) SI tendria que interrumpir al closer.
 */
export function buildAlertas(seed: SeedLead): string[] {
  const alertas: string[] = [];
  if (!seed.esAfiliado) {
    alertas.push('No afiliado: esta venta consume cupo del margen 90/10.');
  }
  if (seed.ingresosSmmlv > TOPE_SFV_SMMLV) {
    alertas.push(
      `Ingresos sobre ${String(TOPE_SFV_SMMLV)} SMMLV: no aplica al Subsidio Familiar de Vivienda.`,
    );
  }
  return alertas;
}

export function toBriefingSheet(seed: SeedLead): BriefingSheet {
  return {
    lead: toEnrichedLead(seed),
    // La semilla no incluye el journey completo de F2.2; F4 muestra el
    // recorrido con `lead.timeline`, que si trae los hitos de nutricion.
    journey: null,
    talkingPoints: buildTalkingPoints(seed),
    alertas: buildAlertas(seed),
    generadoEn: seed.updatedAt,
    resumenScore: seed.resumenScore,
    objeciones: seed.objeciones.map((o) => ({
      pregunta: o.pregunta,
      respuesta: o.respuesta,
    })),
  };
}

export const SEED_LIST_ITEMS: readonly ViableLeadListItem[] = SEED_LEADS.map(toListItem);

export const SEED_BRIEFINGS: Readonly<Record<string, BriefingSheet>> = Object.fromEntries(
  SEED_LEADS.map((seed) => [seed.id, toBriefingSheet(seed)]),
);

/**
 * Simula `POST /reveal-contact`. En produccion esto es un round-trip al
 * servidor que resuelve `ContactVaultPort.revealForCall` y escribe en
 * `AuditLogPort`; aqui solo devuelve un numero inventado que ya venia en el
 * bundle de la demo.
 */
export function revealSeedPhone(leadId: string): string | null {
  return SEED_LEADS.find((l) => l.id === leadId)?.telefonoReal ?? null;
}
