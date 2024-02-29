
    document.addEventListener('DOMContentLoaded', () => {
      const iconCart = document.getElementById('cart-icon');
      
     
      const shoppingCart = document.getElementById('cartTab');
      const closeBtn = document.querySelector('.close');
  
      iconCart.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
  
        // Toggle the 'activeTab' class to show/hide the cart
        shoppingCart.classList.toggle('activeTab');
      });
      
    
  
      closeBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        shoppingCart.classList.remove('activeTab');
      });
  
      // Close the cart if the user clicks outside of it
      document.addEventListener('click', (event) => {
        const target = event.target;
        if (target !== iconCart && target !== shoppingCart && !shoppingCart.contains(target)) {
          shoppingCart.classList.remove('activeTab');
        }
      });
    });


   
  