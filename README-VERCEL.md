# Office IT Services — версия для Vercel

Эта версия подходит для деплоя сайта и Telegram-бота на Vercel.

## Что внутри

- `public/` — сайт
- `api/lead.js` — отправка заявок с сайта
- `api/bot.js` — Telegram-бот через webhook
- `api/set-webhook.js` — установка webhook для Telegram
- `vercel.json` — настройки Vercel

## Важное отличие

На Vercel бот должен работать через webhook, а не через `npm start` и long polling.

## Environment Variables для Vercel

В Vercel откройте:

Project → Settings → Environment Variables

Добавьте:

```text
TELEGRAM_BOT_TOKEN=токен_из_BotFather
ADMIN_TELEGRAM_ID=ваш_Telegram_ID
PUBLIC_URL=https://адрес-вашего-сайта.vercel.app

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=ваша_почта@gmail.com
SMTP_PASS=app_password_от_gmail
LEAD_EMAIL_FROM=ваша_почта@gmail.com
LEAD_EMAIL_TO=galolo066@gmail.com
```

Если почту пока не хотите настраивать, можно не добавлять SMTP переменные. Заявки будут приходить в Telegram, если TELEGRAM_BOT_TOKEN и ADMIN_TELEGRAM_ID заполнены.

## После деплоя

Откройте в браузере:

```text
https://адрес-вашего-сайта.vercel.app/api/set-webhook
```

После этого Telegram начнёт отправлять сообщения боту на Vercel.
