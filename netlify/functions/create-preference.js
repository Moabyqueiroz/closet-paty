// Cria uma preferência de pagamento no Mercado Pago a partir do carrinho enviado pelo site.
// Os precos NUNCA sao confiados a partir do navegador: esta funcao busca o proprio
// index.html publicado e le os atributos data-id/data-price/data-name de cada produto,
// assim o unico lugar onde o preco de verdade existe continua sendo o index.html.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método não permitido' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'JSON inválido' }) };
  }

  const cartItems = Array.isArray(body.items) ? body.items : [];
  if (cartItems.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Carrinho vazio' }) };
  }

  const siteUrl = process.env.URL || ('https://' + event.headers.host);

  let html;
  try {
    const pageRes = await fetch(siteUrl + '/index.html');
    html = await pageRes.text();
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Não foi possível carregar o catálogo de produtos' }) };
  }

  const catalog = {};
  const productRegex = /<div class="product" data-id="([^"]+)" data-price="([^"]+)" data-name="([^"]+)">/g;
  let match;
  while ((match = productRegex.exec(html)) !== null) {
    catalog[match[1]] = { price: parseFloat(match[2]), name: match[3] };
  }

  const mpItems = [];
  for (const item of cartItems) {
    const entry = catalog[item.id];
    if (!entry || isNaN(entry.price)) continue;
    const qty = Math.max(1, Math.min(20, parseInt(item.qty, 10) || 1));
    mpItems.push({
      id: item.id,
      title: entry.name,
      quantity: qty,
      unit_price: entry.price,
      currency_id: 'BRL'
    });
  }

  if (mpItems.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Nenhum item válido no carrinho' }) };
  }

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Configuração de pagamento ausente (MP_ACCESS_TOKEN)' }) };
  }

  const preference = {
    items: mpItems,
    back_urls: {
      success: siteUrl + '/?status=success',
      failure: siteUrl + '/?status=failure',
      pending: siteUrl + '/?status=pending'
    },
    auto_return: 'approved'
  };

  try {
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      },
      body: JSON.stringify(preference)
    });

    const data = await mpRes.json();
    if (!mpRes.ok) {
      return { statusCode: 502, body: JSON.stringify({ error: 'Mercado Pago recusou a preferência', details: data }) };
    }

    return { statusCode: 200, body: JSON.stringify({ init_point: data.init_point }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao criar pagamento' }) };
  }
};
