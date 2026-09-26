# Pedidos360 Cloud — Frontend Angular & Microsoft Entra ID


> **Caso Asignado:** Caso 0 — Pedidos360  
> **Tecnologías:** Angular 22 | MSAL Angular v3 / MSAL Browser v5 | Spring Boot 3 | Oracle Database 11g XE | Microsoft Entra ID  

---

## 1. Contexto y Propósito de la Solución

El presente proyecto implementa el frontend y la integración completa de extremo a extremo para el sistema **Pedidos360 Cloud**, correspondiente a la **Evaluación Parcial N.° 1 (EP1)**.

El objetivo principal es demostrar una arquitectura segura, desacoplada y basada en estándares de la industria para la gestión de identidad, control de acceso basado en roles (RBAC), consumo seguro de APIs mediante un **BFF (Backend for Frontend)** y persistencia relacional en **Oracle Database**.

---

## 2. Arquitectura de la Solución

La solución sigue una arquitectura por capas orientada a microservicios con defensa en profundidad:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MICROSOFT ENTRA ID (AZURE AD)                  │
│   • Tenant:                        │
│   • App Registration:        │
│   • Emisión de Tokens JWT (ID Token & Access Token con roles / claims)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ OAuth2 / OIDC
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND ANGULAR (Pedidos360)                     │
│   • Puerto:                                      │
│   • Integración MSAL (LoginRedirect, MsalGuard, MsalInterceptor)      │
│   • Modo Consulta Público (Cliente) + Modo Autenticado (Admin/Operador)│
│   • Formato Regional: Peso Chileno (CLP - es-CL)                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / Bearer Token
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     BFF (Backend For Frontend)                         │
│   • Puerto: http://localhost:8080                                      │
│   • Spring Security + OAuth2 Resource Server                           │
│   • Validación JWT criptográfica (Issuer, Audience, Firma, Vigencia)   │
│   • Autorización por Roles: ADMIN, OPERADOR, CLIENTE                   │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌───────────────────────────────────┐ ┌───────────────────────────────────┐
│     ms-pedidos360-catalogo        │ │       ms-pedidos360-ordenes       │
│   • Puerto: http://localhost:8081 │ │   • Puerto: http://localhost:8082 │
│   • Dominio: Productos y Stock    │ │   • Dominio: Pedidos y Estados    │
└───────────────────┬───────────────┘ └──────────────────┬────────────────┘
                    │                                    │
                    └─────────────────┬──────────────────┘
                                      │ JDBC / Oracle Thin
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     ORACLE DATABASE (11g XE Local)                     │
│   • Host/Puerto: localhost:1521:xe                                     │
│   • Esquemas y Tablas: PRODUCTOS, PEDIDOS, PEDIDO_ITEMS                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Matriz de Roles y Reglas de Negocio (Caso 0 — Pedidos360)

De acuerdo con el encargo del **Caso 0**, la plataforma diferencia claramente las responsabilidades y privilegios de cada actor:

| Acción / Privilegio | Administrador (`ADMIN`) | Operador (`OPERADOR`) | Cliente (`CLIENTE` / Invitado) |
| :--- | :---: | :---: | :---: |
| **Ver catálogo de productos** | Sí | Sí | Sí (Público) |
| **Crear pedidos** | Sí | Sí | No *(según regla de negocio)* |
| **Ver todos los pedidos del sistema** | Sí (Auditoría) | Sí (Gestión) | No (Solo propios) |
| **Avanzar estados del flujo del pedido** | No | Sí | No (Solo seguimiento) |
| **Crear y eliminar productos del catálogo** | Sí | No | No |
| **Ajustar stock de inventario (+ / -)** | Sí | Sí | No |

### Ciclo de Vida y Transición de Estados del Pedido

El flujo sigue estrictamente la secuencia requerida por el dominio:
$$\text{CREADO} \longrightarrow \text{ACEPTADO} \longrightarrow \text{EN\_PREPARACIÓN} \longrightarrow \text{DESPACHADO} \longrightarrow \text{ENTREGADO}$$
*(O estado terminal **CANCELADO** en cualquier punto previo a la entrega)*.

