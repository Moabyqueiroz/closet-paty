# Closet Paty

Site institucional/vitrine da loja **Closet Paty**, feito em um único arquivo HTML (sem necessidade de servidor ou build).

## Estrutura

```
Closet Paty/
├── index.html                  <- o site inteiro (estrutura, estilo e conteúdo)
├── cart.js                      <- lógica da sacola de compras (carrinho)
├── netlify.toml                 <- configuração de deploy no Netlify
├── logo-closet-paty.png        <- logo usada no cabeçalho e no rodapé
├── netlify/
│   └── functions/
│       └── create-preference.js  <- cria o pagamento no Mercado Pago (roda no servidor, não no navegador)
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
<div class="product" data-id="body-luci" data-price="70.00" data-name="Body Luci">
  <div class="product-img">
    <img class="product-photo" src="imagens/produtos/body-luci.jpg" alt="Body Luci">
    <div class="quick-buy">Comprar</div>
  </div>
  <h3 class="product-name">Body Luci</h3>
  <div class="product-price">R$ 70,00</div>
  <div class="product-installments">12x de R$ 7,20 sem juros</div>
</div>
```

- **Preço**: edite **em dois lugares na mesma linha/bloco** — o texto dentro de `<div class="product-price">` (o que o cliente vê) **e** o atributo `data-price="70.00"` na primeira linha do bloco (o que o Mercado Pago realmente cobra). Se só mudar um dos dois, o carrinho vai cobrar o valor errado.
- **Nome**: edite o texto dentro de `<h3 class="product-name">` e também o atributo `data-name="..."` na primeira linha.
- **Parcelamento**: edite o texto dentro de `<div class="product-installments">` (isso é só informativo, não afeta o valor cobrado).
- Produtos em promoção têm um preço antigo (`<span class="old">`) e o novo preço ao lado, além do desconto (`<span class="discount">`) — o `data-price` deve ser sempre o preço **com desconto** (o que será cobrado).
- **Não repita o mesmo `data-id` em dois produtos** — cada produto precisa de um identificador único.

## Adicionar um novo produto

Copie um bloco `<div class="product" data-id="..." data-price="..." data-name="...">...</div>` inteiro, cole logo abaixo do último produto da seção desejada, e ajuste `data-id` (um nome único, sem espaços), `data-price`, `data-name`, nome, preço, imagem e cores.

## Como funciona o pagamento (carrinho + Mercado Pago)

O site tem uma sacola de compras (clique no ícone de sacola no topo). O cliente:
1. Clica em "Comprar" em um ou mais produtos → eles vão para a sacola
2. Abre a sacola e clica em "Finalizar Compra"
3. É redirecionado para a página de pagamento do Mercado Pago (Pix, cartão parcelado, boleto)
4. Depois de pagar, volta para o site com uma mensagem de confirmação

A parte que fala com o Mercado Pago (`netlify/functions/create-preference.js`) roda no **Netlify**, não no navegador do cliente — isso é necessário porque ela usa a chave secreta (Access Token) da conta Mercado Pago, que nunca pode aparecer no código do site.

### Configurar (uma vez só)

1. Crie uma conta gratuita em [netlify.com](https://www.netlify.com) (dá pra entrar direto com a conta do GitHub)
2. "Add new site" → "Import an existing project" → escolha o repositório `closet-paty`
3. Deixe as configurações padrão (o `netlify.toml` já diz pro Netlify o que fazer) e clique em "Deploy"
4. No painel do site criado, vá em **Site configuration → Environment variables** e adicione:
   - Nome: `MP_ACCESS_TOKEN`
   - Valor: o **Access Token de produção** da sua conta Mercado Pago (pegue em [developers.mercadopago.com.br](https://www.mercadopago.com.br/developers/panel/app) → sua aplicação → Credenciais de produção)
5. Depois de adicionar a variável, vá em **Deploys** e clique em "Trigger deploy" para o site pegar a nova configuração
6. Pronto — o site publicado pelo Netlify (endereço tipo `algumnome.netlify.app`) já processa pagamentos de verdade

**Importante:** nunca cole o Access Token dentro do `index.html`, `cart.js` ou qualquer arquivo do repositório — ele deve existir **só** dentro das variáveis de ambiente do Netlify.
