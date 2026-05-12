import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

function required(value) {
  return value && String(value).trim().length > 0;
}

function buildLeadText(data) {
  return [
    "Новая заявка на IT консультацию",
    "",
    `ФИО: ${data.fullName}`,
    `Почта: ${data.email}`,
    `Компания: ${data.company || "Не указана"}`,
    `Услуга: ${data.service || "Не указана"}`,
    `Комментарий: ${data.message || "Нет"}`
  ].join("\n");
}

async function sendEmail(text) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.LEAD_EMAIL_TO) {
    console.log("Email не настроен. Пропускаю отправку на почту.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.LEAD_EMAIL_FROM || process.env.SMTP_USER,
    to: process.env.LEAD_EMAIL_TO,
    subject: "Новая заявка на IT консультацию",
    text
  });
}

async function sendTelegram(text) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    console.log("Telegram не настроен. Пропускаю отправку в Telegram.");
    return;
  }

  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram error: ${errorText}`);
  }
}

app.post("/api/lead", async (req, res) => {
  try {
    const data = req.body;

    if (!required(data.fullName) || !required(data.email)) {
      return res.status(400).json({
        ok: false,
        message: "ФИО и почта обязательны"
      });
    }

    const text = buildLeadText(data);

    await Promise.all([
      sendEmail(text),
      sendTelegram(text)
    ]);

    res.json({
      ok: true,
      message: "Заявка отправлена"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Ошибка сервера при отправке заявки"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Сайт запущен: http://localhost:${PORT}`);
});
