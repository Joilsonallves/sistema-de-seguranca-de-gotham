const apiUrl = "https://sistema-gotham.onrender.com"; // Substitua pela URL do seu backend
fetch(`${apiUrl}/dados`)
  .then(response => response.json())
  .then(data => console.log(data));

const loginForm = document.getElementById('login-form');

if (loginForm) {
  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: email,
          senha: senha
        })
      });

      if (!response.ok) {
        // Se a resposta não for OK, exibe uma mensagem de erro
        const errorText = await response.text();
        alert("E-mail ou senha incorretos!");
        console.error('Erro:', errorText);
      } else {
        // Redireciona para o dashboard em caso de sucesso
        window.location.href = '/dashboard'; // Use a rota do Flask para redirecionar
      }
    } catch (error) {
      alert("Ocorreu um erro ao tentar fazer login.");
      console.error('Erro:', error);
    }
  });
}
//=======================================//
// Função para a página de configurações //
//======================================//

// Função para carregar usuários na tabela (escopo global)
function carregarUsuarios() {
  const tabelaUsuarios = document.getElementById('corpo-tabela');
  if (!tabelaUsuarios) return; // Verifica se a tabela existe

  fetch('/listar_usuarios')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        tabelaUsuarios.innerHTML = data.usuarios.map(usuario => `
          <tr>
            <td>${usuario.id}</td>
            <td>${usuario.nome}</td>
            <td>${usuario.email}</td>
            <td>${usuario.cargo}</td>
            <td>
              <button class="btn btn-warning btn-sm btn-editar fas fa-edit" data-id="${usuario.id}"></button>
              <button class="btn btn-danger btn-sm btn-remover fas fa-trash" data-id="${usuario.id}"></button>
            </td>
          </tr>
        `).join('');

        // Adiciona event listeners para os botões de editar e remover
        adicionarEventListeners();
      }
    });
}

// Função para adicionar event listeners aos botões de editar e remover
function adicionarEventListeners() {
  document.querySelectorAll('.btn-editar').forEach(button => {
    button.addEventListener('click', function () {
      const id = this.getAttribute('data-id');
      editarUsuario(id);
    });
  });

  document.querySelectorAll('.btn-remover').forEach(button => {
    button.addEventListener('click', function () {
      const id = this.getAttribute('data-id');
      removerUsuario(id);
    });
  });
}

// Função para adicionar usuário
function adicionarUsuario() {
  const nome = document.getElementById('nomeNovoUsuario').value;
  const email = document.getElementById('emailNovoUsuario').value;
  const senha = document.getElementById('senhaNovoUsuario').value;
  const cargo = document.getElementById('cargoNovoUsuario').value;

  console.log("Dados a serem enviados:", { nome, email, senha, cargo });  // Log dos dados

  fetch('/adicionar_usuario', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha, cargo })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert(data.message);
        carregarUsuarios();
      } else {
        alert(data.message);
      }
    })
    .catch(error => {
      console.error('Erro:', error);
      alert("Ocorreu um erro ao adicionar o usuário.");
    });
}

// Função para editar usuário
function editarUsuario(id) {
  // Abre o modal de edição
  const modal = new bootstrap.Modal(document.getElementById('modalEditarUsuario'));
  modal.show();

  // Preenche o modal com os dados do usuário
  fetch(`/usuarios/${id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao buscar dados do usuário');
      }
      return response.json();
    })
    .then(usuario => {
      document.getElementById('idUsuarioEditar').value = usuario.id;
      document.getElementById('nomeUsuarioEditar').value = usuario.nome;
      document.getElementById('emailUsuarioEditar').value = usuario.email;
      document.getElementById('cargoUsuarioEditar').value = usuario.cargo;  // Novo campo para o cargo
    })
    .catch(error => {
      console.error('Erro:', error);
      alert("Ocorreu um erro ao carregar os dados do usuário.");
    });

  // Salva as alterações
  document.getElementById('btnSalvarEdicao').addEventListener('click', function () {
    const nome = document.getElementById('nomeUsuarioEditar').value;
    const email = document.getElementById('emailUsuarioEditar').value;
    const senha = document.getElementById('senhaUsuarioEditar').value;
    const cargo = document.getElementById('cargoUsuarioEditar').value;  // Novo campo para o cargo

    fetch(`/editar_usuario/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha, cargo })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert(data.message);
          carregarUsuarios();  // Atualiza a tabela após a edição
          modal.hide();
        } else {
          alert(data.message);
        }
      })
      .catch(error => {
        console.error('Erro:', error);
        alert("Ocorreu um erro ao editar o usuário.");
      });
  });
}

