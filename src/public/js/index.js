document.getElementById("formCadastro").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("emailCadastro").value;
  const senha = document.getElementById("senhaCadastro").value;
  const perfil = document.getElementById("perfilCadastro").value;

  try {
    const res = await fetch("/api/auth/registrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha, perfil }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.mensagem || "Erro no registro");
      return;
    }

    alert("Registro realizado com sucesso! Faça login.");
    document.getElementById("formCadastro").reset();
  } catch (error) {
    console.error("Erro no registro:", error);
    alert("Erro no servidor.");
  }
});

document.getElementById("formLogin").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("emailLogin").value;
  const senha = document.getElementById("senhaLogin").value;

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await res.json();
    console.log("Resposta do login:", data);

    if (!res.ok) {
      alert(data.mensagem || "Email ou senha inválidos.");
      return;
    }

    alert(data.mensagem);
    const perfil = data.usuario.perfil;

    if (perfil === "bibliotecario") {
      window.location.href = "bibliotecario.html";
    } else if (perfil === "leitor") {
      window.location.href = "leitor.html";
    } else {
      alert("Perfil inválido!");
    }
  } catch (error) {
    console.error("Erro no login:", error);
    alert("Erro ao realizar login.");
  }
});
