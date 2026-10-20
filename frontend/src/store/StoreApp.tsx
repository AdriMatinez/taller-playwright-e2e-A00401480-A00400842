/**
 * Contenedor de la tienda en línea.
 * Aquí manejamos la sesión y el carrito (guardados en sessionStorage), la navegación
 * entre /login, /catalog y /checkout, la protección de rutas (sin sesión solo se ve el
 * login) y el encabezado con el enlace al carrito y el badge con la cantidad de productos.
 */

import React, { useEffect, useState } from 'react';
import { CartItem, Product, Session } from '../types';
import LoginView from './LoginView';
import CatalogView from './CatalogView';
import CheckoutView from './CheckoutView';

type StorePath = '/login' | '/catalog' | '/checkout';

const SESSION_KEY = 'store.session';
const CART_KEY = 'store.cart';

// sessionStorage puede fallar (modo privado, cuota); en ese caso se usa el valor por defecto
function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    if (value === null) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* sin persistencia: la app sigue funcionando con el estado en memoria */
  }
}

function pathFromLocation(): StorePath {
  const p = window.location.pathname;
  return p === '/catalog' || p === '/checkout' ? p : '/login';
}

export default function StoreApp() {
  const [path, setPath] = useState<StorePath>(pathFromLocation());
  const [session, setSession] = useState<Session | null>(() => readStorage<Session | null>(SESSION_KEY, null));
  const [cart, setCart] = useState<CartItem[]>(() => readStorage<CartItem[]>(CART_KEY, []));

  useEffect(() => writeStorage(SESSION_KEY, session), [session]);
  useEffect(() => writeStorage(CART_KEY, cart), [cart]);

  useEffect(() => {
    const onPopState = () => setPath(pathFromLocation());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Vista efectiva: sin sesión solo existe el login; con sesión, el login redirige al catálogo
  const view: StorePath = !session ? '/login' : path === '/login' ? '/catalog' : path;

  // Mantiene la URL sincronizada con la vista efectiva (guard de rutas)
  useEffect(() => {
    if (window.location.pathname !== view) {
      window.history.replaceState({}, '', view);
    }
  }, [view]);

  const navigate = (next: StorePath) => {
    window.history.pushState({}, '', next);
    setPath(next);
  };

  const handleLogin = (newSession: Session) => {
    setSession(newSession);
    navigate('/catalog');
  };

  const handleLogout = () => {
    setSession(null);
    setCart([]);
    navigate('/login');
  };

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => (i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  const goTo = (target: StorePath) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(target);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8 border-b pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-700">Tienda — Icesi Cloud Solutions</h1>
          <p className="text-gray-600 text-sm mt-1">Ciclo de compra para pruebas End-to-End con Playwright</p>
        </div>

        {session && (
          <nav aria-label="Navegación de la tienda" className="flex items-center gap-4 text-sm">
            <a href="/catalog" onClick={goTo('/catalog')} className="text-indigo-700 font-semibold hover:underline">
              Catálogo
            </a>
            <span className="flex items-center gap-2">
              <a href="/checkout" onClick={goTo('/checkout')} className="text-indigo-700 font-semibold hover:underline">
                Ir al carrito
              </a>
              <span
                role="status"
                aria-label="Cantidad de productos en el carrito"
                className="inline-flex min-w-6 justify-center rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white"
              >
                {cartCount}
              </span>
            </span>
            <span className="text-gray-600">Hola, {session.name}</span>
            <button onClick={handleLogout} className="text-red-600 hover:text-red-800 font-semibold">
              Cerrar sesión
            </button>
          </nav>
        )}
      </header>

      {view === '/login' && <LoginView onLogin={handleLogin} />}
      {view === '/catalog' && <CatalogView onAddToCart={handleAddToCart} />}
      {view === '/checkout' && session && (
        <CheckoutView
          cart={cart}
          session={session}
          onOrderCreated={() => setCart([])}
          onNavigate={navigate}
        />
      )}
    </div>
  );
}
