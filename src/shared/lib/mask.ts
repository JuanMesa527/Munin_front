/**
 * Enmascarado de datos de contacto (capa shared).
 *
 * DEFENSA EN PROFUNDIDAD (Ley 1581 de 2012, art. 4, minimizacion): el backend
 * ya entrega el telefono enmascarado dentro de `ContactIdentity` y el numero
 * real solo existe detras de `ContactVaultPort`. Esta funcion es la segunda
 * barrera: si por un bug llega un numero completo a la UI, no se pinta.
 * El formato replica el del adapter del backend para que ambos lados
 * muestren lo mismo.
 */

/** Placeholder cuando el dato no alcanza para enmascarar sin exponerlo. */
const OCULTO = '•••';

/** `"+573001234542"` -> `"+57 3.. ... ..42"`. */
export function maskPhone(t: string): string {
  const digitos = t.replace(/\D/g, '');

  // Con menos de 4 digitos, cualquier mascara revela demasiado del total.
  if (digitos.length < 4) return OCULTO;

  const nacional = digitos.length > 10 ? digitos.slice(-10) : digitos;
  const primero = nacional.slice(0, 1);
  const ultimos = nacional.slice(-2);

  return `+57 ${primero}.. ... ..${ultimos}`;
}

/**
 * `"Ana Maria"` -> `"Ana M."`. El closer necesita saber a quien saluda, no el
 * apellido completo: en el dashboard el nombre de pila basta.
 */
export function maskLastName(nombreCompleto: string): string {
  const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);
  const [nombre, apellido] = partes;

  if (nombre === undefined) return OCULTO;
  if (apellido === undefined) return nombre;

  return `${nombre} ${apellido.slice(0, 1)}.`;
}
