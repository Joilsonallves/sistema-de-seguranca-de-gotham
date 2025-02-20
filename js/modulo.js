// INICIO DA VALIDAÇÃO DE USUÁRIO
let usuarioCadastrado = "admin";
let senhaCadastrada = "123";

// Ao carregar a página, verifica se há credenciais salvas
window.onload = () => {
  if (localStorage.getItem("lembrarDeMim") === "true") {
    document.getElementById("usuario").value = localStorage.getItem("usuario");
    document.getElementById("senha").value = localStorage.getItem("senha");
    document.getElementById("lembrarDeMim").checked = true;
  }
};

function efetuarLogin(event) {
  event.preventDefault();

  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const lembrarDeMim = document.getElementById("lembrarDeMim").checked;

  if (usuario === usuarioCadastrado && senha === senhaCadastrada) {
    if (lembrarDeMim) {
      localStorage.setItem("usuario", usuario);
      localStorage.setItem("senha", senha);
      localStorage.setItem("lembrarDeMim", true);
    } else {
      localStorage.removeItem("usuario");
      localStorage.removeItem("senha");
      localStorage.removeItem("lembrarDeMim");
    }
    // Redireciona para a página do usuário
    alert('Login efetuado com sucesso!');
    location.href = 'paginas/usuario.html';
  } else {
    alert("Usuário ou senha incorretos.");
  }
}
//FIM DA VALIDAÇÃO DO USUÁRIO