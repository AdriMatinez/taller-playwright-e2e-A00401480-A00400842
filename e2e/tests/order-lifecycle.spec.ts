/**
 * Pruebas E2E del ciclo de compra (Fase 2 del taller evaluativo).
 * Test 1: camino feliz (login, catálogo, carrito, checkout y confirmación con ID de orden).
 * Test 1b: subtotales con varias unidades del mismo producto.
 * Test 2: credenciales inválidas (alerta visible y la URL sigue en /login).
 * Test 3: carrito vacío (el botón "Confirmar orden" está deshabilitado).
 * Usamos los Page Objects, localizadores semánticos y aserciones web-first, sin esperas fijas.
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CatalogPage } from '../pages/CatalogPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { VALID_USER, INVALID_USER, LAPTOP, MOUSE, SHIPPING } from '../data/test-data';

test.describe('Ciclo de vida de la orden: login, catálogo, carrito y checkout', () => {
  let loginPage: LoginPage;
  let catalogPage: CatalogPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    catalogPage = new CatalogPage(page);
    checkoutPage = new CheckoutPage(page);
    await loginPage.goto();
  });

  test('Test 1 (Camino feliz): login, catálogo, carrito, checkout y confirmación con ID de orden', async ({ page }) => {
    // Login
    await loginPage.login(VALID_USER.username, VALID_USER.password);
    await expect(page).toHaveURL(/\/catalog/);

    // Catálogo: carga la lista y se filtra con el buscador
    await expect(catalogPage.productCards.first()).toBeVisible();
    await catalogPage.searchProduct(LAPTOP.name);
    await expect(catalogPage.productCards).toHaveCount(1);
    await expect(catalogPage.getProductCard(LAPTOP.name)).toBeVisible();

    // Carrito
    await expect(catalogPage.cartBadge).toHaveText('0');
    await catalogPage.addToCart(LAPTOP.name);
    await expect(catalogPage.cartBadge).toHaveText('1');
    expect(await catalogPage.getCartBadgeCount()).toBe(1);

    // Checkout: resumen y subtotales
    await catalogPage.goToCheckout();
    await expect(page).toHaveURL(/\/checkout/);
    await expect(checkoutPage.getCartRow(LAPTOP.name)).toBeVisible();
    await expect(checkoutPage.getSubtotalCell(LAPTOP.name)).toHaveText(LAPTOP.priceLabel);
    await expect(checkoutPage.getTotalCell()).toHaveText(LAPTOP.priceLabel);

    // Datos de entrega y confirmación
    await expect(checkoutPage.confirmButton).toBeEnabled();
    await checkoutPage.fillShipping(SHIPPING);
    await checkoutPage.confirmOrder();

    // Compra exitosa con identificador de orden
    await expect(checkoutPage.confirmationModal).toBeVisible();
    await expect(checkoutPage.getOrderId()).toHaveText(/^ORD-[A-Z0-9]+$/);
  });

  test('Test 1b (Subtotales): varias unidades del mismo producto actualizan badge y subtotal', async ({ page }) => {
    await loginPage.login(VALID_USER.username, VALID_USER.password);
    await expect(page).toHaveURL(/\/catalog/);

    await catalogPage.addToCart(MOUSE.name);
    await catalogPage.addToCart(MOUSE.name);
    await expect(catalogPage.cartBadge).toHaveText('2');

    await catalogPage.goToCheckout();
    await expect(checkoutPage.getSubtotalCell(MOUSE.name)).toHaveText(MOUSE.doubleSubtotalLabel);
    await expect(checkoutPage.getTotalCell()).toHaveText(MOUSE.doubleSubtotalLabel);
  });

  test('Test 2 (Credenciales inválidas): muestra alerta y permanece en /login', async ({ page }) => {
    await loginPage.login(INVALID_USER.username, INVALID_USER.password);

    await expect(loginPage.alert).toBeVisible();
    await expect(loginPage.alert).toHaveText(/credenciales inválidas/i);
    await expect(page).toHaveURL(/login/);
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('Test 3 (Restricciones): el botón de confirmar está deshabilitado con el carrito vacío', async ({ page }) => {
    await loginPage.login(VALID_USER.username, VALID_USER.password);
    await expect(page).toHaveURL(/\/catalog/);

    await catalogPage.goToCheckout();
    await expect(page).toHaveURL(/\/checkout/);
    await expect(checkoutPage.emptyCartMessage).toBeVisible();
    await expect(checkoutPage.confirmButton).toBeDisabled();
  });
});
