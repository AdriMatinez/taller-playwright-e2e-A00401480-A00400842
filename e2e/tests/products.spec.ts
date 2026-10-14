import { test, expect } from '@playwright/test';
import { ProductPage } from '../pages/ProductPage';

test.describe('Suite E2E: Catálogo de Productos', () => {
  let productPage: ProductPage;

  test.beforeEach(async ({ page }) => {
    // Inicializar el Page Object y navegar a la app
    productPage = new ProductPage(page);
    await productPage.goto();
  });

  test('Prueba 1 (Happy Path): Debe registrar un producto y reflejarlo en la tabla', async ({ page }) => {
    // TODO:
    // 1. Definir datos de prueba dinámicos (nombre único con Date.now() y precio)
    // 2. Invocar createProduct en productPage pasando nombre, precio y categoría
    // 3. Validar con aserciones Web-First (expect(...).toBeVisible(), toHaveText) que aparezca la alerta de éxito:
    //    'Producto creado exitosamente'
    // 4. Obtener la fila de la tabla con productPage.getProductRow(...) y verificar visibilidad de la fila y celda de categoría
  });

  test('Prueba 2 (Validación de Formulario): No permite registrar campos vacíos', async ({ page }) => {
    // TODO:
    // 1. Intentar enviar el formulario sin llenar los campos (clic en submitButton)
    // 2. Verificar con aserciones Web-First que alertBox sea visible y contenga el mensaje de error:
    //    'Todos los campos son obligatorios'
  });

  test('Prueba 3 (Network Mocking): Manejo resiliente de error 500 del servidor', async ({ page }) => {
    // TODO:
    // 1. Interceptar solicitudes de red hacia la API con page.route('**/api/v1/products', ...)
    // 2. Si el método HTTP es 'POST', simular fallo con route.fulfill({ status: 500, contentType: 'application/json', body: ... })
    //    En caso contrario, invocar route.continue()
    // 3. Intentar crear un producto mediante productPage.createProduct(...)
    // 4. Verificar que la interfaz maneje el fallo mostrando alertBox con el mensaje:
    //    'Error al procesar el producto'
  });

  test('Prueba 4 (Eliminación): Debe eliminar un producto existente de la lista', async ({ page }) => {
    // TODO:
    // 1. Crear un producto temporal mediante productPage.createProduct(...)
    // 2. Verificar que la fila del producto sea visible en la tabla
    // 3. Invocar deleteProduct en productPage pasando el nombre del producto
    // 4. Validar con aserción Web-First que la fila ya no sea visible en el DOM (not.toBeVisible())
  });
});
