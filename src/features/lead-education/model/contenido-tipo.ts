/**
 * Presentación del `tipoContenido` de un microlearning (capa model, F2.2).
 *
 * Compartido entre `ContenidoEducativoCard` y `LessonReaderModal` para que la
 * tarjeta y el lector paso a paso nunca se desincronicen en icono/etiqueta.
 *
 * `.ts` (no `.tsx`): se arma con `createElement` para no forzar el transform
 * de JSX en un archivo de capa model.
 */

import { createElement, type ReactElement } from 'react';
import { BookOpen, Calculator, ListChecks } from 'lucide-react';
import type { ContenidoEducativo } from '@contracts';

export const ICONO_POR_TIPO: Record<ContenidoEducativo['tipoContenido'], ReactElement> = {
  concepto: createElement(BookOpen, { 'aria-hidden': true, className: 'size-4' }),
  simulacion: createElement(Calculator, { 'aria-hidden': true, className: 'size-4' }),
  checklist: createElement(ListChecks, { 'aria-hidden': true, className: 'size-4' }),
};

export const ETIQUETA_POR_TIPO: Record<ContenidoEducativo['tipoContenido'], string> = {
  concepto: 'Concepto',
  simulacion: 'Simulación',
  checklist: 'Checklist',
};
