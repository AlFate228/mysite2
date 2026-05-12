import { Telegraf, Markup, session } from "telegraf";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error("Ошибка: укажите TELEGRAM_BOT_TOKEN в файле .env");
  process.exit(1);
}

const bot = new Telegraf(token);

const CONTACT_PHONE = "+7 985 888 92 63";
const CONTACT_EMAIL = "galolo066@gmail.com";

const SERVICES = [
  {
    id: "office",
    title: "Офис под ключ",
    price: "от 65 000 ₽",
    text: "Комплексная настройка офиса: компьютеры, сеть, Wi‑Fi, почта, принтеры, доступы, базовая безопасность."
  },
  {
    id: "support",
    title: "Поддержка пользователей 24/7",
    price: "индивидуально",
    text: "Помощь сотрудникам по вопросам компьютеров, почты, интернета, принтеров, удалённого доступа и рабочих программ."
  },
  {
    id: "network",
    title: "Сеть / Wi‑Fi / VPN",
    price: "от 18 000 ₽",
    text: "Настройка роутеров, MikroTik/Keenetic, Wi‑Fi, гостевых сетей, VPN, firewall, удалённого доступа."
  },
  {
    id: "servers",
    title: "Серверы и Active Directory",
    price: "от 25 000 ₽",
    text: "Windows Server, пользователи, права доступа, домен, файловые ресурсы, групповые политики, резервирование."
  },
  {
    id: "workstations",
    title: "Компьютеры сотрудников",
    price: "от 7 000 ₽",
    text: "Установка Windows, программ, почты, принтеров, сканеров, удалённого доступа и базовой защиты."
  },
  {
    id: "m365",
    title: "Microsoft 365 / Google Workspace",
    price: "от 15 000 ₽",
    text: "Почта компании, домен, общие диски, календари, безопасность аккаунтов, миграция данных."
  },
  {
    id: "telephony",
    title: "IP-телефония и CRM",
    price: "от 22 000 ₽",
    text: "IP-АТС, SIP-транки, добавочные номера, маршрутизация звонков, интеграция с CRM."
  },
  {
    id: "backup",
    title: "Backup и безопасность",
    price: "от 20 000 ₽",
    text: "Резервное копирование, антивирус, контроль доступа, защита данных, план восстановления."
  },
  {
    id: "ai",
    title: "Интеграция ИИ под бизнес-задачи",
    price: "от 30 000 ₽",
    text: "AI-ассистенты, Telegram-боты, автоматизация ответов клиентам, обработка заявок, документов и внутренних процессов."
  }
];

const PACKAGES = [
  {
    title: "Office Start",
    price: "от 65 000 ₽",
    text: "Для небольшого офиса до 5 рабочих мест: компьютеры, Wi‑Fi, почта, принтеры, базовая защита."
  },
  {
    title: "Office Pro",
    price: "от 140 000 ₽",
    text: "Офис под ключ до 15 рабочих мест: сеть, VPN, сервер/облако, почта, backup, запуск офиса."
  },
  {
    title: "Office Enterprise",
    price: "индивидуально",
    text: "Для компаний, которым нужна стабильная IT-система: аудит, серверы, телефония, безопасность, SLA, 24/7."
  }
];

function mainMenu() {
  return Markup.keyboard([
    ["🧰 Услуги", "📦 Пакеты"],
    ["🤖 Интеграция ИИ", "🆘 Поддержка 24/7"],
    ["📝 Оставить заявку", "📞 Контакты"]
  ]).resize();
}

function backMenu() {
  return Markup.keyboard([
    ["⬅️ Назад в меню"]
  ]).resize();
}

function serviceInlineKeyboard() {
  return Markup.inlineKeyboard(
    SERVICES.map(service => [
      Markup.button.callback(service.title, `service_${service.id}`)
    ])
  );
}

function packageInlineKeyboard() {
  return Markup.inlineKeyboard(
    PACKAGES.map((item, index) => [
      Markup.button.callback(item.title, `package_${index}`)
    ])
  );
}

function getServiceById(id) {
  return SERVICES.find(service => service.id === id);
}

