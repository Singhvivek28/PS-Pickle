document.getElementById("checkout-btn").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  toggleCart();

  const upiID = "kgolu123g-4@okhdfcbank"; // Replace with your real UPI ID
  const payeeName = "PS Pickles";
  const amount = total.toFixed(2);

  // Construct UPI payment URL
  const upiURL = `upi://pay?pa=${encodeURIComponent(upiID)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR`;

  // Set the payment link href
  const upiLink = document.getElementById("upi-link");
  upiLink.setAttribute("href", upiURL);

  // Generate QR code
  const qrContainer = document.getElementById("qrcode");
  qrContainer.innerHTML = ""; // Clear previous QR if any
  new QRCode(qrContainer, {
    text: upiURL,
    width: 200,
    height: 200,
    colorDark: "#000000",
    colorLight: "#ffffff",
  });

  // Show UPI payment section
  document.getElementById("upi-section").classList.remove("hidden");

  // Scroll to UPI section smoothly
  window.scrollTo({ top: document.getElementById("upi-section").offsetTop, behavior: "smooth" });
});