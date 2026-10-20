import { test, expect } from '@playwright/test';
import { ProductPage } from '../pages/ProductPage';

test.describe('Suite E2E: Catálogo de Productos', () => {
  let productPage: ProductPage;

  test.beforeEach(async ({ page }) => {
    // Inicializar el Page Object y navegar a la app
    productPage = new ProductPage(page);
    await productPage.goto();
  });

  test('Prueba 1 (Happy Path): Debe registrar un producto y reflejarlo en la tabla', async () => {
    const name = `Teclado Mecánico ${Date.now()}`;

    await productPage.createProduct(name, '250000', 'Periféricos');

    await expect(productPage.alertBox).toBeVisible();
    await expect(productPage.alertBox).toHaveText('Producto creado exitosamente');

    const row = productPage.getProductRow(name);
    await expect(row).toBeVisible();
    await expect(row.getByRole('cell', { name: 'Periféricos' })).toBeVisible();
  });

  test('Prueba 2 (Validación de Formulario): No permite registrar campos vacíos', async () => {
    await productPage.submitButton.click();

    await expect(productPage.alertBox).toBeVisible();
    await expect(productPage.alertBox).toContainText('Todos los campos son obligatorios');
  });

  test('Prueba 3 (Network Mocking): Manejo resiliente de error 500 del servidor', async ({ page }) => {
    await page.route('**/api/v1/products', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Error interno del servidor' }),
        });
      } else {
        await route.continue();
      }
    });

    await productPage.createProduct(`Producto Fallido ${Date.now()}`, '100000');

    await expect(productPage.alertBox).toBeVisible();
    await expect(productPage.alertBox).toContainText('Error al procesar el producto');
  });

  test('Prueba 4 (Eliminación): Debe eliminar un producto existente de la lista', async () => {
    const name = `Producto Temporal ${Date.now()}`;

    await productPage.createProduct(name, '99000');
    const row = productPage.getProductRow(name);
    await expect(row).toBeVisible();

    await productPage.deleteProduct(name);

    await expect(row).not.toBeVisible();
  });
});
