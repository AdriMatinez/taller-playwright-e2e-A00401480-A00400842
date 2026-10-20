import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CatalogPage } from '../pages/CatalogPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { VALID_USER, LAPTOP, SHIPPING } from '../data/test-data';

/** Lleva al usuario hasta el checkout con un producto en el carrito y los datos de entrega diligenciados. */
async function reachCheckoutReadyToConfirm(page: Page) {
  const loginPage = new LoginPage(page);
  const catalogPage = new CatalogPage(page);
  const checkoutPage = new CheckoutPage(page);

  await loginPage.goto();
  await loginPage.login(VALID_USER.username, VALID_USER.password);
  await expect(page).toHaveURL(/\/catalog/);

  await catalogPage.addToCart(LAPTOP.name);
  await expect(catalogPage.cartBadge).toHaveText('1');
  await catalogPage.goToCheckout();
  await expect(page).toHaveURL(/\/checkout/);

  await checkoutPage.fillShipping(SHIPPING);
  return checkoutPage;
}

// Cada test registra sus propias rutas sobre su propia página (contexto aislado),
// por lo que los mocks no se filtran a otros escenarios.
test.describe('Network Mocking y resiliencia del frontend', () => {
  test('Error HTTP 500 al crear la orden: muestra diálogo de reintento y la UI sigue usable', async ({ page }) => {
    await page.route('**/api/v1/orders', async route => {
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Error interno en pasarela de pagos' }),
      });
    });

    const checkoutPage = await reachCheckoutReadyToConfirm(page);
    await checkoutPage.confirmOrder();

    // El frontend informa el fallo y ofrece reintentar
    await expect(checkoutPage.errorDialog).toBeVisible();
    await expect(checkoutPage.errorDialog).toContainText('Error interno en pasarela de pagos');
    await expect(checkoutPage.retryButton).toBeVisible();
    await expect(checkoutPage.confirmationModal).toBeHidden();

    // La interfaz no se congela: se puede cerrar el diálogo y el botón vuelve a estar habilitado
    await checkoutPage.cancelButton.click();
    await expect(checkoutPage.errorDialog).toBeHidden();
    await expect(checkoutPage.confirmButton).toBeEnabled();
    await expect(checkoutPage.getCartRow(LAPTOP.name)).toBeVisible();
  });

  test('Recuperación: el reintento funciona cuando el servicio vuelve a responder', async ({ page }) => {
    let attempts = 0;
    await page.route('**/api/v1/orders', async route => {
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }
      attempts += 1;
      if (attempts === 1) {
        // Solo el primer intento falla; los siguientes llegan al backend real
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Error interno en pasarela de pagos' }),
        });
        return;
      }
      await route.continue();
    });

    const checkoutPage = await reachCheckoutReadyToConfirm(page);
    await checkoutPage.confirmOrder();
    await expect(checkoutPage.errorDialog).toBeVisible();

    await checkoutPage.retryButton.click();

    await expect(checkoutPage.errorDialog).toBeHidden();
    await expect(checkoutPage.confirmationModal).toBeVisible();
    await expect(checkoutPage.getOrderId()).toHaveText(/^ORD-[A-Z0-9]+$/);
  });

  test('Latencia de 3000 ms en GET /products: el spinner aparece y desaparece al terminar la carga', async ({ page }) => {
    await page.route('**/api/v1/products', async route => {
      if (route.request().method() !== 'GET') {
        await route.fallback();
        return;
      }
      // Latencia artificial de la API (simulación de red lenta; no es una espera del test)
      await new Promise(resolve => setTimeout(resolve, 3000));
      await route.continue();
    });

    const loginPage = new LoginPage(page);
    const catalogPage = new CatalogPage(page);

    await loginPage.goto();
    await loginPage.login(VALID_USER.username, VALID_USER.password);

    // Mientras la petición está retenida: indicador visible y sin tarjetas de producto
    await expect(catalogPage.loadingIndicator).toBeVisible();
    const startedAt = Date.now();
    await expect(catalogPage.productCards).toHaveCount(0);

    // Al completarse la petición: el indicador se oculta y aparece el catálogo
    await expect(catalogPage.loadingIndicator).toBeHidden({ timeout: 10_000 });
    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(2000);
    await expect(catalogPage.getProductCard(LAPTOP.name)).toBeVisible();
  });
});
