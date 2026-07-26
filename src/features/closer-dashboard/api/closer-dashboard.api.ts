/**
 * I/O de F3 · closer-dashboard.
 *
 * Fina a proposito: arma la request y devuelve el sobre `ApiResponse`. Ninguna
 * decision de negocio vive aqui, y las URLs salen SIEMPRE de `API_ROUTES`.
 */

import {
  API_ROUTES,
  type ApiResponse,
  type CloserSession,
  type LeadListFilters,
  type LeadListPage,
  type LeadListSort,
} from '@contracts';
import { apiGet, apiPost } from '@shared/api/http-client';

export interface FetchViableLeadsInput {
  readonly filters: LeadListFilters;
  readonly sort: LeadListSort;
  readonly pagina: number;
  readonly porPagina: number;
}

/**
 * PRIVACIDAD: `filters.busqueda` NO se manda al servidor.
 *
 * El texto que escribe el closer puede ser el nombre de un lead, y un nombre en
 * la query string queda en logs de proxies, en el historial del navegador y en
 * el header `Referer` (minimizacion de datos). El filtrado por texto se aplica
 * en el cliente sobre la pagina que ya tiene. Cuando la cola crezca mas que una
 * pagina y haya que buscar en servidor, tiene que ser un POST con el termino en
 * el body, nunca un GET con el nombre en la URL.
 */
export function fetchViableLeads(
  input: FetchViableLeadsInput,
): Promise<ApiResponse<LeadListPage>> {
  const { filters, sort, pagina, porPagina } = input;

  return apiGet<LeadListPage>(API_ROUTES.closer.leads, {
    soloAfiliados: filters.soloAfiliados,
    soloNutridos: filters.soloNutridos,
    segmento: filters.segmento,
    ciudad: filters.ciudad,
    scoreMinimo: filters.scoreMinimo,
    banda: filters.banda,
    sort,
    pagina,
    porPagina,
  });
}

export interface LoginInput {
  readonly usuario: string;
  readonly contrasena: string;
}

/**
 * El backend responde con la sesion y emite la cookie httpOnly. Este cliente
 * nunca ve ni guarda el token: por eso no hay nada que persistir aqui.
 */
export function loginCloser(input: LoginInput): Promise<ApiResponse<CloserSession>> {
  return apiPost<CloserSession>(API_ROUTES.closer.login, input);
}

export function logoutCloser(): Promise<ApiResponse<null>> {
  return apiPost<null>(API_ROUTES.closer.logout);
}
