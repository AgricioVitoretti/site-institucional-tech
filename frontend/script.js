console.log("script carregado");

fetch("http://localhost:3000/api/mensagem")
  .then((response) => response.json())
  .then((data) => {
    console.log("dados recebidos:", data);
    const elemento = document.getElementById("mensagem");
    elemento.textContent = data.mensagem;
  })
  .catch((error) => {
    console.error("Erro ao buscar API:", error);
  });