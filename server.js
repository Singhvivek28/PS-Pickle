// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/pspickles", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});
const User = mongoose.model("User", UserSchema);

// Register Route
app.post("/api/login", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("Incoming user:", req.body);  // ✅ log data
    const user = new User({ name, email, password });
    await user.save();
    console.log("User saved to DB");          // ✅ confirm
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
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    res.json({ message: "Login successful", name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
app.get("/test-insert", async (req, res) => {
  try {
    const user = new User({ name: "Test User", email: "test@example.com", password: "12345" });
    await user.save();
    res.json({ message: "Test user inserted" });
  } catch (err) {
    console.error("Error in test insert:", err);
    res.status(400).json({ message: "Error: " + err.message });
  }
});
