import express from "express";
import session from "express-session";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 3000;

// Banco com lowdb
const adapter = new JSONFile(path.join(__dirname, "db.json"));
const db = new Low(adapter, { users: [] });
await db.read();
db.data ||= { users: [] };

// Middlewares
app.use(cors({ origin: "http://127.0.0.1:5500", credentials: true }));
app.use(express.json());

app.use(session({
  secret: "segredo_super_secreto",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 }
}));

// Registrar usuário
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Preencha todos os campos" });

  const existing = db.data.users.find(u => u.username === username);
  if (existing) return res.status(400).json({ error: "Usuário já existe" });

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = { id: Date.now(), username, password: hashedPassword };
  db.data.users.push(newUser);
  await db.write();

  res.json({ message: "Usuário registrado com sucesso!" });
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = db.data.users.find(u => u.username === username);
  if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(400).json({ error: "Senha incorreta" });

  req.session.user = { id: user.id, username: user.username };
  res.json({ message: "Login bem-sucedido!" });
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logout realizado" });
});

// Middleware de autenticação
function checkAuth(req, res, next) {
  if (req.session.user) next();
  else res.status(401).json({ error: "Não autorizado" });
}

// Rota protegida para app.html
app.get("/app", checkAuth, (req, res) => {
  res.sendFile(join(process.cwd(), "../frontend/app.html"));
});

// Lista de usuários (protegida)
app.get("/users", checkAuth, (req, res) => {
  const usersList = db.data.users.map(u => ({ id: u.id, username: u.username }));
  res.json(usersList);
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
