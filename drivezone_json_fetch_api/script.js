const nomeTrabalho = "Jogos de carros";

let quantidadeJogos = 10;

const categoriaPrincipal = "Velocidade";

const projetoAtivo = true;

let jogosvelocidade = 3;
let jogosdrift = 2;
let totalJogos = jogosvelocidade + jogosdrift;

const resumo = `${nomeTrabalho} possui ${totalJogos} jogos!!!!`;

console.log(nomeTrabalho);
console.log(quantidadeJogos);
console.log(categoriaPrincipal);
console.log(projetoAtivo);
console.log(totalJogos);
console.log(resumo);

const botao = document.querySelector("#botao");
const mensagem = document.querySelector("#mensagem");
const formulario = document.querySelector("#formularioJogo");
const mensagemCadastro = document.querySelector("#mensagemCadastro");
const listaJogos = document.querySelector("#listaJogos");
const artigos = document.querySelectorAll("article");

const listaCategorias = document.querySelector("#listaCategorias");
const mensagemCategorias = document.querySelector("#mensagemCategorias");
const formBusca = document.querySelector("#formBusca");
const termoBusca = document.querySelector("#termoBusca");
const mensagemBusca = document.querySelector("#mensagemBusca");
const resultadosApi = document.querySelector("#resultadosApi");
const listaFavoritos = document.querySelector("#listaFavoritos");

console.log("Quantidade de artigos:", artigos.length);

function verificarJogos() {
    if (totalJogos > 5) {
        mensagem.textContent = `${nomeTrabalho} possui ${totalJogos} jogos cadastrados!`;
    } else {
        mensagem.textContent = `${nomeTrabalho} possui ${totalJogos} jogos cadastrados. Ainda podemos adicionar mais jogos.`;
    }

    mensagem.classList.remove("erro");
    mensagem.classList.add("sucesso");
}

botao.addEventListener("click", verificarJogos);

// Lê as categorias do arquivo JSON do próprio projeto.
async function carregarCategorias() {
    try {
        const resposta = await fetch("categorias.json");

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar as categorias.");
        }

        const dados = await resposta.json();

        dados.categorias.forEach(function(categoria) {
            const artigo = document.createElement("article");
            const titulo = document.createElement("h3");
            const descricao = document.createElement("p");

            titulo.textContent = categoria.nome;
            descricao.textContent = categoria.descricao;

            artigo.appendChild(titulo);
            artigo.appendChild(descricao);
            listaCategorias.appendChild(artigo);
        });
    } catch (erro) {
        mensagemCategorias.textContent = "Não foi possível carregar as categorias.";
        mensagemCategorias.classList.add("erro");
        console.log(erro);
    }
}

// Pesquisa jogos de corrida na API RAWG.
async function buscarJogos(evento) {
    evento.preventDefault();

    const nomePesquisado = termoBusca.value.trim();

    resultadosApi.innerHTML = "";
    mensagemBusca.classList.remove("erro", "sucesso");

    if (nomePesquisado === "") {
        mensagemBusca.textContent = "Digite o nome de um jogo.";
        mensagemBusca.classList.add("erro");
        return;
    }

    if (API_KEY === "COLE_SUA_CHAVE_RAWG_AQUI") {
        mensagemBusca.textContent = "Antes de pesquisar, coloque sua chave da RAWG no arquivo config.js.";
        mensagemBusca.classList.add("erro");
        return;
    }

    mensagemBusca.textContent = "Buscando jogos...";

    const endereco = `https://api.rawg.io/api/games?key=${API_KEY}&search=${encodeURIComponent(nomePesquisado)}&genres=racing&page_size=8`;

    try {
        const resposta = await fetch(endereco);

        if (!resposta.ok) {
            throw new Error("A pesquisa não funcionou. Verifique sua chave da API.");
        }

        const dados = await resposta.json();

        if (dados.results.length === 0) {
            mensagemBusca.textContent = "Nenhum jogo de corrida encontrado. Tente outro nome.";
            mensagemBusca.classList.add("erro");
            return;
        }

        mensagemBusca.textContent = `Encontramos ${dados.results.length} resultado(s).`;
        mensagemBusca.classList.add("sucesso");

        dados.results.forEach(function(jogo) {
            mostrarJogo(jogo, resultadosApi, true);
        });
    } catch (erro) {
        mensagemBusca.textContent = "Ocorreu um erro ao buscar os jogos. Confira a conexão e a chave da API.";
        mensagemBusca.classList.add("erro");
        console.log(erro);
    }
}

