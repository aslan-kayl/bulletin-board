# Доска объявлений — Telegram Mini App

Аналог OLX/Avito внутри Telegram.

## Стек

- **Backend**: Python 3.12 + FastAPI + PostgreSQL + SQLAlchemy
- **Bot**: aiogram 3.x
- **Frontend**: React 18 + TypeScript + Vite
- **Proxy/TLS**: Caddy (автоматический Let's Encrypt)
- **Инфра**: Docker Compose

## Деплой на VPS (Ubuntu/Debian)

### 1. SSH на сервер и клонировать репо

```bash
git clone <repo-url> bulletin-board
cd bulletin-board
```

### 2. Узнать IP сервера и создать домен через sslip.io

```bash
curl ifconfig.me   # например: 167.86.83.90
```

Твой домен — просто заменить точки на тире и добавить `.sslip.io`:
```
167.86.83.90  →  167-86-83-90.sslip.io
```
Никакой регистрации не нужно — это работает автоматически.

### 3. Заполнить .env

```bash
cp .env.example .env
nano .env
```

```env
BOT_TOKEN=8718433336:...
BOT_USERNAME=имя_бота
MINI_APP_URL=https://167-86-83-90.sslip.io

DOMAIN=167-86-83-90.sslip.io
TLS_EMAIL=твой@email.com

POSTGRES_PASSWORD=придумай_пароль
SECRET_KEY=длинная_случайная_строка
ALLOWED_ORIGINS=https://167-86-83-90.sslip.io
```

### 4. Запустить

```bash
chmod +x deploy.sh && ./deploy.sh
```

Caddy сам получит SSL-сертификат. Через ~30 секунд приложение доступно по HTTPS.

### 5. Привязать Mini App в BotFather

BotFather → твой бот → **Bot Settings → Menu Button**:
- URL: `https://167-86-83-90.sslip.io`
- Text: `Доска объявлений`

---

## Локальная разработка

```bash
# Backend
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Bot
cd bot && pip install -r requirements.txt && python main.py

# Frontend
cd frontend && npm install && npm run dev
```

## API

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/listings/` | Лента (поиск, фильтр, пагинация) |
| POST | `/api/listings/` | Создать объявление |
| GET | `/api/listings/{id}` | Детальная страница |
| GET | `/api/listings/my` | Мои объявления |
| PATCH | `/api/listings/{id}` | Обновить (автор) |
| DELETE | `/api/listings/{id}` | Удалить (автор) |
| GET | `/api/categories/` | Список категорий |
| GET | `/api/auth/me` | Профиль пользователя |

Авторизация — заголовок `X-Init-Data: <Telegram WebApp initData>`.
