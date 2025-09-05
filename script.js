let cart = [];
let total = 0;

function addToCart(product, price) {
  cart.push({ product, price });
  total += price;
  renderCart();
}

function renderCart() {
  const cartList = document.getElementById("cart-items");
  cartList.innerHTML = "";

  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.product} – ₹${item.price}`;
    cartList.appendChild(li);
  });

  document.getElementById("total").textContent = `Total: ₹${total}`;
}

document.getElementById("checkout-btn").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty!");
  } else {
    document.getElementById("upi-section").style.display = "block";
    window.scrollTo(0, document.body.scrollHeight);
  }
});

document.getElementById("confirm-payment-btn").addEventListener("click", () => {
  alert("✅ Thank you! Your payment is confirmed. We’ll process your order soon.");
  cart = [];
  total = 0;
  renderCart();
  document.getElementById("upi-section").style.display = "none";
});