// Cria um cartão para cada jogo recebido da API ou salvo nos favoritos.
function mostrarJogo(jogo, local, permitirFavorito) {
    const cartao = document.createElement("article");
    cartao.classList.add("cartao-jogo");

    if (jogo.background_image) {
        const imagem = document.createElement("img");
        imagem.src = jogo.background_image;
        imagem.alt = `Imagem do jogo ${jogo.name}`;
        imagem.loading = "lazy";
        cartao.appendChild(imagem);
    }

    const titulo = document.createElement("h3");
    titulo.textContent = jogo.name;
    cartao.appendChild(titulo);

    const lancamento = document.createElement("p");
    lancamento.textContent = `Lançamento: ${jogo.released || "Não informado"}`;
    cartao.appendChild(lancamento);

    const nota = document.createElement("p");
    nota.textContent = `Nota RAWG: ${jogo.rating || "Sem avaliação"}`;
    cartao.appendChild(nota);

    if (jogo.parent_platforms && jogo.parent_platforms.length > 0) {
        const plataformas = document.createElement("p");
        const nomes = jogo.parent_platforms.map(function(item) {
            return item.platform.name;
        });
        plataformas.textContent = `Plataformas: ${nomes.join(", ")}`;
        cartao.appendChild(plataformas);
    }

    const link = document.createElement("a");
    link.href = `https://rawg.io/games/${jogo.slug}`;
    link.textContent = "Ver detalhes na RAWG";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    cartao.appendChild(link);

    if (permitirFavorito) {
        const botaoFavorito = document.createElement("button");
        botaoFavorito.type = "button";
        botaoFavorito.textContent = "Adicionar aos favoritos";
        botaoFavorito.addEventListener("click", function() {
            salvarFavorito(jogo);
        });
        cartao.appendChild(botaoFavorito);
    } else {
        const botaoRemover = document.createElement("button");
        botaoRemover.type = "button";
        botaoRemover.textContent = "Remover dos favoritos";
        botaoRemover.addEventListener("click", function() {
            removerFavorito(jogo.id);
        });
        cartao.appendChild(botaoRemover);
    }

    local.appendChild(cartao);
}

function salvarFavorito(jogo) {
    const favoritos = JSON.parse(localStorage.getItem("jogosFavoritos")) || [];

    const jaExiste = favoritos.some(function(item) {
        return item.id === jogo.id;
    });

    if (jaExiste) {
        mensagemBusca.textContent = "Esse jogo já está nos seus favoritos.";
        mensagemBusca.classList.remove("erro");
        mensagemBusca.classList.add("sucesso");
        return;
    }

    favoritos.push(jogo);
    localStorage.setItem("jogosFavoritos", JSON.stringify(favoritos));
    mostrarFavoritos();

    mensagemBusca.textContent = "Jogo salvo nos favoritos!";
    mensagemBusca.classList.remove("erro");
    mensagemBusca.classList.add("sucesso");
}

function mostrarFavoritos() {
    listaFavoritos.innerHTML = "";

    const favoritos = JSON.parse(localStorage.getItem("jogosFavoritos")) || [];

    if (favoritos.length === 0) {
        listaFavoritos.textContent = "Você ainda não salvou nenhum jogo.";
        return;
    }

    favoritos.forEach(function(jogo) {
        mostrarJogo(jogo, listaFavoritos, false);
    });
}

function removerFavorito(idJogo) {
    const favoritos = JSON.parse(localStorage.getItem("jogosFavoritos")) || [];

    const novosFavoritos = favoritos.filter(function(jogo) {
        return jogo.id !== idJogo;
    });

    localStorage.setItem("jogosFavoritos", JSON.stringify(novosFavoritos));
    mostrarFavoritos();
}

formBusca.addEventListener("submit", buscarJogos);

// Cadastro manual de jogos, mantendo a atividade DOM que já existia.
formulario.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const nomeJogo = document.querySelector("#nomeJogo").value.trim();
    const categoriaJogo = document.querySelector("#categoriaJogo").value.trim();

    console.log("Nome do jogo:", nomeJogo);
    console.log("Categoria:", categoriaJogo);

    if (nomeJogo === "" || categoriaJogo === "") {
        mensagemCadastro.textContent = "Preencha todos os campos!";
        mensagemCadastro.classList.remove("sucesso");
        mensagemCadastro.classList.add("erro");
    } else {
        const novoJogo = document.createElement("li");
        novoJogo.textContent = nomeJogo + " - " + categoriaJogo;
        novoJogo.classList.add("jogo-cadastrado");
        listaJogos.appendChild(novoJogo);

        totalJogos = totalJogos + 1;

        mensagemCadastro.textContent = "Jogo cadastrado com sucesso!";
        mensagemCadastro.classList.remove("erro");
        mensagemCadastro.classList.add("sucesso");

        console.log("Total de jogos:", totalJogos);
        formulario.reset();
    }
});

carregarCategorias();
mostrarFavoritos();