function buildLeadText(data) {
  return [
    "📩 Новая заявка из Telegram-бота",
    "",
    `👤 ФИО: ${data.fullName || "Не указано"}`,
    `📧 Почта: ${data.email || "Не указана"}`,
    `🏢 Компания: ${data.company || "Не указана"}`,
    `🧰 Услуга: ${data.service || "Не указана"}`,
    `💬 Комментарий: ${data.message || "Нет"}`,
    "",
    data.username ? `Telegram: @${data.username}` : "",
    data.telegramId ? `Telegram ID: ${data.telegramId}` : ""
  ].filter(Boolean).join("\n");
}

async function sendEmail(text) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.LEAD_EMAIL_TO) {
    console.log("Email не настроен. Заявка только в консоли:");
    console.log(text);
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
    subject: "Новая заявка из Telegram-бота",
    text
  });
}

async function notifyAdmin(ctx, text) {
  if (!process.env.ADMIN_TELEGRAM_ID) {
    console.log("ADMIN_TELEGRAM_ID не указан. Заявка только в консоли:");
    console.log(text);
    return;
  }

  await ctx.telegram.sendMessage(process.env.ADMIN_TELEGRAM_ID, text);
}

bot.use(session());

bot.start(async (ctx) => {
  ctx.session = {};
  await ctx.reply(
    "Здравствуйте! Я бот IT-поддержки и автоматизации офиса.\n\nЗдесь можно посмотреть услуги, выбрать пакет, оставить заявку на консультацию или обратиться в поддержку 24/7.",
    mainMenu()
  );
});

bot.hears("⬅️ Назад в меню", async (ctx) => {
  ctx.session = {};
  await ctx.reply("Главное меню:", mainMenu());
});

bot.hears("🧰 Услуги", async (ctx) => {
  await ctx.reply("Выберите услугу:", serviceInlineKeyboard());
});

bot.hears("📦 Пакеты", async (ctx) => {
  await ctx.reply("Выберите пакет:", packageInlineKeyboard());
});

bot.hears("🤖 Интеграция ИИ", async (ctx) => {
  const ai = getServiceById("ai");
  await ctx.reply(
    `🤖 ${ai.title}\n\n${ai.text}\n\nСтоимость: ${ai.price}\n\nПримеры:\n• Telegram-бот для заявок\n• AI-ассистент для ответов клиентам\n• Автоматизация обработки документов\n• Автоматизация внутренних процессов\n• Подключение ИИ к сайту или CRM`,
    Markup.inlineKeyboard([
      [Markup.button.callback("📝 Оставить заявку на ИИ", "lead_ai")]
    ])
  );
});

bot.hears("🆘 Поддержка 24/7", async (ctx) => {
  ctx.session = {
    mode: "support",
    step: "support_message"
  };

  await ctx.reply(
    "Опишите проблему одним сообщением.\n\nНапример:\n«Не работает принтер в бухгалтерии»\n«Нет интернета в офисе»\n«Не открывается почта»",
    backMenu()
  );
});

bot.hears("📞 Контакты", async (ctx) => {
  await ctx.reply(
    `📞 Телефон: ${CONTACT_PHONE}\n📧 Почта: ${CONTACT_EMAIL}\n\nВы можете оставить заявку прямо здесь через кнопку «📝 Оставить заявку».`,
    mainMenu()
  );
});

bot.hears("📝 Оставить заявку", async (ctx) => {
  ctx.session = {
    mode: "lead",
    step: "fullName",
    lead: {}
  };

  await ctx.reply("Введите ваше ФИО:", backMenu());
});

bot.action(/^service_(.+)/, async (ctx) => {
  await ctx.answerCbQuery();
  const id = ctx.match[1];
  const service = getServiceById(id);

  if (!service) {
    await ctx.reply("Услуга не найдена.");
    return;
  }

  await ctx.reply(
    `🧰 ${service.title}\n\n${service.text}\n\nСтоимость: ${service.price}`,
    Markup.inlineKeyboard([
      [Markup.button.callback("📝 Оставить заявку на эту услугу", `lead_${service.id}`)]
    ])
  );
});

