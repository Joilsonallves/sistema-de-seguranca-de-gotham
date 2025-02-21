const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Fake database
const users = [
  { username: 'admin', password: '123456', name: 'Bruce Wayne', role: 'Administrador', email: 'bruce.wayne@wayneindustries.com' }
];

// Rota de login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Validação de corpo da requisição
  if (!username || !password) {
    return res.status(400).json({ message: 'Usuário e senha são obrigatórios!' });
  }

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    // Gerar o token JWT
    const token = jwt.sign(
      { username: user.username, role: user.role },
      process.env.JWT_SECRET, // A chave secreta para o token
      { expiresIn: '1h' } // O tempo de expiração do token
    );

    return res.status(200).json({ message: 'Login realizado com sucesso!', token });
  } else {
    return res.status(401).json({ message: 'Usuário ou senha incorretos!' });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Middleware para verificar o token JWT
function verificarToken(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifica o token
    req.user = decoded; // Armazena os dados do usuário decodificados na requisição
    next(); // Passa o controle para a próxima rota
  } catch (error) {
    return res.status(400).json({ message: 'Token inválido.' });
  }
}

// Rota protegida
app.get('/api/usuarios', verificarToken, (req, res) => {
  res.status(200).json({ message: 'Usuário autenticado', user: req.user });
});

  

//ATUALIZAR PERFIL

app.put('/api/usuarios', (req, res) => {
    const { username, name, email, phone } = req.body;
  
    const user = users.find(u => u.username === username);
  
    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      user.phone = phone || user.phone;
  
      return res.status(200).json({ message: 'Usuário atualizado com sucesso!', user });
    } else {
      return res.status(404).json({ message: 'Usuário não encontrado!' });
    }
  });

//HISTÓRICO DE ATIVIDADES

const activityLog = [
    { username: 'admin', date: '25/01/2025', action: 'Adicionou', resource: 'Computador X', status: 'Concluído' },
  ];
  
  app.get('/api/historico', (req, res) => {
    const { username } = req.query;
    const history = activityLog.filter(activity => activity.username === username);
    res.status(200).json(history);
  });
  