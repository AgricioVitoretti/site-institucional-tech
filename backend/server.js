const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "techsolutions-dev-secret";
const JWT_EXPIRES_IN = "2h";

const demoUser = {
  email: "admin@techsolutions.com",
  senhaHash: "$2b$10$UCbMKTVORvI1HEOu462z9exEXR/aAkHbARwHEO8JdrYCmKKF.oDFi",
  nome: "Administrador Tech Solutions"
};

app.use(cors());
app.use(express.static(path.join(__dirname, "../frontend")));
app.use(express.json());

function buildPublicUser(user) {
  return {
    nome: user.nome,
    email: user.email
  };
}

function generateToken(user) {
  return jwt.sign(buildPublicUser(user), JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function authenticateToken(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    res.status(401).json({
      sucesso: false,
      mensagem: "Token de acesso nao informado."
    });
    return;
  }

  const token = authorization.slice("Bearer ".length);

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({
      sucesso: false,
      mensagem: "Token invalido ou expirado."
    });
  }
}

app.get("/api/servicos", (req, res) => {
  res.json([
    {
      titulo: "Suporte tecnico",
      descricao: "Atendimento para resolucao de problemas tecnicos e manutencao de sistemas."
    },
    {
      titulo: "Infraestrutura",
      descricao: "Organizacao de redes, servidores e ambientes tecnologicos."
    },
    {
      titulo: "Desenvolvimento Web",
      descricao: "Criacao de paginas institucionais e integracao com APIs."
    }
  ]);
});

app.post("/api/contato", (req, res) => {
  const { nome, email, mensagem } = req.body;

  console.log("Dados recebidos do formulario:");
  console.log(nome, email, mensagem);

  res.json({
    sucesso: true,
    mensagem: "Formulario enviado com sucesso!"
  });
});

app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    res.status(400).json({
      sucesso: false,
      mensagem: "Informe email e senha."
    });
    return;
  }

  const emailValido = email === demoUser.email;
  const senhaValida = emailValido && await bcrypt.compare(senha, demoUser.senhaHash);

  if (!senhaValida) {
    res.status(401).json({
      sucesso: false,
      mensagem: "Email ou senha invalidos."
    });
    return;
  }

  const usuario = buildPublicUser(demoUser);

  res.json({
    sucesso: true,
    mensagem: "Login realizado com sucesso!",
    token: generateToken(demoUser),
    usuario
  });
});

app.get("/api/auth/validate", authenticateToken, (req, res) => {
  res.json({
    sucesso: true,
    mensagem: "Token valido.",
    usuario: buildPublicUser(req.user)
  });
});

app.get("/api/dashboard", authenticateToken, (req, res) => {
  res.json({
    sucesso: true,
    usuario: buildPublicUser(req.user)
  });
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
