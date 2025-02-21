async function efetuarLogin(event) {
    event.preventDefault(); // Previne o recarregamento da página
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
  
      if (response.ok) {
        // Armazenar o token no localStorage
        localStorage.setItem('token', data.token);
        alert(data.message);
        window.location.href = 'usuario.html';  // Redirecionar para a página do usuário
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      alert('Erro ao fazer login. Tente novamente mais tarde.');
    }
  }
  
// SCRIPTS DA PÁGINA DE USUARIO

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
  
    if (!user) {
      alert('Você não está autenticado!');
      window.location.href = '../index.html';
      return;
    }
  
    // Preenche as informações do perfil
    document.querySelector('.nomeSidebar').textContent = user.name;
    document.querySelector('.cargoSidebar').textContent = user.role;
    document.querySelector('.infoPessoal').innerHTML = `
      <p><strong>Nome Completo:</strong> ${user.name}</p>
      <p><strong>Cargo:</strong> ${user.role}</p>
      <p><strong>E-mail:</strong> ${user.email}</p>
      <p><strong>Telefone:</strong> (21) 1234-5678</p>
    `;
  });

  
// SCRIPT PARA FAZER LOGOUT

function logout() {
    localStorage.removeItem('user');
    alert('Você saiu da conta!');
    window.location.href = '../index.html';
  }

  
// SCRIPT PARA EDITAR PERFIL

async function salvarConfiguracoes() {
    const user = JSON.parse(localStorage.getItem('user'));
    const name = document.querySelector('input[aria-label="nome completo"]').value;
    const email = document.querySelector('input[aria-label="Novo email"]').value;
    const phone = document.querySelector('input[aria-label="Novo telefone"]').value;
  
    try {
      const response = await fetch('http://localhost:3000/api/usuarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, name, email, phone }),
      });
  
      if (response.ok) {
        const data = await response.json();
        alert(data.message);
  
        // Atualiza os dados do usuário no LocalStorage
        localStorage.setItem('user', JSON.stringify(data.user));
  
        // Atualiza a interface
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      alert('Erro ao salvar. Tente novamente mais tarde.');
    }
  }

//SCRIPT PARA HISTÓRICO DE ATIVIDADES

async function carregarHistorico() {
    const user = JSON.parse(localStorage.getItem('user'));
  
    try {
      const response = await fetch(`http://localhost:3000/api/historico?username=${user.username}`);
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
  
  document.addEventListener('DOMContentLoaded', carregarHistorico);
  