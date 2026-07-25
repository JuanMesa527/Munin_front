/**
 * Datos de demo de F1 (capa model) — tasks.md 3.5.
 *
 * REGLA DURA (D9 del design.md, ya endurecida): estos turnos SOLO se usan
 * como respaldo cuando la llamada a la API falla con `NETWORK_ERROR` o
 * `TIMEOUT_ERROR` (backend inalcanzable). Nunca sustituyen una respuesta real
 * del backend, ni siquiera un `routing: null` real (`DATA_UNAVAILABLE`): ese
 * caso muestra el mensaje honesto del backend y se detiene ahi. No hay switch
 * manual "ver ejemplo" en ningun lugar de la UI — `model/use-intake-conversation`
 * es el UNICO lugar que decide cuando ofrecer este arreglo, y solo lo hace
 * tras un error de conectividad.
 *
 * Guion: 6 preguntas confirmadas con producto, en este orden — afiliacion,
 * rango salarial, segmento familiar, ciudad, ahorro, capacidad de ahorro
 * mensual — y un cierre `completado-viable`. Cero PII real: `LeadProfile` no
 * lleva nombre ni telefono (esos solo existen en `EnrichedLead`, fuera de
 * F1), y los textos son puramente de guion.
 */

import type { ConversationTurn, LeadProfile } from '@contracts';

const AHORA = '2026-07-25T14:00:00.000Z';

function mensajeBot(id: string, texto: string): ConversationTurn['mensajes'][number] {
  return { id, texto, quickReplies: [], emisor: 'bot', enviadoEn: AHORA };
}

const PERFIL_BASE: LeadProfile = {
  id: 'fixture-lead-001',
  consentimiento: null,
  esAfiliado: null,
  rangoSalarial: null,
  segmento: null,
  personasACargo: null,
  ciudad: null,
  segmentoFamiliar: null,
  ahorroDeclarado: null,
  capacidadAhorroMensual: null,
  slotsLlenos: [],
  capacidad: null,
  score: null,
  proyectos: [],
  carril: null,
  createdAt: AHORA,
  updatedAt: AHORA,
};

/**
 * Guion completo de la demo offline, en orden. `model/use-intake-conversation`
 * avanza un indice sobre este arreglo cuando esta en modo fixture; nunca lo
 * usa por fuera de ese modo.
 */
