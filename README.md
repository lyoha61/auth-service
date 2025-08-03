Authentication Service
Описание
Authentication Service — это микросервис для регистрации, аутентификации и авторизации пользователей.
Реализован на Node.js с использованием Express и JWT.
Сервис поддерживает регистрацию новых пользователей, вход в систему, выдачу и проверку JWT токенов.
Для хранения данных используется база данных MongoDB и временное хранилище Redis

Быстрый старт 

git clone https://github.com/lyoshka61/authentication-service

cd authentication-service

cp .env.example .env
# Отредактируйте .env, указав настройки базы и секреты

docker-compose up --build -d

Стек
Node.js
Express
JWT
Redis
MongoDB / PostgreSQL
Docker

Функционал
Регистрация пользователей (Signup)
POST /auth/register
Тело запроса: { name, email, password }

Вход пользователей (Signin)
POST auth/login
Тело запроса: { email/name, password }

Защищённые маршруты (Authorization)
Обновление токена (Refresh tokens)
POST /auth/refresh-token
Тело запроса: { refresh_token }

Роли и права доступа (Roles & Permissions)
Выход из системы (Logout)
POST auth/logout
Тело запроса: { refresh_token }

Восстановление и смена пароля (опционально)
Валидация и обработка ошибок

Потенциальный функционал
Поддержка OAuth / соцсетей (Google, Facebook и т.д.)
Двухфакторная аутентификация (2FA)
Логирование попыток входа и подозрительных действий
Мониторинг безопасности и алерты


