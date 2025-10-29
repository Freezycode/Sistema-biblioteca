const express = require('express');
const router = express.Router();
const controller = require('../controllers/emprestimoController');
const auth = require('../middleware/authMiddleware');
const restrito = require('../middleware/perfilMiddleware');

router.post('/', auth, restrito('leitor'), controller.criarEmprestimo);
router.get('/meus', auth, restrito('leitor'), controller.listarMeusEmprestimos);
router.put('/:id/devolver', auth, restrito('leitor'), controller.solicitarDevolucao);

router.get('/ativos', auth, restrito('bibliotecario'), controller.listarEmprestimosAtivos);
router.put('/:id/aprovar', auth, restrito('bibliotecario'), controller.aprovarDevolucao);

module.exports = router;
