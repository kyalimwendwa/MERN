function addToCart(name, price, quantity, color, image) {
    const cartList = document.getElementById('cartList');

    // Check if the product is already in the cart
    const existingCartItem = Array.from(cartList.children).find(item =>
      item.dataset.name === name && item.dataset.color === color
    );

    if (existingCartItem) {
      // If the product is already in the cart, update its quantity
      const existingQuantityElement = existingCartItem.querySelector('.quantity');
      const existingPriceElement = existingCartItem.querySelector('.price');
      const newQuantity = parseInt(existingQuantityElement.textContent.split(' ')[1]) + quantity;
      existingQuantityElement.textContent = `Quantity: ${newQuantity}`;
      existingPriceElement.textContent = `Price: $${(newQuantity * parseFloat(price)).toFixed(2)}`;
    } else {
      // Create a new cart item element
      const cartItem = document.createElement('div');
      cartItem.classList.add('cart-item');
      cartItem.dataset.name = name;
      cartItem.dataset.color = color;

      // Add product details to the cart item
      cartItem.innerHTML = `
        <img src="${image}" alt="${name}" style="width: 150px; height: 100px; margin-right:20px;">
        <div class="product-details" style="display:flex; align-items:center; justify-content:center; gap: 2rem;">
          <h3>${name}</h3>
         
          
          <div class="quantity-controls" style="display:flex; align-items:center; justify-content:center; gap: 1rem">
          
          <svg   onclick="decreaseQuantity(this, ${parseFloat(price)})" style="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#213047"><path d="M5 11V13H19V11H5Z"></path></svg>
            
          <input type="text" value="${quantity}" readonly style="width: 40px; height: 30px; border: 2px solid #f0f2f9; outline: none; line-height: 30px; text-align: center;">

            <svg  onclick="increaseQuantity(this, ${parseFloat(price)})" style="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#213047"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>
          </div>

          <p class="price">Price: $${parseFloat(price).toFixed(2)}</p>


          <svg onclick="deleteProduct(this)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#213047">
          <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path>
        </svg>
        </div>
      `;

      // Set display to flex
      cartItem.style.display = 'flex';

      // Append the cart item to the cart list
      cartList.appendChild(cartItem);
    }
  }

  function deleteProduct(button) {
    const cartItem = button.closest('.cart-item');
    cartItem.remove();
  }

  function increaseQuantity(button, price) {
    const inputField = button.parentElement.querySelector('input');
    const currentQuantity = parseInt(inputField.value);
    const newQuantity = currentQuantity + 1;
    inputField.value = newQuantity;
    updateTotalPrice(button, price, newQuantity);
  }

  function decreaseQuantity(button, price) {
    const inputField = button.parentElement.querySelector('input');
    const currentQuantity = parseInt(inputField.value);
    if (currentQuantity > 1) {
      const newQuantity = currentQuantity - 1;
      inputField.value = newQuantity;
      updateTotalPrice(button, price, newQuantity);
    }
  }

  function updateTotalPrice(button, price, quantity) {
    const cartItem = button.closest('.cart-item');
    const priceElement = cartItem.querySelector('.price');
    const newPrice = (quantity * parseFloat(price)).toFixed(2);
    priceElement.textContent = `Price: $${newPrice}`;
  }
