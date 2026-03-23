const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const legacyLoginStorageKey = "techsolutions:user";
const sessionStorageKey = "techsolutions:session";

document.addEventListener("DOMContentLoaded", () => {
  setupHeaderState();
  setupAuthShortcut();
  setupRevealAnimations();
  setupCounters();
  setupServicesPage();
  setupContactForm();
  setupLoginArea();
  setupDashboardPage();
});

function setupHeaderState() {
  const header = document.querySelector(".site-header");

  if (!header) {
    return;
  }

  const syncHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
}

function setupRevealAnimations() {
  const revealTargets = document.querySelectorAll(
    ".hero-copy, .hero-highlight, .page-hero .container, .destaque-card, .info-card, .metric-card, .contato-card, .servico, .login-side, .login-card, .dashboard-hero .container, .dashboard-stat, .dashboard-card"
  );

  if (!revealTargets.length) {
    return;
  }

  revealTargets.forEach((element) => element.classList.add("js-reveal"));

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );

  revealTargets.forEach((element) => observer.observe(element));
}

function setupCounters() {
  const counters = document.querySelectorAll("[data-counter]");

  if (!counters.length) {
    return;
  }

  const animateCounter = (element) => {
    const target = Number(element.dataset.counter || 0);

    if (prefersReducedMotion) {
      element.textContent = formatCounter(target);
      return;
    }

    const duration = 1200;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = formatCounter(Math.round(target * eased));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

function formatCounter(value) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function getSession() {
  const raw = localStorage.getItem(sessionStorageKey);

  if (!raw) {
    return null;
  }

  try {
    const session = JSON.parse(raw);

    if (!session?.token || !session?.usuario) {
      localStorage.removeItem(sessionStorageKey);
      return null;
    }

    return session;
  } catch (error) {
    localStorage.removeItem(sessionStorageKey);
    return null;
  }
}

function getSessionUser() {
  return getSession()?.usuario || null;
}

function getSessionToken() {
  return getSession()?.token || null;
}

function saveSession(session) {
  localStorage.removeItem(legacyLoginStorageKey);
  localStorage.setItem(sessionStorageKey, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(legacyLoginStorageKey);
  localStorage.removeItem(sessionStorageKey);
}

function clearSessionAndGoToLogin() {
  clearSession();
  window.location.href = "login.html";
}

function fetchWithAuth(url, options = {}) {
  const token = getSessionToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers
  });
}

function setupAuthShortcut() {
  const authLink = document.querySelector(".nav-login");

  if (!authLink) {
    return;
  }

  const sessaoSalva = getSession();
  const isLoginPage = document.body.classList.contains("login-page");

  if (!sessaoSalva || isLoginPage) {
    return;
  }

  authLink.textContent = "Logoff";
  authLink.setAttribute("href", "#");
  authLink.classList.add("ativo");

  authLink.addEventListener("click", (event) => {
    event.preventDefault();
    clearSessionAndGoToLogin();
  });
}

function setupServicesPage() {
  const listaServicos = document.getElementById("lista-servicos");

  if (!listaServicos) {
    return;
  }

  const busca = document.getElementById("busca-servico");
  const resultado = document.getElementById("resultado-servicos");
  const botoesFiltro = document.querySelectorAll(".filtro-servico");
  const categoriasPorServico = {
    "Suporte tecnico": "suporte",
    Infraestrutura: "infra",
    "Desenvolvimento Web": "web"
  };

  let filtroAtual = "todos";
  let servicosCarregados = [];

  const renderServicos = () => {
    const termo = (busca?.value || "").trim().toLowerCase();
    const filtrados = servicosCarregados.filter((servico) => {
      const texto = `${servico.titulo} ${servico.descricao}`.toLowerCase();
      const passaBusca = !termo || texto.includes(termo);
      const passaFiltro = filtroAtual === "todos" || servico.categoria === filtroAtual;

      return passaBusca && passaFiltro;
    });

    listaServicos.innerHTML = "";

    if (!filtrados.length) {
      listaServicos.innerHTML = `
        <div class="servico-vazio">
          Nenhum servico encontrado. Tente outro termo ou selecione outro filtro.
        </div>
      `;
      resultado.textContent = "Nenhum servico encontrado.";
      return;
    }

    filtrados.forEach((servico) => {
      const card = document.createElement("article");
      card.className = "servico js-reveal is-visible";

      card.innerHTML = `
        <span class="servico-tag">${formatCategoria(servico.categoria)}</span>
        <h3>${servico.titulo}</h3>
        <p>${servico.descricao}</p>
      `;

      listaServicos.appendChild(card);
    });

    resultado.textContent = `Mostrando ${filtrados.length} servico${filtrados.length > 1 ? "s" : ""}.`;
  };

  botoesFiltro.forEach((botao) => {
    botao.addEventListener("click", () => {
      filtroAtual = botao.dataset.filter || "todos";

      botoesFiltro.forEach((item) => item.classList.remove("ativo"));
      botao.classList.add("ativo");
      renderServicos();
    });
  });

  busca?.addEventListener("input", renderServicos);

  fetch("/api/servicos")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Falha ao buscar servicos.");
      }

      return response.json();
    })
    .then((servicos) => {
      servicosCarregados = servicos.map((servico) => ({
        ...servico,
        categoria: categoriasPorServico[servico.titulo] || "todos"
      }));

      renderServicos();
    })
    .catch((error) => {
      console.error("Erro ao buscar servicos:", error);
      resultado.textContent = "Nao foi possivel carregar os servicos agora.";
      listaServicos.innerHTML = `
        <div class="servico-vazio">
          Ocorreu um problema ao carregar os servicos. Tente novamente em instantes.
        </div>
      `;
    });
}

