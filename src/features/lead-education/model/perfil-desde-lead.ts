/**
 * Vista de perfil derivada SOLO del snapshot F1 + journey (capa model, F2.2).
 */

import type { EducationJourney, EducationLeadSnapshot } from '@contracts';
import { formatCOP, SIN_DATO } from '@shared/lib/format-money';
import { conocimientoPorArea } from './progreso-stats';

export interface CampoPerfil {
  label: string;
  valor: string;
}

export interface InteresDesdeCamino {
  tema: string;
  nivel: 'En progreso' | 'Dominado' | 'Por empezar';
  progreso: number;
}

export interface PerfilDesdeLead {
  /** Nombre de pila o "Hola" si no hay nombre. */
  saludo: string;
  /** Título del bloque de identidad. */
  titulo: string;
  /** Iniciales para el avatar. */
  iniciales: string;
  nombre: string | null;
  email: string | null;
  telefonoEnmascarado: string | null;
  edad: number | null;
  estadoCivil: string | null;
  ciudad: string | null;
  afiliacion: string;
  rangoSalarial: string | null;
  segmento: string | null;
  segmentoFamiliar: string | null;
  personasACargo: string;
  informacion: readonly CampoPerfil[];
  intereses: readonly InteresDesdeCamino[];
}

function textoONull(valor: string | null | undefined): string {
  if (valor === null || valor === undefined || valor.trim() === '') return SIN_DATO;
  return valor;
}

function primerNombre(nombre: string): string {
  return nombre.split(/\s+/u).filter(Boolean)[0] ?? nombre;
}

function inicialesDe(lead: EducationLeadSnapshot): string {
  if (lead.nombre !== null && lead.nombre.trim() !== '') {
    return lead.nombre
      .split(/\s+/u)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  }
  if (lead.ciudad !== null && lead.ciudad.trim() !== '') {
    return lead.ciudad
      .split(/[\s,]+/u)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  }
  return '?';
}

export function perfilDesdeLead(
  lead: EducationLeadSnapshot,
  journey: EducationJourney,
): PerfilDesdeLead {
  const nombre = lead.nombre;
  const saludo = nombre !== null && nombre.trim() !== '' ? primerNombre(nombre) : 'Hola';
  const titulo = nombre !== null && nombre.trim() !== '' ? nombre : lead.ciudad ?? 'Tu perfil';

  const afiliacion =
    lead.esAfiliado === null ? SIN_DATO : lead.esAfiliado ? 'Afiliado Colsubsidio' : 'No afiliado';

  const informacion: CampoPerfil[] = [
    { label: 'Nombre', valor: textoONull(nombre) },
    { label: 'Correo', valor: textoONull(lead.email) },
    { label: 'Celular', valor: textoONull(lead.telefonoEnmascarado) },
    {
      label: 'Edad',
      valor: lead.edad === null ? SIN_DATO : `${String(lead.edad)} años`,
    },
    { label: 'Estado civil', valor: textoONull(lead.estadoCivil) },
    { label: 'Afiliación', valor: afiliacion },
    { label: 'Ciudad de búsqueda', valor: textoONull(lead.ciudad) },
    { label: 'Rango salarial', valor: textoONull(lead.rangoSalarial) },
    { label: 'Segmento', valor: textoONull(lead.segmento) },
    { label: 'Composición del hogar', valor: textoONull(lead.segmentoFamiliar) },
    {
      label: 'Personas a cargo',
      valor: lead.personasACargo === null ? SIN_DATO : String(lead.personasACargo),
    },
    { label: 'Ahorro declarado', valor: formatCOP(lead.ahorroDeclarado) },
    { label: 'Capacidad de ahorro mensual', valor: formatCOP(lead.capacidadAhorroMensual) },
    { label: 'Precio objetivo (estimado)', valor: formatCOP(journey.plan.precioObjetivo) },
    {
      label: 'Subsidio familiar estimado',
      valor: journey.plan.aplicaSubsidio ? formatCOP(journey.plan.subsidioEstimado) : 'No aplica',
    },
    { label: 'Brecha por cubrir', valor: formatCOP(journey.plan.gap) },
    {
      label: 'Meses estimados para calificar',
      valor: String(journey.plan.mesesParaCalificar),
    },
    {
      label: 'Score de perfil',
      valor: lead.score === null ? SIN_DATO : `${String(Math.round(lead.score))} / 100`,
    },
    { label: 'Banda de capacidad', valor: textoONull(lead.banda) },
    { label: 'Cuota mensual estimada', valor: formatCOP(lead.cuotaMensualEstimada) },
    { label: 'Techo de precio estimado', valor: formatCOP(lead.precioMaximoEstimado) },
  ];

  if (lead.proyectos[0] !== undefined) {
    informacion.push({
      label: 'Proyecto con mayor afinidad',
      valor: lead.proyectos[0].nombre,
    });
  }

  const intereses: InteresDesdeCamino[] = conocimientoPorArea(journey).map((area) => ({
    tema: area.titulo,
    nivel:
      area.nivel === 'Dominado' ? 'Dominado' : area.porcentaje === 0 ? 'Por empezar' : 'En progreso',
    progreso: Math.min(1, Math.max(0, area.porcentaje / 100)),
  }));

  return {
    saludo,
    titulo,
    iniciales: inicialesDe(lead),
    nombre,
    email: lead.email,
    telefonoEnmascarado: lead.telefonoEnmascarado,
    edad: lead.edad,
    estadoCivil: lead.estadoCivil,
    ciudad: lead.ciudad,
    afiliacion,
    rangoSalarial: lead.rangoSalarial,
    segmento: lead.segmento,
    segmentoFamiliar: lead.segmentoFamiliar,
    personasACargo: lead.personasACargo === null ? SIN_DATO : String(lead.personasACargo),
    informacion,
    intereses,
  };
}

/** Etiqueta corta para TopStats / hero: nombre, ciudad o "Tu camino". */
export function etiquetaLead(lead: EducationLeadSnapshot | undefined): string {
  if (lead === undefined) return 'Tu camino';
  if (lead.nombre !== null && lead.nombre.trim() !== '') return primerNombre(lead.nombre);
  if (lead.ciudad !== null && lead.ciudad.trim() !== '') return lead.ciudad;
  return 'Tu camino';
}
