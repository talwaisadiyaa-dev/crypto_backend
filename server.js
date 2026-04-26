const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "secret123";

/* =========================
   ✅ MONGODB CONNECITION 
   */
require("dotenv").config();


console.log("MONGO_URL:", process.env.MONGO_URL); // debug

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Atlas Connected ✅"))
  .catch(err => console.log("MongoDB error:", err));

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    email: String,
    password: String,
  })
);


/* =========================
   💰 WATCHLIST SCHEMA
========================= */
const Watch = mongoose.model(
  "Watch",
  new mongoose.Schema({
    coinName: String,
    coinId: String,
    amount: Number,
    buyPrice: Number,
    userId: String,
  })
);

/* =========================
   💼 PORTFOLIO SCHEMA
========================= */
const Portfolio = mongoose.model(
  "Portfolio",
  new mongoose.Schema({
    coin: String,
    price: Number,
    quantity: Number,
    userId: String,
  })
);

/* =========================
   📜 TRANSACTION SCHEMA
========================= */
const Transaction = mongoose.model(
  "Transaction",
  new mongoose.Schema({
    coin: String,
    type: String, // BUY / SELL
    price: Number,
    quantity: Number,
    userId: String,
    date: { type: Date, default: Date.now },
  })
);

/* =========================
   🔐 AUTH
========================= */

// SIGNUP
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.json({ message: "User exists ❌" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed });
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);

    res.json({ token, userId: user._id });
  } catch {
    res.status(500).json({ message: "Signup error ❌" });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "User not found ❌" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.json({ message: "Wrong password ❌" });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);

    res.json({ token, userId: user._id });
  } catch {
    res.status(500).json({ message: "Login error ❌" });
  }
});

/* =========================
   ⭐ WATCHLIST
========================= */

// ADD
app.post("/api/watchlist/add", async (req, res) => {
  try {
    const { coinName, coinId, amount, buyPrice, userId } = req.body;

    const exists = await Watch.findOne({ coinId, userId });
    if (exists) return res.json({ message: "Already added ⚠️" });

    await Watch.create({ coinName, coinId, amount, buyPrice, userId });

    res.json({ message: "Added ✅" });
  } catch {
    res.status(500).json({ message: "Error ❌" });
  }
});

// GET
app.get("/api/watchlist/:userId", async (req, res) => {
  const data = await Watch.find({ userId: req.params.userId });
  res.json(data);
});

// DELETE
app.delete("/api/watchlist/:id", async (req, res) => {
  await Watch.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted ✅" });
});

/* =========================
   💼 PORTFOLIO
========================= */

// GET
app.get("/api/portfolio/:userId", async (req, res) => {
  const data = await Portfolio.find({ userId: req.params.userId });
  res.json(data);
});

// BUY
app.post("/api/portfolio/buy", async (req, res) => {
  const { coin, price, quantity, userId } = req.body;

  try {
    const existing = await Portfolio.findOne({ coin, userId });

    if (existing) {
      const totalQty = existing.quantity + quantity;
      const avgPrice =
        (existing.price * existing.quantity + price * quantity) /
        totalQty;

      existing.quantity = totalQty;
      existing.price = avgPrice;

      await existing.save();
    } else {
      await Portfolio.create({ coin, price, quantity, userId });
    }

    // ✅ SAVE TRANSACTION
    await Transaction.create({
      coin,
      type: "BUY",
      price,
      quantity,
      userId,
    });

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Buy failed ❌" });
  }
});

// SELL
app.post("/api/portfolio/sell", async (req, res) => {
  const { coin, quantity, userId } = req.body;

  try {
    const existing = await Portfolio.findOne({ coin, userId });

    if (!existing) {
      return res.status(404).json({ error: "Coin not found ❌" });
    }

    if (existing.quantity < quantity) {
      return res.status(400).json({ error: "Not enough quantity ❌" });
    }

    existing.quantity -= quantity;

    await Transaction.create({
      coin,
      type: "SELL",
      price: existing.price,
      quantity,
      userId,
    });

    if (existing.quantity === 0) {
      await Portfolio.deleteOne({ _id: existing._id });
    } else {
      await existing.save();
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Sell failed ❌" });
  }
});

// DELETE PORTFOLIO
app.delete("/api/portfolio/:id", async (req, res) => {
  await Portfolio.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted ✅" });
});

/* =========================
   📜 TRANSACTIONS
========================= */

app.get("/api/transactions/:userId", async (req, res) => {
  const data = await Transaction.find({ userId: req.params.userId })
    .sort({ date: -1 });

  res.json(data);
});

/* =========================
   🚀 START SERVER
========================= */

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running 🚀");
});
