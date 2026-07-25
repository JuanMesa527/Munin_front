/**
 * Setup global de Vitest (capa shared, solo para tests).
 *
 * Extiende `expect` con los matchers de `@testing-library/jest-dom`
 * (`toBeInTheDocument`, `toHaveTextContent`, etc.) para todos los `*.test.ts(x)`
 * del repo. No se importa desde codigo de produccion.
 */
import '@testing-library/jest-dom/vitest';
