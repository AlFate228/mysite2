const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
const form = document.getElementById("leadForm");
const statusEl = document.getElementById("formStatus");

burger.addEventListener("click", () => {
  nav.classList.toggle("open");
});

document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", () => nav.classList.remove("open"));
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = Object.fromEntries(new FormData(form).entries());

  statusEl.textContent = "Отправляем заявку...";
  statusEl.className = "form-status";

  try {
    const response = await fetch("/api/lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Ошибка отправки");
    }

    statusEl.textContent = "Заявка отправлена. Мы скоро свяжемся с вами.";
    statusEl.className = "form-status success";
    form.reset();
  } catch (error) {
    statusEl.textContent = "Не удалось отправить через сервер. Проверьте backend или настройки .env.";
    statusEl.className = "form-status error";

    const subject = encodeURIComponent("Заявка на IT консультацию");
    const body = encodeURIComponent(
      `ФИО: ${formData.fullName}\n` +
      `Почта: ${formData.email}\n` +
      `Компания: ${formData.company || "Не указана"}\n` +
      `Услуга: ${formData.service}\n` +
      `Комментарий: ${formData.message || "Нет"}`
    );

    setTimeout(() => {
      window.location.href = `mailto:galolo066@gmail.com?subject=${subject}&body=${body}`;
    }, 900);
  }
});
