import { Page, Locator } from '@playwright/test';

/**
 * Page Object de la pantalla de login (/login).
 * Concentramos aquí los localizadores semánticos (campo de usuario, contraseña, botón y
 * alerta) y los métodos goto() y login(user, pass). No hace aserciones: esas quedan en los tests.
 */
export class LoginPage {
  readonly page: Page;
  readonly userInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly alert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userInput = page.getByRole('textbox', { name: /usuario|correo/i });
    this.passwordInput = page.getByLabel(/contraseña/i);
    this.submitButton = page.getByRole('button', { name: /iniciar sesión|ingresar/i });
    this.alert = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
  }

  async login(user: string, pass: string) {
    await this.userInput.fill(user);
    await this.passwordInput.fill(pass);
    await this.submitButton.click();
  }
}
