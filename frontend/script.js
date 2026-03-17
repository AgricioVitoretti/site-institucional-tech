console.log("script carregado");

const listaServicos = document.getElementById("lista-servicos");

if (listaServicos) {
  fetch("/api/servicos")
    .then((response) => response.json())
    .then((servicos) => {
      listaServicos.innerHTML = "";

      servicos.forEach((servico) => {
        const card = document.createElement("div");
        card.classList.add("servico");

        const titulo = document.createElement("h3");
        titulo.textContent = servico.titulo;

        const descricao = document.createElement("p");
        descricao.textContent = servico.descricao;

        card.appendChild(titulo);
        card.appendChild(descricao);
        listaServicos.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("Erro ao buscar serviços:", error);
    });
}

const formContato = document.getElementById("form-contato");

if (formContato) {
  formContato.addEventListener("submit", (event) => {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const mensagem = document.getElementById("mensagem-form").value;

    const status = document.getElementById("status-formulario");
    const botaoEnviar = formContato.querySelector("button");

    status.textContent = "Enviando formulário...";
    status.className = "";

    botaoEnviar.disabled = true;
    botaoEnviar.textContent = "Enviando...";

    fetch("/api/contato", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome,
        email,
        mensagem
      })
    })
      .then((response) => response.json())
      .then((data) => {
        status.textContent = data.mensagem;
        status.className = "sucesso";

        formContato.reset();
      })
      .catch((error) => {
        console.error("Erro ao enviar formulário.", error);

        status.textContent = "Erro ao enviar formulário.";
        status.className = "erro";
      })
      .finally(() => {
        botaoEnviar.disabled = false;
        botaoEnviar.textContent = "Enviar";
      });
  });
}
