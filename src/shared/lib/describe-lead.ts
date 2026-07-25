/**
 * Linea de identidad del lead (capa shared).
 *
 * `31 años · Auxiliar administrativa · Bogotá · Suba`
 *
 * La usan F3 (fila de la cola) y F4 (cabecera de la ficha) y tiene que decir
 * EXACTAMENTE lo mismo en las dos: el comercial pasa de una a otra en un clic y
 * cualquier diferencia se lee como que son dos personas distintas.
 *
 * Salta los campos vacios en vez de imprimir `null · null`, que es el bug
 * clasico de este tipo de concatenacion.
 */

export interface LeadDescribable {
  readonly edad: number | null;
  readonly ocupacion: string | null;
  readonly ciudad: string | null;
}

export function describeLead(lead: LeadDescribable): string {
  return [
    lead.edad === null ? null : `${String(lead.edad)} años`,
    lead.ocupacion,
    lead.ciudad,
  ]
    .filter((parte): parte is string => parte !== null && parte.trim().length > 0)
    .join(' · ');
}

/**
 * Etiqueta de segmento tal como la lee el comercial.
 *
 * Para un no afiliado el segmento de caja no aplica: lo relevante es que la
 * venta consume cupo del margen 90/10, y eso es lo que se muestra.
 */
export function describeSegmento(input: {
  readonly esAfiliado: boolean;
  readonly segmento: string | null;
  readonly rangoSalarial: string | null;
}): string {
  if (!input.esAfiliado) return 'No afiliado · cupo 90/10';

  const letra: Record<string, string> = {
    Basico: 'A',
    Medio: 'B',
    Alto: 'C',
    Joven: 'J',
  };

  const codigo = input.segmento === null ? null : letra[input.segmento];
  const partes = [
    codigo === undefined || codigo === null ? null : `Segmento ${codigo}`,
    input.rangoSalarial === null ? null : `rango ${input.rangoSalarial}`,
  ].filter((parte): parte is string => parte !== null);

  return partes.length === 0 ? 'Sin segmentar' : partes.join(' · ');
}
