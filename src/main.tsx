/**
 * Punto de entrada. Monta la app y carga el design system.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles/index.css';

const contenedor = document.getElementById('root');
if (contenedor === null) {
  throw new Error('No existe #root en index.html: la app no puede montarse.');
}

createRoot(contenedor).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
