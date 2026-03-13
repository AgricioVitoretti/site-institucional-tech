console.log("script carregado");

  fetch("/api/servicos")
    .then((response) => response.json())
    .then((servicos) => {
      const listaServicos = document.getElementById("lista-servicos");

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
    })

    const formContato = document.getElementById("form-contato");

    if (formContato){
    formContato.addEventListener("submit", (event) => {
      event.preventDefault();

      const nome = document.getElementById("nome").value;
      const email = document.getElementById("email").value;
      const mensagem = document.getElementById("mensagem-form").value;

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
          const status = document.getElementById("status-formulario");
          status.textContent = data.mensagem;

          formContato.reset();
        })
        .catch((error) => {
          console.error("Erro ao enviar formulário");
          status.textContent = "Erro ao enviar formulário.";
        });
    });
    }