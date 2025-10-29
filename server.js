require('dotenv').config();
console.log('TESTE .env =>', process.env.DB_USER, process.env.DB_NAME, process.env.DB_PASSWORD);
const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, 'src/public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/public', 'index.html'));
});

const authRoutes = require('./src/routes/authRoutes');
const livroRoutes = require('./src/routes/livroRoutes');
const emprestimoRoutes = require('./src/routes/emprestimoRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/livros', livroRoutes);
app.use('/api/emprestimos', emprestimoRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