> **Regla de Negocio Clave:** No se permite despachar una orden sin haber sido aceptada y preparada previamente. El stock se valida y se descuenta operativamente.

---

## 4. Componentes Técnicos Implementados en Angular (60% EP1)

El frontend cumple al 100% con los requerimientos técnicos y arquitectónicos obligatorios:

### A. Integración con MSAL y Microsoft Entra ID
- **`msalInstanceFactory` (`src/app/msal-config.ts`):** Configurado con `PublicClientApplication`, `clientId`, `authority` de Azure AD y URI de redirección SPA.
- **`APP_INITIALIZER` (`src/app/app.config.ts`):** Inicialización asíncrona garantizada (`msalInstance.initialize()`) previa al renderizado de componentes, resolviendo compatibilidad con MSAL Browser v3/v5.
- **`AuthService` (`src/app/services/auth.service.ts`):** Servicio centralizado que gestiona:
  - `login()`: Redirección segura a Microsoft Entra ID con scopes estándar `['user.read', 'openid', 'profile']`.
  - `logout()`: Cierre de sesión y limpieza de contexto.
  - `getRoles()`: Extracción de roles desde los claims del ID Token / Access Token (`roles`), con selector de rol integrado para demostración rápida en vivo.

### B. Rutas Protegidas y Guards
- **`authGuard` (`src/app/guards/auth.guard.ts`):** Protege la ruta `/orders` contra accesos no autenticados, redirigiendo al visitante al portal `/login`.
- **Navegación Dinámica:** Las opciones de menú y accesos rápidos en la barra de navegación y el dashboard se adaptan en tiempo real según el estado de la sesión.

### C. MsalInterceptor y Consumo Seguro
- **`msalInterceptorConfigFactory` (`src/app/msal-interceptor-config.ts`):** Configurado con `protectedResourceMap` para adjuntar automáticamente el encabezado `Authorization: Bearer <access_token>` a todas las peticiones salientes hacia `/api/orders`.
- **Rutas Públicas Desacopladas:** La consulta al catálogo (`/api/catalog/products`) no exige token para permitir a los clientes explorar productos libremente antes de iniciar sesión.

---

## 5. Diseño Visual, Experiencia de Usuario & Moneda Local

El diseño fue desarrollado con estándares modernos para aplicaciones corporativas B2B:

