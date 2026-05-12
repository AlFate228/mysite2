# OfficeTech Pro — сайт IT-услуг для офиса

Готовый сайт для продажи IT-услуг:
- офис под ключ;
- комплексные IT-пакеты;
- отдельные услуги;
- поддержка пользователей 24/7;
- заявка на консультацию;
- отправка заявки на почту и в Telegram.

## Как запустить

1. Установите Node.js.
2. Откройте папку проекта в терминале.
3. Выполните:

```bash
npm install
npm start
```

4. Откройте в браузере:

```text
http://localhost:3000
```

## Куда вставить сайт

Все файлы сайта лежат в папке `public`:
- `index.html`
- `styles.css`
- `script.js`

Backend:
- `server.js`
- `.env.example`

## Настройка формы

Скопируйте `.env.example` в `.env` и заполните данные:

```bash
cp .env.example .env
```

Для Gmail нужен не обычный пароль, а App Password.

## Telegram

В файле `index.html` замените:

```text
https://t.me/YourBotUsername
```

на ссылку вашего Telegram-бота.

Для уведомлений о заявках заполните в `.env`:

```text
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

## Важно

Фотографии подключены через внешние ссылки Unsplash. Если нужно, можно позже заменить их на свои изображения в папке `public/images`.


## Telegram-бот

В проект добавлена отдельная папка:

```text
telegram-bot
```

Внутри готовый Telegram-бот для услуг, пакетов, заявок и поддержки 24/7.

Запуск:

```bat
cd telegram-bot
npm install
npm start
```

Перед запуском нужно создать `.env` на основе `.env.example`.
