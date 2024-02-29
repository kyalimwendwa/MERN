document.addEventListener('DOMContentLoaded', () => {
    const orderForm = document.getElementById('orderForm');
  
    orderForm.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const username = document.getElementById('username').value;
      const address = document.getElementById('address').value;
  
      try {
        const response = await fetch('http://localhost:3000/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, address }),
        });
  
        if (response.ok) {
          const result = await response.json();
          alert(`Order placed successfully. Order ID: ${result.orderId}`);
        } else {
          const result = await response.json();
          alert(`Failed to place order. Error: ${result.error}`);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to place order. Please try again.');
      }
    });
  });
  