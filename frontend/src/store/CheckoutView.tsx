/**
 * Pantalla de checkout.
 * Muestra el resumen del carrito con subtotales y total, el formulario de entrega y el
 * botón "Confirmar orden", que queda deshabilitado si el carrito está vacío. Al confirmar
 * envía POST /api/v1/orders: si sale bien abre el modal "Compra exitosa" con el ID de la
 * orden; si falla (por ejemplo un 500) abre un diálogo con opción de reintentar.
 */

import React, { useState } from 'react';
import { CartItem, Order, Session } from '../types';
import { formatCOP } from './format';

interface CheckoutViewProps {
  cart: CartItem[];
  session: Session;
  onOrderCreated: () => void;
  onNavigate: (path: '/catalog' | '/checkout') => void;
}

export default function CheckoutView({ cart, session, onOrderCreated, onNavigate }: CheckoutViewProps) {
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const submitOrder = async () => {
    setFormError(null);
    setFailure(null);

    if (!fullName.trim() || !address.trim() || !city.trim()) {
      setFormError('Completa todos los datos de entrega');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          items: cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
          shipping: { fullName: fullName.trim(), address: address.trim(), city: city.trim() },
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setFailure(data?.message ?? `El servidor respondió con el error ${res.status}`);
        return;
      }

      setOrder(data as Order);
      onOrderCreated();
    } catch {
      setFailure('No se pudo conectar con el servidor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitOrder();
  };

  return (
    <section aria-labelledby="checkout-heading">
      <h2 id="checkout-heading" className="text-2xl font-bold mb-4 text-gray-800">
        Resumen de la orden
      </h2>

      {cart.length === 0 ? (
        <p className="bg-white p-6 rounded-xl border text-gray-600 mb-6">
          Tu carrito está vacío. Agrega productos desde el catálogo para continuar.
        </p>
      ) : (
        <div className="bg-white p-4 rounded-xl border mb-6 overflow-x-auto">
          <table className="w-full text-left text-sm" aria-label="Resumen del carrito">
            <thead>
              <tr className="border-b text-xs uppercase text-gray-600">
                <th className="py-2 px-3">Producto</th>
                <th className="py-2 px-3">Cantidad</th>
                <th className="py-2 px-3">Precio unitario</th>
                <th className="py-2 px-3">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cart.map(item => (
                <tr key={item.productId}>
                  <th scope="row" className="py-2 px-3 font-medium text-gray-900">{item.name}</th>
                  <td className="py-2 px-3">{item.quantity}</td>
                  <td className="py-2 px-3">{formatCOP(item.price)}</td>
                  <td className="py-2 px-3 font-semibold">{formatCOP(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t font-bold">
                <th scope="row" colSpan={3} className="py-2 px-3 text-right">Total</th>
                <td className="py-2 px-3">{formatCOP(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <section aria-labelledby="shipping-heading" className="bg-white p-6 rounded-xl border">
        <h3 id="shipping-heading" className="text-lg font-bold mb-4 text-gray-800">
          Información de entrega
        </h3>

        {formError && (
          <div role="alert" className="mb-4 p-3 rounded-lg font-medium border bg-red-50 text-red-800 border-red-300">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="shipping-name" className="block text-sm font-semibold text-gray-700 mb-1">
              Nombre completo
            </label>
            <input
              id="shipping-name"
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label htmlFor="shipping-address" className="block text-sm font-semibold text-gray-700 mb-1">
              Dirección de entrega
            </label>
            <input
              id="shipping-address"
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label htmlFor="shipping-city" className="block text-sm font-semibold text-gray-700 mb-1">
              Ciudad
            </label>
            <input
              id="shipping-city"
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={cart.length === 0 || submitting}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow transition disabled:opacity-50"
          >
            Confirmar orden
          </button>
        </form>
      </section>

      {/* Modal de compra exitosa */}
      {order && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-success-title"
            className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full"
          >
            <h2 id="order-success-title" className="text-xl font-bold text-green-700 mb-2">
              Compra exitosa
            </h2>
            <p className="text-gray-700 mb-2">Tu orden fue registrada correctamente.</p>
            <p className="text-gray-700 mb-1">
              Identificador de orden: <strong>{order.orderId}</strong>
            </p>
            <p className="text-gray-700 mb-4">Total pagado: {formatCOP(order.total)}</p>
            <button
              autoFocus
              onClick={() => onNavigate('/catalog')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
            >
              Seguir comprando
            </button>
          </div>
        </div>
      )}

      {/* Diálogo de error con reintento (por ejemplo, ante un HTTP 500) */}
      {failure && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="order-error-title"
            aria-describedby="order-error-message"
            className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full"
          >
            <h2 id="order-error-title" className="text-xl font-bold text-red-700 mb-2">
              No pudimos procesar tu orden
            </h2>
            <p id="order-error-message" className="text-gray-700 mb-4">
              {failure}
            </p>
            <div className="flex gap-3">
              <button
                autoFocus
                onClick={submitOrder}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
              >
                Reintentar
              </button>
              <button
                onClick={() => setFailure(null)}
                className="px-4 py-2 border rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
