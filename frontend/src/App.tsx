import React, { useState, useEffect } from 'react';
import { Product } from './types';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Computadores');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/products');
      if (!res.ok) throw new Error('Error al consultar productos');
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setAlertType('error');
      setAlertMessage('Error al cargar datos del servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim()) {
      setAlertType('error');
      setAlertMessage('Todos los campos son obligatorios');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price: Number(price), category }),
      });

      if (!res.ok) {
        throw new Error('Error al procesar el producto');
      }

      const created = await res.json();
      setProducts(prev => [...prev, created]);
      setName('');
      setPrice('');
      setAlertType('success');
      setAlertMessage('Producto creado exitosamente');
    } catch (err: any) {
      setAlertType('error');
      setAlertMessage(err.message || 'Error al procesar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/v1/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        setAlertType('success');
        setAlertMessage('Producto eliminado');
      }
    } catch {
      setAlertType('error');
      setAlertMessage('Error al eliminar producto');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-extrabold text-indigo-700">
          Catálogo de Productos — Ingesoft V
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Aplicación Web de Ejemplo para Pruebas End-to-End con Playwright
        </p>
      </header>

      {/* Alerta de notificación accesible */}
      {alertMessage && (
        <div
          role="alert"
          aria-live="polite"
          className={`mb-6 p-4 rounded-lg font-medium border ${
            alertType === 'success'
              ? 'bg-green-50 text-green-800 border-green-300'
              : 'bg-red-50 text-red-800 border-red-300'
          }`}
        >
          {alertMessage}
        </div>
      )}

      {/* Formulario de registro de producto */}
      <section aria-labelledby="form-heading" className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h2 id="form-heading" className="text-xl font-bold mb-4 text-gray-800">
          Registrar Nuevo Producto
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="product-name" className="block text-sm font-semibold text-gray-700 mb-1">
              Nombre del Producto
            </label>
            <input
              id="product-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej. Monitor Ultrawide 34"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="product-price" className="block text-sm font-semibold text-gray-700 mb-1">
                Precio
              </label>
              <input
                id="product-price"
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="Ej. 1850000"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="product-category" className="block text-sm font-semibold text-gray-700 mb-1">
                Categoría
              </label>
              <select
                id="product-category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="Computadores">Computadores</option>
                <option value="Periféricos">Periféricos</option>
                <option value="Almacenamiento">Almacenamiento</option>
                <option value="Redes">Redes</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow transition disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Registrar Producto'}
          </button>
        </form>
      </section>

      {/* Tabla de productos registrados */}
      <section aria-labelledby="table-heading" className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 id="table-heading" className="text-xl font-bold mb-4 text-gray-800">
          Listado de Productos ({products.length})
        </h2>

        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No hay productos registrados en el sistema.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" aria-label="Tabla de inventario">
              <thead>
                <tr className="border-b bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Nombre</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Precio (COP)</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-medium text-gray-900">{p.name}</td>
                    <td className="py-3 px-4 text-gray-600">{p.category}</td>
                    <td className="py-3 px-4 text-gray-800 font-semibold">
                      ${p.price.toLocaleString('es-CO')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(p.id)}
                        aria-label={`Eliminar ${p.name}`}
                        className="text-red-600 hover:text-red-800 text-xs font-bold"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
