/**
 * Punto de entrada del frontend (capa app).
 *
 * `index.html` ya apunta aqui (`<script type="module" src="/src/main.tsx">`);
 * sin este archivo `npm run build` falla al resolverlo. `StrictMode` queda
 * fuera a proposito: monta el arbol dos veces en dev, lo que duplicaria el
 * `start()` de `LeadIntakeScreen` (F1) y su mutacion inicial. Al unir F1 con
 * F2.1 se mantiene apagado; reactivarlo exige guardar ese efecto de arranque.
 */

import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles/index.css';

const contenedor = document.getElementById('root');
if (contenedor === null) {
  throw new Error('No se encontró el elemento #root en index.html.');
}

createRoot(contenedor).render(<App />);
