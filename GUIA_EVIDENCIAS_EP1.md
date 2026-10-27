# Pedidos360 Cloud — Guía de Evidencias Técnicas EP1

Este documento detalla el procedimiento para capturar y presentar el **100% de las evidencias** requeridas en la rúbrica de evaluación:

---

## 1. Evidencia de Flujo OAuth 2.0 Authorization Code con PKCE (15%)

> **Requisito:** Demostrar el uso de `code_challenge`, `code_verifier`, `state` y `nonce` sin uso de Implicit Flow.

### Paso a paso para capturar en el Navegador (Chrome / Edge / Firefox):
1. Abrir el Frontend en `http://localhost:5173`.
2. Presionar `F12` y situarse en la pestaña **Network (Red)**.
3. Marcar la casilla **"Preserve log" (Conservar registro)**.
4. En el campo de filtro, escribir: `microsoftonline`.
5. Hacer clic en el botón de inicio de sesión: **"Iniciar sesión con Microsoft Entra ID"**.
6. En el registro de red aparecerán dos peticiones clave:

#### Petición 1: `/authorize` (Solicitud de Código de Autorización)
* **URL:** `https://login.microsoftonline.com/<TENANT_ID>/oauth2/v2.0/authorize`
* **Método:** `GET`
* **Parámetros visibles en Query String (Capturar pantalla):**
  * `response_type=code` *(Prueba de que NO es Implicit)*
  * `code_challenge=<HASH_SHA256>` *(Generado por MSAL)*
  * `code_challenge_method=S256` *(Algoritmo PKCE seguro)*
  * `state=<CADENA_ALEATORIA>` *(Protección contra CSRF)*
  * `nonce=<CADENA_ALEATORIA>` *(Protección contra ataques de Replay)*
  * `client_id=5805f927-e607-48f6-bcdb-c97e93a8f6dd`
  * `redirect_uri=http://localhost:5173`

#### Petición 2: `/token` (Intercambio de Código por Token)
* **URL:** `https://login.microsoftonline.com/<TENANT_ID>/oauth2/v2.0/token`
* **Método:** `POST`
* **Payload / Form Data (Capturar pantalla):**
  * `grant_type=authorization_code`
  * `code=<CODIGO_RETORNADO>`
  * `code_verifier=<VERIFICADOR_EN_CLARO>` *(MSAL demuestra que fue quien inició el flujo)*
  * `client_id=5805f927-e607-48f6-bcdb-c97e93a8f6dd`

---

## 2. Evidencia de Validación JWT y Respuestas 200, 401, 403 (20% + 15%)

> **Archivo Postman incluido en el proyecto:** [Pedidos360-EP1-Evidencias.postman_collection.json](file:///c:/Users/B/frontCloud/Pedidos360-EP1-Evidencias.postman_collection.json)

### A. Respuestas 401 Unauthorized (Sin Token o Inválido)

#### 1. Sin Token en Catálogo
```bash
curl -i -X GET "http://localhost:8080/api/catalog/products" \
  -H "Accept: application/json"
```
**Respuesta esperada (HTTP 401):**
```json
{
  "timestamp": "2026-10-01T...",
  "status": 401,
  "error": "Unauthorized",
  "message": "Token de autenticacion invalido, expirado o ausente...",
  "path": "/api/catalog/products"
}
```

#### 2. Sin Token en Pedidos
```bash
curl -i -X GET "http://localhost:8080/api/orders" \
  -H "Accept: application/json"
```
**Respuesta esperada (HTTP 401):**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "path": "/api/orders"
}
```

#### 3. Con Token Inválido o Falsificado
```bash
curl -i -X GET "http://localhost:8080/api/catalog/products" \
  -H "Authorization: Bearer token_falso_ep1" \
  -H "Accept: application/json"
```
**Respuesta esperada (HTTP 401):**
```json
{
  "status": 401,
  "error": "Unauthorized"
}
```

---

### B. Respuestas 403 Forbidden (Control de Acceso / RBAC)

#### 1. Usuario con rol CLIENTE intenta crear un Producto en el Catálogo
```bash
curl -i -X POST "http://localhost:8080/api/catalog/products" \
  -H "Authorization: Bearer <TOKEN_CLIENTE>" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Monitor 4K", "precio": 450000, "stock": 5}'
