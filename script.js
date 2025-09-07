const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure your email transporter (using Gmail SMTP as example)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your.email@gmail.com",       // Your email
    pass: "your-email-app-password"     // App password or real password (use app password for Gmail)
  }
});

// POST /api/orders - receive order and send email notification
app.post("/api/orders", async (req, res) => {
  const { items, total, timestamp } = req.body;

  if (!items || !total) {
    return res.status(400).json({ error: "Invalid order data" });
  }

  // Format order details for email
  const itemsList = items.map(
    (item) => `${item.product} - ${item.qty} Kg - ₹${item.price.toFixed(2)}`
  ).join("\n");

  const mailOptions = {
    from: '"PS Pickles" <your.email@gmail.com>',
    to: "your.email@gmail.com",  // Your email to receive orders
    subject: `New Order Received - ₹${total}`,
    text: `You have received a new order on ${timestamp}.\n\nOrder details:\n${itemsList}\n\nTotal: ₹${total}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "Order received and email sent" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});