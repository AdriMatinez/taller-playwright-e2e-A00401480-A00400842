/**
 * Punto de entrada de React.
 * Decidimos qué pantalla montar según la URL: "/" muestra el catálogo CRUD del taller
 * formativo (App.tsx sin cambios) y /login, /catalog y /checkout muestran la tienda
 * del taller evaluativo. También agregamos una barra con enlaces para pasar de una a otra.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import StoreApp from './store/StoreApp';

const STORE_PATHS = ['/login', '/catalog', '/checkout'];
const isStore = STORE_PATHS.includes(window.location.pathname);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <nav
      aria-label="Secciones de la aplicación"
      className="max-w-4xl mx-auto px-6 pt-4 flex gap-4 text-sm text-gray-600"
    >
      <a href="/" className="hover:underline">Administrar productos</a>
      <a href="/login" className="hover:underline">Ir a la tienda</a>
    </nav>
    {isStore ? <StoreApp /> : <App />}
  </React.StrictMode>
);
