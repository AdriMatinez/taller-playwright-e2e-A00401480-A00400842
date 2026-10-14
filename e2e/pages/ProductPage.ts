import { Page, Locator } from '@playwright/test';

export class ProductPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly priceInput: Locator;
  readonly categorySelect: Locator;
  readonly submitButton: Locator;
  readonly alertBox: Locator;

  constructor(page: Page) {
    this.page = page;
    // Locators basados estrictamente en accesibilidad W3C/ARIA
    this.nameInput = page.getByLabel('Nombre del Producto');
    this.priceInput = page.getByLabel('Precio');
    this.categorySelect = page.getByLabel('Categoría');
    this.submitButton = page.getByRole('button', { name: 'Registrar Producto' });
    this.alertBox = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/');
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
    await row.getByRole('button', { name: new RegExp(`Eliminar ${name}`, 'i') }).click();
  }
}