function formatCategoria(categoria) {
  const mapa = {
    suporte: "Suporte",
    infra: "Infraestrutura",
    web: "Sites",
    todos: "Geral"
  };

  return mapa[categoria] || "Geral";
}

function setupContactForm() {
  const formContato = document.getElementById("form-contato");

  if (!formContato) {
    return;
  }

  const nome = document.getElementById("nome");
  const email = document.getElementById("email");
  const mensagem = document.getElementById("mensagem-form");
  const contador = document.getElementById("contador-mensagem");
  const status = document.getElementById("status-formulario");
  const botaoEnviar = formContato.querySelector("button");

  const atualizarContador = () => {
    contador.textContent = String(mensagem.value.length);
  };

  const validarFormulario = () => {
    const nomeValido = nome.value.trim().length >= 3;
    const emailValido = email.validity.valid;
    const mensagemValida = mensagem.value.trim().length >= 10;

    return nomeValido && emailValido && mensagemValida;
  };

  atualizarContador();
  mensagem.addEventListener("input", atualizarContador);

  formContato.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validarFormulario()) {
      status.textContent = "Preencha nome, email valido e uma mensagem com pelo menos 10 caracteres.";
      status.className = "erro";
      return;
    }

    status.textContent = "Enviando formulario...";
    status.className = "";
    botaoEnviar.disabled = true;
    botaoEnviar.textContent = "Enviando...";

    fetch("/api/contato", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome: nome.value.trim(),
        email: email.value.trim(),
        mensagem: mensagem.value.trim()
      })
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Falha ao enviar formulario.");
        }

        return response.json();
      })
      .then((data) => {
        status.textContent = data.mensagem;
        status.className = "sucesso";
        formContato.reset();
        atualizarContador();
      })
      .catch((error) => {
        console.error("Erro ao enviar formulario.", error);
        status.textContent = "Erro ao enviar formulario.";
        status.className = "erro";
      })
      .finally(() => {
        botaoEnviar.disabled = false;
        botaoEnviar.textContent = "Enviar";
      });
  });
}

function setupLoginArea() {
  const formLogin = document.getElementById("form-login");

  if (!formLogin) {
    return;
  }

  const email = document.getElementById("login-email");
  const senha = document.getElementById("login-senha");
  const status = document.getElementById("status-login");
  const botaoEntrar = formLogin.querySelector("button");
  const sessaoSalva = getSession();

  if (sessaoSalva) {
    fetchWithAuth("/api/auth/validate")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Sessao expirada.");
        }

        window.location.href = "dashboard.html";
      })
      .catch(() => {
        clearSession();
      });
  }

  formLogin.addEventListener("submit", (event) => {
    event.preventDefault();

    status.textContent = "Validando acesso...";
    status.className = "";
    botaoEntrar.disabled = true;
    botaoEntrar.textContent = "Entrando...";

    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email.value.trim(),
        senha: senha.value
      })
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.mensagem || "Nao foi possivel entrar.");
        }

        return data;
      })
      .then((data) => {
        saveSession({
          token: data.token,
          usuario: data.usuario
        });
        window.location.href = "dashboard.html";
      })
      .catch((error) => {
        status.textContent = error.message;
        status.className = "erro";
      })
      .finally(() => {
        botaoEntrar.disabled = false;
        botaoEntrar.textContent = "Entrar";
      });
  });
}

function setupDashboardPage() {
  const title = document.getElementById("dashboard-title");

  if (!title) {
    return;
  }

  const token = getSessionToken();
  const logout = document.getElementById("dashboard-logoff");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  title.textContent = "Validando sessao...";

  fetchWithAuth("/api/auth/validate")
    .then(async (response) => {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || "Nao foi possivel validar a sessao.");
      }

      title.textContent = `Ola, ${data.usuario.nome}`;
    })
    .catch(() => {
      clearSessionAndGoToLogin();
    });

  logout?.addEventListener("click", (event) => {
    event.preventDefault();
    clearSessionAndGoToLogin();
  });
}
