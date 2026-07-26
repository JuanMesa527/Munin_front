/**
 * Calculadora en vivo dentro de una lección (capa ui, F2.2).
 *
 * En vez de solo leer "la cuota inicial es el X% del precio", la persona mete
 * SUS propios números y ve el resultado al instante — mismo espíritu que
 * `lesson-quiz.tsx`/`lesson-checklist.tsx`: la lección deja de ser pasiva.
 *
 * `PORCENTAJE_CUOTA_INICIAL` está DUPLICADO acá a propósito: es la misma
 * regla determinista que usa el backend (`nurture-plan.ts`), no un dato que
 * se pida por red. Si el porcentaje cambia en el backend, hay que
 * actualizarlo también acá — son dos copias de una regla de dominio, no una
 * fuente de verdad y un cache.
 */

import { useState, type ReactElement } from 'react';
import type { COP } from '@contracts';
import { Card, Field } from '@shared/ui';
import { formatCOP } from '@shared/lib/format-money';

/** Mantener en sync con `PORCENTAJE_CUOTA_INICIAL` en `Munin_back/.../nurture-plan.ts`. */
const PORCENTAJE_CUOTA_INICIAL = 0.3;

export interface LessonCalculatorProps {
  calculadora: 'cuota-inicial';
  /**
   * `NurturePlan.precioObjetivo` ya conocido para este lead (mostrado en "Tu
   * plan estimado"). Se usa para precargar el campo de precio: preguntarlo de
   * cero sería incoherente, ya lo sabemos. El ingreso mensual NO tiene
   * equivalente — `LeadProfile.rangoSalarial` es una banda de texto, no una
   * cifra — por eso ese campo se deja vacío.
   */
  precioObjetivoConocido?: COP;
}

function parsearMonto(texto: string): number | null {
  const limpio = texto.replace(/[^\d]/gu, '');
  if (limpio.length === 0) return null;
  const valor = Number(limpio);
  return Number.isFinite(valor) && valor > 0 ? valor : null;
}

/** Mismo separador de miles que `formatCOP`, pero sin el signo `$` — el campo es editable. */
const formatoMontoEditable = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

export function LessonCalculator({
  calculadora,
  precioObjetivoConocido,
}: LessonCalculatorProps): ReactElement | null {
  const [precioTexto, setPrecioTexto] = useState(
    precioObjetivoConocido !== undefined ? formatoMontoEditable.format(precioObjetivoConocido) : '',
  );
  const [ingresoTexto, setIngresoTexto] = useState('');

  // Único tipo de calculadora hoy (el union type de `calculadora` solo tiene
  // este miembro, por eso ESLint marca la comparación como siempre-falsa) —
  // se deja el guard igual para que sumar una segunda variante en el futuro
  // no rompa nada acá.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- guard defensivo para cuando se agregue una segunda variante de calculadora
  if (calculadora !== 'cuota-inicial') return null;

  const precio = parsearMonto(precioTexto);
  const ingreso = parsearMonto(ingresoTexto);
  const cuotaInicial = precio !== null ? Math.round(precio * PORCENTAJE_CUOTA_INICIAL) : null;
  // Regla práctica de `cont-capacidad-endeudamiento`: la cuota mensual cómoda
  // no debería superar el 30% del ingreso neto — mismo criterio, reutilizado
  // acá para que la calculadora conecte ambas lecciones.
  const cuotaMensualComoda = ingreso !== null ? Math.round(ingreso * 0.3) : null;

  return (
    <Card className="shadow-card">
      <p className="text-sm font-bold text-text">Calculá tu cuota inicial</p>
      <p className="mt-1 text-xs text-text-muted">
        El precio ya viene precargado con el de tu plan (podés cambiarlo para simular otro
        escenario). El ingreso no lo sabemos con exactitud, así que metelo vos. Nada de esto se
        guarda ni se envía a ningún lado: es un ejercicio libre que no cambia "Tu plan estimado".
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field
          label="Precio de la vivienda"
          type="text"
          inputMode="numeric"
          placeholder="Ej: 150.000.000"
          value={precioTexto}
          onChange={(evento) => {
            setPrecioTexto(evento.currentTarget.value);
          }}
          // El campo arranca precargado con el precio real (no vacío): sin
          // esto, cambiarlo exige borrar dígito por dígito antes de poder
          // escribir el nuevo valor, y un click a mitad del número lo mezcla
          // con lo que ya había — se ve "roto" aunque el cálculo de abajo esté
          // recalculando bien.
          onFocus={(evento) => {
            evento.currentTarget.select();
          }}
        />
        <Field
          label="Ingreso mensual del hogar"
          type="text"
          inputMode="numeric"
          placeholder="Ej: 3.000.000"
          value={ingresoTexto}
          onChange={(evento) => {
            setIngresoTexto(evento.currentTarget.value);
          }}
        />
      </div>

      {(cuotaInicial !== null || cuotaMensualComoda !== null) && (
        <div className="mt-4 grid gap-3 rounded-card bg-accent-50 p-4 sm:grid-cols-2">
          {cuotaInicial !== null && (
            <div>
              <p className="text-xs font-medium text-accent-800">
                Tu cuota inicial estimada ({Math.round(PORCENTAJE_CUOTA_INICIAL * 100)}%)
              </p>
              <p className="font-display text-lg font-bold text-accent-900">
                {formatCOP(cuotaInicial)}
              </p>
            </div>
          )}
          {cuotaMensualComoda !== null && (
            <div>
              <p className="text-xs font-medium text-accent-800">Tu cuota mensual cómoda (30%)</p>
              <p className="font-display text-lg font-bold text-accent-900">
                {formatCOP(cuotaMensualComoda)}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
