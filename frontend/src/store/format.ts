/**
 * Formatea un valor en pesos colombianos con puntos de miles (ej. 4200000 -> $4.200.000).
 * Se implementa a mano para que el texto sea idéntico en Chromium, Firefox y WebKit,
 * sin depender de los datos de localización (ICU) de cada navegador.
 */
export function formatCOP(value: number): string {
  return '$' + String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
