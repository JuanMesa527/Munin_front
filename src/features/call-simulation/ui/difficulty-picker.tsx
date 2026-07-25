/**
 * Selector de dificultad, antes de marcar (F5).
 *
 * Tres niveles: cambian el tono del lead simulado Y el umbral que exige
 * `verdict.ts` para dar la llamada por cerrada — nunca solo lo primero
 * (contrato con el backend, ver adenda A11 de `contracts.ts`).
 */

import type { ReactElement } from 'react';
import type { CallDifficulty } from '@contracts';
import { Modal } from '@shared/ui';

export interface DifficultyPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (dificultad: CallDifficulty) => void;
}

interface Opcion {
  valor: CallDifficulty;
  titulo: string;
  descripcion: string;
}

const OPCIONES: readonly Opcion[] = [
  {
    valor: 'receptivo',
    titulo: 'Receptivo',
    descripcion: 'Interesado desde el saludo. Cede rapido ante una buena respuesta.',
  },
  {
    valor: 'realista',
    titulo: 'Realista',
    descripcion: 'Cauteloso: plantea 2-3 objeciones genuinas antes de decidirse.',
  },
  {
    valor: 'dificil',
    titulo: 'Difícil',
    descripcion: 'Escéptico y ocupado: plantea todo, exige datos concretos de su perfil.',
  },
];

export function DifficultyPicker({
  open,
  onClose,
  onSelect,
}: DifficultyPickerProps): ReactElement | null {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Elige la dificultad del lead simulado"
      description="El closer eres tú. La IA interpreta a este lead con su perfil real."
      size="sm"
    >
      <div className="flex flex-col gap-3">
        {OPCIONES.map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            onClick={() => {
              onSelect(opcion.valor);
            }}
            className="focus-ring rounded-field border border-border p-3 text-left transition-colors hover:border-border-strong hover:bg-surface-3"
          >
            <div className="font-semibold text-text">{opcion.titulo}</div>
            <div className="mt-0.5 text-sm text-text-muted">{opcion.descripcion}</div>
          </button>
        ))}
      </div>
    </Modal>
  );
}
