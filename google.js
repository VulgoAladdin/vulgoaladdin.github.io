    
  
  // Obtenha a instância do serviço de autenticação
  const auth = firebase.auth();
  
  // Função para autenticação com o Google
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth
      .signInWithPopup(provider)
      .then((result) => {
        // A autenticação com o Google foi bem-sucedida, você pode acessar os detalhes do usuário aqui
        const user = result.user;
        console.log(user);
        window.location.href = "tela-inicial.html";
      })
      .catch((error) => {
        // Ocorreu um erro durante a autenticação com o Google
        console.error(error);
      });
  };

  
  // Exemplo de uso
  const signInButton = document.getElementById("google");
  signInButton.addEventListener("click", signInWithGoogle);


  
