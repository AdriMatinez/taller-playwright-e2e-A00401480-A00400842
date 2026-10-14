# 🎭 Taller Práctico Formativo: Pruebas End-to-End (E2E) con Playwright
### Cúspide de la Pirámide • Auto-Waiting • Page Object Model (POM) • Network Mocking • CI/CD en GitHub Actions

**Universidad Icesi**  
**Facultad de Ingeniería, Diseño y Ciencias Aplicadas**  
**Departamento de Computación y Sistemas Inteligentes (DCSI)**  
**Curso:** Ingeniería de Software V (09776 - TIC)  
**Período:** 2026-2 (Semana 10 / Sesión 19)  
**Profesor:** Alejandro Muñoz Bravo  
**Modalidad:** Taller Práctico en Laboratorio (Sala 205M)  
**Política IAG:** Nivel 3 — Colaboración Asistida  

---

## 📄 Enunciados y Material de Apoyo

Los documentos oficiales de referencia, enunciados y diapositivas teóricas se encuentran en el repositorio:
* 📘 **[Guía Formativa de Laboratorio: Pruebas E2E con Playwright (PDF)](./Taller_Formativo_Playwright_E2E.pdf)**
* 📝 **[Taller Evaluativo Sumativo (15%): Rúbrica y Requisitos (PDF)](./Taller_Evaluativo_Playwright_E2E.pdf)**
* 🖥️ **[Presentación de Clase: Diapositivas Beamer (PDF)](./presentacion/sesion_19_pruebas_end_to_end_playwright.pdf)**

---

## 🎯 Objetivos de Aprendizaje

1. **La Pirámide de Automatización:** Comprender el balance de esfuerzo (70% Unitarias, 20% Integración, 10% E2E) según Cohn y Fowler, evitando el antipatrón del *"Cono de Helado"*.
2. **Auto-Waiting y Conexión Nativa:** Aprovechar la arquitectura de Playwright sobre WebSocket y su motor de auto-espera para eliminar pausas arbitrarias (`sleep`) y pruebas intermitentes (*flaky tests*).
3. **Selectores Resilientes basados en Accesibilidad:** Diseñar localizadores semánticos estándar W3C/ARIA (`getByRole`, `getByLabel`, `getByText`) inmunes a cambios cosméticos de CSS o maquetación.
4. **Patrón Page Object Model (POM):** Desacoplar la estructura y selectores de la página de la lógica de aserción y ejecución de las pruebas.
5. **Network Mocking (`page.route`):** Simular contingencias reales de infraestructura (errores 500, latencia, payloads corruptos) sin alterar la base de datos ni el backend real.
6. **Diagnóstico Forense y CI/CD:** Analizar ejecuciones fallidas con **Playwright Trace Viewer** y automatizar la suite en modo desatendido (*headless*) en **GitHub Actions**.

---

## 📁 Estructura del Repositorio

```text
.
├── Taller_Formativo_Playwright_E2E.pdf    # Guía práctica de laboratorio paso a paso
├── Taller_Evaluativo_Playwright_E2E.pdf   # Enunciado evaluativo con rúbrica sobre 5.0
├── presentacion/                          # Diapositivas de la sesión
│   ├── sesion_19_pruebas_end_to_end_playwright.pdf
│   ├── sesion_19_pruebas_end_to_end_playwright.tex
│   └── custombeamer.sty
├── taller/                                # Código fuente LaTeX de los enunciados
│   ├── Taller_Formativo_Playwright_E2E.tex
│   ├── Taller_Evaluativo_Playwright_E2E.tex
│   └── logo-icesi.png
├── playwright.config.ts                   # Configuración central de Playwright (WebServers, Browsers, Trazas)
├── package.json                           # Scripts y dependencias (Vite, React, Express, Playwright)
├── frontend/                              # Aplicación web cliente (React 18 + TypeScript + Tailwind)
│   ├── index.html
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx                        # Catálogo y formulario CRUD con estados accesibles
│       ├── main.tsx
│       └── types.ts
├── server/                                # Servidor REST de pruebas (Node.js + Express)
│   └── server.js                          # Endpoints /api/v1/products con latencia y validaciones
├── e2e/                                   # Suite de pruebas E2E con Playwright
│   ├── pages/
│   │   └── ProductPage.ts                 # Page Object Model de la vista de productos
│   └── tests/
│       └── products.spec.ts               # Escenarios E2E (Happy path, validaciones, mocking 500, delete)
├── .github/
│   └── workflows/
│       └── e2e-playwright.yml             # Pipeline CI/CD automatizado para GitHub Actions
└── README.md                              # Guía integral de inicio rápido
```

