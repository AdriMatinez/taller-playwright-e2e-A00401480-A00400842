/**
 * Pantalla de inicio de sesión.
 * Tiene los campos "Usuario o correo" y "Contraseña" con su label y el botón
 * "Iniciar sesión". Si las credenciales son inválidas mostramos una alerta
 * (role="alert") y el usuario se queda en /login; si son correctas guardamos la sesión.
 */

import React, { useState } from 'react';
import { Session } from '../types';

interface LoginViewProps {
  onLogin: (session: Session) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Ingresa tu usuario y tu contraseña');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.message ?? 'Credenciales inválidas');
        return;
      }

      onLogin({ token: data.token, name: data.user.name });
    } catch {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      aria-labelledby="login-heading"
      className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-sm border"
    >
      <h2 id="login-heading" className="text-2xl font-bold mb-1 text-gray-800">
        Acceso a la tienda
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Cuenta de demostración: estudiante@icesi.edu.co / Icesi2026*
      </p>

      {error && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-lg font-medium border bg-red-50 text-red-800 border-red-300"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="login-username" className="block text-sm font-semibold text-gray-700 mb-1">
            Usuario o correo
          </label>
          <input
            id="login-username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow transition disabled:opacity-50"
        >
          Iniciar sesión
        </button>
      </form>
    </section>
  );
}
