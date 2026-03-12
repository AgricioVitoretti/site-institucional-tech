console.log("script carregado");

fetch("/api/mensagem-api")
  .then((response) => response.json())
  .then((data) => {
    console.log("dados recebidos:", data);
    const elemento = document.getElementById("mensagem-api");
    elemento.textContent = data.mensagem;
  })
  .catch((error) => {
    console.error("Erro ao buscar API:", error);
  });

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