/**
 * Combinador de clases de Tailwind (capa shared).
 *
 * clsx resuelve condicionales y tailwind-merge elimina conflictos dejando
 * ganar la ultima clase. Sin esto, `cn('px-4', props.className)` con un
 * `px-2` desde afuera produce un resultado que depende del orden del CSS.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
