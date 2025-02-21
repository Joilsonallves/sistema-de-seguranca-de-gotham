const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

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
    // Gerando o token JWT
    const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    return res.status(200).json({ message: 'Login realizado com sucesso!', token });
  } else {
    return res.status(401).json({ message: 'Usuário ou senha incorretos!' });
  }
});

// Middleware para proteger rotas
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Obtém o token do cabeçalho
  
    if (!token) {
      return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido' });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Token inválido ou expirado' });
      }
      req.user = user; // Salva as informações do usuário no req.user
      next(); // Chama o próximo middleware ou rota
    });
  };
  

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
  