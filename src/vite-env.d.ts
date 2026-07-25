/// <reference types="vite/client" />

/**
 * Tipado de las variables de entorno del bundle (capa shared).
 *
 * AVISO: todo lo que empieza por `VITE_` se INCRUSTA en el JS publico. Aqui
 * solo puede aparecer configuracion no sensible; los secretos viven en el
 * backend. Se declaran como `string` porque Vite siempre las entrega como
 * texto: la coercion a boolean ocurre en `@shared/config/env`.
 */
/*
 * Se declaran OPCIONALES a proposito: si alguien clona el repo y arranca sin
 * copiar `.env.example` a `.env.local`, la variable llega `undefined`. Tiparla
 * como `string` obligatorio seria mentir y reventaria en el primer `.trim()`.
 */
interface ImportMetaEnv {
  /** Base de la API. Vacio o ausente = mismo origen (proxy de Vite en dev). */
  readonly VITE_API_BASE_URL?: string;
  /** `'true'` habilita datos semilla locales cuando no hay backend. */
  readonly VITE_DEMO_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
