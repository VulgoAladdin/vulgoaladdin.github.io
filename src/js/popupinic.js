window.onload = function() {
    exibirPopUp();
  };
  
  function exibirPopUp() {
    var overlay = document.querySelector('.overlay');
    overlay.style.display = 'flex';
  }
  
  function fecharPopUp() {
    var overlay = document.querySelector('.overlay');
    overlay.style.display = 'none';
  }
