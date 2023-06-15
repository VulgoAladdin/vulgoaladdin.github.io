let produto = [
  {"id":"p1", "desc":"Shampoo pós quimica", "preco":"R$34,99"},
  {"id":"p2", "desc":"Sophie condicionador", "preco":"R$39,99"},
  {"id":"p3", "desc":"Shampoo Anti Oleosidade", "preco":"R$29,99"},
  {"id":"p4", "desc":"Egeo Dolce Creme Esfoliante", "preco":"R$199,99"},
  {"id":"p5", "desc":"Malbec", "preco":"R$179,99"},
  {"id":"p6", "desc":"Arbo", "preco":"R$49,99"}
];

let nrpedido = Number(new Date());
let valorPedido = 0;
let qtItens = 0;

let todosBotoesMais = document.querySelectorAll(".btnMais");

todosBotoesMais.forEach(botao => {
  botao.addEventListener("click", () => {
    let quantidade = botao.parentNode.querySelector(".quantidadeProduto").value;
    addItemCesta(botao.id, quantidade);
  });
});

let ids = produto.map(item => item.id);

ids.forEach(id => {
  let btnComprar = document.getElementById(id);
  btnComprar.addEventListener("click", () => {
    let quantidadeInput = document.getElementById("quantidadeProduto-" + id);
    let quantidade = quantidadeInput.value;
    addItemCesta(btnComprar.id, quantidade);
  });
});

function addItemCesta(idProduto, quantidade) {
  if (parseInt(quantidade) === 0) {
    alert("Coloque uma quantidade para seu produto.");
    return;
  }
  if (parseInt(quantidade) >= 15) {
    alert("Verifique a quantidade colocada");
    return;
  }

  let preco = 0;
  let desc = "";
  let itemExistente = false;

  produto.forEach((elemento) => {
    if (elemento.id === idProduto) {
      preco = elemento.preco;
      desc = elemento.desc;
    }
  });

  const url = `https://suclimp-default-rtdb.firebaseio.com/${nrpedido}.json`;

  // Verificar se o item já existe na cesta
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data) {
        for (let key in data) {
          if (data.hasOwnProperty(key)) {
            const item = data[key];
            if (item.produto === idProduto) {
              // Item já existe na cesta, apenas aumentar a quantidade
              const novaQuantidade = parseInt(item.quantidade) + parseInt(quantidade);
              atualizarQuantidadeItemCesta(key, novaQuantidade);
              itemExistente = true;
              break;
            }
          }
        }
      }

      if (!itemExistente) {
        // Item não existe na cesta, adicionar como um novo item
        const options = {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
            'content-type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify({
            "quantidade": quantidade,
            "produto": idProduto,
            "preco": preco,
            "desc": desc
          })
        };

        fetch(url, options)
          .then(response => response.json())
          .then(data => {
            if (data) {
              mostrarResumo(preco, quantidade);
              listarItensCesta();
            }
          });
      }
    });
}


function atualizarQuantidadeItemCesta(itemKey, novaQuantidade) {
  const url = `https://suclimp-default-rtdb.firebaseio.com/${nrpedido}/${itemKey}.json`;

  const options = {
    method: 'PATCH',
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
      'content-type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({
      "quantidade": novaQuantidade
    })
  };

  fetch(url, options)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      listarItensCesta();
    })
    .catch(error => console.error(error));
}


function mostrarResumo(preco, quantidade) {
  valorPedido += parseCurrency(preco) * parseInt(quantidade);
  qtItens += parseInt(quantidade);
}

function atualizarValorTotal() {
  valorTotal = valorPedido;
  document.getElementById('valorTotal').textContent = `Valor Total: ${formatCurrency(valorTotal)}`;
  document.getElementById('valorTotalFooter').classList.add('valor-total-footer');
  
  var cestaTable = document.getElementById('cestaTable');
  if (cestaTable.rows.length === 0) {
    valorTotal = 0; // Define o valor total como 0
  }
  
  document.getElementById('valorTotal').textContent = `Valor Total: ${formatCurrency(valorTotal)}`;
}



function parseCurrency(value) {
  const currencyValue = value.replace(/[^\d.,]/g, '');
  const numberValue = parseFloat(currencyValue.replace(',', '.'));
  return numberValue;
}

let cestaModal = document.querySelector("#cestaModal");
cestaModal.addEventListener('focus', listarItensCesta);

function formatCurrency(value) {
  const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  return formatter.format(value);
}

