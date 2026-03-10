const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/api/mensagem", (req, res) => {
  res.json({
    mensagem: "API funcionando 🚀"
  });
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});