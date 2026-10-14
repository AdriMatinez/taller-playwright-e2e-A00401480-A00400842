const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

let products = [
  { id: 1, name: 'Portátil Gamer 16GB', price: 4200000, category: 'Computadores' },
  { id: 2, name: 'Mouse Ergonómico Inalámbrico', price: 180000, category: 'Periféricos' }
];

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', service: 'Product Mock API' });
});

// List products
app.get('/api/v1/products', (req, res) => {
  res.json(products);
});

// Create product
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

// Delete product
app.delete('/api/v1/products/:id', (req, res) => {
  const id = Number(req.params.id);
  products = products.filter(p => p.id !== id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`[API Server] Corriendo en http://localhost:${PORT}`);
});
