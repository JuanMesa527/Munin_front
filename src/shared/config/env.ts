/**
 * Lectura y normalizacion de la configuracion del cliente (capa shared).
 *
 * Se lee UNA vez al arrancar el modulo para que ningun componente toque
 * `import.meta.env` directo: asi el dia que la config venga de otro lado
 * se cambia aqui y nada mas.
 */

export interface AppEnv {
  /**
   * Base absoluta de la API sin slash final, o `''` para mismo origen.
   * En dev conviene `''`: el proxy de Vite mantiene el mismo origen y la
   * cookie httpOnly de sesion del closer viaja sin CORS de por medio.
   */
  readonly apiBaseUrl: string;
  /** Muestra el banner de demo y habilita los datos semilla del jurado. */
  readonly demoMode: boolean;
}

/**
 * AVISO DE SEGURIDAD (OWASP A05): todas las `VITE_*` quedan visibles en el
 * bundle. Si alguna vez alguien intenta meter aqui una API key de LLM, el
 * lugar correcto es el backend, no esta funcion.
 */
function readEnv(): AppEnv {
  // Sin `.env.local` las variables llegan `undefined`: el default vacio deja
  // la app funcionando contra el mismo origen en vez de romperse al arrancar.
  const rawBase = (import.meta.env.VITE_API_BASE_URL ?? '').trim();
  const rawDemo = (import.meta.env.VITE_DEMO_MODE ?? '').trim().toLowerCase();

  return {
    // Normalizar el slash final evita URLs con `//` al concatenar API_ROUTES.
    apiBaseUrl: rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase,
    // Comparacion explicita contra `'true'`: cualquier otro valor apaga la
    // demo. Un `Boolean('false')` seria `true` y ya nos habria mordido.
    demoMode: rawDemo === 'true',
  };
}

export const env: AppEnv = readEnv();
