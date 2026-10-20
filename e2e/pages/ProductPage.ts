import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model (POM) para la página de gestión de productos ('/').
 * Usa selectores semánticos basados en accesibilidad W3C/ARIA.
 */
export class ProductPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly priceInput: Locator;
  readonly categorySelect: Locator;
  readonly submitButton: Locator;
  readonly alertBox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByLabel('Nombre del Producto');
    this.priceInput = page.getByLabel('Precio');
    this.categorySelect = page.getByLabel('Categoría');
    this.submitButton = page.getByRole('button', { name: 'Registrar Producto' });
    this.alertBox = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  async createProduct(name: string, price: string, category: string = 'Computadores') {
    await this.nameInput.fill(name);
    await this.priceInput.fill(price);
    await this.categorySelect.selectOption(category);
    await this.submitButton.click();
  }

  getProductRow(name: string): Locator {
    return this.page.getByRole('row', { name: new RegExp(name, 'i') });
  }

  async deleteProduct(name: string) {
    const row = this.getProductRow(name);
    await row.getByRole('button', { name: /eliminar/i }).click();
  }
}
