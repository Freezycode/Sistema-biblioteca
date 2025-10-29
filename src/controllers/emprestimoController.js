const db = require('../models/db');

exports.criarEmprestimo = async (req, res) => {
  const { livro_id, data_devolucao_prevista, leitor_id } = req.body;

  try {
    const [[livro]] = await db.query('SELECT * FROM livros WHERE id = ?', [livro_id]);
    if (!livro) return res.status(404).json({ mensagem: 'Livro não encontrado' });

    if (livro.quantidade_disponivel <= 0)
      return res.status(400).json({ mensagem: 'Livro indisponível no momento' });

    const hoje = new Date();
    const dataPrevista = new Date(data_devolucao_prevista);
    const status = dataPrevista < hoje ? 'atrasado' : 'ativo';

    await db.query(
      `INSERT INTO emprestimos 
        (livro_id, leitor_id, data_emprestimo, data_devolucao_prevista, status) 
      VALUES (?, ?, CURDATE(), ?, ?)`,
      [livro_id, leitor_id || 1, data_devolucao_prevista, status] 
    );

    await db.query(
      'UPDATE livros SET quantidade_disponivel = quantidade_disponivel - 1 WHERE id = ?',
      [livro_id]
    );

    res.status(201).json({ mensagem: 'Empréstimo registrado com sucesso', status });
  } catch (error) {
    console.error('Erro ao criar empréstimo:', error);
    res.status(500).json({ mensagem: 'Erro ao criar empréstimo' });
  }
};
exports.solicitarDevolucao = async (req, res) => {
  const { id } = req.params;

  try {
    const [[emprestimo]] = await db.query('SELECT * FROM emprestimos WHERE id = ?', [id]);

    if (!emprestimo) {
      return res.status(404).json({ mensagem: 'Empréstimo não encontrado' });
    }

    if (emprestimo.status !== 'ativo' && emprestimo.status !== 'atrasado') {
      return res.status(400).json({ mensagem: 'Este empréstimo já foi encerrado ou devolução já foi solicitada' });
    }

    res.status(200).json({ mensagem: 'Solicitação registrada. Aguarde a aprovação do bibliotecário.' });
  } catch (error) {
    console.error('Erro ao solicitar devolução:', error);
    res.status(500).json({ mensagem: 'Erro interno ao solicitar devolução' });
  }
};
exports.aprovarDevolucao = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM emprestimos WHERE id = ?', [id]);
    const emprestimo = rows[0];

    if (!emprestimo) {
      return res.status(404).json({ mensagem: 'Empréstimo não encontrado' });
    }

    if (emprestimo.status !== 'ativo') {
      return res.status(400).json({ mensagem: 'Empréstimo já finalizado ou não pode ser aprovado' });
    }

    await db.query(
      'UPDATE emprestimos SET status = ?, data_devolucao_real = CURDATE() WHERE id = ?',
      ['finalizado', id]
    );

    await db.query(
      'UPDATE livros SET quantidade_disponivel = quantidade_disponivel + 1 WHERE id = ?',
      [emprestimo.livro_id]
    );

    return res.status(200).json({ mensagem: 'Devolução aprovada com sucesso' });
  } catch (error) {
    console.error('Erro ao aprovar devolução:', error);
    return res.status(500).json({ mensagem: 'Erro interno no servidor', erro: error.message });
  }
};
exports.listarMeusEmprestimos = async (req, res) => {
  const leitor_id = req.query.leitor_id || 1; 

  try {
    const [emprestimos] = await db.query(`
      SELECT 
        e.*, 
        l.titulo AS titulo_livro, 
        l.autor
      FROM emprestimos e
      JOIN livros l ON e.livro_id = l.id
      WHERE e.leitor_id = ?
    `, [leitor_id]);

    res.status(200).json(emprestimos);
  } catch (error) {
    console.error('Erro ao listar empréstimos:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar empréstimos' });
  }
};
exports.listarEmprestimosAtivos = async (req, res) => {
  try {
    const [emprestimos] = await db.query(`
      SELECT e.*, u.nome AS leitor_nome, l.titulo AS livro_titulo
      FROM emprestimos e
      JOIN usuarios u ON e.leitor_id = u.id
      JOIN livros l ON e.livro_id = l.id
      WHERE e.status = 'ativo'
    `);

    res.status(200).json(emprestimos);
  } catch (error) {
    console.error('Erro ao listar empréstimos ativos:', error);
    res.status(500).json({ mensagem: 'Erro interno' });
  }
};
