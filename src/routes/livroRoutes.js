const express = require('express');
const router = express.Router();
const livroController = require('../controllers/livroController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, livroController.listarLivros);
router.get('/:id', authMiddleware, livroController.buscarLivroPorId);
router.post('/', authMiddleware, livroController.adicionarLivro);
router.put('/:id', authMiddleware, livroController.atualizarLivro);
router.delete('/:id', authMiddleware, livroController.deletarLivro);

module.exports = router;
