import { Page, Locator } from '@playwright/test';

/**
 * Page Object del catálogo (/catalog) y del carrito del encabezado.
 * Permite buscar un producto, ubicar su tarjeta, agregarlo al carrito, leer la cantidad del
 * badge e ir al checkout. También expone el indicador de carga para la prueba de latencia.
 */
export class CatalogPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly loadingIndicator: Locator;
  readonly productCards: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly alert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder(/buscar productos/i);
    this.loadingIndicator = page.getByRole('status', { name: /cargando productos/i });
    this.productCards = page.getByRole('article');
    this.cartLink = page.getByRole('link', { name: /carrito/i });
    this.cartBadge = page.getByRole('status', { name: /cantidad de productos en el carrito/i });
    this.alert = page.getByRole('alert');
  }

  async searchProduct(term: string) {
    await this.searchInput.fill(term);
  }

  getProductCard(name: string): Locator {
    return this.productCards.filter({ hasText: name });
  }

  async addToCart(name: string) {
    await this.getProductCard(name).getByRole('button', { name: /agregar/i }).click();
  }

  /** Lee el número del badge del carrito (para aserciones con reintento use cartBadge + toHaveText). */
  async getCartBadgeCount(): Promise<number> {
    const text = await this.cartBadge.innerText();
    return Number(text.trim());
  }

  async goToCheckout() {
    await this.cartLink.click();
  }
}
