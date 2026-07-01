# Closet Paty

Site institucional/vitrine da loja **Closet Paty**, feito em um único arquivo HTML (sem necessidade de servidor ou build).

## Estrutura

```
Closet Paty/
├── index.html                  <- o site inteiro (estrutura, estilo e conteúdo)
├── logo-closet-paty.png        <- logo usada no cabeçalho e no rodapé
└── imagens/
    └── produtos/                <- uma foto por produto (placeholders coloridos por enquanto)
        ├── conjunto-canelado-3d.jpg
        ├── macacao-modal-ziper.jpg
        ├── body-luci.jpg
        ├── body-fernanda.jpg
        ├── calca-modal-duo.jpg
        ├── calca-wide-resinada.jpg
        ├── macaquinho-pink-glitz.jpg
        ├── conjunto-duo-jeans.jpg
        ├── vestido-ingrid.jpg
        ├── vestido-medalha.jpg
        ├── vestido-suely.jpg
        └── vestido-mariah-modal.jpg
```

## Como abrir o site

Dê duplo clique em `index.html` (abre no navegador) ou, com a extensão **Live Server** no VS Code, clique em "Go Live".

## Como trocar a foto de um produto

Basta substituir o arquivo correspondente dentro de `imagens/produtos/` por uma foto real **com o mesmo nome de arquivo**. Não precisa mexer no código. Exemplo: para trocar a foto do "Body Luci", substitua `imagens/produtos/body-luci.jpg` pela foto real (pode ser `.jpg` ou `.png`, só ajuste a extensão também dentro do `index.html` se mudar o formato).

## Como alterar preços, nomes ou textos

Abra o `index.html` no VS Code e use Ctrl+F para procurar o produto pelo nome (ex.: "Body Luci"). Cada produto segue este bloco:

```html
<div class="product">
  <div class="product-img">
    <img class="product-photo" src="imagens/produtos/body-luci.jpg" alt="Body Luci">
    <div class="quick-buy">Comprar</div>
  </div>
  <h3 class="product-name">Body Luci</h3>
  <div class="product-price">R$ 70,00</div>
  <div class="product-installments">12x de R$ 7,20 sem juros</div>
</div>
```

- **Preço**: edite o texto dentro de `<div class="product-price">`.
- **Nome**: edite o texto dentro de `<h3 class="product-name">`.
- **Parcelamento**: edite o texto dentro de `<div class="product-installments">`.
- Produtos em promoção têm um preço antigo (`<span class="old">`) e o novo preço ao lado, além do desconto (`<span class="discount">`).

## Adicionar um novo produto

Copie um bloco `<div class="product">...</div>` inteiro, cole logo abaixo do último produto da seção desejada, e ajuste nome, preço, imagem e cores.
