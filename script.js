window.onload = async function onload() {
  await fetchProductList('computador');
  loadCartItems();
};

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

// Cria o card do produto
function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  const button = createCustomElement('button', 'item__add', 'Adicionar ao carrinho!');
  button.addEventListener('click', fetchProductId)
  section.appendChild(button);

  return section;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function cartItemClickListener(event) {
  const parent = event.target.parentElement;
  const targetIndex = Array.prototype.indexOf.call(parent.children, event.target);
  const storage = localStorage.getItem('products');
  const products = JSON.parse(storage).filter((item, index) => index !== targetIndex);
  localStorage.setItem('products', JSON.stringify(products));
  return parent.removeChild(event.target);
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

// Retorna a lista de produtos
async function fetchProductList(product) {
  try {
    const endpoint = `https://api.mercadolibre.com/sites/MLB/search?q=${product}`;
    const response = await fetch(endpoint);
    const { results } = await response.json();
    document.querySelector('.loading').remove();
    const products = results.map(({ id, title, thumbnail }) => {
      return { sku: id, name: title, image: thumbnail }
    })
    const items = document.querySelector('.items');
    products.forEach(({ sku, name, image }) => {
      const product = createProductItemElement({sku, name, image});
      items.appendChild(product);
    });
  } catch (error) {
    return error;
  }
}

// Adiciona o produto no carrinho e salva no localStorage
async function fetchProductId({ target }) {
  try {
    const parent = target.parentElement;
    const sku = getSkuFromProductItem(parent);
    const response = await fetch(`https://api.mercadolibre.com/items/${sku}`);
    const { id, title, price } = await response.json();
    const cartItem = createCartItemElement({sku: id, name: title, salePrice: price});
    const cart = document.querySelector('.cart__items');
    cart.appendChild(cartItem);
    const storage = localStorage.getItem('products');
    if (storage) {
      const list = JSON.parse(storage);
      return localStorage.setItem(
        'products',
        JSON.stringify([...list, {sku: id, name: title, salePrice: price}])
      )
    } 
    return localStorage.setItem(
      'products',
      JSON.stringify([{sku: id, name: title, salePrice: price}])
    )
  } catch (error) {
    return error;
  }
}

// Carrega os itens do carrinho do localStorage
function loadCartItems() {
  const cart = document.querySelector('.cart__items');
  const storage = localStorage.getItem('products');
  const items = JSON.parse(storage);
  items.forEach((item) => {
    const product = createCartItemElement(item);
    cart.appendChild(product);
  })
}