// Função para apagar usuário
function removerUsuario(id) {
  if (confirm('Tem certeza que deseja remover este usuário?')) {
    fetch(`/remover_usuario/${id}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert(data.message);
          carregarUsuarios();  // Atualiza a tabela após a remoção
        } else {
          alert(data.message);
        }
      })
      .catch(error => {
        console.error('Erro:', error);
        alert("Ocorreu um erro ao remover o usuário.");
      });
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function () {
  const btnAdicionar = document.getElementById('btnAdicionarUsuario');
  if (btnAdicionar) {
    btnAdicionar.addEventListener('click', adicionarUsuario);
  }

  // Carregar usuários ao abrir a página
  carregarUsuarios();
});

//=======================================//
// Função para a página de dispositivos //
//======================================//

// Função para carregar dispositivos
function carregarDispositivos() {
  fetch('/carregar_dispositivos')
    .then(response => response.json())
    .then(data => {
      const tabelaDispositivos = document.getElementById('corpo-dispositivos');
      if (!tabelaDispositivos) return; // Verifica se a tabela existe

      tabelaDispositivos.innerHTML = ''; // Limpa a tabela antes de carregar os dados

      data.forEach(dispositivo => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
          <td>${dispositivo.nome}</td>
          <td>${dispositivo.categoria}</td>
          <td>${dispositivo.status}</td>
          <td>${dispositivo.localizacao}</td>
          <td>${dispositivo.fabricante}</td>
          <td>${dispositivo.data_instalacao}</td>
          <td>
              <button class="btn btn-primary fas fa-edit" onclick="editarDispositivo(${dispositivo.id})"></button>
              <button class="btn btn-danger fas fa-trash" onclick="removerDispositivo(${dispositivo.id})"></button>
          </td>
        `;
        tabelaDispositivos.appendChild(linha);
      });
    })
    .catch(error => {
      console.error('Erro ao carregar dispositivos:', error);
      alert("Ocorreu um erro ao carregar os dispositivos.");
    });
}

// Função para adicionar dispositivo
function adicionarDispositivo() {
  console.log("Função adicionarDispositivo chamada");
  
  // Elementos do DOM
  const btnSalvar = document.getElementById('btnSalvarDispositivo');
  const form = document.getElementById('formAdicionarDispositivo');
  const modalElement = document.getElementById('modalAdicionarDispositivo');

  // Verifica se os elementos existem
  if (!btnSalvar || !form || !modalElement) {
    console.error('Elementos necessários não encontrados!');
    return;
  }

  // Desabilita o botão para evitar múltiplos cliques
  btnSalvar.disabled = true;

  // Coleta os dados do modal
  const formData = {
    nome: document.getElementById('nomeNovoDispositivo').value.trim(),
    categoria: document.getElementById('categoriaNovoDispositivo').value.trim(),
    localizacao: document.getElementById('localizacaoNovoDispositivo').value.trim(),
    status: document.getElementById('statusNovoDispositivo').value.trim(),
    fabricante: document.getElementById('fabricanteNovoDispositivo').value.trim(),
    dataInstalacao: document.getElementById('dataInstalacaoNovoDispositivo').value
  };

  console.log("Dados a serem enviados:", formData);

  // Validação dos campos
  if (Object.values(formData).some(value => !value)) {
    alert("Todos os campos são obrigatórios!");
    btnSalvar.disabled = false;
    return;
  }

  // Validação da data
  if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.dataInstalacao)) {
    alert("Formato de data inválido! Use YYYY-MM-DD");
    btnSalvar.disabled = false;
    return;
  }

  // Envio dos dados
  fetch('/adicionar_dispositivo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      // Fecha o modal usando Bootstrap
      const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
      modal.hide();
      
      // Recarrega a lista de dispositivos
      carregarDispositivos();
      
      // Reseta o formulário
      form.reset();
      
      // Feedback visual
      mostrarNotificacao('Dispositivo adicionado com sucesso!', 'success');
    } else {
      throw new Error(data.message || 'Erro desconhecido ao adicionar dispositivo');
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    mostrarNotificacao(error.message || 'Erro na comunicação com o servidor', 'error');
  })
  .finally(() => {
    btnSalvar.disabled = false;
  });
}

