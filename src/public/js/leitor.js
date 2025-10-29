async function carregarLivros() {
  try {
    const res = await fetch("/api/livros");
    if (!res.ok) throw new Error("Erro ao carregar livros");
    const livros = await res.json();

    const tabela = document.getElementById("tabela-livros");
    tabela.innerHTML = "";

    livros.forEach((livro) => {
      if (livro.quantidade_disponivel > 0) {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${livro.id}</td>
          <td>${livro.titulo}</td>
          <td>${livro.autor}</td>
          <td>${livro.ano_publicacao || ""}</td>
          <td>${livro.quantidade_disponivel}</td>
          <td><button onclick="abrirFormularioEmprestimo(${livro.id}, '${livro.titulo}')">Solicitar</button></td>
        `;
        tabela.appendChild(row);
      }
    });
  } catch (err) {
    alert("Erro ao carregar livros");
    console.error(err);
  }
}

function abrirFormularioEmprestimo(livro_id, titulo) {
  const dataInput = prompt(`Digite a data prevista de devolução para o livro "${titulo}" (formato: AAAA-MM-DD):`);
  if (!dataInput) return;

  const dataHoje = new Date();
  const dataPrevista = new Date(dataInput);
  if (isNaN(dataPrevista.getTime())) {
    alert("Data inválida. Use o formato AAAA-MM-DD.");
    return;
  }

  const status = dataPrevista < dataHoje ? "atrasado" : "ativo";
  solicitarEmprestimo(livro_id, dataInput, status);
}

async function solicitarEmprestimo(livro_id, dataPrevista, status) {
  try {
    const res = await fetch("/api/emprestimos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        livro_id,
        data_devolucao_prevista: dataPrevista,
        status,
      }),
    });

    if (!res.ok) {
      const erro = await res.json();
      alert(erro.mensagem || "Erro ao solicitar empréstimo");
      return;
    }

    alert("Empréstimo solicitado com sucesso!");
    carregarLivros();
    carregarEmprestimos();
  } catch (err) {
    alert("Erro ao solicitar empréstimo");
    console.error(err);
  }
}

async function carregarEmprestimos() {
  try {
    const res = await fetch("/api/emprestimos/meus");
    if (!res.ok) throw new Error("Erro ao carregar empréstimos");
    const emprestimos = await res.json();

    const tabela = document.getElementById("tabela-emprestimos");
    tabela.innerHTML = "";

    emprestimos.forEach((e) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${e.titulo_livro}</td>
        <td>${e.data_emprestimo}</td>
        <td>${e.data_devolucao_prevista}</td>
        <td>${e.status}</td>
        <td>
          ${
            e.status === "ativo" || e.status === "atrasado"
              ? `<button onclick="solicitarDevolucao(${e.id})">Solicitar Devolução</button>`
              : ""
          }
        </td>
      `;
      tabela.appendChild(row);
    });
  } catch (err) {
    alert("Erro ao carregar empréstimos");
    console.error(err);
  }
}

async function solicitarDevolucao(id) {
  try {
    const res = await fetch(`/api/emprestimos/${id}/devolver`, {
      method: "PUT",
    });

    if (!res.ok) {
      const erro = await res.json();
      alert(erro.mensagem || "Erro ao solicitar devolução");
      return;
    }

    alert("Solicitação de devolução enviada com sucesso.");
    carregarEmprestimos();
  } catch (err) {
    alert("Erro ao solicitar devolução");
    console.error(err);
  }
}

carregarLivros();
carregarEmprestimos();