---

## 🚀 Puesta en Marcha en Entorno Local

### 1. Requisitos Previos
* **Node.js:** Versión 18+ o 20 LTS.
* **npm:** Versión 9+.

### 2. Instalación de Dependencias
Clone el repositorio y ejecute en la raíz:
```bash
npm install
```

### 3. Descarga de Navegadores de Playwright
Playwright requiere los binarios de los motores Chromium, Firefox y WebKit (Safari):
```bash
npx playwright install --with-deps
```

### 4. Iniciar la Aplicación (Frontend + Backend)
El proyecto incluye un script concurrente que levanta simultáneamente el servidor REST y la interfaz Vite:
```bash
npm run dev
```
* **Frontend Web:** `http://localhost:3000`
* **API REST Backend:** `http://localhost:8080/api/v1/products`

> [!NOTE]
> Al ejecutar `npm run test:e2e`, Playwright automáticamente detecta y levanta el `webServer` si no está en ejecución gracias a la directiva en `playwright.config.ts`.

---

## 🧪 Ejecución de Pruebas E2E

### Modo Consola / Headless (CI estándar):
Ejecuta toda la suite en segundo plano a máxima velocidad:
```bash
npm run test:e2e
```

### Modo Interactivo / UI Mode (Desarrollo y depuración en vivo):
Abre la interfaz gráfica interactiva de Playwright con Time-Travel y selector en vivo:
```bash
npm run test:e2e:ui
```

### Inspección del Reporte HTML:
Genera un informe visual detallado con tiempos por paso, capturas y videos:
```bash
npm run test:e2e:report
```

### Diagnóstico Forense con Trace Viewer:
Si una prueba falla en CI o localmente con reintentos activados, Playwright genera un archivo `.zip` con el registro milisegundo a milisegundo:
```bash
npx playwright show-trace test-results/<nombre-de-la-prueba>/trace.zip
```

---

## 🧩 Escenarios E2E Implementados

Las pruebas en `e2e/tests/products.spec.ts` validan las capacidades clave exigidas en ingeniería de software moderna:

| ID | Escenario de Prueba | Técnica Aplicada | Validación Web-First |
| :---: | :--- | :--- | :--- |
| **01** | Registro exitoso de producto (Happy Path) | Page Object Model (`ProductPage.ts`) | `expect(alertBox).toBeVisible()` y verificación en tabla |
| **02** | Validación de campos obligatorios vacíos | Selectores ARIA y captura de alertas | `expect(alertBox).toContainText('Todos los campos son obligatorios')` |
| **03** | Resiliencia ante caída del servidor (500) | **Network Mocking** (`page.route()`) | Intercepción de `POST /api/v1/products` con respuesta 500 forzada |
| **04** | Eliminación reactiva de un producto | Aislamiento y manipulación de lista | Confirmación de borrado dinámico en el DOM |

---

## 🤖 Integración Continua (GitHub Actions)

El flujo `.github/workflows/e2e-playwright.yml` automatiza la verificación en cada `push` o `pull_request`:
* Configura Node.js 20 con caché de npm.
* Descarga e instala los navegadores de prueba.
* Ejecuta `npm run test:e2e` en entornos virtualizados limpios.
* Publica los artefactos y el reporte HTML automáticamente si ocurre algún fallo para auditoría docente.

---

**Laboratorio IasLab • Universidad Icesi 2026**
