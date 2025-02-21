// SCRIPT PARA EFETUAR LOGIN
async function efetuarLogin(event) {
  event.preventDefault(); // Previne o recarregamento da página

  const username = document.getElementById('usuario').value;
  const password = document.getElementById('senha').value;

  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token); // Armazenando o token no localStorage

      // Aqui, você deve armazenar as informações do usuário (caso venham na resposta)
      localStorage.setItem('user', JSON.stringify(data.user)); // Armazenando o objeto 'user' no localStorage

      console.log('Usuário armazenado:', data.user); // Verifique se o usuário está correto

      alert(data.message);
      window.location.href = 'paginas/usuario.html';  // Redirecionar para a página do usuário

    } else {
      alert(data.message); // Exibe a mensagem de erro
    }
  } catch (err) {
    console.error('Erro ao fazer login:', err);
    alert('Erro ao fazer login. Tente novamente mais tarde.');
  }
}

// Função assíncrona para pegar dados do usuário usando o token
async function obterUsuario() {
  const token = localStorage.getItem('token');

  if (token) {
    try {
      const response = await fetch('http://localhost:3000/api/usuarios', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Enviar o token no cabeçalho
        }
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Dados do usuário:', data);
        // Processar os dados do usuário conforme necessário
      } else {
        console.error('Erro ao obter dados do usuário:', data);
      }
    } catch (err) {
      console.error('Erro ao fazer requisição de dados do usuário:', err);
    }
  } else {
    console.error('Token não encontrado. Usuário não autenticado.');
  }
}

// Chamar a função para obter dados do usuário (pode ser em um evento ou carregamento da página)
obterUsuario();

// SCRIPT PARA FAZER LOGOUT
function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  alert('Você saiu da conta!');
  window.location.href = '../index.html'; // Redireciona para a página de login
}

// SCRIPT PARA SALVAR CONFIGURAÇÃO
async function salvarConfiguracoes() {
  const user = localStorage.getItem('user');

  // Verificar se o 'user' existe no localStorage
  if (!user) {
    alert('Você não está autenticado! Faça login primeiro.');
    window.location.href = '../index.html'; // Redireciona para a página de login
    return;
  }

  // Parse o valor do 'user', pois ele existe agora
  let parsedUser;
  try {
    parsedUser = JSON.parse(user);
  } catch (err) {
    console.error('Erro ao analisar o usuário:', err);
    alert('Erro ao carregar os dados do usuário. Tente novamente mais tarde.');
    return;
  }

  if (!parsedUser) {
    console.error('Usuário não encontrado ou inválido.');
    alert('Usuário inválido. Faça login novamente.');
    window.location.href = '../index.html'; // Redireciona para a página de login
    return;
  }

  const name = document.querySelector('input[aria-label="nome completo"]').value;
  const email = document.querySelector('input[aria-label="Novo email"]').value;
  const phone = document.querySelector('input[aria-label="Novo telefone"]').value;

  try {
    const response = await fetch('http://localhost:3000/api/usuarios', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ username: parsedUser.username, name, email, phone }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message);
      localStorage.setItem('user', JSON.stringify(data.user)); // Atualiza o user no LocalStorage
      window.location.reload(); // Atualiza a página com as novas configurações
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error('Erro ao salvar configurações:', err);
    alert('Erro ao salvar. Tente novamente mais tarde.');
  }
}

// SCRIPT PARA CARREGAR HISTÓRICO DE ATIVIDADES
async function carregarHistorico() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    alert('Você não está autenticado! Faça login primeiro.');
    window.location.href = '../index.html'; // Redireciona para a página de login
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/historico?username=${user.username}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const historico = await response.json();
    const tbody = document.querySelector('table tbody');
    historico.forEach(atividade => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${atividade.date}</td>
        <td>${atividade.action}</td>
        <td>${atividade.resource}</td>
        <td>${atividade.status}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Erro ao carregar histórico:', err);
  }
}
