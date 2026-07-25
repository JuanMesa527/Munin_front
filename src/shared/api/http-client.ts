/**
 * Cliente HTTP unico del frontend (capa shared).
 *
 * Todo lo que sale del navegador pasa por aqui. Devuelve el mismo sobre
 * `ApiResponse<T>` del contrato incluso cuando la red falla, para que ninguna
 * feature tenga que hacer try/catch: el error siempre es un dato tipado.
 *
 * SEGURIDAD (OWASP A07 - fallas de autenticacion): la sesion del closer vive
 * en una cookie httpOnly + SameSite=Strict que emite el backend. Este cliente
 * NUNCA guarda tokens en localStorage ni sessionStorage: con un XSS, cualquier
 * token legible por JS es un robo de sesion. De ahi `credentials: 'include'`
 * y cero manejo manual de Authorization.
 */

import type { ApiError, ApiResponse } from '@contracts';
import { env } from '../config/env';

/**
 * Corta la espera para que la UI pueda mostrar un error en vez de un spinner
 * eterno si el backend de la demo se cae en plena presentacion.
 */
const TIMEOUT_MS = 15_000;

/** Valores admitidos en query string. */
export type QueryValue = string | number | boolean | null | undefined;

const JSON_HEADERS: Readonly<Record<string, string>> = {
  Accept: 'application/json',
};

function errorResponse(code: string, message: string): ApiResponse<never> {
  const error: ApiError = { code, message, fields: null };
  return { ok: false, error };
}

/**
 * El sobre se reconoce por la discriminante `ok`. El shape interno de `T` no
 * se revalida en el cliente: el contrato es el MISMO archivo en los dos repos
 * y el backend ya valida en el borde con zod. Validar dos veces daria una
 * falsa sensacion de seguridad sin agregar garantia real.
 */
function isApiResponse<T>(payload: unknown): payload is ApiResponse<T> {
  if (typeof payload !== 'object' || payload === null) return false;
  return typeof (payload as { ok?: unknown }).ok === 'boolean';
}

function parseJson(texto: string): unknown {
  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

/** Traduce el status HTTP a un `code` estable cuando el body no trae el sobre. */
function codeForStatus(status: number): string {
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 429) return 'RATE_LIMITED';
  if (status >= 500) return 'SERVER_ERROR';
  return 'HTTP_ERROR';
}

function messageForStatus(status: number): string {
  if (status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.';
  if (status === 403) return 'No tienes permisos para ver esta información.';
  if (status === 404) return 'No encontramos lo que buscabas.';
  if (status === 429) return 'Demasiadas solicitudes. Espera un momento e intenta de nuevo.';
  return 'No pudimos completar la operación. Intenta de nuevo.';
}

/**
 * PRIVACIDAD: nunca pases datos personales por query string. Quedan en logs
 * de proxies, en el historial y en el Referer. Los datos del lead viajan
 * SIEMPRE en el body de un POST.
 */
function buildUrl(path: string, query?: Readonly<Record<string, QueryValue>>): string {
  const base = `${env.apiBaseUrl}${path}`;
  if (query === undefined) return base;

  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries(query)) {
    if (valor === null || valor === undefined || valor === '') continue;
    params.append(clave, String(valor));
  }

  const cadena = params.toString();
  return cadena.length > 0 ? `${base}?${cadena}` : base;
}

async function request<T>(url: string, init: RequestInit): Promise<ApiResponse<T>> {
  try {
    const respuesta = await fetch(url, {
      ...init,
      // La cookie httpOnly de sesion del closer viaja sola.
      credentials: 'include',
      // Evita que un proxy o el navegador sirva un dashboard cacheado de otra sesion.
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    const texto = await respuesta.text();
    const payload = texto.length > 0 ? parseJson(texto) : null;

    if (isApiResponse<T>(payload)) return payload;

    // El backend contesto algo que no es nuestro sobre (proxy, 502 en HTML...).
    return errorResponse(codeForStatus(respuesta.status), messageForStatus(respuesta.status));
  } catch (causa) {
    // No se loguea la causa completa: podria arrastrar el body con datos del
    // lead a la consola del navegador (Ley 1581, minimizacion).
    const esTimeout =
      causa instanceof Error && (causa.name === 'TimeoutError' || causa.name === 'AbortError');

    return esTimeout
      ? errorResponse('TIMEOUT_ERROR', 'El servidor tardó demasiado en responder.')
      : errorResponse('NETWORK_ERROR', 'No pudimos conectarnos. Revisa tu conexión.');
  }
}

export function apiGet<T>(
  path: string,
  query?: Readonly<Record<string, QueryValue>>,
): Promise<ApiResponse<T>> {
  return request<T>(buildUrl(path, query), { method: 'GET', headers: JSON_HEADERS });
}

export function apiPost<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
  return request<T>(buildUrl(path), {
    method: 'POST',
    headers: { ...JSON_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
}

/** Error con el `ApiError` adjunto para que la UI decida por `code`. */
export class ApiRequestError extends Error {
  readonly code: string;
  readonly fields: Record<string, string> | null;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiRequestError';
    this.code = error.code;
    this.fields = error.fields;
  }
}

/**
 * Azucar para TanStack Query: convierte el sobre en valor o excepcion, que es
 * lo que espera un `queryFn`. El mensaje que llega al usuario sale del
 * backend, jamas de un stack trace.
 */
export async function unwrap<T>(promesa: Promise<ApiResponse<T>>): Promise<T> {
  const respuesta = await promesa;
  if (respuesta.ok) return respuesta.data;
  throw new ApiRequestError(respuesta.error);
}
