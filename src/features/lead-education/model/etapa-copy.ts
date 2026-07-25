/**
 * Copy de presentación del camino (capa model, F2.2).
 *
 * Los títulos del contrato (`ETAPAS_CAMINO`) son canónicos para back/front.
 * Este mapa es solo UI. Iconos: Lucide (vectorial), no emoji ni imagenes
 * recortadas — consistencia con el resto del design system.
 */

import { Calculator, KeyRound, Landmark, ListChecks, Search, type LucideIcon } from 'lucide-react';
import type { EtapaId } from '@contracts';

export interface EtapaCopy {
  titulo: string;
  descripcion: string;
  icono: LucideIcon;
}

export const ETAPA_COPY: Record<EtapaId, EtapaCopy> = {
  descubrir: {
    titulo: 'Descubrir si puedo comprar',
    descripcion: 'Conoce si la vivienda propia está a tu alcance.',
    icono: Search,
  },
  capacidad: {
    titulo: 'Entender mi capacidad financiera',
    descripcion: 'Aprende a leer tu ingreso, ahorro y cuota estimada.',
    icono: Calculator,
  },
  financiar: {
    titulo: 'Descubrir cómo financiar mi vivienda',
    descripcion: 'Aprende sobre créditos, subsidios y alternativas.',
    icono: Landmark,
  },
  prepararse: {
    titulo: 'Prepararme para comprar',
    descripcion: 'Junta documentos y checklist antes de dar el paso.',
    icono: ListChecks,
  },
  llegar: {
    titulo: 'Llegar a mi hogar',
    descripcion: 'Conecta con tu asesor listo para concretar.',
    icono: KeyRound,
  },
};
