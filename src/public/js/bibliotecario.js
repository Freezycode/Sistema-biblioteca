const btnLogout = document.getElementById('btnLogout');
const tabelaLivros = document.getElementById('tabela-livros');
const formLivro = document.getElementById('formLivro');
const inputTitulo = document.getElementById('livro-titulo');
const inputAutor = document.getElementById('livro-autor');
const inputAno = document.getElementById('livro-ano');
const inputQuantidade = document.getElementById('livro-quantidade');
const tabelaEmprestimos = document.getElementById('tabela-emprestimos');

let livroEditandoId = null;

btnLogout.addEventListener('click', () => {
  window.location.href = 'index.html';
});

async function carregarLivros() {
  try {
    const res = await fetch('/api/livros');
    if (!res.ok) throw new Error('Falha ao carregar livros');
    const livros = await res.json();

    tabelaLivros.innerHTML = '';

    livros.forEach((livro) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${livro.id}</td>
        <td>${livro.titulo}</td>
        <td>${livro.autor}</td>
        <td>${livro.ano_publicacao || ''}</td>
        <td>${livro.quantidade_disponivel}</td>
        <td>
          <button onclick="editarLivro(${livro.id})">Editar</button>
          <button onclick="excluirLivro(${livro.id})">Excluir</button>
        </td>
      `;
      tabelaLivros.appendChild(tr);
    });
  } catch (err) {
    alert('Erro ao carregar livros');
    console.error(err);
  }
}

formLivro.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    titulo: inputTitulo.value.trim(),
    autor: inputAutor.value.trim(),
    ano_publicacao: inputAno.value ? parseInt(inputAno.value) : null,
    quantidade_disponivel: parseInt(inputQuantidade.value),
  };

  try {
    let res;
    if (livroEditandoId) {
    
      res = await fetch(`/api/livros/${livroEditandoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } else {
      
      res = await fetch('/api/livros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    }

    if (!res.ok) {
      const erro = await res.json();
      alert(erro.mensagem || 'Erro ao salvar livro');
      return;
    }

    alert(livroEditandoId ? 'Livro atualizado com sucesso!' : 'Livro adicionado com sucesso!');
    formLivro.reset();
    livroEditandoId = null;
    formLivro.querySelector('button[type="submit"]').textContent = 'Salvar Livro';

    carregarLivros();
  } catch (err) {
    alert('Erro ao salvar livro');
    console.error(err);
  }
});

async function editarLivro(id) {
  try {
    const res = await fetch(`/api/livros/${id}`);
    if (!res.ok) throw new Error('Livro não encontrado');
    const livro = await res.json();

    inputTitulo.value = livro.titulo;
    inputAutor.value = livro.autor;
    inputAno.value = livro.ano_publicacao || '';
    inputQuantidade.value = livro.quantidade_disponivel;

    livroEditandoId = id;
    formLivro.querySelector('button[type="submit"]').textContent = 'Atualizar Livro';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    alert('Erro ao carregar livro para edição');
    console.error(err);
  }
}

async function excluirLivro(id) {
  if (!confirm('Deseja realmente excluir este livro?')) return;

  try {
    const res = await fetch(`/api/livros/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const erro = await res.json();
      alert(erro.mensagem || 'Erro ao excluir livro');
      return;
    }

    alert('Livro excluído com sucesso!');
    if (livroEditandoId === id) {
      livroEditandoId = null;
      formLivro.reset();
      formLivro.querySelector('button[type="submit"]').textContent = 'Salvar Livro';
    }
    carregarLivros();
  } catch (err) {
    alert('Erro ao excluir livro');
    console.error(err);
  }
}

async function carregarEmprestimos() {
  try {
    const res = await fetch('/api/emprestimos/ativos');

    if (!res.ok) {
      throw new Error(`Erro ao carregar empréstimos: ${res.status} ${res.statusText}`);
    }

    const emprestimos = await res.json();

    tabelaEmprestimos.innerHTML = '';

    if (!emprestimos || emprestimos.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="6" style="text-align:center;">Nenhum empréstimo ativo encontrado.</td>`;
      tabelaEmprestimos.appendChild(tr);
      return;
    }

    emprestimos.forEach((emp) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${emp.leitor_nome || '—'}</td>
        <td>${emp.livro_titulo || '—'}</td>
        <td>${emp.data_emprestimo ? new Date(emp.data_emprestimo).toLocaleDateString() : '—'}</td>
        <td>${emp.data_devolucao_prevista ? new Date(emp.data_devolucao_prevista).toLocaleDateString() : '—'}</td>
        <td>${emp.status || '—'}</td>
        <td><button onclick="aprovarDevolucao(${emp.id})">Aprovar Devolução</button></td>
      `;
      tabelaEmprestimos.appendChild(tr);
    });
  } catch (err) {
    console.error('Erro ao carregar empréstimos:', err);
    alert('Erro ao carregar empréstimos. Verifique o console para mais detalhes.');
  }
}

async function aprovarDevolucao(id) {
  if (!confirm('Confirma a aprovação da devolução?')) return;

  try {
    const res = await fetch(`/api/emprestimos/${id}/aprovar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const erro = await res.json().catch(() => ({}));
      alert(erro.mensagem || 'Erro ao aprovar devolução');
      return;
    }

    alert('Devolução aprovada com sucesso!');
    carregarEmprestimos();
  } catch (err) {
    alert('Erro ao aprovar devolução. Veja o console para mais detalhes.');
    console.error('Erro na aprovação:', err);
  }
}

carregarLivros();
carregarEmprestimos();

