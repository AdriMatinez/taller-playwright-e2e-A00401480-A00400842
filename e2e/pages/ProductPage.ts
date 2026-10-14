import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model (POM) para la página de gestión de productos.
 * 
 * OBJETIVO DEL ESTUDIANTE:
 * 1. Inicializar los locators en el constructor utilizando selectores semánticos
 *    estándar basados en accesibilidad W3C/ARIA:
 *    - nameInput: page.getByLabel('Nombre del Producto')
 *    - priceInput: page.getByLabel('Precio')
 *    - categorySelect: page.getByLabel('Categoría')
 *    - submitButton: page.getByRole('button', { name: 'Registrar Producto' })
 *    - alertBox: page.getByRole('alert')
 * 
 * 2. Implementar los métodos de interacción:
 *    - goto(): Navegar a la raíz ('/')
 *    - createProduct(name, price, category): Diligenciar el formulario y hacer clic en registrar
 *    - getProductRow(name): Retornar el locator de la fila en la tabla que contiene el producto
 *    - deleteProduct(name): Accionar el botón de eliminar del producto seleccionado
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

    // TODO: Inicializar localizadores semánticos basados en ARIA
    // Ejemplo:
    // this.nameInput = page.getByLabel('...');
    // this.priceInput = page.getByLabel('...');
    // this.categorySelect = page.getByLabel('...');
    // this.submitButton = page.getByRole('button', { name: '...' });
    // this.alertBox = page.getByRole('alert');
  }

  async goto() {
    // TODO: Navegar a la ruta base de la aplicación ('/')
  }

  async createProduct(name: string, price: string, category: string = 'Computadores') {
    // TODO:
    // 1. Llenar nameInput con el valor recibido
    // 2. Llenar priceInput con el valor recibido
    // 3. Seleccionar la opción en categorySelect
    // 4. Hacer clic en submitButton
  }

  getProductRow(name: string): Locator {
    // TODO: Retornar el Locator de la fila (row) que contiene el nombre del producto
    // Tip: this.page.getByRole('row', { name: new RegExp(name, 'i') })
    throw new Error('Método no implementado: getProductRow');
  }

  async deleteProduct(name: string) {
    // TODO:
    // 1. Obtener la fila con this.getProductRow(name)
    // 2. Localizar el botón de eliminar dentro de la fila y hacer clic
  }
}
