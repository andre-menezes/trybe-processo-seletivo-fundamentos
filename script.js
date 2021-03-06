window.onload = async function onload() {
  await fetchProductList("computador");
  await loadCartItems();
  clearCart();
};

// função que cria a imagem de um produto
function createProductImageElement(imageSource) {
  const img = document.createElement("img");
  img.className = "item__image";
  img.src = imageSource;
  return img;
}

// função que cria um elemento HTML
function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

// pega o ID do produto
function getSkuFromProductItem(item) {
  return item.querySelector("span.item__sku").innerText;
}

// cria o item no carrinho de compras
function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement("li");
  li.className = "cart__item";
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener("click", cartItemClickListener);
  return li;
}

// Cria o card do produto
function createProductItemElement({ sku, name, image }) {
  const section = document.createElement("section");
  section.className = "item";
  section.appendChild(createCustomElement("span", "item__sku", sku));
  section.appendChild(createCustomElement("span", "item__title", name));
  section.appendChild(createProductImageElement(image));
  const button = createCustomElement(
    "button",
    "item__add",
    "Adicionar ao carrinho!"
  );
  button.addEventListener("click", fetchProductId);
  section.appendChild(button);

  return section;
}

function cartItemClickListener(event) {
  const parent = event.target.parentElement;
  const targetIndex = Array.prototype.indexOf.call(
    parent.children,
    event.target
  );
  const storage = localStorage.getItem("products");
  const products = JSON.parse(storage).filter(
    (item, index) => index !== targetIndex
  );
  let total = 0;
  products.forEach((item) => (total += item.salePrice));
  document.querySelector(".total-price").innerText = total
    .toFixed(2)
    .toString();
  localStorage.setItem("products", JSON.stringify(products));
  return parent.removeChild(event.target);
}

// Retorna a lista de produtos
async function fetchProductList(product) {
  try {
    const endpoint = `https://api.mercadolibre.com/sites/MLB/search?q=${product}`;
    const response = await fetch(endpoint);
    const { results } = await response.json();
    document.querySelector(".loading").remove();
    const products = results.map(({ id, title, thumbnail }) => {
      return { sku: id, name: title, image: thumbnail };
    });
    const items = document.querySelector(".items");
    products.forEach(({ sku, name, image }) => {
      const product = createProductItemElement({ sku, name, image });
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
    const cartItem = createCartItemElement({
      sku: id,
      name: title,
      salePrice: price,
    });
    const cart = document.querySelector(".cart__items");
    let total = parseFloat(document.querySelector(".total-price").innerText);
    total += price;
    document.querySelector(".total-price").innerText = total
      .toFixed(2)
      .toString();
    cart.appendChild(cartItem);
    const storage = localStorage.getItem("products");
    if (storage) {
      const list = JSON.parse(storage);
      return localStorage.setItem(
        "products",
        JSON.stringify([...list, { sku: id, name: title, salePrice: price }])
      );
    }
    return localStorage.setItem(
      "products",
      JSON.stringify([{ sku: id, name: title, salePrice: price }])
    );
  } catch (error) {
    return error;
  }
}

// Carrega os itens do carrinho do localStorage
function loadCartItems() {
  const cart = document.querySelector(".cart__items");
  const storage = localStorage.getItem("products");
  const items = JSON.parse(storage);
  let total = 0;
  if (items) {
    items.forEach((item) => {
      total += item.salePrice;
      const product = createCartItemElement(item);
      cart.appendChild(product);
    });
  }
  return (document.querySelector(".total-price").innerText = total
    .toFixed(2)
    .toString());
}

function clearCart() {
  const btnClear = document.querySelector(".empty-cart");
  btnClear.addEventListener("click", () => {
    const cart = document.querySelector(".cart__items");
    while (cart.firstChild) {
      cart.removeChild(cart.firstChild);
    }
    document.querySelector(".total-price").innerText = "0.00";
    localStorage.clear();
  });
}