export const FIXTURE_TURNS: readonly ConversationTurn[] = [
  // 0 · saludo + gate de consentimiento (post /start, sin persistir)
  {
    profile: { ...PERFIL_BASE, consentimiento: null },
    mensajes: [
      mensajeBot(
        'fixture-msg-0',
        'Hola, soy el asistente de Colsubsidio para vivienda. Antes de arrancar necesito tu autorización para tratar tus datos.',
      ),
    ],
    siguientePaso: {
      id: 'fixture-paso-consentimiento',
      slot: null,
      tipo: 'consentimiento',
      permiteTextoLibre: false,
      quickReplies: [],
    },
    progreso: 0,
    routing: null,
  },
  // 1 · consentimiento otorgado -> primera pregunta: afiliacion
  {
    profile: {
      ...PERFIL_BASE,
      consentimiento: {
        otorgado: true,
        versionPolitica: 'v1.0-2026-07',
        finalidades: ['perfilamiento_vivienda', 'contacto_comercial', 'educacion_financiera'],
        otorgadoEn: AHORA,
        canal: 'web-chat',
      },
    },
    mensajes: [mensajeBot('fixture-msg-1', '¡Gracias! Para empezar, ¿estás afiliado a Colsubsidio?')],
    siguientePaso: {
      id: 'fixture-paso-afiliacion',
      slot: 'afiliacion',
      tipo: 'pregunta',
      permiteTextoLibre: true,
      quickReplies: [
        { label: 'Sí, soy afiliado', value: 'true' },
        { label: 'No, no soy afiliado', value: 'false' },
      ],
    },
    progreso: 0.12,
    routing: null,
  },
  // 2 · afiliacion respondida -> rango salarial
  {
    profile: {
      ...PERFIL_BASE,
      consentimiento: {
        otorgado: true,
        versionPolitica: 'v1.0-2026-07',
        finalidades: ['perfilamiento_vivienda', 'contacto_comercial', 'educacion_financiera'],
        otorgadoEn: AHORA,
        canal: 'web-chat',
      },
      esAfiliado: true,
      slotsLlenos: ['afiliacion'],
    },
    mensajes: [mensajeBot('fixture-msg-2', 'Perfecto. ¿En qué rango de ingresos mensuales estás?')],
    siguientePaso: {
      id: 'fixture-paso-rango-salarial',
      slot: 'rangoSalarial',
      tipo: 'pregunta',
      permiteTextoLibre: true,
      quickReplies: [
        { label: '2-4 SMMLV', value: '2-4 SMMLV' },
        { label: '4-6 SMMLV', value: '4-6 SMMLV' },
      ],
    },
    progreso: 0.28,
    routing: null,
  },
  // 3 · rango salarial respondido -> segmento familiar
  {
    profile: {
      ...PERFIL_BASE,
      consentimiento: {
        otorgado: true,
        versionPolitica: 'v1.0-2026-07',
        finalidades: ['perfilamiento_vivienda', 'contacto_comercial', 'educacion_financiera'],
        otorgadoEn: AHORA,
        canal: 'web-chat',
      },
      esAfiliado: true,
      rangoSalarial: '4-6 SMMLV',
      slotsLlenos: ['afiliacion', 'rangoSalarial'],
    },
    mensajes: [mensajeBot('fixture-msg-3', 'Bien. ¿Cómo describirías tu hogar?')],
    siguientePaso: {
      id: 'fixture-paso-segmento-familiar',
      slot: 'segmentoFamiliar',
      tipo: 'pregunta',
      permiteTextoLibre: true,
      quickReplies: [
        { label: 'Pareja con hijos', value: 'Pareja con hijos' },
        { label: 'Pareja sin hijos', value: 'Pareja sin hijos' },
      ],
    },
    progreso: 0.44,
    routing: null,
  },
  // 4 · segmento familiar respondido -> ciudad
  {
    profile: {
      ...PERFIL_BASE,
      consentimiento: {
        otorgado: true,
        versionPolitica: 'v1.0-2026-07',
        finalidades: ['perfilamiento_vivienda', 'contacto_comercial', 'educacion_financiera'],
        otorgadoEn: AHORA,
        canal: 'web-chat',
      },
      esAfiliado: true,
      rangoSalarial: '4-6 SMMLV',
      segmentoFamiliar: 'Pareja con hijos',
      slotsLlenos: ['afiliacion', 'rangoSalarial', 'segmentoFamiliar'],
    },
    mensajes: [mensajeBot('fixture-msg-4', '¿En qué ciudad estás buscando vivienda?')],
    siguientePaso: {
      id: 'fixture-paso-ciudad',
      slot: 'ciudad',
      tipo: 'pregunta',
      permiteTextoLibre: true,
      quickReplies: [
        { label: 'Bogotá', value: 'Bogotá' },
        { label: 'Soacha', value: 'Soacha' },
      ],
    },
    progreso: 0.6,
    routing: null,
  },
  // 5 · ciudad respondida -> ahorro
  {
    profile: {
      ...PERFIL_BASE,
      consentimiento: {
        otorgado: true,
        versionPolitica: 'v1.0-2026-07',
        finalidades: ['perfilamiento_vivienda', 'contacto_comercial', 'educacion_financiera'],
        otorgadoEn: AHORA,
        canal: 'web-chat',
      },
      esAfiliado: true,
      rangoSalarial: '4-6 SMMLV',
      segmentoFamiliar: 'Pareja con hijos',
      ciudad: 'Bogotá',
      slotsLlenos: ['afiliacion', 'rangoSalarial', 'segmentoFamiliar', 'ciudad'],
    },
    mensajes: [mensajeBot('fixture-msg-5', '¿Cuánto tienes ahorrado hoy para tu vivienda, aproximadamente?')],
    siguientePaso: {
      id: 'fixture-paso-ahorro',
      slot: 'ahorro',
      tipo: 'pregunta',
      permiteTextoLibre: true,
      quickReplies: [],
    },
    progreso: 0.76,
    routing: null,
  },
  // 6 · ahorro respondido -> capacidad de ahorro mensual
  {
    profile: {
      ...PERFIL_BASE,
      consentimiento: {
        otorgado: true,
        versionPolitica: 'v1.0-2026-07',
        finalidades: ['perfilamiento_vivienda', 'contacto_comercial', 'educacion_financiera'],
        otorgadoEn: AHORA,
        canal: 'web-chat',
      },
      esAfiliado: true,
      rangoSalarial: '4-6 SMMLV',
      segmentoFamiliar: 'Pareja con hijos',
      ciudad: 'Bogotá',
      ahorroDeclarado: 30_000_000,
      slotsLlenos: ['afiliacion', 'rangoSalarial', 'segmentoFamiliar', 'ciudad', 'ahorro'],
    },
    mensajes: [
      mensajeBot('fixture-msg-6', 'Última pregunta: ¿cuánto podrías ahorrar cada mes de aquí en adelante?'),
    ],
    siguientePaso: {
      id: 'fixture-paso-capacidad-ahorro',
      slot: 'capacidadAhorroMensual',
      tipo: 'pregunta',
      permiteTextoLibre: true,
      quickReplies: [],
    },
    progreso: 0.9,
    routing: null,
  },
  // 7 · cierre: completado-viable (demo, con score y factores explicables)
  {
    profile: {
      ...PERFIL_BASE,
      consentimiento: {
        otorgado: true,
        versionPolitica: 'v1.0-2026-07',
        finalidades: ['perfilamiento_vivienda', 'contacto_comercial', 'educacion_financiera'],
        otorgadoEn: AHORA,
        canal: 'web-chat',
      },
      esAfiliado: true,
      rangoSalarial: '4-6 SMMLV',
      segmentoFamiliar: 'Pareja con hijos',
      ciudad: 'Bogotá',
      ahorroDeclarado: 30_000_000,
      capacidadAhorroMensual: 900_000,
      slotsLlenos: [
        'afiliacion',
        'rangoSalarial',
        'segmentoFamiliar',
        'ciudad',
        'ahorro',
        'capacidadAhorroMensual',
      ],
      capacidad: {
        banda: 'media',
        faltantes: [],
        cuotaMensualEstimada: 900_000,
        precioMaximoEstimado: 210_000_000,
      },
      score: {
        valor: 78,
        factores: [
          { nombre: 'Afiliación', peso: 0.35, valor: 'Afiliado', contribucion: 28, intensidad: 100 },
          { nombre: 'Ahorro declarado', peso: 0.25, valor: '$30.000.000', contribucion: 14, intensidad: 56 },
          {
            nombre: 'Capacidad de ahorro mensual',
            peso: 0.25,
            valor: '$900.000',
            contribucion: 12,
            intensidad: 48,
          },
          { nombre: 'Personas a cargo', peso: 0.15, valor: 'No informado', contribucion: -6, intensidad: 20 },
        ],
        weightsVersion: 'demo-fixture-1.0',
        calculadoEn: AHORA,
      },
      proyectos: [
        {
          proyectoId: 'fixture-proyecto-1',
          similitud: 0.86,
          razon:
            'Tu ahorro y tu ciudad calzan con el perfil típico de compradores de este proyecto en Bogotá.',
          nombre: 'Ciudadela del Norte',
          etapa: 'Etapa 2',
          precioDesde: 180_000_000,
          tipologia: 'VIS · 3 hab',
        },
      ],
      carril: 'viable',
    },
    mensajes: [
      mensajeBot(
        'fixture-msg-7',
        'Con lo que me compartiste, tu perfil se ve viable para continuar con un asesor. Esto es una demostración: los datos no representan a un comprador real.',
      ),
    ],
    siguientePaso: null,
    progreso: 1,
    routing: {
      carril: 'viable',
      razones: [],
      explicacion:
        '(Demo) Tu combinación de afiliación, ahorro y capacidad mensual estimada te ubica en el carril viable.',
      decididoEn: AHORA,
    },
  },
];