bot.action(/^package_(\d+)/, async (ctx) => {
  await ctx.answerCbQuery();
  const index = Number(ctx.match[1]);
  const item = PACKAGES[index];

  if (!item) {
    await ctx.reply("Пакет не найден.");
    return;
  }

  await ctx.reply(
    `📦 ${item.title}\n\n${item.text}\n\nСтоимость: ${item.price}`,
    Markup.inlineKeyboard([
      [Markup.button.callback("📝 Оставить заявку на пакет", `lead_package_${index}`)]
    ])
  );
});

bot.action(/^lead_(.+)/, async (ctx) => {
  await ctx.answerCbQuery();

  const type = ctx.match[1];
  let selectedService = "Консультация";

  if (type.startsWith("package_")) {
    const index = Number(type.replace("package_", ""));
    selectedService = PACKAGES[index]?.title || "Пакет услуг";
  } else {
    selectedService = getServiceById(type)?.title || "Консультация";
  }

  ctx.session = {
    mode: "lead",
    step: "fullName",
    lead: {
      service: selectedService
    }
  };

  await ctx.reply(`Оформим заявку на: ${selectedService}\n\nВведите ваше ФИО:`, backMenu());
});

bot.on("text", async (ctx) => {
  const text = ctx.message.text;

  if (!ctx.session || !ctx.session.mode) {
    await ctx.reply(
      "Я вас понял. Выберите нужный раздел в меню или нажмите «📝 Оставить заявку».",
      mainMenu()
    );
    return;
  }

  if (ctx.session.mode === "support") {
    const supportText = [
      "🆘 Новое обращение в поддержку 24/7",
      "",
      `Сообщение: ${text}`,
      ctx.from?.username ? `Telegram: @${ctx.from.username}` : "",
      `Telegram ID: ${ctx.from.id}`
    ].filter(Boolean).join("\n");

    await notifyAdmin(ctx, supportText);
    await ctx.reply(
      "Заявка в поддержку создана. Специалист получил уведомление и скоро свяжется с вами.",
      mainMenu()
    );

    ctx.session = {};
    return;
  }

  if (ctx.session.mode === "lead") {
    const lead = ctx.session.lead || {};

    if (ctx.session.step === "fullName") {
      lead.fullName = text;
      ctx.session.lead = lead;
      ctx.session.step = "email";
      await ctx.reply("Введите вашу почту:");
      return;
    }

    if (ctx.session.step === "email") {
      lead.email = text;
      ctx.session.lead = lead;
      ctx.session.step = "company";
      await ctx.reply("Введите название компании. Если компании нет, напишите «нет»:");
      return;
    }

    if (ctx.session.step === "company") {
      lead.company = text.toLowerCase() === "нет" ? "" : text;
      ctx.session.lead = lead;
      ctx.session.step = "service";

      if (lead.service) {
        ctx.session.step = "message";
        await ctx.reply("Кратко опишите задачу или проблему:");
      } else {
        await ctx.reply(
          "Выберите услугу или напишите свой вариант:",
          Markup.keyboard([
            ["Офис под ключ", "Поддержка 24/7"],
            ["Сеть / Wi‑Fi / VPN", "Серверы и AD"],
            ["Интеграция ИИ", "Другое"],
            ["⬅️ Назад в меню"]
          ]).resize()
        );
      }
      return;
    }

    if (ctx.session.step === "service") {
      lead.service = text;
      ctx.session.lead = lead;
      ctx.session.step = "message";
      await ctx.reply("Кратко опишите задачу или проблему:");
      return;
    }

    if (ctx.session.step === "message") {
      lead.message = text;
      lead.username = ctx.from?.username || "";
      lead.telegramId = ctx.from?.id || "";

      const leadText = buildLeadText(lead);

      await Promise.all([
        notifyAdmin(ctx, leadText),
        sendEmail(leadText)
      ]);

      await ctx.reply(
        "Спасибо! Заявка отправлена. Мы свяжемся с вами в ближайшее время.",
        mainMenu()
      );

      ctx.session = {};
      return;
    }
  }
});

bot.catch((error, ctx) => {
  console.error("Bot error:", error);
  if (ctx) {
    ctx.reply("Произошла ошибка. Попробуйте ещё раз или свяжитесь напрямую: " + CONTACT_PHONE);
  }
});

bot.launch();

console.log("Telegram-бот запущен.");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
