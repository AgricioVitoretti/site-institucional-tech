const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const demoUser = {
  email: "admin@techsolutions.com",
  senha: "123456",
  nome: "Administrador Tech Solutions"
};

app.use(cors());
app.use(express.static(path.join(__dirname, "../frontend")));
app.use(express.json());

app.get("/api/servicos", (req, res) => {
  res.json([
    {
      titulo: "Suporte técnico",
      descricao: "Atendimento para resolução de problemas técnicos e manutenção de sistemas."
    },
    {
      titulo: "Infraestrutura",
      descricao: "Organização de redes, servidores e ambientes tecnológicos."
    },
    {
      titulo: "Desenvolvimento Web",
      descricao: "Criação de páginas institucionais e integração com APIs."
    }
  ]);
});

app.post("/api/contato", (req, res) => {
  const { nome, email, mensagem } = req.body;

  console.log("Dados recebidos do formulário:");
  console.log(nome, email, mensagem);

  res.json({
    sucesso: true,
    mensagem: "Formulário enviado com sucesso!"
  });
});

app.post("/api/login", (req, res) => {
  const { email, senha } = req.body;

  if (email === demoUser.email && senha === demoUser.senha) {
    res.json({
      sucesso: true,
      mensagem: "Login realizado com sucesso!",
      usuario: {
        nome: demoUser.nome,
        email: demoUser.email
      }
    });

    return;
  }

  res.status(401).json({
    sucesso: false,
    mensagem: "Email ou senha inválidos."
  });
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
