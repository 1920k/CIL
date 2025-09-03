async function register() {
  const username = document.getElementById("regUser").value.trim();
  const password = document.getElementById("regPass").value.trim();
  if (!username || !password) return alert("Preencha todos os campos!");

  const res = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: "include"
  });
  const data = await res.json();
  alert(data.message || data.error);
}

async function login() {
  const username = document.getElementById("logUser").value.trim();
  const password = document.getElementById("logPass").value.trim();
  if (!username || !password) return alert("Preencha todos os campos!");

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: "include"
  });
  const data = await res.json();

  if (data.message === "Login bem-sucedido!") {
    window.location.href = "/app";
  } else {
    alert(data.error);
  }
}

async function logout() {
  const res = await fetch("/logout", { method: "POST", credentials: "include" });
  const data = await res.json();
  alert(data.message);
  window.location.href = "/";
}

async function loadUsers() {
  const res = await fetch("/users", { credentials: "include" });
  if (res.status === 401) return alert("Você não está autorizado. Faça login.");
  const users = await res.json();
  const list = document.getElementById("userList");
  list.innerHTML = "";
  users.forEach(u => {
    const li = document.createElement("li");
    li.textContent = `ID: ${u.id} | Usuário: ${u.username}`;
    list.appendChild(li);
  });
}
