// server.js


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Add a route to serve the frontend index.html explicitly for root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Add a route to serve the login.html explicitly
app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// Connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/pspickles")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});
const User = mongoose.model("User", UserSchema);

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token missing' });

  jwt.verify(token, "your_jwt_secret", (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Order Schema
const OrderSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  items: [
    {
      productName: String,
      quantity: Number,
      price: Number
    }
  ],
  totalPrice: Number,
  orderDate: { type: Date, default: Date.now }
});
const Order = mongoose.model("Order", OrderSchema);

// Register Route
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("Incoming user:", req.body);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    console.log("User saved to DB");
    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(400).json({ message: "Error: " + err.message });
  }
});

// Login Route
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, "your_jwt_secret", { expiresIn: "1h" });

    res.json({ message: "Login successful", name: user.name, email: user.email, token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/test-insert", async (req, res) => {
  try {
    const user = new User({ name: "Shivansh", email: "kgolu2804g@gmail.com", password: "12345" });
    await user.save();
    res.json({ message: "Test user inserted" });
  } catch (err) {
    console.error("Error in test insert:", err);
    res.status(400).json({ message: "Error: " + err.message });
  }
});

// Create Order Route
app.post("/api/order", authenticateToken, async (req, res) => {
  try {
    const { userEmail, items, totalPrice } = req.body;
    if (!userEmail || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid order data" });
    }
    const order = new Order({ userEmail, items, totalPrice });
    await order.save();
    res.json({ message: "Order placed successfully" });
  } catch (err) {
    console.error("Error saving order:", err);
    res.status(400).json({ message: "Error: " + err.message });
  }
});

// Get Orders for a User
app.get("/api/orders/:userEmail", authenticateToken, async (req, res) => {
  try {
    const userEmail = req.params.userEmail;
    const orders = await Order.find({ userEmail });
    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user details by email
app.get("/api/users/:email", authenticateToken, async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user details by email
app.put("/api/users/:email", authenticateToken, async (req, res) => {
  try {
    const email = req.params.email;
    const updateData = req.body;
    const user = await User.findOneAndUpdate({ email }, updateData, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated", user });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(400).json({ message: "Error: " + err.message });
  }
});

// Delete user by email
app.delete("/api/users/:email", authenticateToken, async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOneAndDelete({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users
app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update order by id
app.put("/api/order/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;
    const order = await Order.findByIdAndUpdate(id, updateData, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order updated", order });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(400).json({ message: "Error: " + err.message });
  }
});

// Delete order by id
app.delete("/api/order/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findByIdAndDelete(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted" });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all orders
app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Contact Schema
const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model("Contact", ContactSchema);

// Contact form submission endpoint
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // Save contact message to database
    const contact = new Contact({ name, email, message });
    await contact.save();

    console.log("Contact form submission:", { name, email, message });
    res.json({ message: "Thank you for contacting PS Pickles! We will get back to you soon." });
  } catch (err) {
    console.error("Error saving contact message:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
