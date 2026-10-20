/**
 * Datos de prueba que usamos en los tests del taller evaluativo: el usuario válido e inválido,
 * los productos y los datos de entrega. Coinciden con lo que sembramos en server/server.js
 * y los dejamos en un solo archivo para no repetirlos en cada test.
 */

export const VALID_USER = {
  username: 'estudiante@icesi.edu.co',
  password: 'Icesi2026*',
};

export const INVALID_USER = {
  username: 'estudiante@icesi.edu.co',
  password: 'clave-incorrecta',
};

export const LAPTOP = {
  name: 'Portátil Gamer 16GB',
  priceLabel: '$4.200.000',
};

export const MOUSE = {
  name: 'Mouse Ergonómico Inalámbrico',
  unitPrice: 180000,
  doubleSubtotalLabel: '$360.000',
};

export const SHIPPING = {
  fullName: 'Estudiante Icesi',
  address: 'Calle 18 # 122-135',
  city: 'Cali',
};
