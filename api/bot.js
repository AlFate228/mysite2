import { Telegraf, Markup } from "telegraf";
import nodemailer from "nodemailer";

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new Telegraf(token || "missing-token");
const CONTACT_PHONE = "+7 985 888 92 63";
const CONTACT_EMAIL = "galolo066@gmail.com";

const services = [
  ["Офис под ключ", "от 65 000 ₽", "Компьютеры, сеть, Wi‑Fi, почта, принтеры, доступы, базовая безопасность."],
  ["Поддержка пользователей 24/7", "индивидуально", "Помощь сотрудникам по компьютерам, почте, интернету, принтерам и рабочим программам."],
  ["Сеть / Wi‑Fi / VPN", "от 18 000 ₽", "Роутеры, MikroTik/Keenetic, Wi‑Fi, гостевые сети, VPN, firewall, удалённый доступ."],
  ["Серверы и Active Directory", "от 25 000 ₽", "Windows Server, домен, пользователи, права доступа, файловые ресурсы, политики."],
  ["Компьютеры сотрудников", "от 7 000 ₽", "Windows, программы, почта, принтеры, сканеры, удалённый доступ и базовая защита."],
  ["Microsoft 365 / Google Workspace", "от 15 000 ₽", "Почта компании, домен, общие диски, календари, безопасность аккаунтов, миграция."],
  ["IP-телефония и CRM", "от 22 000 ₽", "IP-АТС, SIP-транки, добавочные номера, маршрутизация звонков, интеграция с CRM."],
  ["Backup и безопасность", "от 20 000 ₽", "Резервное копирование, антивирус, контроль доступа, защита данных, план восстановления."],
  ["Интеграция ИИ под бизнес-задачи", "от 30 000 ₽", "AI-ассистенты, Telegram-боты, автоматизация ответов, заявок, документов и процессов."]
];

function menu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🧰 Услуги", "services"), Markup.button.callback("📦 Пакеты", "packages")],
    [Markup.button.callback("🤖 Интеграция ИИ", "ai"), Markup.button.callback("🆘 Поддержка 24/7", "support")],
    [Markup.button.callback("📝 Оставить заявку", "lead"), Markup.button.callback("📞 Контакты", "contacts")]
  ]);
}

async function sendAdmin(text) {
  if (!process.env.ADMIN_TELEGRAM_ID) {
    console.log("ADMIN_TELEGRAM_ID missing:", text);
    return;
  }
  await bot.telegram.sendMessage(process.env.ADMIN_TELEGRAM_ID, text);
}

async function sendEmail(text) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.LEAD_EMAIL_TO) {
    console.log("Email не настроен:", text);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  await transporter.sendMail({
    from: process.env.LEAD_EMAIL_FROM || process.env.SMTP_USER,
    to: process.env.LEAD_EMAIL_TO,
    subject: "Новая заявка из Telegram-бота",
    text
  });
}

bot.start(async (ctx) => {
  await ctx.reply("Здравствуйте! Я бот IT-услуг и поддержки.\n\nВыберите раздел ниже:", menu());
});

bot.action("services", async (ctx) => {
  await ctx.answerCbQuery();
  const text = services.map(([name, price, desc]) => `🧰 ${name}\n${price}\n${desc}`).join("\n\n");
  await ctx.reply(text, Markup.inlineKeyboard([[Markup.button.callback("📝 Оставить заявку", "lead")]]));
});

bot.action("packages", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("📦 Office Start — от 65 000 ₽\nДля небольшого офиса до 5 рабочих мест.\n\n📦 Office Pro — от 140 000 ₽\nОфис под ключ до 15 рабочих мест.\n\n📦 Office Enterprise — индивидуально\nАудит, серверы, телефония, безопасность, SLA, 24/7.", Markup.inlineKeyboard([[Markup.button.callback("📝 Оставить заявку", "lead")]]));
});

bot.action("ai", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("🤖 Интеграция ИИ под бизнес-задачи — от 30 000 ₽\n\nЧто можно сделать:\n• Telegram-бот для заявок\n• AI-ассистент для сайта\n• Автоматизация ответов клиентам\n• Обработка документов\n• Автоматизация внутренних процессов", Markup.inlineKeyboard([[Markup.button.callback("📝 Заявка на ИИ", "lead")]]));
});

bot.action("support", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("🆘 Поддержка 24/7\n\nНапишите одним сообщением вашу проблему.\n\nНапример:\nФИО: Иван Иванов\nКомпания: Ромашка\nПроблема: не работает принтер\nТелефон: +7...");
});

bot.action("lead", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("📝 Оставьте заявку одним сообщением в таком формате:\n\nФИО: \nПочта: \nКомпания: \nУслуга: \nКомментарий: \nТелефон: \n\nПосле отправки я передам заявку специалисту.");
});

bot.action("contacts", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`📞 Телефон: ${CONTACT_PHONE}\n📧 Почта: ${CONTACT_EMAIL}`);
});

bot.on("text", async (ctx) => {
  const from = ctx.from;
  const text = [
    "📩 Новое сообщение/заявка из Telegram-бота",
    "",
    ctx.message.text,
    "",
    from?.username ? `Telegram: @${from.username}` : "",
    from?.id ? `Telegram ID: ${from.id}` : ""
  ].filter(Boolean).join("\n");
  await Promise.all([sendAdmin(text), sendEmail(text)]);
  await ctx.reply("Спасибо! Я передал сообщение специалисту. С вами скоро свяжутся.", menu());
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("Telegram bot webhook is running");
  try {
    await bot.handleUpdate(req.body);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false });
  }
}
