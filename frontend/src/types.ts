/**
 * Tipos de TypeScript compartidos por el frontend.
 * Product viene del taller formativo; CartItem, Session, ShippingInfo y Order
 * los agregamos para el carrito, la sesión, los datos de entrega y la orden confirmada.
 */

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

// ---- Tipos de la tienda en línea (taller evaluativo) ----

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Session {
  token: string;
  name: string;
}

export interface ShippingInfo {
  fullName: string;
  address: string;
  city: string;
}

export interface Order {
  orderId: string;
  status: string;
  total: number;
}