// Função auxiliar para notificações
function mostrarNotificacao(mensagem, tipo = 'info') {
  const toastContainer = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${tipo} border-0`;
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${mensagem}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  new bootstrap.Toast(toast, { autohide: true, delay: 5000 }).show();
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  // Event Listener para o botão de salvar
  const btnSalvar = document.getElementById('btnSalvarDispositivo');
  if (btnSalvar) {
    btnSalvar.addEventListener('click', adicionarDispositivo);
  }

  // Event Listener para fechar o modal
  const modalElement = document.getElementById('modalAdicionarDispositivo');
  if (modalElement) {
    modalElement.addEventListener('hidden.bs.modal', () => {
      document.getElementById('formAdicionarDispositivo').reset();
    });
  }

  // Carrega os dispositivos inicialmente
  carregarDispositivos();
});

//Função para editar dispositivos
function editarDispositivo(id) {
  // Verifica se o modal existe
  const modalElement = document.getElementById('modalEditarDispositivo');
  if (!modalElement) {
    console.error('Modal não encontrado!');
    return;
  }

  // Inicializa o modal
  const modal = new bootstrap.Modal(modalElement);
  modal.show();

  // Preenche o modal com os dados do dispositivo
  fetch(`/dispositivos/${id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao buscar dados do dispositivo');
      }
      return response.json();
    })
    .then(dispositivo => {
      document.getElementById('nomeDispositivoEditar').value = dispositivo.nome;
      document.getElementById('categoriaDispositivoEditar').value = dispositivo.categoria;
      document.getElementById('localizacaoDispositivoEditar').value = dispositivo.localizacao;
      document.getElementById('statusDispositivoEditar').value = dispositivo.status;
      document.getElementById('fabricanteDispositivoEditar').value = dispositivo.fabricante;
      document.getElementById('dataInstalacaoDispositivoEditar').value = dispositivo.data_instalacao;
    })
    .catch(error => {
      console.error('Erro:', error);
      alert("Ocorreu um erro ao carregar os dados do dispositivo.");
    });

  // Salva as alterações
  document.getElementById('btnSalvarEdicaoDispositivo').addEventListener('click', function () {
    const nome = document.getElementById('nomeDispositivoEditar').value;
    const categoria = document.getElementById('categoriaDispositivoEditar').value;
    const localizacao = document.getElementById('localizacaoDispositivoEditar').value;
    const status = document.getElementById('statusDispositivoEditar').value;
    const fabricante = document.getElementById('fabricanteDispositivoEditar').value;
    const dataInstalacao = document.getElementById('dataInstalacaoDispositivoEditar').value;

    fetch(`/editar_dispositivo/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, categoria, localizacao, status, fabricante, dataInstalacao })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert(data.message);
          carregarDispositivos(); // Atualiza a tabela após a edição
          modal.hide();
        } else {
          alert(data.message);
        }
      })
      .catch(error => {
        console.error('Erro:', error);
        alert("Ocorreu um erro ao editar o dispositivo.");
      });
  });
}
//Função para remover dispositivos
function removerDispositivo(id) {
  if (confirm('Tem certeza que deseja remover este dispositivo?')) {
    fetch(`/remover_dispositivo/${id}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert(data.message);
          carregarDispositivos(); // Recarrega a tabela após a remoção
        } else {
          alert(data.message);
        }
      })
      .catch(error => {
        console.error('Erro ao remover dispositivo:', error);
        alert("Ocorreu um erro ao remover o dispositivo.");
      });
  }
}