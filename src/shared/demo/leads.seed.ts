/**
 * Datos semilla de la demo — leads viables de la consola del closer.
 *
 * POR QUE VIVE EN `shared/demo/` Y NO EN UNA FEATURE: F3 (dashboard) y F4
 * (ficha de llamada) necesitan EXACTAMENTE los mismos leads, y la de prohibe
 * que una feature importe internals de otra. Duplicar la semilla en las dos
 * garantizaria que se desincronicen.
 *
 * TODO ES FICTICIO. Nombres, telefonos, proyectos y montos son inventados: no
 * hay ni una cedula, ni un dato de una persona real (Ley 1581 de 2012).
 *
 * SOBRE `telefonoReal`: en produccion el numero real JAMAS llega al navegador —
 * vive detras de `ContactVaultPort` y revelarlo es un round-trip al servidor
 * que queda auditado. Aqui esta en el bundle solo porque es un numero inventado
 * y la demo tiene que funcionar sin backend. Cuando F3/F4 se conecten de
 * verdad, este campo desaparece y lo reemplaza `POST /reveal-contact`.
 */

import type { Segmento } from '@contracts';

/** Forma compacta de la semilla. Los mappers la traducen al contrato. */
export interface SeedLead {
  readonly id: string;
  readonly nombre: string;
  readonly ciudad: string;
  readonly edad: number;
  readonly ocupacion: string;
  readonly esAfiliado: boolean;
  readonly vieneDeNutricion: boolean;
  readonly score: number;
  readonly intentScore: number;
  /** Techo de precio alcanzable, en pesos enteros. */
  readonly capacidad: number;
  readonly cuota: number;
  readonly ahorro: number;
  /** Ahorro mensual sostenible declarado. */
  readonly capacidadAhorroMensual: number;
  /** SFV estimado. `0` = no aplica (supera el tope de 4 SMMLV). */
  readonly subsidio: number;
  readonly ingresosSmmlv: number;
  readonly personasACargo: number;
  readonly hogar: string;
  readonly segmento: Segmento | null;
  readonly rangoSalarial: string;
  readonly segmentoFamiliar: string;
  readonly telefonoReal: string;
  readonly telefonoEnmascarado: string;
  readonly mejorHorario: string;
  readonly horarioRazon: string;
  /** 7 intensidades L→D, 0-100 relativas a la mejor franja del propio lead. */
  readonly contactabilidad: readonly number[];
  readonly cita: string;
  readonly resumenScore: string;
  readonly factores: readonly SeedFactor[];
  readonly intereses: readonly string[];
  readonly zonaPreferida: string;
  readonly timingCompra: string;
  readonly motivacion: string;
  readonly proyectos: readonly SeedProyecto[];
  readonly objeciones: readonly SeedObjecion[];
  readonly timeline: readonly SeedHito[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SeedFactor {
  readonly nombre: string;
  /** 0-100. Que tan bien puntua el lead en este factor: es la barra. */
  readonly intensidad: number;
  /** Peso del factor en el modelo, en puntos porcentuales. */
  readonly peso: number;
  /** Puntos con signo que aporta al score final. */
  readonly contribucion: number;
  readonly nota: string;
}

export interface SeedProyecto {
  readonly proyectoId: string;
  readonly nombre: string;
  readonly etapa: string;
  readonly precioDesde: number;
  readonly tipologia: string;
  /** 0-100. */
  readonly match: number;
  readonly razon: string;
}

export interface SeedObjecion {
  readonly pregunta: string;
  readonly respuesta: string;
}

export interface SeedHito {
  readonly label: string;
  readonly fecha: string;
  readonly hito: 'ingreso' | 'consentimiento' | 'perfilamiento' | 'nutricion' | 'viable';
}

/**
 * Leads crudos que entraron por pauta antes de perfilar. El dashboard muestra
 * el contraste "214 crudos → 6 viables": es la evidencia visual del 20% de la
 * rubrica (reduccion de ruido al comercial).
 */
export const SEED_LEADS_CRUDOS = 214;

export const SEED_LEADS: readonly SeedLead[] = [
  {
    id: 'l1',
    nombre: 'Laura Restrepo M.',
    ciudad: 'Bogotá · Suba',
    edad: 31,
    ocupacion: 'Auxiliar administrativa',
    esAfiliado: true,
    vieneDeNutricion: false,
    score: 92,
    intentScore: 90,
    capacidad: 168_000_000,
    cuota: 1_120_000,
    ahorro: 22_000_000,
    capacidadAhorroMensual: 850_000,
    subsidio: 32_500_000,
    ingresosSmmlv: 2.4,
    personasACargo: 2,
    hogar: '2 personas a cargo',
    segmento: 'Medio',
    rangoSalarial: '2–4 SMMLV',
    segmentoFamiliar: 'Monoparental',
    telefonoReal: '+57 311 482 3342',
    telefonoEnmascarado: '+57 311•• ••• ••42',
    mejorHorario: 'Martes y jueves, 6:00–8:00 p.m.',
    horarioRazon: 'Respondió el chat 4 de 5 veces en esa franja',
    contactabilidad: [48, 74, 32, 100, 39, 23, 13],
    cita: 'Ya estoy cansada de arrendar. Quiero algo cerca al colegio de mi hija y que la cuota no me ahogue.',
    resumenScore:
      'Perfil casi idéntico al de compradores vigentes: afiliada, capacidad holgada frente a la cuota y ahorro previo real.',
    factores: [
      {
        nombre: 'Afiliación vigente',
        intensidad: 100,
        peso: 25,
        contribucion: 25,
        nota: 'Afiliada hace 6 años · categoría B',
      },
      {
        nombre: 'Capacidad vs. cuota',
        intensidad: 88,
        peso: 30,
        contribucion: 26,
        nota: 'Cuota estimada = 24% de sus ingresos',
      },
      {
        nombre: 'Ahorro previo',
        intensidad: 74,
        peso: 20,
        contribucion: 15,
        nota: '$22M declarados en ahorro programado',
      },
      {
        nombre: 'Intención declarada',
        intensidad: 90,
        peso: 15,
        contribucion: 14,
        nota: 'Quiere comprar en menos de 6 meses',
      },
      {
        nombre: 'Estabilidad laboral',
        intensidad: 80,
        peso: 10,
        contribucion: 8,
        nota: '4 años en la misma empresa',
      },
    ],
    intereses: [
      '3 habitaciones',
      'Cerca a colegio',
      'Zona norte',
      'Entrega 2027',
      'Parqueadero',
      'Subsidio SFV',
    ],
    zonaPreferida: 'Zona norte',
    timingCompra: 'Menos de 6 meses',
    motivacion: 'Dejar de arrendar y quedar cerca al colegio de su hija',
    proyectos: [
      {
        proyectoId: 'ciudadela-sabana',
        nombre: 'Ciudadela Sabana',
        etapa: 'Etapa 3',
        precioDesde: 189_000_000,
        tipologia: 'VIS · 3 hab',
        match: 94,
        razon: 'Cabe en su capacidad con subsidio y queda a 9 min del colegio que mencionó.',
      },
      {
        proyectoId: 'torres-parque-norte',
        nombre: 'Torres del Parque Norte',
        etapa: 'Etapa 1',
        precioDesde: 214_000_000,
        tipologia: 'No VIS · 3 hab',
        match: 78,
        razon: 'Le gusta la zona, pero exige cuota inicial mayor: solo si insiste en estrenar.',
      },
      {
        proyectoId: 'mirador-fontibon',
        nombre: 'Mirador de Fontibón',
        etapa: 'Etapa 2',
        precioDesde: 162_000_000,
        tipologia: 'VIS · 2 hab',
        match: 61,
        razon: 'Encaja en precio, pero pierde la habitación extra que pidió.',
      },
    ],
    objeciones: [
      {
        pregunta: '“La cuota inicial me queda alta.”',
        respuesta:
          'Con SFV estimado de $32,5M y su ahorro de $22M, la inicial baja a un rango manejable. Menciona ahorro programado de la caja.',
      },
      {
        pregunta: '“Prefiero seguir arrendando este año.”',
        respuesta:
          'Su arriendo actual está a 8% del valor de la cuota proyectada. Compáralo en voz alta, sin presionar cierre.',
      },
    ],
    timeline: [
      { label: 'Llegó por pauta en redes', fecha: '18 JUL 2026 · 9:12 P.M.', hito: 'ingreso' },
      {
        label: 'Aceptó tratamiento de datos',
        fecha: '18 JUL 2026 · 9:13 P.M.',
        hito: 'consentimiento',
      },
      {
        label: 'Completó perfilamiento (6 preguntas)',
        fecha: '18 JUL 2026 · 9:21 P.M.',
        hito: 'perfilamiento',
      },
      {
        label: 'Clasificada viable · enriquecimiento',
        fecha: '18 JUL 2026 · 9:24 P.M.',
        hito: 'viable',
      },
    ],
    createdAt: '2026-07-18T21:12:00.000Z',
    updatedAt: '2026-07-18T21:24:00.000Z',
  },

  {
    id: 'l2',
    nombre: 'Andrés Camilo Ríos',
    ciudad: 'Soacha · Compartir',
    edad: 28,
    ocupacion: 'Técnico logístico',
    esAfiliado: true,
    vieneDeNutricion: true,
    score: 87,
    intentScore: 86,
    capacidad: 132_000_000,
    cuota: 890_000,
    ahorro: 14_500_000,
    capacidadAhorroMensual: 620_000,
    subsidio: 35_100_000,
    ingresosSmmlv: 1.9,
    personasACargo: 1,
    hogar: '1 persona a cargo',
    segmento: 'Basico',
    rangoSalarial: '1–2 SMMLV',
    segmentoFamiliar: 'Pareja sin hijos',
    telefonoReal: '+57 320 774 1156',
    telefonoEnmascarado: '+57 320•• ••• ••56',
    mejorHorario: 'Sábados, 10:00 a.m.–12:00 m.',
    horarioRazon: 'Turnos rotativos entre semana',
    contactabilidad: [21, 31, 28, 38, 52, 100, 34],
    cita: 'Cuando empecé no me daba. Terminé el plan de ahorro y ahora sí quiero mirar opciones.',
    resumenScore:
      'Entró como no viable y se recuperó: completó el plan de ahorro de nutrición y hoy califica a subsidio pleno.',
    factores: [
      {
        nombre: 'Afiliación vigente',
        intensidad: 100,
        peso: 25,
        contribucion: 25,
        nota: 'Afiliado hace 3 años · categoría A',
      },
      {
        nombre: 'Capacidad vs. cuota',
        intensidad: 71,
        peso: 30,
        contribucion: 21,
        nota: 'Cuota estimada = 31% de sus ingresos',
      },
      {
        nombre: 'Ahorro previo',
        intensidad: 82,
        peso: 20,
        contribucion: 16,
        nota: 'Cumplió 9 de 9 metas del plan de ahorro',
      },
      {
        nombre: 'Intención declarada',
        intensidad: 86,
        peso: 15,
        contribucion: 13,
        nota: 'Compra proyectada a 8 meses',
      },
      {
        nombre: 'Estabilidad laboral',
        intensidad: 62,
        peso: 10,
        contribucion: 6,
        nota: 'Contrato a término fijo renovado 2 veces',
      },
    ],
    intereses: [
      '2 habitaciones',
      'Cerca a Transmilenio',
      'Sur / Soacha',
      'Máximo $140M',
      'Subsidio SFV',
    ],
    zonaPreferida: 'Sur / Soacha',
    timingCompra: '8 meses',
    motivacion: 'Estrenar vivienda propia después de terminar su plan de ahorro',
    proyectos: [
      {
        proyectoId: 'alameda-del-sol',
        nombre: 'Alameda del Sol',
        etapa: 'Etapa 2',
        precioDesde: 138_000_000,
        tipologia: 'VIS · 2 hab',
        match: 91,
        razon: 'Precio dentro de su tope y a 6 cuadras del portal que usa a diario.',
      },
      {
        proyectoId: 'reserva-tibana',
        nombre: 'Reserva Tibaná',
        etapa: 'Etapa 1',
        precioDesde: 149_000_000,
        tipologia: 'VIS · 2 hab',
        match: 72,
        razon: 'Un poco por encima de su tope; funciona si estira el ahorro 4 meses más.',
      },
    ],
    objeciones: [
      {
        pregunta: '“¿El subsidio sí me lo van a dar?”',
        respuesta:
          'Es un subsidio estimado según sus ingresos declarados; la asignación depende del proceso formal. Nunca lo presentes como aprobado.',
      },
      {
        pregunta: '“Mi contrato es a término fijo.”',
        respuesta:
          'Reconoce el punto y enfócate en la entidad financiera: el estudio de crédito lo hace el banco, no la caja.',
      },
    ],
    timeline: [
      { label: 'Llegó por pauta pagada', fecha: '02 MAY 2026', hito: 'ingreso' },
      { label: 'Clasificado no viable · a nutrición', fecha: '02 MAY 2026', hito: 'nutricion' },
      { label: 'Completó plan de ahorro (9 metas)', fecha: '14 JUL 2026', hito: 'nutricion' },
      { label: 'Reclasificado viable', fecha: '21 JUL 2026', hito: 'viable' },
    ],
    createdAt: '2026-05-02T14:30:00.000Z',
    updatedAt: '2026-07-21T16:05:00.000Z',
  },

  {
    id: 'l3',
    nombre: 'Marcela Ocampo T.',
    ciudad: 'Bogotá · Kennedy',
    edad: 36,
    ocupacion: 'Enfermera jefe',
    esAfiliado: true,
    vieneDeNutricion: false,
    score: 81,
    intentScore: 54,
    capacidad: 205_000_000,
    cuota: 1_380_000,
    ahorro: 31_000_000,
    capacidadAhorroMensual: 1_100_000,
    subsidio: 0,
    ingresosSmmlv: 4.6,
    personasACargo: 3,
    hogar: '3 personas a cargo',
    segmento: 'Alto',
    rangoSalarial: '4–6 SMMLV',
    segmentoFamiliar: 'Pareja con hijos',
    telefonoReal: '+57 315 209 8871',
    telefonoEnmascarado: '+57 315•• ••• ••71',
    mejorHorario: 'Lunes y miércoles, 1:00–3:00 p.m.',
    horarioRazon: 'Turno nocturno: no llamar antes de mediodía',
    contactabilidad: [100, 38, 92, 35, 42, 19, 12],
    cita: 'Quiero algo más grande, ya no cabemos. Y que tenga zonas comunes para los niños.',
    resumenScore:
      'Alta capacidad y ahorro sólido, pero supera el tope de 4 SMMLV: no aplica a subsidio, la conversación es de crédito.',
    factores: [
      {
        nombre: 'Afiliación vigente',
        intensidad: 100,
        peso: 25,
        contribucion: 25,
        nota: 'Afiliada hace 11 años · categoría C',
      },
      {
        nombre: 'Capacidad vs. cuota',
        intensidad: 94,
        peso: 30,
        contribucion: 28,
        nota: 'Cuota estimada = 19% de sus ingresos',
      },
      {
        nombre: 'Ahorro previo',
        intensidad: 88,
        peso: 20,
        contribucion: 17,
        nota: '$31M en ahorro disponible',
      },
      {
        nombre: 'Intención declarada',
        intensidad: 54,
        peso: 15,
        contribucion: 8,
        nota: 'Compra proyectada a 12–18 meses',
      },
      {
        nombre: 'Elegibilidad a subsidio',
        intensidad: 10,
        peso: 10,
        contribucion: 1,
        nota: 'Ingresos sobre el tope de 4 SMMLV',
      },
    ],
    intereses: [
      '4 habitaciones',
      'Zonas comunes',
      'Occidente',
      'Entrega 2028',
      'Dos parqueaderos',
    ],
    zonaPreferida: 'Occidente',
    timingCompra: '12–18 meses',
    motivacion: 'La familia creció y necesitan más espacio y zonas comunes',
    proyectos: [
      {
        proyectoId: 'torres-parque-norte',
        nombre: 'Torres del Parque Norte',
        etapa: 'Etapa 1',
        precioDesde: 214_000_000,
        tipologia: 'No VIS · 3 hab',
        match: 88,
        razon: 'Zonas comunes amplias, que es lo primero que pidió para los niños.',
      },
      {
        proyectoId: 'reserva-tibana',
        nombre: 'Reserva Tibaná',
        etapa: 'Etapa 3',
        precioDesde: 198_000_000,
        tipologia: 'No VIS · 3 hab',
        match: 74,
        razon: 'Mejor precio por m², pero con menos amenidades.',
      },
    ],
    objeciones: [
      {
        pregunta: '“¿No me dan subsidio?”',
        respuesta:
          'Explica con claridad que el SFV aplica hasta 4 SMMLV y que su caso se resuelve por crédito y tasa, no por subsidio.',
      },
      {
        pregunta: '“No tengo afán, es para el otro año.”',
        respuesta:
          'Respeta el ritmo: ofrece separar etapa con cuota baja y agenda seguimiento a 60 días.',
      },
    ],
    timeline: [
      { label: 'Llegó por referido', fecha: '11 JUL 2026', hito: 'ingreso' },
      { label: 'Aceptó tratamiento de datos', fecha: '11 JUL 2026', hito: 'consentimiento' },
      { label: 'Completó perfilamiento', fecha: '11 JUL 2026', hito: 'perfilamiento' },
      { label: 'Clasificada viable', fecha: '11 JUL 2026', hito: 'viable' },
    ],
    createdAt: '2026-07-11T15:40:00.000Z',
    updatedAt: '2026-07-11T15:58:00.000Z',
  },

  {
    id: 'l4',
    nombre: 'Julián Betancur',
    ciudad: 'Chía · Cundinamarca',
    edad: 42,
    ocupacion: 'Ingeniero de sistemas',
    esAfiliado: false,
    vieneDeNutricion: false,
    score: 74,
    intentScore: 88,
    capacidad: 246_000_000,
    cuota: 1_650_000,
    ahorro: 40_000_000,
    capacidadAhorroMensual: 1_800_000,
    subsidio: 0,
    ingresosSmmlv: 6.1,
    personasACargo: 0,
    hogar: 'Sin personas a cargo',
    segmento: null,
    rangoSalarial: '6–10 SMMLV',
    segmentoFamiliar: 'Unipersonal',
    telefonoReal: '+57 300 661 9024',
    telefonoEnmascarado: '+57 300•• ••• ••24',
    mejorHorario: 'Viernes, 4:00–6:00 p.m.',
    horarioRazon: 'Pidió expresamente el final de semana',
    contactabilidad: [29, 25, 32, 46, 100, 21, 14],
    cita: 'Estoy comparando tres proyectos. Lo que me importa es la fecha de entrega.',
    resumenScore:
      'Capacidad alta pero no es afiliado: consume cupo del margen 90/10, por eso el score baja aunque el bolsillo alcance.',
    factores: [
      {
        nombre: 'Afiliación vigente',
        intensidad: 0,
        peso: 25,
        contribucion: 0,
        nota: 'No afiliado · ocupa margen 90/10',
      },
      {
        nombre: 'Capacidad vs. cuota',
        intensidad: 97,
        peso: 30,
        contribucion: 29,
        nota: 'Cuota estimada = 16% de sus ingresos',
      },
      {
        nombre: 'Ahorro previo',
        intensidad: 92,
        peso: 20,
        contribucion: 18,
        nota: '$40M disponibles de inmediato',
      },
      {
        nombre: 'Intención declarada',
        intensidad: 88,
        peso: 15,
        contribucion: 13,
        nota: 'Comparando proyectos activamente',
      },
      {
        nombre: 'Estabilidad laboral',
        intensidad: 90,
        peso: 10,
        contribucion: 9,
        nota: 'Independiente con 7 años de facturación',
      },
    ],
    intereses: ['Entrega inmediata', 'Sabana norte', 'Casa', 'Home office', 'Sin subsidio'],
    zonaPreferida: 'Sabana norte',
    timingCompra: 'Inmediato',
    motivacion: 'Comparando constructores; decide por fecha de entrega',
    proyectos: [
      {
        proyectoId: 'reserva-tibana',
        nombre: 'Reserva Tibaná',
        etapa: 'Etapa 4',
        precioDesde: 239_000_000,
        tipologia: 'No VIS · casa',
        match: 86,
        razon: 'Única con entrega en 2026, que es su criterio decisorio.',
      },
      {
        proyectoId: 'torres-parque-norte',
        nombre: 'Torres del Parque Norte',
        etapa: 'Etapa 1',
        precioDesde: 214_000_000,
        tipologia: 'No VIS · 3 hab',
        match: 63,
        razon: 'Buen precio pero entrega 2028: probablemente lo descarte.',
      },
    ],
    objeciones: [
      {
        pregunta: '“Estoy mirando otros constructores.”',
        respuesta:
          'No compitas por precio: usa entrega 2026 y respaldo institucional de la caja.',
      },
      {
        pregunta: '“No soy afiliado, ¿puedo comprar?”',
        respuesta:
          'Sí, dentro del margen de no afiliados. Menciona además el beneficio de afiliarse antes de firmar.',
      },
    ],
    timeline: [
      { label: 'Llegó por búsqueda orgánica', fecha: '20 JUL 2026', hito: 'ingreso' },
      { label: 'Aceptó tratamiento de datos', fecha: '20 JUL 2026', hito: 'consentimiento' },
      { label: 'Completó perfilamiento', fecha: '20 JUL 2026', hito: 'perfilamiento' },
      { label: 'Clasificado viable · cupo 90/10', fecha: '20 JUL 2026', hito: 'viable' },
    ],
    createdAt: '2026-07-20T18:05:00.000Z',
    updatedAt: '2026-07-20T18:22:00.000Z',
  },

  {
    id: 'l5',
    nombre: 'Diana Carolina Peña',
    ciudad: 'Bogotá · Engativá',
    edad: 27,
    ocupacion: 'Docente de primaria',
    esAfiliado: true,
    vieneDeNutricion: true,
    score: 69,
    intentScore: 84,
    capacidad: 118_000_000,
    cuota: 790_000,
    ahorro: 9_200_000,
    capacidadAhorroMensual: 480_000,
    subsidio: 35_100_000,
    ingresosSmmlv: 1.6,
    personasACargo: 1,
    hogar: '1 persona a cargo',
    segmento: 'Basico',
    rangoSalarial: '1–2 SMMLV',
    segmentoFamiliar: 'Monoparental',
    telefonoReal: '+57 313 550 4478',
    telefonoEnmascarado: '+57 313•• ••• ••78',
    mejorHorario: 'Miércoles, 5:00–7:00 p.m.',
    horarioRazon: 'Sale del colegio a las 4:30 p.m.',
    contactabilidad: [33, 41, 100, 37, 30, 22, 19],
    cita: 'Voy juiciosa con el ahorro, pero todavía me falta para la cuota inicial.',
    resumenScore:
      'Viable reciente por nutrición: subsidio pleno y disciplina de ahorro, pero el colchón todavía es corto.',
    factores: [
      {
        nombre: 'Afiliación vigente',
        intensidad: 100,
        peso: 25,
        contribucion: 25,
        nota: 'Afiliada hace 2 años · categoría A',
      },
      {
        nombre: 'Capacidad vs. cuota',
        intensidad: 58,
        peso: 30,
        contribucion: 17,
        nota: 'Cuota estimada = 36% de sus ingresos',
      },
      {
        nombre: 'Ahorro previo',
        intensidad: 42,
        peso: 20,
        contribucion: 8,
        nota: '$9,2M · 6 de 9 metas cumplidas',
      },
      {
        nombre: 'Intención declarada',
        intensidad: 84,
        peso: 15,
        contribucion: 13,
        nota: 'Quiere comprar dentro del año',
      },
      {
        nombre: 'Estabilidad laboral',
        intensidad: 60,
        peso: 10,
        contribucion: 6,
        nota: 'Nombramiento en propiedad reciente',
      },
    ],
    intereses: [
      '2 habitaciones',
      'Occidente',
      'Máximo $120M',
      'Subsidio SFV',
      'Cerca a Transmilenio',
    ],
    zonaPreferida: 'Occidente',
    timingCompra: 'Dentro del año',
    motivacion: 'Primera vivienda propia; viene de completar metas de ahorro',
    proyectos: [
      {
        proyectoId: 'mirador-fontibon',
        nombre: 'Mirador de Fontibón',
        etapa: 'Etapa 2',
        precioDesde: 121_000_000,
        tipologia: 'VIS · 2 hab',
        match: 83,
        razon:
          'Con subsidio estimado su inicial baja a lo que ya tiene ahorrado más 4 meses.',
      },
      {
        proyectoId: 'alameda-del-sol',
        nombre: 'Alameda del Sol',
        etapa: 'Etapa 2',
        precioDesde: 138_000_000,
        tipologia: 'VIS · 2 hab',
        match: 58,
        razon: 'Se le sale del tope declarado; solo si el ahorro avanza.',
      },
    ],
    objeciones: [
      {
        pregunta: '“Todavía no me alcanza la inicial.”',
        respuesta:
          'No fuerces cierre: propón separar con cuota baja y mantener el plan de ahorro tres meses más.',
      },
      {
        pregunta: '“¿Y si me quedo sin trabajo?”',
        respuesta:
          'Menciona el seguro de vida deudor y no prometas nada sobre aprobación del crédito.',
      },
    ],
    timeline: [
      { label: 'Llegó por pauta pagada', fecha: '30 ABR 2026', hito: 'ingreso' },
      { label: 'Clasificada no viable · a nutrición', fecha: '30 ABR 2026', hito: 'nutricion' },
      { label: '6 de 9 metas de ahorro', fecha: '10 JUL 2026', hito: 'nutricion' },
      { label: 'Reclasificada viable', fecha: '23 JUL 2026', hito: 'viable' },
    ],
    createdAt: '2026-04-30T13:15:00.000Z',
    updatedAt: '2026-07-23T14:40:00.000Z',
  },

  {
    id: 'l6',
    nombre: 'Óscar Villamil R.',
    ciudad: 'Mosquera · Cundinamarca',
    edad: 39,
    ocupacion: 'Coordinador de bodega',
    esAfiliado: true,
    vieneDeNutricion: false,
    score: 64,
    intentScore: 80,
    capacidad: 126_000_000,
    cuota: 850_000,
    ahorro: 6_000_000,
    capacidadAhorroMensual: 390_000,
    subsidio: 32_500_000,
    ingresosSmmlv: 2.1,
    personasACargo: 4,
    hogar: '4 personas a cargo',
    segmento: 'Medio',
    rangoSalarial: '2–4 SMMLV',
    segmentoFamiliar: 'Familia extensa',
    telefonoReal: '+57 318 903 2210',
    telefonoEnmascarado: '+57 318•• ••• ••10',
    mejorHorario: 'Jueves, 7:00–8:30 p.m.',
    horarioRazon: 'Trabaja turnos hasta las 6 p.m.',
    contactabilidad: [28, 32, 40, 100, 48, 36, 16],
    cita: 'Somos cinco en la casa. Necesito tres habitaciones sí o sí, y cerca del trabajo.',
    resumenScore:
      'Afiliado con intención clara, pero el ahorro es bajo y el hogar numeroso aprieta la capacidad mensual.',
    factores: [
      {
        nombre: 'Afiliación vigente',
        intensidad: 100,
        peso: 25,
        contribucion: 25,
        nota: 'Afiliado hace 8 años · categoría B',
      },
      {
        nombre: 'Capacidad vs. cuota',
        intensidad: 52,
        peso: 30,
        contribucion: 16,
        nota: 'Cuota estimada = 38% de sus ingresos',
      },
      {
        nombre: 'Ahorro previo',
        intensidad: 26,
        peso: 20,
        contribucion: 5,
        nota: '$6M · sin plan de ahorro activo',
      },
      {
        nombre: 'Intención declarada',
        intensidad: 80,
        peso: 15,
        contribucion: 12,
        nota: 'Quiere mudarse antes de fin de año',
      },
      {
        nombre: 'Estabilidad laboral',
        intensidad: 60,
        peso: 10,
        contribucion: 6,
        nota: '5 años en la misma bodega',
      },
    ],
    intereses: [
      '3 habitaciones',
      'Mosquera / Funza',
      'Máximo $130M',
      'Subsidio SFV',
      'Colegio cercano',
    ],
    zonaPreferida: 'Mosquera / Funza',
    timingCompra: 'Antes de fin de año',
    motivacion: 'Hogar de cinco personas que necesita una habitación más',
    proyectos: [
      {
        proyectoId: 'alameda-del-sol',
        nombre: 'Alameda del Sol',
        etapa: 'Etapa 2',
        precioDesde: 138_000_000,
        tipologia: 'VIS · 3 hab',
        match: 79,
        razon: 'Única con 3 habitaciones dentro de su rango y a 12 min de su trabajo.',
      },
      {
        proyectoId: 'mirador-fontibon',
        nombre: 'Mirador de Fontibón',
        etapa: 'Etapa 2',
        precioDesde: 121_000_000,
        tipologia: 'VIS · 2 hab',
        match: 55,
        razon: 'Entra en precio pero pierde la tercera habitación que es innegociable.',
      },
    ],
    objeciones: [
      {
        pregunta: '“No tengo casi ahorrado.”',
        respuesta:
          'Ofrece el ahorro programado de la caja y calcula con él en voz alta; el subsidio estimado hace la diferencia.',
      },
      {
        pregunta: '“Con cinco en la casa no me alcanza.”',
        respuesta:
          'Trabaja el ingreso familiar: si la pareja también aporta, la capacidad cambia. Anótalo para recalcular.',
      },
    ],
    timeline: [
      { label: 'Llegó por WhatsApp de campaña', fecha: '16 JUL 2026', hito: 'ingreso' },
      { label: 'Aceptó tratamiento de datos', fecha: '16 JUL 2026', hito: 'consentimiento' },
      { label: 'Completó perfilamiento', fecha: '16 JUL 2026', hito: 'perfilamiento' },
      { label: 'Clasificado viable', fecha: '16 JUL 2026', hito: 'viable' },
    ],
    createdAt: '2026-07-16T19:20:00.000Z',
    updatedAt: '2026-07-16T19:35:00.000Z',
  },
];
