/**
 * Pantalla del catálogo.
 * Consulta GET /api/v1/products y muestra cada producto en una tarjeta (article) con su
 * botón "Agregar al carrito". Incluye el buscador y un indicador de carga (role="status")
 * mientras llegan los datos. Si la carga falla, muestra una alerta con un botón para reintentar.
 */

import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { formatCOP } from './format';

interface CatalogViewProps {
  onAddToCart: (product: Product) => void;
}

export default function CatalogView({ onAddToCart }: CatalogViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  // Arranca en true para que el indicador de carga sea visible desde el primer render
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/v1/products');
        if (!res.ok) throw new Error('Error al consultar productos');
        const data: Product[] = await res.json();
        if (!ignore) setProducts(data);
      } catch {
        if (!ignore) setError('No se pudo cargar el catálogo de productos');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const term = search.trim().toLowerCase();
  const visibleProducts = products.filter(
    p => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)
  );

  return (
    <section aria-labelledby="catalog-heading">
      <h2 id="catalog-heading" className="text-2xl font-bold mb-4 text-gray-800">
        Catálogo de productos
      </h2>

      <input
        type="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar productos..."
        aria-label="Buscar productos"
        className="w-full md:w-96 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none mb-6"
      />

      {loading && (
        <div
          role="status"
          aria-label="Cargando productos"
          className="flex items-center gap-3 py-10 text-gray-600"
        >
          <span
            aria-hidden="true"
            className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"
          />
          <span>Cargando productos...</span>
        </div>
      )}

      {!loading && error && (
        <div role="alert" className="p-4 rounded-lg border bg-red-50 text-red-800 border-red-300">
          <p className="mb-3 font-medium">{error}</p>
          <button
            onClick={() => setReloadKey(k => k + 1)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg"
          >
            Reintentar carga
          </button>
        </div>
      )}

      {!loading && !error && visibleProducts.length === 0 && (
        <p className="text-gray-500 py-6">No se encontraron productos para tu búsqueda.</p>
      )}

      {!loading && !error && visibleProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleProducts.map(p => (
            <article key={p.id} className="bg-white p-4 rounded-xl shadow-sm border flex flex-col">
              <h3 className="font-bold text-gray-900">{p.name}</h3>
              <p className="text-sm text-gray-600">{p.category}</p>
              <p className="text-lg font-semibold text-gray-800 my-3">{formatCOP(p.price)}</p>
              <button
                onClick={() => onAddToCart(p)}
                aria-label={`Agregar ${p.name} al carrito`}
                className="mt-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition"
              >
                Agregar al carrito
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
