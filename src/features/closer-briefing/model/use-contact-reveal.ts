/**
 * Revelado del telefono del lead (F4).
 *
 * La UI arranca SIEMPRE con el numero enmascarado. Destaparlo es una accion
 * deliberada del comercial que el backend audita (quien, de quien, cuando):
 * minimizacion de datos de la Ley 1581 y trazabilidad exigible a una entidad
 * Vigilada Supersubsidio.
 *
 * Ocultar de nuevo NO borra el registro de auditoria: lo unico que hace es
 * quitar el numero de la pantalla. El texto de la UI lo dice asi a proposito.
 */

import { useCallback, useState } from 'react';
import { env } from '@shared/config/env';
import { revealSeedPhone } from '@shared/demo';
import { revealContact } from '../api/closer-briefing.api';

export interface ContactRevealState {
  /** Numero ya listo para pintar: enmascarado, o real si se revelo. */
  readonly telefono: string;
  readonly revelado: boolean;
  readonly cargando: boolean;
  readonly error: string | null;
  toggle: () => void;
}

export interface UseContactRevealInput {
  readonly leadId: string;
  readonly telefonoEnmascarado: string;
}

export function useContactReveal({
  leadId,
  telefonoEnmascarado,
}: UseContactRevealInput): ContactRevealState {
  const [real, setReal] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = useCallback(() => {
    if (real !== null) {
      setReal(null);
      return;
    }

    setCargando(true);
    setError(null);

    void revealContact(leadId).then((respuesta) => {
      setCargando(false);

      if (respuesta.ok) {
        setReal(respuesta.data.telefono);
        return;
      }

      // Sin backend la demo sigue funcionando; con backend, un fallo real se
      // muestra y el numero NO se destapa.
      const semilla = env.demoMode ? revealSeedPhone(leadId) : null;
      if (semilla !== null) setReal(semilla);
      else setError('No pudimos revelar el contacto.');
    });
  }, [leadId, real]);

  return {
    telefono: real ?? telefonoEnmascarado,
    revelado: real !== null,
    cargando,
    error,
    toggle,
  };
}
