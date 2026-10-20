import { Page, Locator } from '@playwright/test';

export interface ShippingData {
  fullName: string;
  address: string;
  city: string;
}

/**
 * Page Object del checkout (/checkout).
 * Expone la tabla del resumen (filas, subtotales y total), los campos de entrega, el botón
 * "Confirmar orden", el modal de compra exitosa con el ID de la orden y el diálogo de error
 * con sus botones Reintentar y Cancelar. Las aserciones las hacemos en los tests.
 */
export class CheckoutPage {
  readonly page: Page;
  readonly cartTable: Locator;
  readonly emptyCartMessage: Locator;
  readonly fullNameInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly confirmButton: Locator;
  readonly alert: Locator;
  readonly confirmationModal: Locator;
  readonly errorDialog: Locator;
  readonly retryButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartTable = page.getByRole('table', { name: /resumen del carrito/i });
    this.emptyCartMessage = page.getByText(/tu carrito está vacío/i);
    this.fullNameInput = page.getByLabel(/nombre completo/i);
    this.addressInput = page.getByLabel(/dirección/i);
    this.cityInput = page.getByLabel(/ciudad/i);
    this.confirmButton = page.getByRole('button', { name: /confirmar orden/i });
    this.alert = page.getByRole('alert');
    this.confirmationModal = page.getByRole('dialog', { name: /compra exitosa/i });
    this.errorDialog = page.getByRole('alertdialog', { name: /no pudimos procesar/i });
    this.retryButton = this.errorDialog.getByRole('button', { name: /reintentar/i });
    this.cancelButton = this.errorDialog.getByRole('button', { name: /cancelar/i });
  }

  /** Fila del resumen que corresponde a un producto. */
  getCartRow(productName: string): Locator {
    return this.cartTable.getByRole('row').filter({ hasText: productName });
  }

  /** Celda del subtotal (última columna) de un producto, para validarla en el test. */
  getSubtotalCell(productName: string): Locator {
    return this.getCartRow(productName).getByRole('cell').last();
  }

  /** Celda del total general de la orden. */
  getTotalCell(): Locator {
    return this.cartTable
      .getByRole('row')
      .filter({ has: this.page.getByRole('rowheader', { name: 'Total', exact: true }) })
      .getByRole('cell');
  }

  /** Identificador de la orden mostrado en el modal de confirmación (ej. ORD-MGX12AB). */
  getOrderId(): Locator {
    return this.confirmationModal.getByText(/ORD-[A-Z0-9]+/);
  }

  async fillShipping(data: ShippingData) {
    await this.fullNameInput.fill(data.fullName);
    await this.addressInput.fill(data.address);
    await this.cityInput.fill(data.city);
  }

  async confirmOrder() {
    await this.confirmButton.click();
  }
}