function listarItensCesta() {
  const url = `https://suclimp-default-rtdb.firebaseio.com/${nrpedido}.json`;
  const options = {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
      'content-type': 'application/json;charset=utf-8'
    },
  };

  fetch(url, options)
    .then(response => response.json())
    .then(data => {
      if (data) {
        let cestaTable = document.querySelector("#cestaTable");
        cestaTable.innerHTML = `
          <tr class="table-header">
            <th class="quantidade-col">Quantidade</th>
            <th class="descricao-col">Descrição</th>
            <th class="preco-col">Preço</th>
            <th class="total-col">Total</th>
            <th class="acao-col">Excluir</th>
          </tr>
        `;

        let valorPedido = 0;

        for (let key in data) {
          if (data.hasOwnProperty(key)) {
            const item = data[key];
            const tr = document.createElement("tr");
            tr.setAttribute("id", key);

            const total = parseCurrency(item.preco) * parseInt(item.quantidade);

            tr.innerHTML = `
              <td class="quantidade-list">${item.quantidade}</td>
              <td class="descricao-list">${item.desc}</td>
              <td class="preco-list">${formatCurrency(parseCurrency(item.preco))}</td>
              <td class="total-list">${formatCurrency(total)}</td>
              <td class="acao-list"><span class="excluir-item" onclick="excluirItemCesta('${key}')"><i class="fas fa-trash-alt"></i></span></td>
            `;
            cestaTable.appendChild(tr);

            valorPedido += total;
           
          }
       
        }
        if (cestaTable.rows.length === 0) {
          valorPedido = 0; // Define o valor total como 0
        }
        document.getElementById('valorTotal').textContent = `Valor Total: ${formatCurrency(valorPedido)}`;
        exibirOcultarMensagem()

      }
    });

  exibirOcultarMensagem();
}


function exibirOcultarMensagem() {
  var cestaTable = document.getElementById('cestaTable');
  var emptyMessage = document.getElementById('emptyMessage');

  if (cestaTable.rows.length === 0) {
    emptyMessage.style.display = 'block';
  } else {
    emptyMessage.style.display = 'none';
  } 
  // Verifica se o último produto foi excluído
  if (cestaTable.rows.length === 0) {
    exibirOcultarMensagem();
  }
}

function excluirItemCesta(itemKey) { 
  const url = `https://suclimp-default-rtdb.firebaseio.com/${nrpedido}/${itemKey}.json`;

  fetch(url)
  .then(response => response.json())
  .then(data => {
    if (data) {
      let quantidade = data.quantidade;
      if (quantidade > 1) {
        quantidade--;
        atualizarQuantidadeItemCesta(itemKey, quantidade);
      } else {
        deletarItemCesta(itemKey);
      }
      exibirOcultarMensagem();
    }
  })
  .catch(error => console.error(error));
}

function atualizarQuantidadeItemCesta(itemKey, quantidade) {
const url = `https://suclimp-default-rtdb.firebaseio.com/${nrpedido}/${itemKey}.json`;

const options = {
  method: 'PATCH',
  mode: 'cors',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json;charset=utf-8'
  },
  body: JSON.stringify({ quantidade: quantidade })
};

fetch(url, options)
  .then(response => response.json())
  .then(data => {
    console.log(data);
    listarItensCesta();
  })
  .catch(error => console.error(error));
}

function deletarItemCesta(itemKey) {
const url = `https://suclimp-default-rtdb.firebaseio.com/${nrpedido}/${itemKey}.json`;

const options = {
  method: 'DELETE',
  mode: 'cors',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json;charset=utf-8'
  }
};

fetch(url, options)
  .then(response => response.json())
  .then(data => {
    console.log(data);
    listarItensCesta();
    exibirOcultarMensagem();
  })
  .catch(error => console.error(error));
}

function deletarItemCesta(itemKey) {
  const url = `https://suclimp-default-rtdb.firebaseio.com/${nrpedido}/${itemKey}.json`;

  const options = {
    method: 'DELETE',
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=utf-8'
    }
  };

  fetch(url, options)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      listarItensCesta();
      exibirOcultarMensagem();
    })
    .catch(error => console.error(error));
}


document.addEventListener('DOMContentLoaded', function() {
  function enviarPorWhatsApp() {
    var tabela = document.getElementById('cestaTable');
    var conteudo = '';
    var linhas = tabela.getElementsByTagName('tr');
    for (var i = 1; i < linhas.length; i++) {
      var linha = linhas[i];
      var colunas = linha.getElementsByTagName('td');
      var quantidade = colunas[0].innerText;
      var descricao = colunas[1].innerText;
      var preco = colunas[2].innerText;
      var valorTotalElement = document.getElementById('valorTotal');
      var valorTotal = valorTotalElement.textContent.replace('Valor Total: ', '');
      conteudo += quantidade + 'x ' + descricao + ' - ' + preco + '\n';
    }

    if (cestaTable.rows.length === 0) {
      alert('Adicione um produto no carrinho');
      return window.location.href = 'tela-inicial.html'
    } 

    var numeroTelefone = '5511950290870'; // Substitua pelo número de telefone desejado
    var mensagem = 'Olá, tudo bem? Gostaria de fazer o pedido desses itens:\n\n' + conteudo +  '\nValor total do seu pedido: ' + valorTotal + '\nCaso seja necessário, esse é o número do seu pedido: ' + nrpedido;
    mensagem = encodeURIComponent(mensagem);
    var url = 'https://wa.me/' + numeroTelefone + '?text=' + mensagem;
    window.open(url);
  }
  

  document.getElementById('enviar-whatsapp').addEventListener('click', enviarPorWhatsApp);
});