- **Tipografía:** [Inter (Google Fonts)](https://fonts.google.com/specimen/Inter), optimizada con preconnect en `index.html`.
- **Paleta de Colores:**
  - **Primario:** Azul corporativo `#2563EB` (hover `#1D4ED8`).
  - **Fondo:** Gris claro `#F8FAFC` con tarjetas en blanco puro `#FFFFFF`, bordes `#E2E8F0` y sombras suaves.
  - **Texto Principal:** Gris oscuro `#1E293B` (alto contraste y descanso visual).
  - **Texto Secundario:** Gris medio `#64748B`.
- **Semáforo Semántico de Estados:**
  - `CREADO`: Gris `#94A3B8`
  - `ACEPTADO`: Azul `#3B82F6`
  - `EN PREPARACIÓN`: Ámbar `#F59E0B`
  - `DESPACHADO`: Púrpura `#8B5CF6`
  - `ENTREGADO`: Verde `#22C55E`
  - `CANCELADO`: Rojo `#EF4444`
- **Acentos por Rol:**
  - Admin: Dorado / Ámbar `#D97706`
  - Operador: Azul `#2563EB`
  - Cliente / Invitado: Verde `#16A34A`
- **Moneda Local (CLP - Peso Chileno):**
  - Registro de `localeEsCL` (`es-CL`) en `app.config.ts`.
  - Todos los precios e importes formateados con separador de miles (`.`) y sin decimales:
    - *Laptop Dell Precision 5570:* `$1.450.000`
    - *Monitor Dell UltraSharp 27:* `$420.000`
    - *Teclado Mecanico Logitech MX:* `$129.990`

---

## 6. Estructura de Rutas y Pantallas

| Ruta | Acceso | Componente | Descripción |
| :--- | :--- | :--- | :--- |
| `/login` | Público | `LoginComponent` | Botón corporativo con logotipo oficial de Microsoft para inicio de sesión seguro. |
| `/dashboard` | Público / Privado | `DashboardComponent` | Tarjeta de bienvenida con detección de rol activa (Cliente Invitado, Operador o Admin). |
| `/catalog` | Público | `CatalogComponent` | Catálogo de productos en CLP. Permite control de stock a operadores y alta/baja a administradores. |
| `/orders` | Protegido (`authGuard`) | `OrdersComponent` | Panel de creación de pedidos (Admin/Operador) y máquina de estados interactiva para el operador. |

---

## 7. Instrucciones para Ejecución Local

### Prerrequisitos
- **Node.js:** v18+ o v20+
- **Java JDK:** 17+
- **Maven:** 3.8+
- **Oracle Database 11g XE:** Servicio escuchando en `localhost:1521:xe` con usuario `SYSTEM / system`.

### Paso 1: Base de Datos Oracle
Asegurarse de que el servicio `OracleServiceXE` y `OracleXETNSListener` estén activos:
```powershell
sqlplus SYSTEM/system@localhost:1521/xe
```

### Paso 2: Levantar Microservicio de Catálogo (Puerto 8081)
```powershell
cd C:\Users\B\Desktop\ms-pedidos360-catalogo
$env:DB_URL="jdbc:oracle:thin:@localhost:1521:xe"
$env:DB_USER="SYSTEM"
$env:DB_PASSWORD="system"
mvn spring-boot:run
```

### Paso 3: Levantar Microservicio de Órdenes (Puerto 8082)
```powershell
cd C:\Users\B\Desktop\ms-pedidos360-ordenes
$env:DB_URL="jdbc:oracle:thin:@localhost:1521:xe"
$env:DB_USER="SYSTEM"
$env:DB_PASSWORD="system"
mvn spring-boot:run
```

### Paso 4: Levantar BFF con Spring Security (Puerto 8080)
```powershell
cd C:\Users\B\Desktop\ms-pedidos360-bff
mvn spring-boot:run
```

### Paso 5: Levantar Frontend Angular (Puerto 5173)
```powershell
cd c:\Users\B\frontCloud
npm install
npm start
```

Abrir el navegador en: **`http://localhost:5173`**

---

## 8. Checklist de Validación para la Demostración EP1

- [x] **Autenticación con Microsoft Entra ID:** Redirección funcional de ida y vuelta.
- [x] **Cierre de sesión (Logout):** Limpieza de tokens y redirección a `/login`.
- [x] **Rutas Protegidas:** `/orders` inaccesible sin autenticación previa.
- [x] **Inyección de Tokens:** `MsalInterceptor` añade `Authorization: Bearer <token>` a las llamadas protegidas.
- [x] **Consumo Público del Catálogo:** Clientes no autenticados pueden visualizar el inventario sin errores 401.
- [x] **Validación Criptográfica en BFF:** Verificación de firma, audiencia y emisor (`sts.windows.net` / `login.microsoftonline.com`).
- [x] **Diferenciación Real por Roles:**
  - `CLIENTE`: Consulta de catálogo y pedidos propios.
  - `ADMIN`: Gestión de productos en catálogo y pedidos corporativos.
  - `OPERADOR`: Control de stock y avance en el semáforo de estados de pedidos.
- [x] **Persistencia en Oracle 11g:** Inserción y actualización real en tablas relacionales (`PRODUCTOS`, `PEDIDOS`, `PEDIDO_ITEMS`).
- [x] **Diseño y Usabilidad:** Interfaz limpia en modo B2B con precios en Pesos Chilenos (`$ CLP`).
