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
 * Guion offline (fallback de red): identidad de contacto (nombre/email/
 * telefono/edad/estadoCivil) + perfilamiento financiero (afiliacion, rango
 * salarial, segmento familiar, ciudad, ahorro, capacidad mensual) + cierre
 * `completado-viable`. Datos ficticios (example.com / 300…). `identidad`
 * tokenizada queda en `null` (el telefono real no viaja en el DTO).
 */

import type { ConversationTurn, LeadProfile } from '@contracts';

const AHORA = '2026-07-25T14:00:00.000Z';

function mensajeBot(id: string, texto: string): ConversationTurn['mensajes'][number] {
  return { id, texto, quickReplies: [], emisor: 'bot', enviadoEn: AHORA };
}

const PERFIL_BASE: LeadProfile = {
  id: 'fixture-lead-001',
  consentimiento: null,
  identidad: null,
  nombre: null,
  email: null,
  telefono: null,
  edad: null,
  estadoCivil: null,
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

const CONSENT = {
  otorgado: true as const,
  versionPolitica: 'v1.0-2026-07',
  finalidades: [
    'perfilamiento_vivienda' as const,
    'contacto_comercial' as const,
    'educacion_financiera' as const,
  ],
  otorgadoEn: AHORA,
  canal: 'web-chat',
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
  // 1 · consentimiento -> nombre
  {
    profile: { ...PERFIL_BASE, consentimiento: CONSENT },
    mensajes: [mensajeBot('fixture-msg-1', '¡Gracias! Para empezar, ¿cómo te llamas?')],
    siguientePaso: {
      id: 'fixture-paso-nombre',
      slot: 'nombre',
      tipo: 'pregunta',
      permiteTextoLibre: true,
      quickReplies: [],
    },
    progreso: 0,
    routing: null,
  },
  // 2 · nombre -> email (identidad ya avanzada en el perfil del turn)
  {
    profile: {
      ...PERFIL_BASE,
      consentimiento: CONSENT,
      nombre: 'María Demo',
      email: 'maria.demo@example.com',
      telefono: '3001234567',
      edad: 27,
      estadoCivil: 'Soltero/a',
      slotsLlenos: ['nombre', 'email', 'telefono', 'edad', 'estadoCivil'],
    },
    mensajes: [mensajeBot('fixture-msg-2', '¿Estás afiliado a Colsubsidio?')],
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
    progreso: 5 / 11,
    routing: null,
  },
  // 3 · afiliacion -> rango salarial
  {
    profile: {
      ...PERFIL_BASE,
      consentimiento: CONSENT,
      nombre: 'María Demo',
      email: 'maria.demo@example.com',
      telefono: '3001234567',
      edad: 27,
      estadoCivil: 'Soltero/a',
      esAfiliado: true,
      slotsLlenos: ['nombre', 'email', 'telefono', 'edad', 'estadoCivil', 'afiliacion'],
    },
    mensajes: [mensajeBot('fixture-msg-3', 'Perfecto. ¿En qué rango de ingresos mensuales estás?')],
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
    progreso: 6 / 11,
    routing: null,
  },
  // 4 · rango -> segmento familiar
  {
    profile: {
      ...PERFIL_BASE,
      consentimiento: CONSENT,
      nombre: 'María Demo',
      email: 'maria.demo@example.com',
      telefono: '3001234567',
      edad: 27,
      estadoCivil: 'Soltero/a',
      esAfiliado: true,
      rangoSalarial: '4-6 SMMLV',
      slotsLlenos: [
        'nombre',
        'email',
        'telefono',
        'edad',
        'estadoCivil',
        'afiliacion',
        'rangoSalarial',
      ],
    },
    mensajes: [mensajeBot('fixture-msg-4', 'Bien. ¿Cómo describirías tu hogar?')],
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
    progreso: 7 / 11,
    routing: null,
  },
  // 5 · segmento -> ciudad
  {
    profile: {
      ...PERFIL_BASE,
      consentimiento: CONSENT,
      nombre: 'María Demo',
      email: 'maria.demo@example.com',
      telefono: '3001234567',
      edad: 27,
      estadoCivil: 'Soltero/a',
      esAfiliado: true,
      rangoSalarial: '4-6 SMMLV',
      segmentoFamiliar: 'Pareja con hijos',
      slotsLlenos: [
        'nombre',
        'email',
        'telefono',
        'edad',
        'estadoCivil',
        'afiliacion',
        'rangoSalarial',
        'segmentoFamiliar',
      ],
    },
    mensajes: [mensajeBot('fixture-msg-5', '¿En qué ciudad estás buscando vivienda?')],
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
    progreso: 8 / 11,
    routing: null,
  },
  // 6 · ciudad -> ahorro
  {
    profile: {
      ...PERFIL_BASE,
      consentimiento: CONSENT,
      nombre: 'María Demo',
      email: 'maria.demo@example.com',
      telefono: '3001234567',
      edad: 27,
      estadoCivil: 'Soltero/a',
      esAfiliado: true,
      rangoSalarial: '4-6 SMMLV',
      segmentoFamiliar: 'Pareja con hijos',
      ciudad: 'Bogotá',
      slotsLlenos: [
        'nombre',
        'email',
        'telefono',
        'edad',
        'estadoCivil',
        'afiliacion',
        'rangoSalarial',
        'segmentoFamiliar',
        'ciudad',
      ],
    },
    mensajes: [mensajeBot('fixture-msg-6', '¿Cuánto tienes ahorrado hoy para tu vivienda, aproximadamente?')],
    siguientePaso: {
      id: 'fixture-paso-ahorro',
      slot: 'ahorro',
      tipo: 'pregunta',
      permiteTextoLibre: true,
      quickReplies: [],
    },
    progreso: 9 / 11,
    routing: null,
  },
  // 7 · ahorro -> capacidad mensual
  {
    profile: {
      ...PERFIL_BASE,
      consentimiento: CONSENT,
      nombre: 'María Demo',
      email: 'maria.demo@example.com',
      telefono: '3001234567',
      edad: 27,
      estadoCivil: 'Soltero/a',
      esAfiliado: true,
      rangoSalarial: '4-6 SMMLV',
      segmentoFamiliar: 'Pareja con hijos',
      ciudad: 'Bogotá',
      ahorroDeclarado: 30_000_000,
      slotsLlenos: [
        'nombre',
        'email',
        'telefono',
        'edad',
        'estadoCivil',
        'afiliacion',
        'rangoSalarial',
        'segmentoFamiliar',
        'ciudad',
        'ahorro',
      ],
    },
    mensajes: [
      mensajeBot('fixture-msg-7', 'Última pregunta: ¿cuánto podrías ahorrar cada mes de aquí en adelante?'),
    ],
    siguientePaso: {
      id: 'fixture-paso-capacidad-ahorro',
      slot: 'capacidadAhorroMensual',
      tipo: 'pregunta',
      permiteTextoLibre: true,
      quickReplies: [],
    },
    progreso: 10 / 11,
    routing: null,
  },
  // 8 · cierre viable
  {
    profile: {
      ...PERFIL_BASE,
      consentimiento: CONSENT,
      nombre: 'María Demo',
      email: 'maria.demo@example.com',
      telefono: '3001234567',
      edad: 27,
      estadoCivil: 'Soltero/a',
      esAfiliado: true,
      rangoSalarial: '4-6 SMMLV',
      segmentoFamiliar: 'Pareja con hijos',
      ciudad: 'Bogotá',
      ahorroDeclarado: 30_000_000,
      capacidadAhorroMensual: 900_000,
      slotsLlenos: [
        'nombre',
        'email',
        'telefono',
        'edad',
        'estadoCivil',
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
        'fixture-msg-8',
        'Con lo que me compartiste, tu perfil se ve viable para continuar con un asesor.',
      ),
    ],
    siguientePaso: null,
    progreso: 1,
    routing: {
      carril: 'viable',
      razones: [],
      explicacion:
        'Tu combinación de afiliación, ahorro y capacidad mensual estimada te ubica en el carril viable.',
      decididoEn: AHORA,
    },
  },
];