```
**Respuesta esperada (HTTP 403):**
```json
{
  "timestamp": "2026-10-01T...",
  "status": 403,
  "error": "Forbidden",
  "message": "Acceso denegado: No cuenta con los roles requeridos para este recurso.",
  "path": "/api/catalog/products"
}
```

#### 2. Usuario con rol CLIENTE intenta listar todas las órdenes globales
```bash
curl -i -X GET "http://localhost:8080/api/orders" \
  -H "Authorization: Bearer <TOKEN_CLIENTE>"
```
**Respuesta esperada (HTTP 403):**
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Acceso denegado: No cuenta con los roles requeridos para este recurso.",
  "path": "/api/orders"
}
```

#### 3. Usuario con rol OPERADOR intenta eliminar un Producto
```bash
curl -i -X DELETE "http://localhost:8080/api/catalog/products/1" \
  -H "Authorization: Bearer <TOKEN_OPERADOR>"
```
**Respuesta esperada (HTTP 403):**
```json
{
  "status": 403,
  "error": "Forbidden",
  "path": "/api/catalog/products/1"
}
```

---

### C. Respuestas 200, 201 y 204 OK (Acceso Autorizado)

#### 1. Consultar Catálogo con Token (Cualquier rol: CLIENTE, OPERADOR, ADMIN)
```bash
curl -i -X GET "http://localhost:8080/api/catalog/products" \
  -H "Authorization: Bearer <TOKEN_VALIDO>"
```
**Respuesta esperada (HTTP 200):**
```json
[
  {
    "id": 1,
    "nombre": "Laptop Dell Precision 5570",
    "precio": 1450000,
    "stock": 12
  }
]
```

#### 2. Crear Producto en Catálogo (Solo ADMIN)
```bash
curl -i -X POST "http://localhost:8080/api/catalog/products" \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Mouse Inalambrico", "descripcion": "Ergonomico", "precio": 29990, "stock": 50}'
```
**Respuesta esperada (HTTP 201 Created):**
```json
{
  "id": 2,
  "nombre": "Mouse Inalambrico",
  "precio": 29990,
  "stock": 50
}
```

#### 3. Actualizar Producto o Stock (ADMIN u OPERADOR)
```bash
curl -i -X PUT "http://localhost:8080/api/catalog/products/1" \
  -H "Authorization: Bearer <TOKEN_OPERADOR>" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Laptop Dell Precision 5570", "precio": 1450000, "stock": 20}'
```
**Respuesta esperada (HTTP 200 OK):**
```json
{
  "id": 1,
  "nombre": "Laptop Dell Precision 5570",
  "precio": 1450000,
  "stock": 20
}
```

#### 4. Consultar Pedidos Propios (CLIENTE)
```bash
curl -i -X GET "http://localhost:8080/api/orders/mine" \
  -H "Authorization: Bearer <TOKEN_CLIENTE>"
```
**Respuesta esperada (HTTP 200 OK):**
```json
[
  {
    "id": 101,
    "estado": "CREADO",
    "items": [{ "productoId": 1, "cantidad": 1, "precioUnitario": 1450000 }]
  }
]
```

#### 5. Avanzar Estado del Pedido (OPERADOR)
```bash
curl -i -X PATCH "http://localhost:8080/api/orders/1/status" \
  -H "Authorization: Bearer <TOKEN_OPERADOR>" \
  -H "Content-Type: application/json" \
  -d '{"estado": "ACEPTADO"}'
```
**Respuesta esperada (HTTP 200 OK):**
```json
{
  "id": 1,
  "estado": "ACEPTADO"
}
```

---

## 3. Evidencia de Configuración CORS Estricta (7%)

En [SecurityConfig.java](file:///c:/Users/B/Desktop/ms-pedidos360-bff/src/main/java/com/pedidos360/bff/config/SecurityConfig.java):
* **Sin comodines (`*`):** Se eliminó cualquier uso de `*` en orígenes y encabezados.
* **Orígenes permitidos:** Exclusivamente `http://localhost:5173` y `http://localhost:4200`.
* **Métodos permitidos:** Exclusivamente `GET, POST, PUT, PATCH, DELETE, OPTIONS`.
* **Headers permitidos:** Exclusivamente `Authorization, Content-Type, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers`.
