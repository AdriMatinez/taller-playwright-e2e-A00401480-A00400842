import { test, expect } from '@playwright/test';
import { ProductPage } from '../pages/ProductPage';

test.describe('Suite E2E: Catálogo de Productos', () => {
  let productPage: ProductPage;

  test.beforeEach(async ({ page }) => {
    productPage = new ProductPage(page);
    await productPage.goto();
  });

  test('Prueba 1 (Happy Path): Debe registrar un producto y reflejarlo en la tabla', async ({ page }) => {
    const productName = `Teclado RGB ${Date.now()}`;
    const productPrice = '240000';

    await productPage.createProduct(productName, productPrice, 'Periféricos');

    // Validación Web-First del mensaje de éxito con auto-waiting
    await expect(productPage.alertBox).toBeVisible();
    await expect(productPage.alertBox).toHaveText('Producto creado exitosamente');

    // Validación en el listado de la tabla
    const row = productPage.getProductRow(productName);
    await expect(row).toBeVisible();
    await expect(row.getByRole('cell', { name: 'Periféricos' })).toBeVisible();
  });

  test('Prueba 2 (Validación de Formulario): No permite registrar campos vacíos', async ({ page }) => {
    // Intentar enviar formulario vacío
    await productPage.submitButton.click();

    // Verificación de alerta de error
    await expect(productPage.alertBox).toBeVisible();
    await expect(productPage.alertBox).toContainText('Todos los campos son obligatorios');
  });

  test('Prueba 3 (Network Mocking): Manejo resiliente de error 500 del servidor', async ({ page }) => {
    // Intercepción de la llamada POST simulando caída de base de datos
    await page.route('**/api/v1/products', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Error interno en base de datos' })
        });
      } else {
        await route.continue();
      }
    });

    await productPage.createProduct('Disco SSD 1TB', '380000', 'Almacenamiento');

    // La interfaz debe capturar el error y no colapsar la pantalla
    await expect(productPage.alertBox).toBeVisible();
    await expect(productPage.alertBox).toContainText('Error al procesar el producto');
  });

  test('Prueba 4: Debe eliminar un producto existente de la lista', async ({ page }) => {
    const itemToDelete = `Item Temporal ${Date.now()}`;
    await productPage.createProduct(itemToDelete, '50000', 'General');
    await expect(productPage.getProductRow(itemToDelete)).toBeVisible();

    // Eliminar producto
    await productPage.deleteProduct(itemToDelete);

    // Validar que el elemento desapareció del DOM
    await expect(productPage.getProductRow(itemToDelete)).not.toBeVisible();
  });
});
