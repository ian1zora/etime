# etime — eCommerce restaurante

## Requisitos
- Node.js >= 18
- MySQL

## Instalación
1. Clonar repo
2. Backend:
   - `cd server`
   - `cp .env.example .env` y configurar BD y JWT_SECRET
   - `npm install`
   - Crear la BD y correr `schema.sql` (o usar sequelize migrations)
   - `npm run dev`
3. Frontend:
   - `cd client`
   - `npm install`
   - `npm start`

## Notas
- El límite por comensal se encuentra en la tabla `settings` (clave `max_items_per_person`).
- Se valida el límite tanto en frontend como en backend.
