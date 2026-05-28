# Контрольный список реализации

- PostgreSQL: `server/database/schema.sql`, `seed.sql`.
- Express REST API: `server/src/routes/index.js`.
- JWT: `server/src/middleware/auth.js`.
- HTTPS: `server/src/app.js`, `server/certs`.
- React frontend: `client/src/main.jsx`.
- Корзина отдельной страницей: `/cart`.
- Профиль и история заказов: `/profile`.
- Роли: guest/user/seller/admin.
- Тестовая оплата: таблица `payments`, обработка в `orderController.js`.
