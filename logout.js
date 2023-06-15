document.getElementById('logout').addEventListener('click', logout);

//linkar com a tela inicial
function logout() {
    firebase.auth().signOut()
      .then(() => {
        // Limpar informações de sessão ou token de autenticação
        // Redirecionar o usuário para a página de login ou página de confirmação de logout
        window.location.href = 'cadastro.html';
      })
      .catch((error) => {
        console.log('Erro durante o logout:', error);
      });
  }