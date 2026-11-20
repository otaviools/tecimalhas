// Link ativo no menu
const caminho = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".header-menu a").forEach((link) => {
  if (link.getAttribute("href").replace("./", "") === caminho) {
    link.classList.add("ativo");
    link.setAttribute("aria-current", "page");
  }
});

// Tema claro/escuro (o tema inicial é definido no <head> para não piscar)
const temaBotao = document.querySelector(".tema-botao");
const metaCor = document.querySelector('meta[name="theme-color"]');

function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  if (metaCor) metaCor.content = tema === "claro" ? "#f1f0eb" : "#0b0b0b";
  if (temaBotao) {
    temaBotao.setAttribute("aria-label", tema === "claro" ? "Ativar tema escuro" : "Ativar tema claro");
  }
}

if (temaBotao) {
  aplicarTema(document.documentElement.dataset.tema || "escuro");

  temaBotao.addEventListener("click", () => {
    const novo = document.documentElement.dataset.tema === "claro" ? "escuro" : "claro";
    try {
      localStorage.setItem("tema", novo);
    } catch (e) {}

    const semAnimacao =
      !document.startViewTransition ||
      document.hidden ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (semAnimacao) {
      aplicarTema(novo);
      return;
    }

    // Círculo que cresce a partir do botão até cobrir a tela
    const r = temaBotao.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const raio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const transicao = document.startViewTransition(() => aplicarTema(novo));
    transicao.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${raio}px at ${x}px ${y}px)`] },
          { duration: 650, easing: "cubic-bezier(0.2, 0.7, 0.1, 1)", pseudoElement: "::view-transition-new(root)" }
        );
      })
      .catch(() => {}); // transição abortada (ex.: aba oculta): o tema já foi aplicado
    transicao.finished.catch(() => {});
  });
}

// Menu mobile em tela cheia
const header = document.querySelector(".header");
const menuBotao = document.querySelector(".menu-botao");

if (header && menuBotao) {
  const textoBotao = menuBotao.querySelector(".menu-botao-texto");
  const desktop = window.matchMedia("(min-width: 801px)");

  function alternarMenu(abrir) {
    header.classList.toggle("menu-aberto", abrir);
    menuBotao.setAttribute("aria-expanded", String(abrir));
    textoBotao.textContent = abrir ? "Fechar" : "Menu";
    document.documentElement.style.overflow = abrir ? "hidden" : "";
  }

  menuBotao.addEventListener("click", () => {
    alternarMenu(!header.classList.contains("menu-aberto"));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && header.classList.contains("menu-aberto")) {
      alternarMenu(false);
      menuBotao.focus();
    }
  });

  header.querySelectorAll(".menu a").forEach((link) => {
    link.addEventListener("click", () => alternarMenu(false));
  });

  desktop.addEventListener("change", (e) => {
    if (e.matches) alternarMenu(false);
  });
}

// Ano no rodapé
document.querySelectorAll("[data-ano]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Números que contam até o valor final
function contar(el) {
  const alvo = Number(el.dataset.contar);
  const sufixo = el.dataset.sufixo || "";
  const formatar = (n) => String(n).padStart(2, "0") + sufixo;

  if (reduzirMovimento) {
    el.textContent = formatar(alvo);
    return;
  }

  const duracao = 1400;
  const inicio = performance.now();

  function passo(agora) {
    const t = Math.min((agora - inicio) / duracao, 1);
    const suavizado = 1 - Math.pow(1 - t, 4);
    el.textContent = formatar(Math.round(alvo * suavizado));
    if (t < 1) requestAnimationFrame(passo);
  }

  el.textContent = formatar(0);
  requestAnimationFrame(passo);
}

// Revelação ao rolar: um único observer, anima uma vez e para de observar
const revelaveis = document.querySelectorAll("[data-revela], [data-contar]");

if ("IntersectionObserver" in window && !reduzirMovimento) {
  const observer = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        const el = entrada.target;
        el.classList.add("visivel");
        if (el.dataset.contar) contar(el);
        observer.unobserve(el);
      });
    },
    { rootMargin: "0px 0px -12% 0px" }
  );

  revelaveis.forEach((el) => observer.observe(el));
} else {
  revelaveis.forEach((el) => el.classList.add("visivel"));
}

// Status da loja (aberta/fechada) no horário de Brasília
const status = document.querySelector("[data-status-loja]");

if (status) {
  // Dia da semana: 0 = domingo. Horários em minutos desde 00:00.
  const horarios = {
    1: [480, 1050],
    2: [480, 1050],
    3: [480, 1050],
    4: [480, 1050],
    5: [480, 1050],
    6: [510, 720],
  };

  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const valor = (tipo) => partes.find((p) => p.type === tipo).value;
  const dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(valor("weekday"));
  const minutos = Number(valor("hour")) * 60 + Number(valor("minute"));
  const hoje = horarios[dia];
  const hora = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

  if (hoje && minutos >= hoje[0] && minutos < hoje[1]) {
    status.textContent = `Aberto agora · fecha às ${hora(hoje[1])}`;
    status.classList.add("aberto");
  } else {
    status.textContent = "Fechado agora";
  }
}
