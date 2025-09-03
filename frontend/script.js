// Registrar usuário
async function register() {
  const username = document.getElementById("regUser").value.trim();
  const password = document.getElementById("regPass").value.trim();

  if (!username || !password) {
    document.getElementById("result").innerText = "Preencha todos os campos!";
    return;
  }

  try {
    const res = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include"
    });
    const data = await res.json();
    document.getElementById("result").innerText = data.message || data.error;
  } catch (err) {
    document.getElementById("result").innerText = "Erro ao conectar com o servidor.";
    console.error(err);
  }
}

// Login
async function login() {
  const username = document.getElementById("logUser").value.trim();
  const password = document.getElementById("logPass").value.trim();

  if (!username || !password) {
    document.getElementById("result").innerText = "Preencha todos os campos!";
    return;
  }

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include"
    });
    const data = await res.json();

    if (data.message === "Login bem-sucedido!") {
      // Redireciona para rota protegida
      window.location.href = "/app";
    } else {
      document.getElementById("result").innerText = data.error;
    }
  } catch (err) {
    document.getElementById("result").innerText = "Erro ao conectar com o servidor.";
    console.error(err);
  }
}

// Carregar usuários (apenas se logado)
async function loadUsers() {
  try {
    const res = await fetch("/users", { credentials: "include" });
    if (res.status === 401) {
      document.getElementById("msg").innerText = "Você não está autorizado. Faça login.";
      return;
    }
    const users = await res.json();
    const list = document.getElementById("userList");
    list.innerHTML = "";
    users.forEach(u => {
      const li = document.createElement("li");
      li.textContent = `ID: ${u.id} | Usuário: ${u.username}`;
      list.appendChild(li);
    });
  } catch (err) {
    document.getElementById("msg").innerText = "Erro ao carregar usuários.";
    console.error(err);
  }
}

// Logout
async function logout() {
  try {
    const res = await fetch("/logout", { method: "POST", credentials: "include" });
    const data = await res.json();
    alert(data.message);
    window.location.href = "/";
  } catch (err) {
    document.getElementById("msg").innerText = "Erro ao sair.";
    console.error(err);
  }
}
