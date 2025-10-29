const db = require('../models/db');

exports.listarLivros = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM livros');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao listar livros:', error);
    res.status(500).json({ mensagem: 'Erro ao listar livros' });
  }
};

exports.buscarLivroPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM livros WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ mensagem: 'Livro não encontrado' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar livro:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar livro' });
  }
};

exports.adicionarLivro = async (req, res) => {
  const { titulo, autor, ano_publicacao, quantidade_disponivel } = req.body;
  try {
    const [resultado] = await db.query(
      'INSERT INTO livros (titulo, autor, ano_publicacao, quantidade_disponivel) VALUES (?, ?, ?, ?)',
      [titulo, autor, ano_publicacao, quantidade_disponivel]
    );
    res.status(201).json({ mensagem: 'Livro adicionado com sucesso', id: resultado.insertId });
  } catch (error) {
    console.error('Erro ao adicionar livro:', error);
    res.status(500).json({ mensagem: 'Erro ao adicionar livro' });
  }
};

exports.atualizarLivro = async (req, res) => {
  const { id } = req.params;
  const { titulo, autor, ano_publicacao, quantidade_disponivel } = req.body;
  try {
    const [resultado] = await db.query(
      'UPDATE livros SET titulo = ?, autor = ?, ano_publicacao = ?, quantidade_disponivel = ? WHERE id = ?',
      [titulo, autor, ano_publicacao, quantidade_disponivel, id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Livro não encontrado' });
    }
    res.status(200).json({ mensagem: 'Livro atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar livro:', error);
    res.status(500).json({ mensagem: 'Erro ao atualizar livro' });
  }
};

exports.deletarLivro = async (req, res) => {
  const { id } = req.params;
  try {
    const [resultado] = await db.query('DELETE FROM livros WHERE id = ?', [id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Livro não encontrado' });
    }
    res.status(200).json({ mensagem: 'Livro deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar livro:', error);
    res.status(500).json({ mensagem: 'Erro ao deletar livro' });
  }
};
