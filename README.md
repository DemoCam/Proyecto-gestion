# Yovendo - Aplicacion web de gestion de ventas

Aplicacion web para la administracion y control de procesos de venta, fidelizacion de
clientes y distribucion de producto, desarrollada para el curso de la Escuela de Ingenieria
de Sistemas y Computacion (Universidad del Valle). Metodologia XP y paradigma orientado a
objetos.

## Tecnologias

- Backend: NestJS 11 (Node.js + TypeScript), MongoDB con Mongoose, autenticacion JWT
  (Passport) y hash de contrasenas con bcrypt.
- Frontend: React 19 + Vite, React Router, Tailwind CSS v4 (tema Material Design 3), Axios,
  React Hook Form, Recharts para las graficas del tablero de direccion.
- Base de datos: MongoDB (Atlas o local).

## Roles del sistema

- ADMIN: administra usuarios (crear, editar, activar/desactivar) y asigna perfiles.
- SUPERVISOR: administra y controla el inventario (categorias, insumos y movimientos).
- CONSULTOR: gestiona clientes, registra llamadas y ventas, y hace seguimiento.
- DIRECTOR: tablero de seguimiento del equipo comercial (ventas por dia, mes y anio,
  ranking de consultores y metas).

## Requisitos previos

- Node.js 18 o superior y npm.
- Una instancia de MongoDB accesible (cadena de conexion).

## Configuracion

Crear el archivo `yovendo-backend/.env` con las variables:

```
MONGO_URI=<cadena de conexion a MongoDB>
JWT_SECRET=<clave secreta para firmar los tokens>
PORT=3000
```

El frontend apunta por defecto al backend en `http://localhost:3000`
(ver `yovendo-frontend/src/utils/api.js`).

## Ejecucion

Backend:

```
cd yovendo-backend
npm install
node seed.js
npm run start:dev
```

`seed.js` crea los roles (ADMIN, SUPERVISOR, DIRECTOR, CONSULTOR) y el usuario
administrador inicial.

Frontend (en otra terminal):

```
cd yovendo-frontend
npm install
npm run dev
```

La aplicacion queda disponible en la URL que indique Vite (por defecto
`http://localhost:5173`).

## Credenciales iniciales

- Usuario administrador: `admin@yovendo.com`
- Contrasena: `admin123`

## Como ver el tablero de direccion con datos

1. Ingresar como administrador y crear al menos un usuario DIRECTOR y un usuario CONSULTOR
   (y opcionalmente un SUPERVISOR).
2. Ingresar como CONSULTOR y registrar clientes y varias ventas (con distintas fechas para
   ver la tendencia mensual) y algunas llamadas.
3. Ingresar como DIRECTOR y abrir el "Tablero de Direccion": muestra los KPIs por periodo
   (hoy / mes / anio), la grafica de tendencia de ventas del anio, el monto por consultor y
   el ranking de consultores con progreso frente a la meta mensual.

## Modelo de datos

La base de datos MongoDB usa las siguientes colecciones:

- `roles`: catalogo de perfiles. Campos: name, description, isActive.
- `users`: usuarios del sistema. Campos: firstName, lastName, email, passwordHash,
  roleId (referencia a `roles`), documentNumber, phone, status (ACTIVE/INACTIVE),
  lastLoginAt, createdBy/updatedBy. Relacion: cada usuario pertenece a un rol.
- `customers`: clientes. Campos: fullName, phone, email, source, notes,
  assignedConsultantId (referencia a `users`), status (NEW, IN_FOLLOW_UP, WON, LOST,
  INACTIVE). Relacion: cada cliente pertenece a un consultor.
- `calls`: llamadas de seguimiento. Campos: customerId (referencia a `customers`),
  consultantId (referencia a `users`), date, result, notes, nextFollowUpDate,
  status (COMPLETED, PENDING_FOLLOW_UP, NO_ANSWER, CANCELLED).
- `sales`: ventas. Campos: customerId, consultantId, items (lista con inventoryItemId,
  name, quantity, unitPrice), totalAmount, status (REGISTERED, CONFIRMED, CANCELLED),
  saleDate, notes. Relacion: una venta enlaza un cliente y un consultor; sus items
  referencian insumos del inventario.
- `inventorycategories`: categorias de insumos. Campos: name, description, isActive.
- `inventoryitems`: insumos. Campos: code, name, description, categoryId (referencia a
  `inventorycategories`), unit, currentStock, minimumStock, maximumStock, costPrice,
  salePrice, status, createdBy/updatedBy.
- `inventorymovements`: movimientos de inventario. Campos: itemId (referencia a
  `inventoryitems`), type (ENTRY, EXIT, ADJUSTMENT), quantity, previousStock, newStock,
  reason, reference, performedBy. Al registrar una venta no cancelada se generan
  movimientos de tipo EXIT que descuentan el stock.
- `notifications`: notificaciones por usuario o por rol. Campos: title, message,
  type (INFO, USER, INVENTORY, CUSTOMER, CALL, SALE, WARNING), targetRole, targetUserId,
  isRead, readByUserIds, relatedEntityType, relatedEntityId.

## Endpoints principales del tablero de direccion

- `GET /sales/dashboard/director`: agrega ventas por periodo (hoy/mes/anio), tendencia
  mensual del anio, ranking de consultores (ventas, monto, clientes, progreso frente a la
  meta) y totales generales. Protegido para el rol DIRECTOR.
- `GET /sales/summary/director`, `GET /calls/summary/director`,
  `GET /customers/summary/director`, `GET /users/consultants/count`: resumenes simples.
