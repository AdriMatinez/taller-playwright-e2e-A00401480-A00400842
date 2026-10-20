/**
 * Servidor de la tienda (Express, puerto 8080).
 * Conservamos el CRUD de productos del taller formativo y le agregamos lo que pide
 * el evaluativo: POST /api/v1/auth/login (usuario de prueba, devuelve un token)
 * y POST /api/v1/orders (valida el token, los productos y la entrega, calcula el
 * total y devuelve el identificador de la orden, ej. ORD-XXXX). Los datos viven en memoria.
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Datos en memoria
// ---------------------------------------------------------------------------
let products = [
  { id: 1, name: 'Portátil Gamer 16GB', price: 4200000, category: 'Computadores' },
  { id: 2, name: 'Mouse Ergonómico Inalámbrico', price: 180000, category: 'Periféricos' },
  { id: 3, name: 'Monitor Ultrawide 34 Pulgadas', price: 1850000, category: 'Periféricos' },
  { id: 4, name: 'Disco SSD NVMe 1TB', price: 420000, category: 'Almacenamiento' },
  { id: 5, name: 'Router WiFi 6 Doble Banda', price: 350000, category: 'Redes' }
];

// Usuario de demostración para el flujo de login del taller evaluativo
const USERS = [
  { username: 'estudiante@icesi.edu.co', password: 'Icesi2026*', name: 'Estudiante Icesi' }
];

// Tokens de sesión emitidos por /auth/login (en memoria)
const activeTokens = new Set();

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !activeTokens.has(token)) {
    return res.status(401).json({ message: 'Sesión no válida. Inicia sesión nuevamente.' });
  }
  next();
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', service: 'Product Mock API' });
});

// ---------------------------------------------------------------------------
// Productos (catálogo CRUD del taller formativo)
// ---------------------------------------------------------------------------
app.get('/api/v1/products', (req, res) => {
  res.json(products);
});

app.post('/api/v1/products', (req, res) => {
  const { name, price, category } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Nombre y precio son obligatorios' });
  }

  const newProduct = {
    id: Date.now(),
    name,
    price: Number(price),
    category: category || 'General'
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.delete('/api/v1/products/:id', (req, res) => {
  const id = Number(req.params.id);
  products = products.filter(p => p.id !== id);
  res.status(204).send();
});

// ---------------------------------------------------------------------------
// Autenticación (taller evaluativo)
// ---------------------------------------------------------------------------
app.post('/api/v1/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = USERS.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const token = crypto.randomBytes(24).toString('hex');
  activeTokens.add(token);
  res.json({ token, user: { username: user.username, name: user.name } });
});

// ---------------------------------------------------------------------------
// Órdenes de compra (taller evaluativo)
// ---------------------------------------------------------------------------
app.post('/api/v1/orders', requireAuth, (req, res) => {
  const { items, shipping } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'La orden debe tener al menos un producto' });
  }
  if (!shipping || !shipping.fullName || !shipping.address || !shipping.city) {
    return res.status(400).json({ message: 'Los datos de entrega son obligatorios' });
  }

  const orderItems = [];
  for (const item of items) {
    const product = products.find(p => p.id === Number(item.productId));
    const quantity = Number(item.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'La orden contiene productos o cantidades inválidas' });
    }
    orderItems.push({
      productId: product.id,
      name: product.name,
      unitPrice: product.price,
      quantity,
      subtotal: product.price * quantity
    });
  }

  const total = orderItems.reduce((acc, i) => acc + i.subtotal, 0);
  const order = {
    orderId: `ORD-${Date.now().toString(36).toUpperCase()}`,
    status: 'CONFIRMED',
    total,
    items: orderItems,
    shipping,
    createdAt: new Date().toISOString()
  };

  res.status(201).json(order);
});

app.listen(PORT, () => {
  console.log(`[API Server] Corriendo en http://localhost:${PORT}`);
});
