# Sistema de Información Gerencial para la Gestión Integrada del Flujo Turístico en la Provincia de Cusco

![Dashboard Preview](https://github.com/JosephCC123/GERENCIALES-SISTEMA/raw/main/preview.png) *(Nota: Imagen referencial)*

## 1. OBJETIVOS DE LA PRÁCTICA
Definir un proyecto de investigación formativa orientado a identificar una problemática real en la localidad de Cusco y proponer una solución viable desde la perspectiva de los **Sistemas de Información Gerencial (SIG)**, aplicando criterios técnicos, metodológicos e institucionales.

## 2. TRABAJO PREPARATORIO
Para la elaboración del presente proyecto se indagó sobre las condiciones actuales de la gestión de información en el sector turístico de la región Cusco. Se identificó que, si bien la Municipalidad Provincial del Cusco ha dado pasos iniciales hacia el gobierno digital, aún existen brechas importantes en la gestión, integración y análisis de datos relacionados con el flujo turístico local. Esta situación representa una oportunidad concreta de mejora desde la perspectiva técnica y gerencial.

## 3. EJERCICIO PROPUESTO: FORMULACIÓN DEL PROYECTO

### Contexto del Proyecto
*   **Título:** Sistema de Información Gerencial para la Gestión Integrada del Flujo Turístico en la Provincia de Cusco.
*   **Área de Impacto:** Región Cusco, Perú.
*   **Instituciones Vinculadas:** DIRCETUR Cusco, Municipalidad Provincial del Cusco (MPC), COSITUC.

### Problemática Identificada
Cusco, como principal destino turístico del Perú, enfrenta deficiencias estructurales en la gestión de información turística:
*   **Desarticulación Institucional:** Las entidades operan con sistemas independientes que no se comunican entre sí.
*   **Informalidad y Falta de Control:** Dificultad para regular agencias, operadores y guías debido a sistemas de registro manuales o semi-digitalizados.
*   **Rezago Tecnológico:** Apenas el 28% de los programas públicos cuentan con un plan de gobierno digital implementado (ComexPerú).
*   **Inexistencia de Indicadores en Tiempo Real:** Falta de monitoreo sobre saturación de sitios arqueológicos y capacidad de carga.

### Justificación Técnica y Académica
*   **Técnica:** Aprovecha el impulso de transformación digital de la MPC para incorporar herramientas de **Business Intelligence** y gestión centralizada.
*   **Académica:** Se fundamenta en los principios de los SIG, abordando la interoperabilidad, inteligencia de negocios y toma de decisiones basada en datos estratégicos.

### Relevancia Institucional o Social
El turismo es el motor económico de Cusco. Una gestión eficiente impacta positivamente en:
1.  **Experiencia del Visitante:** Optimización de flujos y servicios.
2.  **Economía Local:** Mejora en los ingresos de operadores formales.
3.  **Conservación del Patrimonio:** Control estricto de la capacidad de carga de sitios como Machu Picchu y Sacsayhuaman.

### Diagnóstico del Estado Actual
*   Sistemas fragmentados en hojas de cálculo y formularios físicos.
*   Escasez de infraestructura de red moderna en instancias regionales.
*   Falta de un tablero (Dashboard) gerencial para la visualización de KPIs críticos.

---

## 4. OBJETIVOS DEL SISTEMA

### Objetivo General
Diseñar e implementar un Sistema de Información Gerencial integrado para la gestión del flujo turístico en la provincia de Cusco, que permita la consolidación, procesamiento y visualización de datos estratégicos para apoyar la toma de decisiones y optimizar la prestación de servicios turísticos.

### Objetivos Específicos
1.  **Diagnóstico:** Identificar las brechas de interoperabilidad en DIRCETUR, MPC y COSITUC.
2.  **Arquitectura:** Diseñar una plataforma técnica escalable con módulos de captura, procesamiento y visualización de KPIs.
3.  **Implementación:** Proponer un plan de adopción tecnológica y capacitación institucional.

---

## 5. STACK TECNOLÓGICO Y DATOS TÉCNICOS

El sistema ha sido desarrollado bajo una arquitectura moderna de **SPA (Single Page Application)** con un backend robusto tipo **RESTful API**.

### Frontend (Interfaz de Usuario)
*   **Framework:** [React 19](https://react.dev/) con [Vite](https://vitejs.dev/) para un desarrollo ultra-rápido.
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) para asegurar la integridad de los datos.
*   **Estilos:** [Tailwind CSS 4](https://tailwindcss.com/) (Arquitectura CSS-first) con diseño **Neuromórfico/Glassmorphism**.
*   **Iconografía:** [Lucide React](https://lucide.dev/).
*   **Gestión de Estado:** [Zustand](https://docs.pmnd.rs/zustand/) (Persistencia de autenticación).
*   **Animaciones:** `tw-animate-css` y Framer Motion (conceptuales).
*   **Visualización de Datos:** [Recharts](https://recharts.org/) para gráficos estadísticos.

### Backend (Lógica de Negocio)
*   **Framework:** [Laravel 11](https://laravel.com/).
*   **Lenguaje:** PHP 8.2+.
*   **Autenticación:** [Laravel Sanctum](https://laravel.com/docs/sanctum) (Tokens API seguros).
*   **Base de Datos:** [SQLite](https://www.sqlite.org/) (Versión de desarrollo/test) / Compatible con PostgreSQL/MySQL.
*   **ORM:** Eloquent para gestión relacional eficiente.
*   **Seeding:** FakerPHP para la generación masiva de datos de prueba (Stress Testing).

### Integraciones
*   **Google Maps API:** Monitor de capacidad turística en tiempo real integrado en el Dashboard.
*   **Axios:** Interceptores personalizados para gestión automática de tokens Bearer.

---

## 6. MÓDULOS DEL SISTEMA

1.  **Dashboard Gerencial:** Visualización de KPIs globales, mapa de saturación y estados de sitios.
2.  **Gestión de Visitantes:** Registro CRUD (Create, Read, Update, Delete) de ingresos nacionales e internacionales.
3.  **Control de Sitios Turísticos:** Monitoreo de capacidad de carga y estado administrativo de atractivos.
4.  **Directorio de Operadores:** Gestión de agencias, hoteles y transporte con validación de RUC y licencias.
5.  **Registro de Guías:** Base de datos de profesionales certificados con gestión de idiomas y especialidades.

---

## 7. INSTALACIÓN Y CONFIGURACIÓN

### Requisitos Previos
*   PHP 8.2+
*   Composer
*   Node.js 18+ & npm
*   SQLite3

### Pasos de Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/JosephCC123/GERENCIALES-SISTEMA.git
    cd GERENCIALES-SISTEMA
    ```

2.  **Configurar el Backend:**
    ```bash
    cd backend
    composer install
    cp .env.example .env
    php artisan key:generate
    touch database/database.sqlite
    php artisan migrate:fresh --seed
    php artisan serve --port=8001
    ```

3.  **Configurar el Frontend:**
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```

4.  **Acceso:**
    *   URL: `http://localhost:5173`
    *   API: `http://localhost:8001/api`

---

## 8. AUTORES Y CRÉDITOS
Proyecto desarrollado como parte de la investigación formativa en Sistemas de Información Gerencial - Cusco.

**Desarrollado con ❤️ para la Región Cusco.**