const express = require("express");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(session({
  secret: "segredo_super_secreto",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 } // 1 hora
}));

// Servir frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Registro de usuário
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Preencha todos os campos" });

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run("INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashedPassword],
    function(err) {
      if (err) return res.status(400).json({ error: "Usuário já existe" });
      res.json({ message: "Usuário registrado com sucesso!" });
    }
  );
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(400).json({ error: "Senha incorreta" });

    // Cria sessão
    req.session.user = { id: user.id, username: user.username };
    res.json({ message: "Login bem-sucedido!" });
  });
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logout realizado" });
});

// Middleware de autenticação
function checkAuth(req, res, next) {
  if (req.session.user) next();
  else res.redirect("/"); // redireciona para login se não estiver logado
}

// Rota protegida
app.get("/app", checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/app.html"));
});

// Lista de usuários (protegida)
app.get("/users", checkAuth, (req, res) => {
  db.all("SELECT id, username FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Erro no servidor" });
    res.json(rows);
  });
});

// Rota raiz -> index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Inicia servidor
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
