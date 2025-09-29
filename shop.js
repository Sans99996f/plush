document.addEventListener('DOMContentLoaded', () => {
  // ====== Данные товаров ======
  const productsData = [
    { name: "A Short Hike Plush", category: "A Short Hike", price: 32, image: "./plushes/A Short Hikemain.png" },
    { name: "Phoenix Wright Plush", category: "Ace Attorney", price: 28, image: "./plushes/ace attornei 1main.png" },
    { name: "Miles Edgeworth Plush", category: "Ace Attorney", price: 30, image: "./plushes/ace attornei 2main.png" },
    { name: "Astro Kratos Bot Plush", category: "ASTRO BOT", price: 39, image: "./plushes/ASTROBOT main.png" },
    { name: "Astro Plush", category: "ASTRO BOT", price: 36, image: "./plushes/astro bot main.png" },
    { name: "Baba Is Plush", category: "Baba Is You", price: 26, image: "./plushes/Baba is you main.png" },
    { name: "Banjo-Kazooie Plush Set", category: "Banjo-Kazooie", price: 39, image: "./plushes/Banjo kazooie 1 main.png" },
    { name: "Mumbo-Jumbo Plush", category: "Banjo-Kazooie", price: 22, image: "./plushes/banjo kazooie 2 main.png" },
    { name: "Plain Doll Plush", category: "BloodBorne", price: 36, image: "./plushes/BloodBorne main.png" },
    { name: "Brotato Plush", category: "Brotato", price: 24, image: "./plushes/brotato main.png" },
    { name: "Strabby Plush", category: "Bugsnax", price: 32, image: "./plushes/Bugsnax 1 main.png" },
    { name: "Bunger Plush", category: "Bugsnax", price: 39, image: "./plushes/Bugsnax 2 main.png" },
    { name: "Filto Fiddlepie Plush", category: "Bugsnax", price: 36, image: "./plushes/Bugsnax 3 main.png" },
    { name: "Cinnasnail Plush", category: "Bugsnax", price: 36, image: "./plushes/Bugsnax 4 main.png" },
    { name: "Kweeble Plush", category: "Bugsnax", price: 36, image: "./plushes/Bugsnax 5 main.png" },
    { name: "Madeline and Badeline Plush Set", category: "Celeste", price: 39, image: "./plushes/Celeste main.png" },
    { name: "Conker Talking Plush", category: "Conker", price: 36, image: "./plushes/Conker main.png" },
    { name: "Siegmeyer Plush", category: "Dark Souls", price: 36, image: "./plushes/Dark Souls main.png" },
    { name: "ENA Plush", category: "ENA", price: 39, image: "./plushes/ENA-1-main.png" },
  ];

  // ====== Корзина ======
  let cart = [];

  // ====== Селекторы и элементы ======
  const productsContainer = document.querySelector(".products");
  const sortSelect = document.getElementById("sort");
  const checkboxes = document.querySelectorAll(".sidebar input[type=checkbox]");
  const pageInfo = document.querySelector(".page-info");
  let paginationContainer = document.querySelector(".pagination-wrapper .pagination") || document.querySelector(".pagination");
  let paginationWrapperParent = document.querySelector(".pagination-wrapper");
  const paginationInfo = document.querySelector(".pagination-info");
  const cartButton = document.querySelector(".cart");
  const cartCount = document.querySelector(".cart-count");
  const cartModal = document.querySelector(".cart-modal");
  const cartModalClose = document.querySelector(".cart-modal-close");
  const cartItemsContainer = document.querySelector(".cart-items");
  const cartTotal = document.querySelector(".cart-total");
  const cartCheckout = document.querySelector(".cart-checkout");
  const checkoutFormContainer = document.querySelector(".checkout-form");
  const checkoutForm = document.getElementById("checkout-form");

  console.log("shop.js: elements initial:", {
    productsContainerExists: !!productsContainer,
    sortSelectExists: !!sortSelect,
    checkboxesCount: checkboxes.length,
    paginationContainerFound: !!paginationContainer,
    paginationWrapperFound: !!paginationWrapperParent,
    paginationInfoExists: !!paginationInfo,
    cartButtonExists: !!cartButton,
    cartModalExists: !!cartModal,
    checkoutFormExists: !!checkoutForm,
  });

  // Если .pagination-wrapper отсутствует — создаём его после .products
  if (!paginationWrapperParent && productsContainer) {
    paginationWrapperParent = document.createElement('div');
    paginationWrapperParent.className = 'pagination-wrapper';
    const p = document.createElement('p');
    p.className = 'pagination-info';
    p.textContent = '';
    paginationWrapperParent.appendChild(p);
    paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';
    paginationWrapperParent.appendChild(paginationContainer);
    productsContainer.parentElement.appendChild(paginationWrapperParent);
    console.log("shop.js: создал pagination-wrapper после .products");
  } else if (paginationWrapperParent && !paginationContainer) {
    paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';
    paginationWrapperParent.appendChild(paginationContainer);
    console.log("shop.js: создал .pagination внутри существующего .pagination-wrapper");
  } else if (!paginationContainer) {
    paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';
    document.body.appendChild(paginationContainer);
    console.warn("shop.js: создал .pagination в конце body (fallback)");
  }

  // Обновляем reference на paginationInfo и pageInfo
  const paginationInfoRef = document.querySelector(".pagination-info");
  const pageInfoRef = document.querySelector(".page-info");

  let currentPage = 1;
  const itemsPerPage = 6;
  let filteredProducts = [...productsData];

  // Helper: убедиться, что блок видим
  function ensureVisible(elem) {
    if (!elem) return;
    const comp = window.getComputedStyle(elem);
    if (comp.display === 'none') {
      elem.style.display = 'block';
      console.log("shop.js: сделал visible для", elem.className);
    }
  }


  // ====== Сброс состояния модального окна ======
  function resetModalState() {
    if (cartItemsContainer) cartItemsContainer.style.display = 'block';
    if (cartTotal) cartTotal.style.display = 'block';
    if (cartCheckout) cartCheckout.style.display = 'block';
    if (checkoutFormContainer) checkoutFormContainer.style.display = 'none';
    if (checkoutForm) checkoutForm.reset();
    renderCart(); // Обновляем список товаров в корзине
  }


  // ====== Управление корзиной ======
  function addToCart(product) {
    cart.push(product);
    updateCart();
    console.log("shop.js: добавлен товар в корзину:", product.name);
  }

  function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
    console.log("shop.js: удалён товар из корзины, индекс:", index);
  }

  function updateCart() {
    if (cartCount) {
      cartCount.textContent = cart.length;
    }
    renderCart();
  }

  function renderCart() {
    if (!cartItemsContainer || !cartTotal) return;
    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
      cartTotal.textContent = 'Total: $0';
      return;
    }
    cart.forEach((item, index) => {
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">$${item.price}</span>
        <button class="cart-item-remove">Remove</button>
      `;
      cartItemsContainer.appendChild(cartItem);
      cartItem.querySelector('.cart-item-remove').addEventListener('click', () => {
        removeFromCart(index);
      });
    });
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    cartTotal.textContent = `Total: $${total}`;
  }

  // Открытие/закрытие модального окна
  if (cartButton && cartModal && cartModalClose) {
    cartButton.addEventListener('click', () => {
      cartModal.style.display = 'flex';

      resetModalState(); // Сбрасываем состояние при открытии
    });
    cartModalClose.addEventListener('click', () => {
      cartModal.style.display = 'none';
      resetModalState(); // Сбрасываем состояние при закрытии

      renderCart();
      if (checkoutFormContainer) {
        checkoutFormContainer.style.display = 'none'; // Скрываем форму при открытии корзины
      }
    });
    cartModalClose.addEventListener('click', () => {
      cartModal.style.display = 'none';

    });
    cartModal.addEventListener('click', (e) => {
      if (e.target === cartModal) {
        cartModal.style.display = 'none';

        resetModalState(); // Сбрасываем состояние при клике вне модального окна

      }
    });
  } else {
    console.warn("shop.js: элементы корзины (.cart, .cart-modal, .cart-modal-close) не найдены");
  }

  // Обработчик кнопки Checkout
  if (cartCheckout && checkoutFormContainer) {
    cartCheckout.addEventListener('click', () => {
      if (cart.length === 0) {
        alert('Your cart is empty. Add some items before checking out.');
        return;
      }
      cartItemsContainer.style.display = 'none';
      cartTotal.style.display = 'none';
      cartCheckout.style.display = 'none';
      checkoutFormContainer.style.display = 'block';
    });
  }

  // Обработчик отправки формы
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(checkoutForm);
      const orderData = {
        customer: {
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          address: formData.get('address'),
        },

        payment: {
          cardNumber: formData.get('card-number'),
          expiryDate: formData.get('expiry-date'),
          cvv: formData.get('cvv'),
        },

        items: cart,
        total: cart.reduce((sum, item) => sum + item.price, 0),
        timestamp: new Date().toISOString(),
      };


      // Простая валидация (добавлена для проверки)
      if (!orderData.payment.cardNumber || !orderData.payment.expiryDate || !orderData.payment.cvv) {
        alert('Please fill in all payment details.');
        return;
      }


      // Создание JSON-файла для скачивания
      const orderJson = JSON.stringify(orderData, null, 2);
      const blob = new Blob([orderJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `order_${orderData.timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log("shop.js: заказ создан и скачан:", orderData);

      // Очистка корзины и сброс формы
      cart = [];
      updateCart();

      resetModalState(); // Сбрасываем состояние после отправки
      cartModal.style.display = 'none'; // Закрываем модальное окно

      checkoutForm.reset();
      cartModal.style.display = 'none';

      alert('Order submitted successfully! Check your downloads for order details.');
    });
  }

  // ====== Рендер товаров ======
  function renderProducts() {
    if (!productsContainer) {
      console.error("shop.js: .products контейнер не найден — прерываю renderProducts");
      return;
    }

    console.log("shop.js: renderProducts — filtered length:", filteredProducts.length, "currentPage:", currentPage);

    productsContainer.innerHTML = "";

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const productsToShow = filteredProducts.slice(start, end);

    if (productsToShow.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'no-products';
      empty.textContent = "No products found.";
      productsContainer.appendChild(empty);
    } else {
      productsToShow.forEach(p => {
        const div = document.createElement("div");
        div.classList.add("product");
        div.innerHTML = `
          <img src="${p.image}" alt="${p.name}">
          <div class="product-name">${p.name}</div>
          <div class="product-category">${p.category}</div>
          <div class="product-price">$${p.price}</div>
          <button class="product-add-to-cart">Add to Cart</button>
        `;
        productsContainer.appendChild(div);
        div.querySelector('.product-add-to-cart').addEventListener('click', () => {
          addToCart(p);
        });
      });
    }

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
    if (pageInfoRef) pageInfoRef.textContent = `Page ${currentPage} of ${totalPages}`;
    if (paginationInfoRef) paginationInfoRef.textContent = `Showing ${Math.min(filteredProducts.length, start + 1)}–${Math.min(end, filteredProducts.length)} of ${filteredProducts.length}`;

    renderPagination(totalPages);
  }

  // ====== Сортировка ======
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      const value = sortSelect.value;
      if (value === "price-asc") {
        filteredProducts.sort((a, b) => a.price - b.price);
      } else if (value === "price-desc") {
        filteredProducts.sort((a, b) => b.price - a.price);
      } else if (value === "ABC") {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      } else if (value === "CBA") {
        filteredProducts.sort((a, b) => b.name.localeCompare(b.name));
      }
      currentPage = 1;
      renderProducts();
    });
  } else {
    console.warn("shop.js: select#sort не найден — сортировка отключена");
  }

  // ====== Фильтрация ======
  if (checkboxes && checkboxes.length > 0) {
    checkboxes.forEach(cb => {
      cb.addEventListener("change", () => {
        const selected = Array.from(checkboxes)
          .filter(x => x.checked)
          .map(x => x.parentElement.textContent.trim().split("(")[0].trim());
        console.log("shop.js: selected categories:", selected);
        filteredProducts = selected.length > 0
          ? productsData.filter(p => selected.includes(p.category))
          : [...productsData];
        console.log("shop.js: filtered products:", filteredProducts.length);
        currentPage = 1;
        renderProducts();
      });
    });
  } else {
    console.warn("shop.js: чекбоксов для фильтрации не найдено");
  }





  // ====== Пагинация ======
  function renderPagination(totalPages) {
    console.log("shop.js: renderPagination totalPages=", totalPages, "paginationContainer:", !!paginationContainer);
    if (!paginationContainer) {
      console.error("shop.js: paginationContainer не найден, не рисую пагинацию");
      return;
    }

    if (paginationWrapperParent) ensureVisible(paginationWrapperParent);
    ensureVisible(paginationContainer);

    paginationContainer.innerHTML = "";

    paginationContainer.style.display = 'inline-flex';
    paginationContainer.style.gap = '8px';
    paginationContainer.style.flexWrap = 'wrap';
    paginationContainer.style.alignItems = 'center';

    const prev = document.createElement("button");
    prev.textContent = "Previous";
    prev.disabled = currentPage === 1;
    prev.className = 'js-prev';
    prev.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderProducts();
      }
    });
    paginationContainer.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = 'js-page';
      if (i === currentPage) btn.classList.add('active');
      btn.addEventListener("click", () => {
        currentPage = i;
        renderProducts();
      });
      paginationContainer.appendChild(btn);
    }

    const next = document.createElement("button");
    next.textContent = "Next";
    next.disabled = currentPage === totalPages;
    next.className = 'js-next';
    next.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderProducts();
      }
    });
    paginationContainer.appendChild(next);

    console.log("shop.js: pagination buttons created:", paginationContainer.innerHTML);
  }

  // ====== Первый рендер ======
  renderProducts();

  console.log("shop.js ready. Debug tips:");
  console.log(" - Проверить существование элементов: document.querySelector('.products'), document.querySelector('.pagination-wrapper .pagination'), document.querySelector('.cart-modal'), document.querySelector('.checkout-form')");
  console.log(" - Если пагинация, корзина или форма не видны — откройте DevTools (F12) и посмотрите ошибки/лог.");
});