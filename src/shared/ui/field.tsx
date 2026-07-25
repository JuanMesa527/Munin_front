/**
 * Campo de formulario: label + control + error (design system, capa shared).
 *
 * ACCESIBILIDAD: el label esta asociado por `htmlFor`, el error y la ayuda se
 * anuncian con `aria-describedby`, y el estado invalido con `aria-invalid`.
 * El error tambien es `role="alert"` para que el lector lo lea al aparecer.
 * Nada de placeholders como etiqueta: desaparecen al escribir.
 */

import { useId, type ComponentPropsWithRef, type ReactElement } from 'react';
import { cn } from '../lib/cn';

/**
 * Clases del control, exportadas para que un `<select>` o un `<textarea>` de
 * una feature se vea identico sin duplicar el estilo.
 * PROPUESTA AL EQUIPO: no esta en el manifiesto; se agrega porque F3 necesita
 * selects en la barra de filtros.
 */
export const FIELD_CONTROL_CLASS =
  'focus-ring w-full rounded-field border border-border bg-surface px-3 py-2 text-sm text-text ' +
  'placeholder:text-text-subtle disabled:cursor-not-allowed disabled:opacity-60';

export interface FieldProps extends Omit<ComponentPropsWithRef<'input'>, 'id'> {
  label: string;
  /** Texto de ayuda permanente. Se anuncia junto al campo. */
  hint?: string | undefined;
  /** Mensaje de validacion. Su presencia marca el campo como invalido. */
  error?: string | undefined;
  /** Muestra el asterisco y marca `required` en el control. */
  required?: boolean | undefined;
}

export function Field({
  label,
  hint,
  error,
  required = false,
  className,
  ...rest
}: FieldProps): ReactElement {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const descripciones = [hint !== undefined ? hintId : null, error !== undefined ? errorId : null]
    .filter((valor): valor is string => valor !== null)
    .join(' ');

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="ml-0.5 text-danger">
              *
            </span>
            <span className="sr-only"> (obligatorio)</span>
          </>
        )}
      </label>

      <input
        id={id}
        required={required}
        aria-invalid={error !== undefined ? true : undefined}
        aria-describedby={descripciones.length > 0 ? descripciones : undefined}
        className={cn(
          FIELD_CONTROL_CLASS,
          error !== undefined && 'border-danger focus-visible:outline-danger',
          className,
        )}
        {...rest}
      />

      {hint !== undefined && error === undefined && (
        <p id={hintId} className="text-xs text-text-muted">
          {hint}
        </p>
      )}

      {error !== undefined && (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
